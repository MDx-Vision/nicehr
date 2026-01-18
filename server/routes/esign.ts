/**
 * ESIGN Act Compliance API Routes
 *
 * Implements legally binding electronic signatures in compliance with:
 * - ESIGN Act (15 U.S.C. § 7001)
 * - UETA (Uniform Electronic Transactions Act)
 *
 * Features:
 * - Consent flow with required acknowledgments
 * - Document hashing (SHA-256) for tamper-evidence
 * - Intent confirmation
 * - Review tracking
 * - Signature certificates
 */

import { Router } from "express";
import { isAuthenticated, requireRole } from "../replitAuth";
import { storage } from "../storage";
import { db } from "../db";
import { createHash } from "crypto";
import {
  esignConsents,
  esignDocumentHashes,
  esignIntentConfirmations,
  esignReviewTracking,
  esignCertificates,
  contractSigners,
  contractSignatures,
  contracts,
  contractAuditEvents,
  users,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// ESIGN Disclosure text - versioned for legal compliance
const ESIGN_DISCLOSURE = {
  version: "1.0",
  text: `
ELECTRONIC SIGNATURE DISCLOSURE AND CONSENT

Before you can sign documents electronically, federal law requires us to inform you of the following:

1. HARDWARE AND SOFTWARE REQUIREMENTS
To access, view, and retain electronic documents, you will need:
- A computer or mobile device with internet access
- A current web browser (Chrome, Firefox, Safari, or Edge)
- Software to view PDF documents (such as Adobe Reader)
- A valid email address for receiving documents
- Sufficient storage to retain documents

2. RIGHT TO PAPER COPIES
You have the right to receive paper copies of any document. You may request paper copies at any time by contacting us. Paper copies will be provided free of charge.

3. RIGHT TO WITHDRAW CONSENT
You may withdraw your consent to receive documents electronically at any time. Withdrawal of consent will not affect the legal validity of any documents you have already signed electronically.

By checking the acknowledgment boxes below, you confirm that:
- You have read and understand this disclosure
- You meet the hardware and software requirements
- You consent to conducting business electronically
- You understand your right to paper copies
- You understand your right to withdraw consent
`,
};

/**
 * GET /api/esign/disclosure
 * Returns the ESIGN disclosure text and version
 */
router.get("/esign/disclosure", isAuthenticated, async (req, res) => {
  try {
    // Compute hash of disclosure text for tamper evidence
    const disclosureHash = createHash("sha256")
      .update(ESIGN_DISCLOSURE.text)
      .digest("hex");

    res.json({
      version: ESIGN_DISCLOSURE.version,
      text: ESIGN_DISCLOSURE.text,
      hash: disclosureHash,
    });
  } catch (error) {
    console.error("Error fetching ESIGN disclosure:", error);
    res.status(500).json({ message: "Failed to fetch disclosure" });
  }
});

/**
 * POST /api/contracts/:contractId/esign/consent
 * Records ESIGN consent with all required acknowledgments
 */
router.post(
  "/contracts/:contractId/esign/consent",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const {
        signerId,
        hardwareSoftwareAcknowledged,
        paperCopyRightAcknowledged,
        consentWithdrawalAcknowledged,
      } = req.body;

      // Validate all acknowledgments are true
      if (
        !hardwareSoftwareAcknowledged ||
        !paperCopyRightAcknowledged ||
        !consentWithdrawalAcknowledged
      ) {
        return res.status(400).json({
          message: "All three acknowledgments are required to proceed",
          required: [
            "hardwareSoftwareAcknowledged",
            "paperCopyRightAcknowledged",
            "consentWithdrawalAcknowledged",
          ],
        });
      }

      // Verify signer exists and belongs to this contract
      const [signer] = await db
        .select()
        .from(contractSigners)
        .where(
          and(
            eq(contractSigners.id, signerId),
            eq(contractSigners.contractId, contractId)
          )
        );

      if (!signer) {
        return res.status(404).json({ message: "Signer not found" });
      }

      // Compute disclosure hash
      const disclosureHash = createHash("sha256")
        .update(ESIGN_DISCLOSURE.text)
        .digest("hex");

      // Get IP and user agent
      const ipAddress =
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Create consent record
      const [consent] = await db
        .insert(esignConsents)
        .values({
          signerId,
          contractId,
          consentGiven: true,
          consentTimestamp: new Date(),
          hardwareSoftwareAcknowledged: true,
          paperCopyRightAcknowledged: true,
          consentWithdrawalAcknowledged: true,
          disclosureTextVersion: ESIGN_DISCLOSURE.version,
          disclosureTextHash: disclosureHash,
          ipAddress,
          userAgent,
        })
        .returning();

      // Log audit event
      await db.insert(contractAuditEvents).values({
        contractId,
        eventType: "esign_consent_given",
        userId: req.user?.id,
        details: {
          signerId,
          disclosureVersion: ESIGN_DISCLOSURE.version,
          acknowledgments: {
            hardwareSoftware: true,
            paperCopyRight: true,
            consentWithdrawal: true,
          },
        },
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        message: "ESIGN consent recorded successfully",
        consent: {
          id: consent.id,
          consentTimestamp: consent.consentTimestamp,
          disclosureVersion: consent.disclosureTextVersion,
        },
      });
    } catch (error) {
      console.error("Error recording ESIGN consent:", error);
      res.status(500).json({ message: "Failed to record consent" });
    }
  }
);

