import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Search, CheckCircle, XCircle, Clock, Filter, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { ConsultantDocument, DocumentType, Consultant } from "@shared/schema";
import { format } from "date-fns";

export default function Documents() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<ConsultantDocument | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: consultants, isLoading: consultantsLoading } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
  });

  const { data: documentTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/documents/${id}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
      toast({ title: "Document status updated" });
      setSelectedDocument(null);
      setReviewNotes("");
    },
    onError: () => {
      toast({ title: "Failed to update document status", variant: "destructive" });
    },
  });

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

  const allDocuments: (ConsultantDocument & { consultantTngId?: string })[] = [];
  consultants?.forEach((consultant) => {
    consultant.userId;
  });

  const pendingDocumentsCount = allDocuments.filter((d) => d.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-documents-title">Documents</h1>
          <p className="text-muted-foreground">
            Review and manage consultant documents
          </p>
        </div>
        {pendingDocumentsCount > 0 && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {pendingDocumentsCount} Pending Review
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by consultant ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {consultantsLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : consultants && consultants.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Consultant Documents Overview</CardTitle>
            <CardDescription>
              View and manage documents uploaded by consultants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Onboarded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((consultant) => (
                  <TableRow key={consultant.id} data-testid={`row-consultant-${consultant.id}`}>
                    <TableCell className="font-medium">
                      {consultant.tngId}
                    </TableCell>
                    <TableCell>{consultant.location || "-"}</TableCell>
                    <TableCell>
                      {consultant.isOnboarded ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Onboarded
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={consultant.isAvailable ? "default" : "secondary"}>
                        {consultant.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-view-docs-${consultant.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Documents
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents to review</h3>
            <p className="text-muted-foreground">
              Documents will appear here when consultants upload them.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review and approve or reject this document
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-medium">{getDocTypeName(selectedDocument.documentTypeId)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge variant={getStatusColor(selectedDocument.status) as any} className="capitalize">
                  {getStatusIcon(selectedDocument.status)}
                  <span className="ml-1">{selectedDocument.status}</span>
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Review Notes</p>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this document..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedDocument) {
                  updateStatusMutation.mutate({
                    id: selectedDocument.id,
                    status: "rejected",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedDocument) {
                  updateStatusMutation.mutate({
                    id: selectedDocument.id,
                    status: "approved",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
