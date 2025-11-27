import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ObjectUploader } from "@/components/ObjectUploader";
import { FileText, Upload, CheckCircle, XCircle, Clock, Plus, AlertTriangle, FileUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Consultant, ConsultantDocument, DocumentType } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import { format } from "date-fns";

export default function MyDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: consultant, isLoading: consultantLoading } = useQuery<Consultant>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: documents, isLoading: documentsLoading } = useQuery<ConsultantDocument[]>({
    queryKey: ["/api/consultants", consultant?.id, "documents"],
    enabled: !!consultant?.id,
  });

  const { data: documentTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  const handleGetUploadParameters = async () => {
    const res = await fetch('/api/objects/upload', { 
      method: 'POST', 
      credentials: 'include' 
    });
    const { uploadURL } = await res.json();
    return { method: 'PUT' as const, url: uploadURL };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful?.[0]) {
      const uploadedFile = result.successful[0];
      const fileName = uploadedFile.name || 'Document';
      const uploadUrl = uploadedFile.uploadURL;
      
      if (!selectedDocType) {
        toast({ title: "Please select a document type first", variant: "destructive" });
        return;
      }

      setIsUploading(true);
      
      try {
        const res = await fetch(`/api/consultants/${consultant?.id}/documents`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            fileUrl: uploadUrl,
            documentTypeId: selectedDocType,
            fileName: fileName,
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setUploadedFileUrl(data.objectPath);
          setUploadedFileName(fileName);
          toast({ title: "File uploaded successfully" });
        } else {
          const error = await res.json();
          toast({ title: error.message || "Failed to save document", variant: "destructive" });
        }
      } catch (error) {
        console.error('Failed to save document:', error);
        toast({ title: "Failed to save document", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveDocument = () => {
    if (!selectedDocType || !uploadedFileUrl) {
      toast({ title: "Please select a document type and upload a file", variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["/api/consultants", consultant?.id, "documents"] });
    toast({ title: "Document saved successfully" });
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDocType("");
    setUploadedFileUrl(null);
    setUploadedFileName("");
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDocTypeName = (typeId: string) => {
    return documentTypes?.find((t) => t.id === typeId)?.name || "Unknown";
  };

  const requiredDocTypes = documentTypes?.filter((d) => d.isRequired) || [];
  const uploadedDocTypeIds = documents?.map((d) => d.documentTypeId) || [];
  const approvedCount = documents?.filter((d) => d.status === "approved").length || 0;
  const totalRequired = requiredDocTypes.length;
  const progress = totalRequired > 0 ? (approvedCount / totalRequired) * 100 : 0;

  const isLoading = consultantLoading || documentsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-my-documents-title">My Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your required documents
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-document">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Select a document type and upload your file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger data-testid="select-doc-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes?.map((docType) => (
                      <SelectItem key={docType.id} value={docType.id}>
                        {docType.name} {docType.isRequired && "(Required)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Upload Document</Label>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={52428800}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  {uploadedFileName ? `Selected: ${uploadedFileName}` : "Choose File"}
                </ObjectUploader>
                {uploadedFileUrl && (
                  <p className="text-xs text-green-600" data-testid="text-upload-success">
                    File uploaded successfully
                  </p>
                )}
                {isUploading && (
                  <p className="text-xs text-muted-foreground">
                    Saving document...
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveDocument} 
                disabled={!uploadedFileUrl || isUploading} 
                data-testid="button-submit-document"
              >
                Save Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            Complete all required documents to finish onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{approvedCount} of {totalRequired} required documents approved</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
          {totalRequired > 0 && progress < 100 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Complete all required documents to be eligible for project assignments</span>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover-elevate" data-testid={`card-document-${doc.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{getDocTypeName(doc.documentTypeId)}</CardTitle>
                      <CardDescription>
                        Uploaded {doc.createdAt ? format(new Date(doc.createdAt), "MMM d, yyyy") : "Unknown"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(doc.status) as any} className="capitalize">
                    {getStatusIcon(doc.status)}
                    <span className="ml-1">{doc.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {doc.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes: </span>
                    {doc.notes}
                  </div>
                )}
                {doc.expirationDate && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Expires: </span>
                    {format(new Date(doc.expirationDate), "MMM d, yyyy")}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your required documents to complete the onboarding process.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-upload-first">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}

      {requiredDocTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              These documents are required to complete onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requiredDocTypes.map((docType) => {
                const uploaded = uploadedDocTypeIds.includes(docType.id);
                const doc = documents?.find((d) => d.documentTypeId === docType.id);
                const approved = doc?.status === "approved";

                return (
                  <div key={docType.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      {approved ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : uploaded ? (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>{docType.name}</span>
                    </div>
                    <Badge variant={approved ? "default" : uploaded ? "secondary" : "destructive"}>
                      {approved ? "Approved" : uploaded ? "Pending" : "Missing"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
