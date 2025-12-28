import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import {
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  Settings,
  Download,
  Send,
  Play,
  Banknote,
  Pencil,
  Trash2
} from "lucide-react";
import type { 
  PayrollBatch,
  PayrollBatchWithDetails,
  PayrollEntry,
  PayrollEntryWithDetails,
  PayRate,
  PaycheckStub,
  PaycheckStubWithDetails,
  Consultant,
  PayrollAnalytics
} from "@shared/schema";

const BATCH_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "processing", label: "Pending Approval", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "paid", label: "Processed", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

function getStatusBadge(status: string) {
  const config = BATCH_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function formatCurrency(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatHours(hours: string | number | null | undefined) {
  if (hours === null || hours === undefined) return "0.00";
  const num = typeof hours === "string" ? parseFloat(hours) : hours;
  return num.toFixed(2);
}

function PayrollStats({ batches }: { batches: PayrollBatch[] }) {
  const draftCount = batches.filter(b => b.status === "draft").length;
  const processingCount = batches.filter(b => b.status === "processing").length;
  const processedCount = batches.filter(b => b.status === "paid").length;
  const totalPaidAmount = batches
    .filter(b => b.status === "paid")
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-active-batches">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{draftCount}</div>
          <p className="text-xs text-muted-foreground">In draft status</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-pending-payroll">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingCount}</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-total-processed">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processedCount}</div>
          <p className="text-xs text-muted-foreground">Completed batches</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-total-paid">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPaidAmount)}</div>
          <p className="text-xs text-muted-foreground">All time processed</p>
        </CardContent>
      </Card>
    </div>
  );
}