/**
 * GET /api/contracts/:contractId/esign/consent/:signerId
 * Checks if a signer has given ESIGN consent
 */
router.get(
  "/contracts/:contractId/esign/consent/:signerId",
  isAuthenticated,
  async (req, res) => {
    try {
      const { contractId, signerId } = req.params;

      const [consent] = await db
        .select()
        .from(esignConsents)
        .where(
          and(
            eq(esignConsents.contractId, contractId),
            eq(esignConsents.signerId, signerId)
          )
        )
        .orderBy(desc(esignConsents.createdAt))
        .limit(1);

      res.json({
        hasConsent: !!consent?.consentGiven,
        consent: consent || null,
      });
    } catch (error) {
      console.error("Error checking consent:", error);
      res.status(500).json({ message: "Failed to check consent" });
    }
  }
);

/**
 * POST /api/contracts/:contractId/esign/review-start
 * Records when a signer starts reviewing a document
 */
router.post(
  "/contracts/:contractId/esign/review-start",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const { signerId } = req.body;

      // Check for existing review tracking
      const [existing] = await db
        .select()
        .from(esignReviewTracking)
        .where(
          and(
            eq(esignReviewTracking.contractId, contractId),
            eq(esignReviewTracking.signerId, signerId)
          )
        );

      if (existing) {
        // Update existing record
        await db
          .update(esignReviewTracking)
          .set({
            reviewStartedAt: new Date(),
            pageViewCount: (existing.pageViewCount || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(esignReviewTracking.id, existing.id));

        res.json({ message: "Review tracking updated", trackingId: existing.id });
      } else {
        // Create new tracking record
        const [tracking] = await db
          .insert(esignReviewTracking)
          .values({
            signerId,
            contractId,
            documentPresentedAt: new Date(),
            reviewStartedAt: new Date(),
            scrolledToBottom: false,
            maxScrollPercentage: 0,
            pageViewCount: 1,
          })
          .returning();

        res.status(201).json({
          message: "Review tracking started",
          trackingId: tracking.id,
        });
      }
    } catch (error) {
      console.error("Error starting review tracking:", error);
      res.status(500).json({ message: "Failed to start review tracking" });
    }
  }
);

/**
 * PATCH /api/contracts/:contractId/esign/review-progress
 * Updates review progress (scroll position, etc.)
 */
router.patch(
  "/contracts/:contractId/esign/review-progress",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const { signerId, scrollPercentage, scrolledToBottom } = req.body;

      const [tracking] = await db
        .select()
        .from(esignReviewTracking)
        .where(
          and(
            eq(esignReviewTracking.contractId, contractId),
            eq(esignReviewTracking.signerId, signerId)
          )
        );

      if (!tracking) {
        return res.status(404).json({ message: "Review tracking not found" });
      }

      // Update with max scroll percentage
      const updates: any = {
        updatedAt: new Date(),
      };

      if (scrollPercentage !== undefined) {
        updates.maxScrollPercentage = Math.max(
          tracking.maxScrollPercentage || 0,
          scrollPercentage
        );
      }

      if (scrolledToBottom) {
        updates.scrolledToBottom = true;
      }

      await db
        .update(esignReviewTracking)
        .set(updates)
        .where(eq(esignReviewTracking.id, tracking.id));

      res.json({ message: "Review progress updated" });
    } catch (error) {
      console.error("Error updating review progress:", error);
      res.status(500).json({ message: "Failed to update review progress" });
    }
  }
);

/**
 * Helper: Generate SHA-256 hash of document content
 */
function computeDocumentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Helper: Generate certificate number
 */
function generateCertificateNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NICEHR-${dateStr}-${random}`;
}

/**
 * POST /api/contracts/:contractId/esign/sign
 * Enhanced signing endpoint with ESIGN compliance
 */
router.post(
  "/contracts/:contractId/esign/sign",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { contractId } = req.params;
      const {
        signerId,
        signatureData,
        typedName,
        intentConfirmed,
      } = req.body;

      // Validate required fields
      if (!signerId || !signatureData || !intentConfirmed) {
        return res.status(400).json({
          message: "Missing required fields",
          required: ["signerId", "signatureData", "intentConfirmed"],
        });
      }

      // Get contract and signer
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId));

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const [signer] = await db
        .select({
          signer: contractSigners,
          user: users,
        })
        .from(contractSigners)
        .leftJoin(users, eq(contractSigners.userId, users.id))
        .where(
          and(
            eq(contractSigners.id, signerId),
            eq(contractSigners.contractId, contractId)
          )
        );

      if (!signer) {
        return res.status(404).json({ message: "Signer not found" });
      }

      // Check ESIGN consent was given
      const [consent] = await db
        .select()
        .from(esignConsents)
        .where(
          and(
            eq(esignConsents.contractId, contractId),
            eq(esignConsents.signerId, signerId),
            eq(esignConsents.consentGiven, true)
          )
        );

      if (!consent) {
        return res.status(400).json({
          message: "ESIGN consent required before signing",
          code: "CONSENT_REQUIRED",
        });
      }

      // Get IP and user agent
      const ipAddress =
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Compute document hash
      const documentHash = computeDocumentHash(contract.content);

      // Create signature record
      const [signature] = await db
        .insert(contractSignatures)
        .values({
          contractId,
          signerId,
          signatureData,
          ipAddress,
          userAgent,
          signedAt: new Date(),
        })
        .returning();

      // Create document hash record
      await db.insert(esignDocumentHashes).values({
        contractId,
        signatureId: signature.id,
        documentHashSha256: documentHash,
        hashAlgorithm: "SHA-256",
        documentVersion: 1,
        contentType: "full_document",
        computedAt: new Date(),
      });

      // Create intent confirmation
      const expectedName = signer.user?.fullName || signer.user?.email || "";
      const typedNameMatch = typedName?.toLowerCase().trim() === expectedName.toLowerCase().trim();

      await db.insert(esignIntentConfirmations).values({
        signatureId: signature.id,
        intentCheckboxChecked: intentConfirmed,
        intentStatement: "I intend this to be my legally binding electronic signature",
        typedNameMatch,
        typedName: typedName || "",
        expectedName,
        confirmedAt: new Date(),
      });

      // Update review tracking
      await db
        .update(esignReviewTracking)
        .set({
          reviewCompletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(esignReviewTracking.contractId, contractId),
            eq(esignReviewTracking.signerId, signerId)
          )
        );

      // Calculate review duration if tracking exists
      const [tracking] = await db
        .select()
        .from(esignReviewTracking)
        .where(
          and(
            eq(esignReviewTracking.contractId, contractId),
            eq(esignReviewTracking.signerId, signerId)
          )
        );

      if (tracking?.reviewStartedAt && tracking?.reviewCompletedAt) {
        const duration = Math.floor(
          (new Date(tracking.reviewCompletedAt).getTime() -
            new Date(tracking.reviewStartedAt).getTime()) /
            1000
        );
        await db
          .update(esignReviewTracking)
          .set({ reviewDurationSeconds: duration })
          .where(eq(esignReviewTracking.id, tracking.id));
      }

      // Generate certificate
      const certificateNumber = generateCertificateNumber();
      const [certificate] = await db
        .insert(esignCertificates)
        .values({
          signatureId: signature.id,
          contractId,
          certificateNumber,
          signerName: signer.user?.fullName || signer.user?.email || "Unknown",
          signerEmail: signer.user?.email || "unknown@example.com",
          documentTitle: contract.title,
          documentHashSha256: documentHash,
          signedAt: new Date(),
          signerIpAddress: ipAddress,
          signerUserAgent: userAgent,
          certificateData: {
            signatureId: signature.id,
            contractId,
            documentHash,
            hashAlgorithm: "SHA-256",
            signingTimestamp: new Date().toISOString(),
            consentTimestamp: consent.consentTimestamp,
            reviewTracking: tracking
              ? {
                  reviewDuration: tracking.reviewDurationSeconds,
                  scrolledToBottom: tracking.scrolledToBottom,
                  maxScrollPercentage: tracking.maxScrollPercentage,
                }
              : null,
          },
          esignActCompliant: true,
          uetaCompliant: true,
        })
        .returning();

      // Update signer status
      await db
        .update(contractSigners)
        .set({
          status: "signed",
          signedAt: new Date(),
        })
        .where(eq(contractSigners.id, signerId));

      // Log audit event
      await db.insert(contractAuditEvents).values({
        contractId,
        eventType: "esign_document_signed",
        userId: req.user?.id,
        details: {
          signerId,
          signatureId: signature.id,
          certificateNumber,
          documentHash,
          intentConfirmed,
          typedNameMatch,
        },
        ipAddress,
        userAgent,
      });

      // Check if all signers have signed
      const allSigners = await db
        .select()
        .from(contractSigners)
        .where(eq(contractSigners.contractId, contractId));

      const allSigned = allSigners.every((s: typeof contractSigners.$inferSelect) => s.status === "signed");

      if (allSigned) {
        await db
          .update(contracts)
          .set({
            status: "completed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contracts.id, contractId));
      } else {
        await db
          .update(contracts)
          .set({
            status: "partially_signed",
            updatedAt: new Date(),
          })
          .where(eq(contracts.id, contractId));
      }

      res.status(201).json({
        message: "Document signed successfully",
        signature: {
          id: signature.id,
          signedAt: signature.signedAt,
        },
        certificate: {
          id: certificate.id,
          number: certificate.certificateNumber,
          documentHash,
        },
        contractStatus: allSigned ? "completed" : "partially_signed",
      });
    } catch (error) {
      console.error("Error signing document:", error);
      res.status(500).json({ message: "Failed to sign document" });
    }
  }
);

/**
 * GET /api/contracts/:contractId/esign/verify
 * Verifies document integrity by comparing hashes
 */
router.get(
  "/contracts/:contractId/esign/verify",
  isAuthenticated,
  async (req, res) => {
    try {
      const { contractId } = req.params;

      // Get contract
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId));

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Get all document hashes
      const hashes = await db
        .select()
        .from(esignDocumentHashes)
        .where(eq(esignDocumentHashes.contractId, contractId));

      if (hashes.length === 0) {
        return res.json({
          verified: false,
          message: "No signatures found for this document",
          currentHash: computeDocumentHash(contract.content),
        });
      }

      // Compute current hash
      const currentHash = computeDocumentHash(contract.content);

      // Compare with stored hashes
      const verificationResults = hashes.map((h: typeof esignDocumentHashes.$inferSelect) => ({
        signatureId: h.signatureId,
        storedHash: h.documentHashSha256,
        currentHash,
        hashAlgorithm: h.hashAlgorithm,
        computedAt: h.computedAt,
        verified: h.documentHashSha256 === currentHash,
      }));

      const allVerified = verificationResults.every((r: { verified: boolean }) => r.verified);

      res.json({
        verified: allVerified,
        message: allVerified
          ? "Document integrity verified - no modifications detected"
          : "WARNING: Document has been modified since signing",
        verificationResults,
      });
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  }
);

/**
 * GET /api/contracts/:contractId/esign/certificate/:signatureId
 * Returns the signature certificate
 */
router.get(
  "/contracts/:contractId/esign/certificate/:signatureId",
  isAuthenticated,
  async (req, res) => {
    try {
      const { contractId, signatureId } = req.params;

      const [certificate] = await db
        .select()
        .from(esignCertificates)
        .where(
          and(
            eq(esignCertificates.contractId, contractId),
            eq(esignCertificates.signatureId, signatureId)
          )
        );

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.json({
        certificate: {
          ...certificate,
          legalNotice: `This document was electronically signed in compliance with the ESIGN Act (15 U.S.C. § 7001) and UETA. The signature is legally binding.`,
        },
      });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  }
);

/**
 * GET /api/contracts/:contractId/esign/audit-trail
 * Returns the complete ESIGN audit trail
 */
router.get(
  "/contracts/:contractId/esign/audit-trail",
  isAuthenticated,
  async (req, res) => {
    try {
      const { contractId } = req.params;

      // Get all related data
      const [
        consentsData,
        reviewsData,
        hashesData,
        certificatesData,
        auditEventsData,
      ] = await Promise.all([
        db
          .select()
          .from(esignConsents)
          .where(eq(esignConsents.contractId, contractId)),
        db
          .select()
          .from(esignReviewTracking)
          .where(eq(esignReviewTracking.contractId, contractId)),
        db
          .select()
          .from(esignDocumentHashes)
          .where(eq(esignDocumentHashes.contractId, contractId)),
        db
          .select()
          .from(esignCertificates)
          .where(eq(esignCertificates.contractId, contractId)),
        db
          .select()
          .from(contractAuditEvents)
          .where(eq(contractAuditEvents.contractId, contractId))
          .orderBy(desc(contractAuditEvents.createdAt)),
      ]);

      res.json({
        contractId,
        auditTrail: {
          consents: consentsData,
          reviews: reviewsData,
          documentHashes: hashesData,
          certificates: certificatesData,
          events: auditEventsData,
        },
        generatedAt: new Date().toISOString(),
        compliance: {
          esignAct: "15 U.S.C. § 7001",
          ueta: "Uniform Electronic Transactions Act",
        },
      });
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      res.status(500).json({ message: "Failed to fetch audit trail" });
    }
  }
);

export default router;
