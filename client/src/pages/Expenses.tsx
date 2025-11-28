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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  FileText,
  Car,
  Utensils,
  Hotel,
  Plane,
  Package,
  Send,
  User,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  Settings,
  MapPin,
  X
} from "lucide-react";
import type { 
  Project, 
  Consultant,
  Expense,
  ExpenseWithDetails,
  PerDiemPolicy,
  MileageRate
} from "@shared/schema";

const EXPENSE_CATEGORIES = [
  { value: "travel", label: "Travel", icon: Plane },
  { value: "lodging", label: "Lodging", icon: Hotel },
  { value: "meals", label: "Meals", icon: Utensils },
  { value: "transportation", label: "Transportation", icon: Car },
  { value: "parking", label: "Parking", icon: Car },
  { value: "mileage", label: "Mileage", icon: MapPin },
  { value: "per_diem", label: "Per Diem", icon: DollarSign },
  { value: "equipment", label: "Equipment", icon: Package },
  { value: "supplies", label: "Supplies", icon: Package },
  { value: "training", label: "Training", icon: FileText },
  { value: "other", label: "Other", icon: FileText },
];

const EXPENSE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "reimbursed", label: "Reimbursed", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
];

function getCategoryIcon(category: string) {
  const config = EXPENSE_CATEGORIES.find(c => c.value === category);
  const Icon = config?.icon || FileText;
  return <Icon className="h-4 w-4" />;
}

function getCategoryLabel(category: string) {
  const config = EXPENSE_CATEGORIES.find(c => c.value === category);
  return config?.label || category;
}

