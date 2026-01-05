import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

// Environment detection
const isReplit = !!process.env.REPLIT_CONNECTORS_HOSTNAME || !!process.env.REPL_IDENTITY;
const isProduction = process.env.NODE_ENV === 'production';

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

/**
 * Creates a Google Cloud Storage client based on environment:
 * - Replit: Uses sidecar proxy for authentication
 * - Production: Uses service account credentials
 */
function createStorageClient(): Storage {
  // Production mode with explicit credentials
  if (isProduction || process.env.GCS_PROJECT_ID) {
    const projectId = process.env.GCS_PROJECT_ID;

    if (!projectId) {
      throw new Error(
        "GCS_PROJECT_ID environment variable is required for production. " +
        "See DEPLOYMENT_REQUIREMENTS.md for setup instructions."
      );
    }

    // Option 1: Use GOOGLE_APPLICATION_CREDENTIALS file path
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('[GCS] Using service account credentials from file');
      return new Storage({
        projectId,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    }

    // Option 2: Use inline credentials (for containerized deployments)
    if (process.env.GCS_CLIENT_EMAIL && process.env.GCS_PRIVATE_KEY) {
      console.log('[GCS] Using inline service account credentials');
      return new Storage({
        projectId,
        credentials: {
          client_email: process.env.GCS_CLIENT_EMAIL,
          private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      });
    }

    throw new Error(
      "GCS credentials not configured. Set either GOOGLE_APPLICATION_CREDENTIALS " +
      "or both GCS_CLIENT_EMAIL and GCS_PRIVATE_KEY. See DEPLOYMENT_REQUIREMENTS.md."
    );
  }

  // Replit development mode - use sidecar proxy
  if (isReplit) {
    console.log('[GCS] Using Replit sidecar proxy for authentication');
    return new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token",
          },
        },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });
  }

  // Local development fallback
  console.warn('[GCS] No credentials configured. File operations will fail.');
  return new Storage({ projectId: 'local-dev' });
}

export const objectStorageClient = createStorageClient();

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME || '';
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in Google Cloud Storage " +
          "and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in Google Cloud Storage " +
          "and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${
          isPublic ? "public" : "private"
        }, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in Google Cloud Storage " +
          "and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

/**
 * Signs a URL for direct upload/download to GCS.
 * Uses different methods based on environment:
 * - Replit: Uses sidecar proxy
 * - Production: Uses service account signing
 */
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  // Production mode - use native GCS signed URLs
  if (isProduction || process.env.GCS_PROJECT_ID) {
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: method === 'PUT' ? 'write' : method === 'DELETE' ? 'delete' : 'read',
      expires: Date.now() + ttlSec * 1000,
      contentType: method === 'PUT' ? 'application/octet-stream' : undefined,
    });

    return signedUrl;
  }

  // Replit mode - use sidecar proxy
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };

  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit or have production credentials configured`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