function PayrollBatchRow({ 
  batch,
  onClick 
}: { 
  batch: PayrollBatch;
  onClick: () => void;
}) {
  return (
    <TableRow 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`batch-row-${batch.id}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-muted-foreground" />
          <span>{batch.batchNumber || batch.id.slice(0, 8)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[200px] truncate">{batch.name}</div>
      </TableCell>
      <TableCell>{getStatusBadge(batch.status)}</TableCell>
      <TableCell>
        <div className="text-sm">
          {batch.periodStart ? format(new Date(batch.periodStart), "MMM d") : "N/A"} - {batch.periodEnd ? format(new Date(batch.periodEnd), "MMM d, yyyy") : "N/A"}
        </div>
      </TableCell>
      <TableCell className="font-medium">{formatCurrency(batch.totalAmount)}</TableCell>
      <TableCell>
        <div className="text-sm">{batch.consultantCount || 0} consultants</div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {batch.createdAt ? formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true }) : "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}

function PayrollBatchDetailPanel({
  batchId,
  onClose,
  isAdmin
}: {
  batchId: string;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const [showAddEntryDialog, setShowAddEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PayrollEntryWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState({
    regularHours: "",
    overtimeHours: "",
    hourlyRate: "",
    overtimeRate: "",
    expenseReimbursement: "",
    notes: "",
  });
  const { toast } = useToast();

  const { data: batch, isLoading } = useQuery<PayrollBatchWithDetails>({
    queryKey: ['/api/payroll-batches', batchId],
    enabled: !!batchId,
  });

  const { data: entries = [] } = useQuery<PayrollEntryWithDetails[]>({
    queryKey: [`/api/payroll-entries?batchId=${batchId}`],
    enabled: !!batchId,
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/payroll-batches/${batchId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      toast({ title: "Payroll batch approved" });
    },
    onError: () => {
      toast({ title: "Failed to approve batch", variant: "destructive" });
    }
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/payroll-batches/${batchId}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      toast({ title: "Payroll batch processed" });
    },
    onError: () => {
      toast({ title: "Failed to process batch", variant: "destructive" });
    }
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/payroll-batches/${batchId}`, { status: "processing" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      toast({ title: "Batch submitted for approval" });
    },
    onError: () => {
      toast({ title: "Failed to submit batch", variant: "destructive" });
    }
  });

  const autoCalculateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/payroll-batches/${batchId}/auto-calculate`, {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      const entriesCreated = data?.entriesCreated || 0;
      toast({
        title: "Auto-calculation complete",
        description: `Created ${entriesCreated} entries from timesheet data.`
      });
    },
    onError: () => {
      toast({ title: "Failed to auto-calculate", variant: "destructive" });
    }
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (data: typeof editFormData & { entryId: string }) => {
      const regularHours = parseFloat(data.regularHours) || 0;
      const overtimeHours = parseFloat(data.overtimeHours) || 0;
      const hourlyRate = parseFloat(data.hourlyRate) || 0;
      const overtimeRate = parseFloat(data.overtimeRate) || hourlyRate * 1.5;
      const expenseReimbursement = parseFloat(data.expenseReimbursement) || 0;

      const regularPay = regularHours * hourlyRate;
      const overtimePay = overtimeHours * overtimeRate;
      const grossPay = regularPay + overtimePay;
      const totalPay = grossPay + expenseReimbursement;

      return apiRequest("PATCH", `/api/payroll-entries/${data.entryId}`, {
        regularHours: data.regularHours,
        overtimeHours: data.overtimeHours || "0",
        hourlyRate: data.hourlyRate,
        overtimeRate: data.overtimeRate || String(overtimeRate),
        regularPay: String(regularPay),
        overtimePay: String(overtimePay),
        grossPay: String(grossPay),
        expenseReimbursement: data.expenseReimbursement || "0",
        totalPay: String(totalPay),
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      setEditingEntry(null);
      toast({ title: "Entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return apiRequest("DELETE", `/api/payroll-entries/${entryId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      toast({ title: "Entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    }
  });

  const openEditDialog = (entry: PayrollEntryWithDetails) => {
    setEditFormData({
      regularHours: entry.regularHours || "",
      overtimeHours: entry.overtimeHours || "",
      hourlyRate: entry.hourlyRate || "",
      overtimeRate: entry.overtimeRate || "",
      expenseReimbursement: entry.expenseReimbursement || "",
      notes: entry.notes || "",
    });
    setEditingEntry(entry);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Banknote className="h-4 w-4" />
              <span>{batch.batchNumber || batch.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl font-semibold">{batch.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(batch.status)}
            <span className="text-xl font-bold">{formatCurrency(batch.totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Pay Period</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {batch.periodStart ? format(new Date(batch.periodStart), "MMM d") : "N/A"} - {batch.periodEnd ? format(new Date(batch.periodEnd), "MMM d, yyyy") : "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Consultants</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{batch.consultantCount || entries.length} consultants</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatHours(batch.totalHours)} hours ({formatHours(batch.totalRegularHours)} regular, {formatHours(batch.totalOvertimeHours)} OT)</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{batch.createdAt ? formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true }) : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="entries" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="entries" data-testid="tab-entries">
              Entries ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="flex-1 overflow-auto px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payroll Entries</h3>
              {isAdmin && batch.status === "draft" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => autoCalculateMutation.mutate()}
                    disabled={autoCalculateMutation.isPending}
                    data-testid="button-auto-calculate"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Auto-Calculate from Timesheets
                  </Button>
                  <Button size="sm" onClick={() => setShowAddEntryDialog(true)} data-testid="button-add-entry">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              )}
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No entries in this batch</p>
                {isAdmin && batch.status === "draft" && (
                  <p className="text-sm">Add consultant entries to this batch</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Regular Hours</TableHead>
                    <TableHead>OT Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Total</TableHead>
                    {isAdmin && batch.status === "draft" && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(entry => (
                    <TableRow key={entry.id} data-testid={`entry-row-${entry.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {(entry.consultant?.user?.firstName?.[0] || "") + (entry.consultant?.user?.lastName?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {entry.consultant?.user?.firstName} {entry.consultant?.user?.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatHours(entry.regularHours)}</TableCell>
                      <TableCell>{formatHours(entry.overtimeHours)}</TableCell>
                      <TableCell>{formatCurrency(entry.hourlyRate)}/hr</TableCell>
                      <TableCell>{formatCurrency(entry.grossPay)}</TableCell>
                      <TableCell>{formatCurrency(entry.expenseReimbursement)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(entry.totalPay)}</TableCell>
                      {isAdmin && batch.status === "draft" && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(entry)}
                              data-testid={`button-edit-entry-${entry.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              disabled={deleteEntryMutation.isPending}
                              data-testid={`button-delete-entry-${entry.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="summary" className="flex-1 overflow-auto px-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Batch Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Regular Pay</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(entries.reduce((sum, e) => sum + parseFloat(e.regularPay || "0"), 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Overtime Pay</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(entries.reduce((sum, e) => sum + parseFloat(e.overtimePay || "0"), 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Gross Pay</div>
                    <div className="text-lg font-semibold">{formatCurrency(batch.totalGrossPay)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                    <div className="text-lg font-semibold">{formatCurrency(batch.totalExpenses)}</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground">Grand Total</div>
                  <div className="text-2xl font-bold">{formatCurrency(batch.totalAmount)}</div>
                </div>
                {batch.notes && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <p className="text-sm">{batch.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t flex justify-between gap-2">
        <Button variant="outline" onClick={onClose} data-testid="button-close-detail">
          Close
        </Button>
        <div className="flex gap-2">
          {isAdmin && batch.status === "draft" && (
            <Button 
              onClick={() => submitForApprovalMutation.mutate()}
              disabled={submitForApprovalMutation.isPending || entries.length === 0}
              data-testid="button-submit-batch"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          )}
          {isAdmin && batch.status === "processing" && (
            <Button 
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              data-testid="button-approve-batch"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {isAdmin && batch.status === "approved" && (
            <Button 
              onClick={() => processMutation.mutate()}
              disabled={processMutation.isPending}
              data-testid="button-process-batch"
            >
              <Play className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          )}
        </div>
      </div>

      <AddPayrollEntryDialog
        open={showAddEntryDialog}
        onOpenChange={setShowAddEntryDialog}
        batchId={batchId}
        consultants={consultants}
      />

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Payroll Entry</DialogTitle>
            <DialogDescription>
              Update the payment details for {editingEntry?.consultant?.user?.firstName} {editingEntry?.consultant?.user?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Regular Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editFormData.regularHours}
                  onChange={(e) => setEditFormData({ ...editFormData, regularHours: e.target.value })}
                  data-testid="edit-input-regular-hours"
                />
              </div>
              <div className="space-y-2">
                <Label>Overtime Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editFormData.overtimeHours}
                  onChange={(e) => setEditFormData({ ...editFormData, overtimeHours: e.target.value })}
                  data-testid="edit-input-overtime-hours"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.hourlyRate}
                  onChange={(e) => setEditFormData({ ...editFormData, hourlyRate: e.target.value })}
                  data-testid="edit-input-hourly-rate"
                />
              </div>
              <div className="space-y-2">
                <Label>Overtime Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.overtimeRate}
                  onChange={(e) => setEditFormData({ ...editFormData, overtimeRate: e.target.value })}
                  placeholder="Default: 1.5x hourly"
                  data-testid="edit-input-overtime-rate"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expense Reimbursement ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editFormData.expenseReimbursement}
                onChange={(e) => setEditFormData({ ...editFormData, expenseReimbursement: e.target.value })}
                data-testid="edit-input-expense-reimbursement"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Additional notes..."
                data-testid="edit-input-notes"
              />
            </div>
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Calculated Total</div>
              <div className="text-xl font-bold">
                {formatCurrency(
                  ((parseFloat(editFormData.regularHours) || 0) * (parseFloat(editFormData.hourlyRate) || 0)) +
                  ((parseFloat(editFormData.overtimeHours) || 0) * (parseFloat(editFormData.overtimeRate) || (parseFloat(editFormData.hourlyRate) || 0) * 1.5)) +
                  (parseFloat(editFormData.expenseReimbursement) || 0)
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingEntry && updateEntryMutation.mutate({ ...editFormData, entryId: editingEntry.id })}
              disabled={updateEntryMutation.isPending}
              data-testid="button-save-entry"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreatePayrollBatchDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    periodStart: format(new Date(), "yyyy-MM-dd"),
    periodEnd: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/payroll-batches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches'] });
      onOpenChange(false);
      setFormData({
        name: "",
        periodStart: format(new Date(), "yyyy-MM-dd"),
        periodEnd: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      });
      toast({ title: "Payroll batch created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create payroll batch", variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Payroll Batch</DialogTitle>
          <DialogDescription>
            Create a new payroll batch to process consultant payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Batch Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., November 2024 Payroll"
              data-testid="input-batch-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period Start *</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                data-testid="input-period-start"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period End *</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                data-testid="input-period-end"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="min-h-[80px]"
              data-testid="input-batch-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.name || !formData.periodStart || !formData.periodEnd || createMutation.isPending}
            data-testid="button-create-batch"
          >
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPayrollEntryDialog({
  open,
  onOpenChange,
  batchId,
  consultants
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  consultants: Consultant[];
}) {
  const [formData, setFormData] = useState({
    consultantId: "",
    regularHours: "",
    overtimeHours: "",
    hourlyRate: "",
    overtimeRate: "",
    expenseReimbursement: "",
    notes: "",
  });
  const { toast } = useToast();

  const { data: currentRate } = useQuery<PayRate>({
    queryKey: ['/api/pay-rates/current', formData.consultantId],
    enabled: !!formData.consultantId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const regularHours = parseFloat(data.regularHours) || 0;
      const overtimeHours = parseFloat(data.overtimeHours) || 0;
      const hourlyRate = parseFloat(data.hourlyRate) || 0;
      const overtimeRate = parseFloat(data.overtimeRate) || hourlyRate * 1.5;
      const expenseReimbursement = parseFloat(data.expenseReimbursement) || 0;
      
      const regularPay = regularHours * hourlyRate;
      const overtimePay = overtimeHours * overtimeRate;
      const grossPay = regularPay + overtimePay;
      const totalPay = grossPay + expenseReimbursement;

      return apiRequest("POST", "/api/payroll-entries", {
        batchId,
        consultantId: data.consultantId,
        regularHours: data.regularHours,
        overtimeHours: data.overtimeHours || "0",
        hourlyRate: data.hourlyRate,
        overtimeRate: data.overtimeRate || String(overtimeRate),
        regularPay: String(regularPay),
        overtimePay: String(overtimePay),
        grossPay: String(grossPay),
        expenseReimbursement: data.expenseReimbursement || "0",
        totalPay: String(totalPay),
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-batches', batchId] });
      onOpenChange(false);
      setFormData({
        consultantId: "",
        regularHours: "",
        overtimeHours: "",
        hourlyRate: "",
        overtimeRate: "",
        expenseReimbursement: "",
        notes: "",
      });
      toast({ title: "Payroll entry added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add payroll entry", variant: "destructive" });
    }
  });

  const handleConsultantChange = (consultantId: string) => {
    setFormData({ ...formData, consultantId });
  };

  const regularHours = parseFloat(formData.regularHours) || 0;
  const overtimeHours = parseFloat(formData.overtimeHours) || 0;
  const hourlyRate = parseFloat(formData.hourlyRate) || 0;
  const overtimeRate = parseFloat(formData.overtimeRate) || hourlyRate * 1.5;
  const expenseReimbursement = parseFloat(formData.expenseReimbursement) || 0;
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * overtimeRate;
  const grossPay = regularPay + overtimePay;
  const totalPay = grossPay + expenseReimbursement;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Payroll Entry</DialogTitle>
          <DialogDescription>
            Add a consultant entry to this payroll batch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Consultant *</Label>
            <Select
              value={formData.consultantId}
              onValueChange={handleConsultantChange}
            >
              <SelectTrigger data-testid="select-consultant">
                <SelectValue placeholder="Select consultant" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map(consultant => (
                  <SelectItem key={consultant.id} value={consultant.id}>
                    {consultant.tngId || consultant.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentRate && (
              <p className="text-xs text-muted-foreground">
                Current rate: {formatCurrency(currentRate.hourlyRate)}/hr
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Regular Hours *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.regularHours}
                onChange={(e) => setFormData({ ...formData, regularHours: e.target.value })}
                placeholder="0.00"
                data-testid="input-regular-hours"
              />
            </div>
            <div className="space-y-2">
              <Label>Overtime Hours</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.overtimeHours}
                onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                placeholder="0.00"
                data-testid="input-overtime-hours"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hourly Rate *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="0.00"
                data-testid="input-hourly-rate"
              />
            </div>
            <div className="space-y-2">
              <Label>Overtime Rate</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.overtimeRate}
                onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                placeholder={`${(hourlyRate * 1.5).toFixed(2)} (1.5x)`}
                data-testid="input-overtime-rate"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expense Reimbursement</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.expenseReimbursement}
              onChange={(e) => setFormData({ ...formData, expenseReimbursement: e.target.value })}
              placeholder="0.00"
              data-testid="input-expense-reimbursement"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              data-testid="input-entry-notes"
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Regular Pay:</div>
                <div className="text-right font-medium">{formatCurrency(regularPay)}</div>
                <div>Overtime Pay:</div>
                <div className="text-right font-medium">{formatCurrency(overtimePay)}</div>
                <div>Gross Pay:</div>
                <div className="text-right font-medium">{formatCurrency(grossPay)}</div>
                <div>Expenses:</div>
                <div className="text-right font-medium">{formatCurrency(expenseReimbursement)}</div>
                <div className="border-t pt-2 font-medium">Total:</div>
                <div className="border-t pt-2 text-right font-bold">{formatCurrency(totalPay)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.consultantId || !formData.regularHours || !formData.hourlyRate || createMutation.isPending}
            data-testid="button-add-entry-submit"
          >
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayRatesManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRate, setEditingRate] = useState<PayRate | null>(null);
  const { toast } = useToast();

  const { data: payRates = [], isLoading } = useQuery<PayRate[]>({
    queryKey: ['/api/pay-rates'],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const [formData, setFormData] = useState({
    consultantId: "",
    hourlyRate: "",
    overtimeRate: "",
    effectiveFrom: format(new Date(), "yyyy-MM-dd"),
    effectiveTo: "",
    notes: "",
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/pay-rates", {
        ...data,
        effectiveTo: data.effectiveTo || undefined,
        overtimeRate: data.overtimeRate || undefined,
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pay-rates'] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Pay rate created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create pay rate", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/pay-rates/${id}`, {
        ...data,
        effectiveTo: data.effectiveTo || undefined,
        overtimeRate: data.overtimeRate || undefined,
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pay-rates'] });
      setEditingRate(null);
      resetForm();
      toast({ title: "Pay rate updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update pay rate", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/pay-rates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pay-rates'] });
      toast({ title: "Pay rate deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete pay rate", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      consultantId: "",
      hourlyRate: "",
      overtimeRate: "",
      effectiveFrom: format(new Date(), "yyyy-MM-dd"),
      effectiveTo: "",
      notes: "",
      isActive: true,
    });
  };

  const openEditDialog = (rate: PayRate) => {
    setEditingRate(rate);
    setFormData({
      consultantId: rate.consultantId,
      hourlyRate: rate.hourlyRate,
      overtimeRate: rate.overtimeRate || "",
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo || "",
      notes: rate.notes || "",
      isActive: rate.isActive,
    });
  };

  const getConsultantName = (consultantId: string) => {
    const consultant = consultants.find(c => c.id === consultantId);
    return consultant?.tngId || consultantId.slice(0, 8);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pay Rates</h3>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-add-pay-rate">
          <Plus className="h-4 w-4 mr-2" />
          Add Pay Rate
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Consultant</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Overtime Rate</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Effective To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payRates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No pay rates found
              </TableCell>
            </TableRow>
          ) : (
            payRates.map(rate => (
              <TableRow key={rate.id} data-testid={`pay-rate-row-${rate.id}`}>
                <TableCell className="font-medium">{getConsultantName(rate.consultantId)}</TableCell>
                <TableCell>{formatCurrency(rate.hourlyRate)}/hr</TableCell>
                <TableCell>{rate.overtimeRate ? `${formatCurrency(rate.overtimeRate)}/hr` : "1.5x"}</TableCell>
                <TableCell>{format(new Date(rate.effectiveFrom), "MMM d, yyyy")}</TableCell>
                <TableCell>{rate.effectiveTo ? format(new Date(rate.effectiveTo), "MMM d, yyyy") : "Ongoing"}</TableCell>
                <TableCell>
                  <Badge variant={rate.isActive ? "default" : "secondary"}>
                    {rate.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(rate)}
                      data-testid={`button-edit-pay-rate-${rate.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this pay rate?")) {
                          deleteMutation.mutate(rate.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-pay-rate-${rate.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={showCreateDialog || !!editingRate} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingRate(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? "Edit Pay Rate" : "Create Pay Rate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Consultant *</Label>
              <Select
                value={formData.consultantId}
                onValueChange={(value) => setFormData({ ...formData, consultantId: value })}
                disabled={!!editingRate}
              >
                <SelectTrigger data-testid="select-pay-rate-consultant">
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map(consultant => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.tngId || consultant.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-pay-rate-hourly"
                />
              </div>
              <div className="space-y-2">
                <Label>Overtime Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overtimeRate}
                  onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                  placeholder="1.5x hourly rate"
                  data-testid="input-pay-rate-overtime"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  data-testid="input-pay-rate-effective-from"
                />
              </div>
              <div className="space-y-2">
                <Label>Effective To</Label>
                <Input
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  data-testid="input-pay-rate-effective-to"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                data-testid="input-pay-rate-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingRate(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingRate) {
                  updateMutation.mutate({ id: editingRate.id, data: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={!formData.consultantId || !formData.hourlyRate || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-pay-rate"
            >
              {editingRate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaycheckStubsTab() {
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: stubs = [], isLoading } = useQuery<PaycheckStubWithDetails[]>({
    queryKey: ['/api/paycheck-stubs', { consultantId: consultantFilter !== "all" ? consultantFilter : undefined }],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const handleDownload = (stub: PaycheckStubWithDetails) => {
    if (stub.pdfUrl) {
      window.open(stub.pdfUrl, '_blank');
    } else {
      toast({ title: "PDF not available", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h3 className="text-lg font-medium">Paycheck Stubs</h3>
        <Select value={consultantFilter} onValueChange={setConsultantFilter}>
          <SelectTrigger className="w-[200px]" data-testid="filter-consultant">
            <SelectValue placeholder="Filter by consultant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Consultants</SelectItem>
            {consultants.map(consultant => (
              <SelectItem key={consultant.id} value={consultant.id}>
                {consultant.tngId || consultant.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {stubs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No paycheck stubs found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consultant</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Gross Pay</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stubs.map(stub => (
              <TableRow key={stub.id} data-testid={`stub-row-${stub.id}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {(stub.consultant?.user?.firstName?.[0] || "") + (stub.consultant?.user?.lastName?.[0] || "")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {stub.consultant?.user?.firstName} {stub.consultant?.user?.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{stub.payDate ? format(new Date(stub.payDate), "MMM d, yyyy") : "N/A"}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {stub.periodStart ? format(new Date(stub.periodStart), "MMM d") : "N/A"} - {stub.periodEnd ? format(new Date(stub.periodEnd), "MMM d") : "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  {formatHours(parseFloat(stub.regularHours || "0") + parseFloat(stub.overtimeHours || "0"))} hrs
                </TableCell>
                <TableCell>{formatCurrency(stub.grossPay)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(stub.netPay)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownload(stub)}
                    data-testid={`button-download-stub-${stub.id}`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function Payroll() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { isAdmin } = useAuth();

  const { data: batches = [], isLoading: batchesLoading } = useQuery<PayrollBatch[]>({
    queryKey: ['/api/payroll-batches'],
  });

  const filteredBatches = batches.filter(batch => {
    if (statusFilter !== "all" && batch.status !== statusFilter) return false;
    return true;
  });

  // CSV Export function for batches
  const exportBatchesToCSV = () => {
    const headers = ["Batch Name", "Status", "Period Start", "Period End", "Pay Date", "Total Amount", "Total Entries", "Created"];
    const rows = filteredBatches.map(batch => [
      batch.name || "",
      BATCH_STATUSES.find(s => s.value === batch.status)?.label || batch.status,
      batch.periodStart ? format(new Date(batch.periodStart), "yyyy-MM-dd") : "",
      batch.periodEnd ? format(new Date(batch.periodEnd), "yyyy-MM-dd") : "",
      batch.payDate ? format(new Date(batch.payDate), "yyyy-MM-dd") : "",
      batch.totalAmount || "0",
      batch.totalEntries?.toString() || "0",
      batch.createdAt ? format(new Date(batch.createdAt), "yyyy-MM-dd") : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payroll-batches-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (batchesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Payroll</h1>
          <p className="text-muted-foreground">Manage payroll batches, pay rates, and paycheck stubs</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-batch">
            <Plus className="h-4 w-4 mr-2" />
            New Payroll Batch
          </Button>
        )}
      </div>

      <PayrollStats batches={batches} />

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches" data-testid="tab-batches">
            <Banknote className="h-4 w-4 mr-2" />
            Payroll Batches
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="pay-rates" data-testid="tab-pay-rates">
              <DollarSign className="h-4 w-4 mr-2" />
              Pay Rates
            </TabsTrigger>
          )}
          <TabsTrigger value="stubs" data-testid="tab-stubs">
            <FileText className="h-4 w-4 mr-2" />
            Paycheck Stubs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Payroll Batches</CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]" data-testid="filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {BATCH_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportBatchesToCSV}
                    disabled={filteredBatches.length === 0}
                    data-testid="button-export-batches-csv"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBatches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payroll batches found</p>
                  {isAdmin && (
                    <p className="text-sm">Create your first payroll batch to get started</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Consultants</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map(batch => (
                      <PayrollBatchRow
                        key={batch.id}
                        batch={batch}
                        onClick={() => setSelectedBatchId(batch.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="pay-rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pay Rates Management</CardTitle>
                <CardDescription>
                  Manage consultant pay rates and overtime rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PayRatesManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="stubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paycheck Stubs</CardTitle>
              <CardDescription>
                View and download paycheck stubs for consultants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaycheckStubsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedBatchId} onOpenChange={(open) => !open && setSelectedBatchId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          {selectedBatchId && (
            <PayrollBatchDetailPanel
              batchId={selectedBatchId}
              onClose={() => setSelectedBatchId(null)}
              isAdmin={isAdmin}
            />
          )}
        </DialogContent>
      </Dialog>

      <CreatePayrollBatchDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