function getStatusBadge(status: string) {
  const config = EXPENSE_STATUSES.find(s => s.value === status);
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

function ExpenseStats({ expenses }: { expenses: ExpenseWithDetails[] }) {
  const pendingCount = expenses.filter(e => e.status === "submitted").length;
  const approvedCount = expenses.filter(e => e.status === "approved").length;
  const rejectedCount = expenses.filter(e => e.status === "rejected").length;
  const pendingAmount = expenses
    .filter(e => e.status === "submitted")
    .reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-pending-expenses">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-approved-expenses">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedCount}</div>
          <p className="text-xs text-muted-foreground">Ready for reimbursement</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-rejected-expenses">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rejectedCount}</div>
          <p className="text-xs text-muted-foreground">Needs revision</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-pending-amount">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
          <p className="text-xs text-muted-foreground">Total awaiting approval</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseRow({ 
  expense,
  onClick 
}: { 
  expense: ExpenseWithDetails;
  onClick: () => void;
}) {
  return (
    <TableRow 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`expense-row-${expense.id}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getCategoryIcon(expense.category)}
          <span>{getCategoryLabel(expense.category)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[200px] truncate">{expense.description}</div>
      </TableCell>
      <TableCell>{getStatusBadge(expense.status)}</TableCell>
      <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
      <TableCell>
        <div className="text-sm">
          {expense.project?.name || "No project"}
        </div>
      </TableCell>
      <TableCell>
        {expense.consultant?.user ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(expense.consultant.user.firstName?.[0] || "") + (expense.consultant.user.lastName?.[0] || "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {expense.consultant.user.firstName} {expense.consultant.user.lastName}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Unknown</span>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {expense.expenseDate ? format(new Date(expense.expenseDate), "MMM d, yyyy") : "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}

function ExpenseDetailPanel({
  expenseId,
  onClose,
  isAdmin
}: {
  expenseId: string;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  const { data: expense, isLoading } = useQuery<ExpenseWithDetails>({
    queryKey: ['/api/expenses', expenseId],
    enabled: !!expenseId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/expenses/${expenseId}/submit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses', expenseId] });
      toast({ title: "Expense submitted for approval" });
    },
    onError: () => {
      toast({ title: "Failed to submit expense", variant: "destructive" });
    }
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/expenses/${expenseId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses', expenseId] });
      toast({ title: "Expense approved" });
    },
    onError: () => {
      toast({ title: "Failed to approve expense", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest("POST", `/api/expenses/${expenseId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses', expenseId] });
      setShowRejectDialog(false);
      setRejectReason("");
      toast({ title: "Expense rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject expense", variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!expense) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {getCategoryIcon(expense.category)}
              <span>{getCategoryLabel(expense.category)}</span>
            </div>
            <h2 className="text-xl font-semibold">{expense.description}</h2>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(expense.status)}
            <span className="text-xl font-bold">{formatCurrency(expense.amount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Project</div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{expense.project?.name || "No project"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Submitted By</div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {expense.consultant?.user 
                  ? `${expense.consultant.user.firstName || ""} ${expense.consultant.user.lastName || ""}`.trim() || "Unknown"
                  : "Unknown"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Expense Date</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{expense.expenseDate ? format(new Date(expense.expenseDate), "MMM d, yyyy") : "N/A"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{expense.createdAt ? formatDistanceToNow(new Date(expense.createdAt), { addSuffix: true }) : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        {expense.category === "mileage" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Mileage Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Start Location</div>
                  <div>{expense.mileageStart || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">End Location</div>
                  <div>{expense.mileageEnd || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                  <div>{expense.mileageDistance ? `${expense.mileageDistance} miles` : "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {expense.category === "per_diem" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Per Diem Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Days</div>
                  <div>{expense.perDiemDays || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {expense.receiptUrl && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <a 
                  href={expense.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                  data-testid="link-receipt"
                >
                  <Eye className="h-4 w-4" />
                  View Receipt
                </a>
                {expense.receiptFileName && (
                  <span className="text-sm text-muted-foreground">{expense.receiptFileName}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {expense.reviewNotes && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Review Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{expense.reviewNotes}</p>
              {expense.reviewer && (
                <p className="text-sm text-muted-foreground mt-2">
                  Reviewed by {expense.reviewer.firstName} {expense.reviewer.lastName}
                  {expense.reviewedAt && ` on ${format(new Date(expense.reviewedAt), "MMM d, yyyy")}`}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      <div className="p-4 border-t flex justify-between gap-2">
        <Button variant="outline" onClick={onClose} data-testid="button-close-detail">
          Close
        </Button>
        <div className="flex gap-2">
          {expense.status === "draft" && (
            <Button 
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              data-testid="button-submit-expense"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          )}
          {isAdmin && expense.status === "submitted" && (
            <>
              <Button 
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                data-testid="button-reject-expense"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                data-testid="button-approve-expense"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this expense.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-reject-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => rejectMutation.mutate(rejectReason)}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              Reject Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateExpenseDialog({
  open,
  onOpenChange,
  projects,
  consultants,
  mileageRates,
  perDiemPolicies
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  consultants: Consultant[];
  mileageRates: MileageRate[];
  perDiemPolicies: PerDiemPolicy[];
}) {
  const [formData, setFormData] = useState({
    consultantId: "",
    projectId: "",
    category: "meals",
    description: "",
    amount: "",
    expenseDate: format(new Date(), "yyyy-MM-dd"),
    receiptUrl: "",
    mileageStart: "",
    mileageEnd: "",
    mileageDistance: "",
    mileageRateId: "",
    perDiemPolicyId: "",
    perDiemDays: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: Record<string, unknown> = {
        consultantId: data.consultantId,
        projectId: data.projectId || undefined,
        category: data.category,
        description: data.description,
        amount: data.amount,
        expenseDate: data.expenseDate,
        receiptUrl: data.receiptUrl || undefined,
      };

      if (data.category === "mileage") {
        payload.mileageStart = data.mileageStart;
        payload.mileageEnd = data.mileageEnd;
        payload.mileageDistance = data.mileageDistance || undefined;
        payload.mileageRateId = data.mileageRateId || undefined;
      }

      if (data.category === "per_diem") {
        payload.perDiemPolicyId = data.perDiemPolicyId || undefined;
        payload.perDiemDays = data.perDiemDays ? parseInt(data.perDiemDays) : undefined;
      }

      return apiRequest("POST", "/api/expenses", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      onOpenChange(false);
      setFormData({
        consultantId: "",
        projectId: "",
        category: "meals",
        description: "",
        amount: "",
        expenseDate: format(new Date(), "yyyy-MM-dd"),
        receiptUrl: "",
        mileageStart: "",
        mileageEnd: "",
        mileageDistance: "",
        mileageRateId: "",
        perDiemPolicyId: "",
        perDiemDays: "",
      });
      toast({ title: "Expense created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create expense", variant: "destructive" });
    }
  });

  const handleMileageRateChange = (rateId: string) => {
    setFormData({ ...formData, mileageRateId: rateId });
    const rate = mileageRates.find(r => r.id === rateId);
    if (rate && formData.mileageDistance) {
      const distance = parseFloat(formData.mileageDistance);
      const ratePerMile = parseFloat(rate.ratePerMile);
      const amount = (distance * ratePerMile).toFixed(2);
      setFormData(prev => ({ ...prev, mileageRateId: rateId, amount }));
    }
  };

  const handleMileageDistanceChange = (distance: string) => {
    setFormData({ ...formData, mileageDistance: distance });
    if (formData.mileageRateId && distance) {
      const rate = mileageRates.find(r => r.id === formData.mileageRateId);
      if (rate) {
        const dist = parseFloat(distance);
        const ratePerMile = parseFloat(rate.ratePerMile);
        const amount = (dist * ratePerMile).toFixed(2);
        setFormData(prev => ({ ...prev, mileageDistance: distance, amount }));
      }
    }
  };

  const handlePerDiemPolicyChange = (policyId: string) => {
    setFormData({ ...formData, perDiemPolicyId: policyId });
    const policy = perDiemPolicies.find(p => p.id === policyId);
    if (policy && formData.perDiemDays) {
      const days = parseInt(formData.perDiemDays);
      const dailyRate = parseFloat(policy.dailyRate);
      const amount = (days * dailyRate).toFixed(2);
      setFormData(prev => ({ ...prev, perDiemPolicyId: policyId, amount }));
    }
  };

  const handlePerDiemDaysChange = (days: string) => {
    setFormData({ ...formData, perDiemDays: days });
    if (formData.perDiemPolicyId && days) {
      const policy = perDiemPolicies.find(p => p.id === formData.perDiemPolicyId);
      if (policy) {
        const d = parseInt(days);
        const dailyRate = parseFloat(policy.dailyRate);
        const amount = (d * dailyRate).toFixed(2);
        setFormData(prev => ({ ...prev, perDiemDays: days, amount }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Expense</DialogTitle>
          <DialogDescription>
            Submit a new expense for reimbursement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consultant">Consultant *</Label>
            <Select
              value={formData.consultantId}
              onValueChange={(value) => setFormData({ ...formData, consultantId: value })}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger data-testid="select-project">
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the expense..."
              className="min-h-[80px]"
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                data-testid="input-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                data-testid="input-expense-date"
              />
            </div>
          </div>

          {formData.category === "mileage" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Mileage Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileageStart">Start Location</Label>
                    <Input
                      id="mileageStart"
                      value={formData.mileageStart}
                      onChange={(e) => setFormData({ ...formData, mileageStart: e.target.value })}
                      placeholder="e.g., 123 Main St"
                      data-testid="input-mileage-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileageEnd">End Location</Label>
                    <Input
                      id="mileageEnd"
                      value={formData.mileageEnd}
                      onChange={(e) => setFormData({ ...formData, mileageEnd: e.target.value })}
                      placeholder="e.g., 456 Oak Ave"
                      data-testid="input-mileage-end"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileageDistance">Distance (miles)</Label>
                    <Input
                      id="mileageDistance"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.mileageDistance}
                      onChange={(e) => handleMileageDistanceChange(e.target.value)}
                      placeholder="0.0"
                      data-testid="input-mileage-distance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileageRate">Mileage Rate</Label>
                    <Select
                      value={formData.mileageRateId}
                      onValueChange={handleMileageRateChange}
                    >
                      <SelectTrigger data-testid="select-mileage-rate">
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                      <SelectContent>
                        {mileageRates.filter(r => r.isActive).map(rate => (
                          <SelectItem key={rate.id} value={rate.id}>
                            {rate.name} (${rate.ratePerMile}/mile)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.category === "per_diem" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Per Diem Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perDiemPolicy">Per Diem Policy</Label>
                    <Select
                      value={formData.perDiemPolicyId}
                      onValueChange={handlePerDiemPolicyChange}
                    >
                      <SelectTrigger data-testid="select-per-diem-policy">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {perDiemPolicies.filter(p => p.isActive).map(policy => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.name} (${policy.dailyRate}/day)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perDiemDays">Number of Days</Label>
                    <Input
                      id="perDiemDays"
                      type="number"
                      min="1"
                      value={formData.perDiemDays}
                      onChange={(e) => handlePerDiemDaysChange(e.target.value)}
                      placeholder="1"
                      data-testid="input-per-diem-days"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <Input
              id="receiptUrl"
              type="url"
              value={formData.receiptUrl}
              onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
              placeholder="https://..."
              data-testid="input-receipt-url"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to the uploaded receipt image or document
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.consultantId || !formData.description || !formData.amount || createMutation.isPending}
            data-testid="button-create-expense"
          >
            Create Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PerDiemManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PerDiemPolicy | null>(null);
  const { toast } = useToast();

  const { data: policies = [], isLoading } = useQuery<PerDiemPolicy[]>({
    queryKey: ['/api/per-diem-policies'],
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dailyRate: "",
    breakfastRate: "",
    lunchRate: "",
    dinnerRate: "",
    incidentalRate: "",
    location: "",
    effectiveFrom: format(new Date(), "yyyy-MM-dd"),
    effectiveTo: "",
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/per-diem-policies", {
        ...data,
        dailyRate: data.dailyRate,
        breakfastRate: data.breakfastRate || undefined,
        lunchRate: data.lunchRate || undefined,
        dinnerRate: data.dinnerRate || undefined,
        incidentalRate: data.incidentalRate || undefined,
        effectiveTo: data.effectiveTo || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/per-diem-policies'] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Per diem policy created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create per diem policy", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/per-diem-policies/${id}`, {
        ...data,
        dailyRate: data.dailyRate,
        breakfastRate: data.breakfastRate || undefined,
        lunchRate: data.lunchRate || undefined,
        dinnerRate: data.dinnerRate || undefined,
        incidentalRate: data.incidentalRate || undefined,
        effectiveTo: data.effectiveTo || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/per-diem-policies'] });
      setEditingPolicy(null);
      resetForm();
      toast({ title: "Per diem policy updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update per diem policy", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/per-diem-policies/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/per-diem-policies'] });
      toast({ title: "Per diem policy deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete per diem policy", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dailyRate: "",
      breakfastRate: "",
      lunchRate: "",
      dinnerRate: "",
      incidentalRate: "",
      location: "",
      effectiveFrom: format(new Date(), "yyyy-MM-dd"),
      effectiveTo: "",
      isActive: true,
    });
  };

  const openEditDialog = (policy: PerDiemPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || "",
      dailyRate: policy.dailyRate,
      breakfastRate: policy.breakfastRate || "",
      lunchRate: policy.lunchRate || "",
      dinnerRate: policy.dinnerRate || "",
      incidentalRate: policy.incidentalRate || "",
      location: policy.location || "",
      effectiveFrom: policy.effectiveFrom,
      effectiveTo: policy.effectiveTo || "",
      isActive: policy.isActive,
    });
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
        <h3 className="text-lg font-medium">Per Diem Policies</h3>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-add-per-diem">
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No per diem policies found
              </TableCell>
            </TableRow>
          ) : (
            policies.map(policy => (
              <TableRow key={policy.id} data-testid={`per-diem-row-${policy.id}`}>
                <TableCell className="font-medium">{policy.name}</TableCell>
                <TableCell>{formatCurrency(policy.dailyRate)}</TableCell>
                <TableCell>{policy.location || "All locations"}</TableCell>
                <TableCell>{format(new Date(policy.effectiveFrom), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={policy.isActive ? "default" : "secondary"}>
                    {policy.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(policy)}
                      data-testid={`button-edit-per-diem-${policy.id}`}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(policy.id)}
                      data-testid={`button-delete-per-diem-${policy.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={showCreateDialog || !!editingPolicy} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingPolicy(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Edit Per Diem Policy" : "Create Per Diem Policy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-per-diem-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  data-testid="input-per-diem-daily-rate"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-per-diem-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., New York, NY"
                  data-testid="input-per-diem-location"
                />
              </div>
              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  data-testid="input-per-diem-effective-from"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingPolicy(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingPolicy) {
                  updateMutation.mutate({ id: editingPolicy.id, data: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={!formData.name || !formData.dailyRate || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-per-diem"
            >
              {editingPolicy ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MileageRateManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRate, setEditingRate] = useState<MileageRate | null>(null);
  const { toast } = useToast();

  const { data: rates = [], isLoading } = useQuery<MileageRate[]>({
    queryKey: ['/api/mileage-rates'],
  });

  const [formData, setFormData] = useState({
    name: "",
    ratePerMile: "",
    vehicleType: "",
    effectiveFrom: format(new Date(), "yyyy-MM-dd"),
    effectiveTo: "",
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/mileage-rates", {
        ...data,
        effectiveTo: data.effectiveTo || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mileage-rates'] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Mileage rate created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create mileage rate", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/mileage-rates/${id}`, {
        ...data,
        effectiveTo: data.effectiveTo || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mileage-rates'] });
      setEditingRate(null);
      resetForm();
      toast({ title: "Mileage rate updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update mileage rate", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/mileage-rates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mileage-rates'] });
      toast({ title: "Mileage rate deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete mileage rate", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      ratePerMile: "",
      vehicleType: "",
      effectiveFrom: format(new Date(), "yyyy-MM-dd"),
      effectiveTo: "",
      isActive: true,
    });
  };

  const openEditDialog = (rate: MileageRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      ratePerMile: rate.ratePerMile,
      vehicleType: rate.vehicleType || "",
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo || "",
      isActive: rate.isActive,
    });
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
        <h3 className="text-lg font-medium">Mileage Rates</h3>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-add-mileage-rate">
          <Plus className="h-4 w-4 mr-2" />
          Add Rate
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Rate per Mile</TableHead>
            <TableHead>Vehicle Type</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No mileage rates found
              </TableCell>
            </TableRow>
          ) : (
            rates.map(rate => (
              <TableRow key={rate.id} data-testid={`mileage-rate-row-${rate.id}`}>
                <TableCell className="font-medium">{rate.name}</TableCell>
                <TableCell>${rate.ratePerMile}/mile</TableCell>
                <TableCell>{rate.vehicleType || "Any"}</TableCell>
                <TableCell>{format(new Date(rate.effectiveFrom), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={rate.isActive ? "default" : "secondary"}>
                    {rate.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(rate)}
                      data-testid={`button-edit-mileage-rate-${rate.id}`}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(rate.id)}
                      data-testid={`button-delete-mileage-rate-${rate.id}`}
                    >
                      Delete
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
            <DialogTitle>{editingRate ? "Edit Mileage Rate" : "Create Mileage Rate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-mileage-rate-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Rate per Mile *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.ratePerMile}
                  onChange={(e) => setFormData({ ...formData, ratePerMile: e.target.value })}
                  placeholder="0.67"
                  data-testid="input-mileage-rate-per-mile"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Input
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  placeholder="e.g., Personal Vehicle"
                  data-testid="input-mileage-rate-vehicle-type"
                />
              </div>
              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  data-testid="input-mileage-rate-effective-from"
                />
              </div>
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
              disabled={!formData.name || !formData.ratePerMile || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-mileage-rate"
            >
              {editingRate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Expenses() {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { user, isAdmin } = useAuth();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<ExpenseWithDetails[]>({
    queryKey: ['/api/expenses'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const { data: mileageRates = [] } = useQuery<MileageRate[]>({
    queryKey: ['/api/mileage-rates'],
  });

  const { data: perDiemPolicies = [] } = useQuery<PerDiemPolicy[]>({
    queryKey: ['/api/per-diem-policies'],
  });

  const filteredExpenses = expenses.filter(expense => {
    if (statusFilter !== "all" && expense.status !== statusFilter) return false;
    if (categoryFilter !== "all" && expense.category !== categoryFilter) return false;
    return true;
  });

  if (expensesLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Expenses</h1>
          <p className="text-muted-foreground">Manage expense reports and reimbursements</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-expense">
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      <ExpenseStats expenses={expenses} />

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses" data-testid="tab-expenses">
            <Receipt className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" data-testid="tab-admin">
              <Settings className="h-4 w-4 mr-2" />
              Rate Management
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Expense Reports</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {EXPENSE_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="filter-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EXPENSE_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expenses found</p>
                  <p className="text-sm">Create your first expense to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map(expense => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        onClick={() => setSelectedExpenseId(expense.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Per Diem Policies</CardTitle>
                <CardDescription>
                  Manage per diem rates for different locations and policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerDiemManagement />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mileage Rates</CardTitle>
                <CardDescription>
                  Manage mileage reimbursement rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MileageRateManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!selectedExpenseId} onOpenChange={(open) => !open && setSelectedExpenseId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          {selectedExpenseId && (
            <ExpenseDetailPanel
              expenseId={selectedExpenseId}
              onClose={() => setSelectedExpenseId(null)}
              isAdmin={isAdmin}
            />
          )}
        </DialogContent>
      </Dialog>

      <CreateExpenseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projects={projects}
        consultants={consultants}
        mileageRates={mileageRates}
        perDiemPolicies={perDiemPolicies}
      />
    </div>
  );
}
