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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Send,
  Calendar,
  Building2,
  ChevronRight,
  Settings,
  Trash2,
  X,
  Eye,
  XCircle,
  Receipt,
  Download,
  Mail,
  Printer
} from "lucide-react";
import type { 
  Project, 
  Hospital,
  Invoice,
  InvoiceWithDetails,
  InvoiceTemplate,
  InvoiceLineItem,
  Timesheet
} from "@shared/schema";

const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
];

function getStatusBadge(status: string) {
  const config = INVOICE_STATUSES.find(s => s.value === status);
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

function InvoiceStats({ invoices }: { invoices: InvoiceWithDetails[] }) {
  const totalCount = invoices.length;
  const pendingCount = invoices.filter(i => i.status === "pending").length;
  const sentCount = invoices.filter(i => i.status === "sent").length;
  const paidCount = invoices.filter(i => i.status === "paid").length;
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  
  const totalAmount = invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
  const paidAmount = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
  const overdueAmount = invoices
    .filter(i => i.status === "overdue")
    .reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-total-invoices">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(totalAmount)} total</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-pending-sent">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending/Sent</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount + sentCount}</div>
          <p className="text-xs text-muted-foreground">{pendingCount} pending, {sentCount} sent</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-paid-invoices">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paidCount}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(paidAmount)} collected</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-overdue-invoices">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueCount}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(overdueAmount)} outstanding</p>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceRow({ 
  invoice,
  onClick 
}: { 
  invoice: InvoiceWithDetails;
  onClick: () => void;
}) {
  return (
    <TableRow 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`invoice-row-${invoice.id}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{invoice.invoiceNumber || invoice.id.slice(0, 8)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{invoice.hospital?.name || "N/A"}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{invoice.project?.name || "N/A"}</div>
      </TableCell>
      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
      <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {invoice.issueDate ? format(new Date(invoice.issueDate), "MMM d, yyyy") : "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}

function InvoiceDetailPanel({
  invoiceId,
  onClose,
  isAdmin
}: {
  invoiceId: string;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const { toast } = useToast();

  const { data: invoice, isLoading } = useQuery<InvoiceWithDetails>({
    queryKey: ['/api/invoices', invoiceId],
    enabled: !!invoiceId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const payload: Record<string, unknown> = { status };
      if (status === "sent") {
        payload.sentAt = new Date().toISOString();
      }
      if (status === "paid") {
        payload.paidAt = new Date().toISOString();
        payload.paidAmount = invoice?.totalAmount;
      }
      return apiRequest("PATCH", `/api/invoices/${invoiceId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId] });
      toast({ title: "Invoice status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update invoice status", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/invoices/${invoiceId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      onClose();
      toast({ title: "Invoice deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete invoice", variant: "destructive" });
    }
  });

  const voidMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest("PATCH", `/api/invoices/${invoiceId}`, {
        status: "cancelled",
        notes: invoice?.notes
          ? `${invoice.notes}\n\n--- VOIDED ---\nReason: ${reason}\nVoided on: ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`
          : `--- VOIDED ---\nReason: ${reason}\nVoided on: ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId] });
      setShowVoidDialog(false);
      setVoidReason("");
      toast({ title: "Invoice voided successfully" });
    },
    onError: () => {
      toast({ title: "Failed to void invoice", variant: "destructive" });
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: { amount: string; method: string; reference: string }) => {
      const currentPaid = parseFloat(invoice?.paidAmount || "0");
      const newPayment = parseFloat(data.amount);
      const newTotal = currentPaid + newPayment;
      const totalDue = parseFloat(invoice?.totalAmount || "0");
      const isFullyPaid = newTotal >= totalDue;

      const paymentNote = `Payment recorded: ${formatCurrency(newPayment)}${data.method ? ` via ${data.method}` : ""}${data.reference ? ` (Ref: ${data.reference})` : ""} on ${format(new Date(), "MMM d, yyyy")}`;

      return apiRequest("PATCH", `/api/invoices/${invoiceId}`, {
        paidAmount: newTotal.toFixed(2),
        paidAt: new Date().toISOString(),
        status: isFullyPaid ? "paid" : invoice?.status,
        notes: invoice?.notes
          ? `${invoice.notes}\n\n${paymentNote}`
          : paymentNote
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId] });
      setShowPaymentDialog(false);
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentReference("");
      toast({ title: "Payment recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "destructive" });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/invoices/${invoiceId}/send-email`, {
        recipientEmail,
        recipientName: recipientName || undefined,
        message: emailMessage || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId] });
      setShowEmailDialog(false);
      setRecipientEmail("");
      setRecipientName("");
      setEmailMessage("");
      toast({ title: "Invoice sent via email successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send invoice email", variant: "destructive" });
    }
  });

  // Generate printable PDF invoice
  const handleDownloadPDF = () => {
    if (!invoice) return;

    const lineItemsHtml = invoice.lineItems && invoice.lineItems.length > 0
      ? invoice.lineItems.map((item: InvoiceLineItem) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.amount)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #9ca3af;">No line items</td></tr>';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Please allow popups to download PDF", variant: "destructive" });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #1f2937; }
          .invoice-number { color: #6b7280; margin-top: 8px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-sent { background: #dbeafe; color: #1e40af; }
          .status-draft { background: #f3f4f6; color: #374151; }
          .status-overdue { background: #fee2e2; color: #991b1b; }
          .status-cancelled { background: #f3f4f6; color: #6b7280; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { width: 45%; }
          .party-title { font-weight: 600; color: #6b7280; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; }
          .dates { display: flex; gap: 40px; margin-bottom: 40px; }
          .date-item { }
          .date-label { font-size: 12px; color: #6b7280; }
          .date-value { font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
          .amount-col { text-align: right; }
          .summary { margin-left: auto; width: 300px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 18px; margin-top: 8px; padding-top: 16px; }
          .notes { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
          .notes-title { font-weight: 600; margin-bottom: 8px; }
          .footer { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoice.invoiceNumber || invoice.id.slice(0, 8)}</div>
          </div>
          <div>
            <span class="status status-${invoice.status}">${INVOICE_STATUSES.find(s => s.value === invoice.status)?.label || invoice.status}</span>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="party-title">Bill To</div>
            <div style="font-weight: 500;">${invoice.hospital?.name || 'N/A'}</div>
          </div>
          <div class="party">
            <div class="party-title">Project</div>
            <div style="font-weight: 500;">${invoice.project?.name || 'N/A'}</div>
          </div>
        </div>

        <div class="dates">
          <div class="date-item">
            <div class="date-label">Issue Date</div>
            <div class="date-value">${invoice.issueDate ? format(new Date(invoice.issueDate), "MMMM d, yyyy") : 'N/A'}</div>
          </div>
          <div class="date-item">
            <div class="date-label">Due Date</div>
            <div class="date-value">${invoice.dueDate ? format(new Date(invoice.dueDate), "MMMM d, yyyy") : 'N/A'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount-col">Qty</th>
              <th class="amount-col">Unit Price</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          ${parseFloat(invoice.taxRate || "0") > 0 ? `
          <div class="summary-row">
            <span>Tax (${invoice.taxRate}%)</span>
            <span>${formatCurrency(invoice.taxAmount)}</span>
          </div>
          ` : ''}
          ${parseFloat(invoice.discountAmount || "0") > 0 ? `
          <div class="summary-row" style="color: #059669;">
            <span>Discount</span>
            <span>-${formatCurrency(invoice.discountAmount)}</span>
          </div>
          ` : ''}
          <div class="summary-row total">
            <span>Total</span>
            <span>${formatCurrency(invoice.totalAmount)}</span>
          </div>
          ${parseFloat(invoice.paidAmount || "0") > 0 ? `
          <div class="summary-row" style="color: #059669;">
            <span>Paid</span>
            <span>${formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div class="summary-row" style="font-weight: 600;">
            <span>Balance Due</span>
            <span>${formatCurrency(parseFloat(invoice.totalAmount || "0") - parseFloat(invoice.paidAmount || "0"))}</span>
          </div>
          ` : ''}
        </div>

        ${invoice.notes ? `
        <div class="notes">
          <div class="notes-title">Notes</div>
          <div style="white-space: pre-wrap;">${invoice.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          Generated on ${format(new Date(), "MMMM d, yyyy")}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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

  if (!invoice) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <FileText className="h-4 w-4" />
              <span>Invoice #{invoice.invoiceNumber || invoice.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl font-semibold">{invoice.hospital?.name || "Invoice"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(invoice.status)}
            <span className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Project</div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.project?.name || "N/A"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Issue Date</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.issueDate ? format(new Date(invoice.issueDate), "MMM d, yyyy") : "N/A"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Due Date</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "N/A"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.createdAt ? formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true }) : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item: InvoiceLineItem) => (
                    <TableRow key={item.id} data-testid={`line-item-${item.id}`}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No line items</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {parseFloat(invoice.taxRate || "0") > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              {parseFloat(invoice.discountAmount || "0") > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {parseFloat(invoice.paidAmount || "0") > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(parseFloat(invoice.totalAmount || "0") - parseFloat(invoice.paidAmount || "0"))}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {isAdmin && invoice.status !== "paid" && invoice.status !== "cancelled" && (
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Payment</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  const balance = parseFloat(invoice.totalAmount || "0") - parseFloat(invoice.paidAmount || "0");
                  setPaymentAmount(balance.toFixed(2));
                  setShowPaymentDialog(true);
                }}
                data-testid="button-record-payment"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="font-medium">{formatCurrency(parseFloat(invoice.totalAmount || "0") - parseFloat(invoice.paidAmount || "0"))}</span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Payment</span>
                    <span>{format(new Date(invoice.paidAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.status === "paid" && (
          <Card className="mb-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Payment Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span>{format(new Date(invoice.paidAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.notes && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INVOICE_STATUSES.map(status => (
                  <Button
                    key={status.value}
                    variant={invoice.status === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatusMutation.mutate(status.value)}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`status-btn-${status.value}`}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      <div className="p-4 border-t flex justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-close-detail">
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            data-testid="button-download-pdf"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(true)}
              data-testid="button-email-invoice"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Invoice
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && invoice.status === "draft" && (
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-invoice"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          {isAdmin && (invoice.status === "draft" || invoice.status === "pending" || invoice.status === "sent") && (
            <Button
              variant="outline"
              onClick={() => setShowVoidDialog(true)}
              data-testid="button-void-invoice"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Void
            </Button>
          )}
          {isAdmin && invoice.status === "draft" && (
            <Button
              onClick={() => updateStatusMutation.mutate("sent")}
              disabled={updateStatusMutation.isPending}
              data-testid="button-send-invoice"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
          {isAdmin && invoice.status === "sent" && (
            <Button
              onClick={() => updateStatusMutation.mutate("paid")}
              disabled={updateStatusMutation.isPending}
              data-testid="button-mark-paid"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Invoice</DialogTitle>
            <DialogDescription>
              This will mark the invoice as cancelled. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voidReason">Reason for voiding *</Label>
              <Textarea
                id="voidReason"
                placeholder="Enter the reason for voiding this invoice..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="min-h-[100px]"
                data-testid="input-void-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => voidMutation.mutate(voidReason)}
              disabled={!voidReason.trim() || voidMutation.isPending}
              data-testid="button-confirm-void"
            >
              Void Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment received for this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0.01"
                max={parseFloat(invoice?.totalAmount || "0") - parseFloat(invoice?.paidAmount || "0")}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-payment-amount"
              />
              <p className="text-xs text-muted-foreground">
                Balance due: {formatCurrency(parseFloat(invoice?.totalAmount || "0") - parseFloat(invoice?.paidAmount || "0"))}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue placeholder="Select method (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Reference Number</Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Check # or Transaction ID (optional)"
                data-testid="input-payment-reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => recordPaymentMutation.mutate({
                amount: paymentAmount,
                method: paymentMethod,
                reference: paymentReference
              })}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || recordPaymentMutation.isPending}
              data-testid="button-confirm-payment"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
            <DialogDescription>
              Send this invoice via email to the recipient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                data-testid="input-recipient-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Doe (optional)"
                data-testid="input-recipient-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Message</Label>
              <Textarea
                id="emailMessage"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a personal message (optional)"
                className="min-h-[80px]"
                data-testid="input-email-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendEmailMutation.mutate()}
              disabled={!recipientEmail.trim() || sendEmailMutation.isPending}
              data-testid="button-confirm-send-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface LineItemFormData {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

function CreateInvoiceDialog({
  open,
  onOpenChange,
  projects,
  hospitals,
  templates
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  hospitals: Hospital[];
  templates: InvoiceTemplate[];
}) {
  const [formData, setFormData] = useState({
    projectId: "",
    hospitalId: "",
    templateId: "",
    invoiceNumber: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    notes: "",
    taxRate: "0",
  });
  
  const [lineItems, setLineItems] = useState<LineItemFormData[]>([
    { description: "", quantity: "1", unitPrice: "", amount: "" }
  ]);
  
  const { toast } = useToast();

  const calculateLineItemAmount = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const updateLineItem = (index: number, field: keyof LineItemFormData, value: string) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    
    if (field === "quantity" || field === "unitPrice") {
      updated[index].amount = calculateLineItemAmount(
        field === "quantity" ? value : updated[index].quantity,
        field === "unitPrice" ? value : updated[index].unitPrice
      );
    }
    
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "", amount: "" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);
  const taxAmount = (subtotal * parseFloat(formData.taxRate || "0")) / 100;
  const total = subtotal + taxAmount;

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const invoicePayload = {
        projectId: data.projectId || undefined,
        hospitalId: data.hospitalId || undefined,
        templateId: data.templateId || undefined,
        invoiceNumber: data.invoiceNumber || undefined,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        notes: data.notes || undefined,
        taxRate: data.taxRate,
        taxAmount: taxAmount.toFixed(2),
        subtotal: subtotal.toFixed(2),
        totalAmount: total.toFixed(2),
        status: "draft",
      };
      
      const response = await apiRequest("POST", "/api/invoices", invoicePayload);
      const invoice = await response.json();
      
      for (const item of lineItems) {
        if (item.description && item.unitPrice) {
          await apiRequest("POST", "/api/invoice-line-items", {
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          });
        }
      }
      
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Invoice created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create invoice", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      projectId: "",
      hospitalId: "",
      templateId: "",
      invoiceNumber: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      notes: "",
      taxRate: "0",
    });
    setLineItems([{ description: "", quantity: "1", unitPrice: "", amount: "" }]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a project or hospital.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select
                  value={formData.hospitalId}
                  onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}
                >
                  <SelectTrigger data-testid="select-hospital">
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
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
                    <SelectValue placeholder="Select project" />
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">Template (Optional)</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                >
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-001"
                  data-testid="input-invoice-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  data-testid="input-tax-rate"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  data-testid="input-issue-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  data-testid="input-due-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem} data-testid="button-add-line-item">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start" data-testid={`line-item-form-${index}`}>
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        data-testid={`input-line-description-${index}`}
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                        data-testid={`input-line-quantity-${index}`}
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                        data-testid={`input-line-unit-price-${index}`}
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        readOnly
                        className="bg-muted"
                        data-testid={`input-line-amount-${index}`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      data-testid={`button-remove-line-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-subtotal">{formatCurrency(subtotal)}</span>
                  </div>
                  {parseFloat(formData.taxRate) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({formData.taxRate}%)</span>
                      <span data-testid="text-tax-amount">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span data-testid="text-total">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or payment instructions..."
                className="min-h-[80px]"
                data-testid="input-notes"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => createInvoiceMutation.mutate(formData)}
            disabled={lineItems.every(i => !i.description || !i.unitPrice) || createInvoiceMutation.isPending}
            data-testid="button-create-invoice"
          >
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GenerateFromTimesheetDialog({
  open,
  onOpenChange,
  templates
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: InvoiceTemplate[];
}) {
  const [timesheetId, setTimesheetId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const { toast } = useToast();

  const { data: timesheets = [] } = useQuery<Timesheet[]>({
    queryKey: ['/api/timesheets'],
    enabled: open,
  });

  const approvedTimesheets = timesheets.filter(t => t.status === "approved");

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/invoices/generate-from-timesheet", {
        timesheetId,
        templateId: templateId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      onOpenChange(false);
      setTimesheetId("");
      setTemplateId("");
      toast({ title: "Invoice generated from timesheet" });
    },
    onError: () => {
      toast({ title: "Failed to generate invoice", variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Invoice from Timesheet</DialogTitle>
          <DialogDescription>
            Create an invoice based on an approved timesheet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timesheet">Select Timesheet</Label>
            <Select value={timesheetId} onValueChange={setTimesheetId}>
              <SelectTrigger data-testid="select-timesheet">
                <SelectValue placeholder="Select approved timesheet" />
              </SelectTrigger>
              <SelectContent>
                {approvedTimesheets.length === 0 ? (
                  <SelectItem value="" disabled>No approved timesheets</SelectItem>
                ) : (
                  approvedTimesheets.map(ts => (
                    <SelectItem key={ts.id} value={ts.id}>
                      Week of {format(new Date(ts.weekStartDate), "MMM d, yyyy")} - {ts.totalHours}h
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template (Optional)</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger data-testid="select-gen-template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No template</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => generateMutation.mutate()}
            disabled={!timesheetId || generateMutation.isPending}
            data-testid="button-generate-invoice"
          >
            Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceTemplateManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<InvoiceTemplate[]>({
    queryKey: ['/api/invoice-templates'],
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headerText: "",
    footerText: "",
    termsAndConditions: "",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    paymentInstructions: "",
    isDefault: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/invoice-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Template created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/invoice-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      setEditingTemplate(null);
      resetForm();
      toast({ title: "Template updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/invoice-templates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      toast({ title: "Template deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      headerText: "",
      footerText: "",
      termsAndConditions: "",
      companyName: "",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      paymentInstructions: "",
      isDefault: false,
    });
  };

  const openEditDialog = (template: InvoiceTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      headerText: template.headerText || "",
      footerText: template.footerText || "",
      termsAndConditions: template.termsAndConditions || "",
      companyName: template.companyName || "",
      companyAddress: template.companyAddress || "",
      companyPhone: template.companyPhone || "",
      companyEmail: template.companyEmail || "",
      paymentInstructions: template.paymentInstructions || "",
      isDefault: template.isDefault,
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
        <h3 className="text-lg font-medium">Invoice Templates</h3>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-add-template">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No templates found
              </TableCell>
            </TableRow>
          ) : (
            templates.map(template => (
              <TableRow key={template.id} data-testid={`template-row-${template.id}`}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.companyName || "N/A"}</TableCell>
                <TableCell>
                  {template.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(template)}
                      data-testid={`button-edit-template-${template.id}`}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(template.id)}
                      data-testid={`button-delete-template-${template.id}`}
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

      <Dialog open={showCreateDialog || !!editingTemplate} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-template-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    data-testid="input-company-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-template-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Phone</Label>
                  <Input
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                    data-testid="input-company-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <Input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    data-testid="input-company-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company Address</Label>
                <Textarea
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  data-testid="input-company-address"
                />
              </div>
              <div className="space-y-2">
                <Label>Header Text</Label>
                <Textarea
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  data-testid="input-header-text"
                />
              </div>
              <div className="space-y-2">
                <Label>Footer Text</Label>
                <Textarea
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  data-testid="input-footer-text"
                />
              </div>
              <div className="space-y-2">
                <Label>Terms and Conditions</Label>
                <Textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  className="min-h-[80px]"
                  data-testid="input-terms"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Instructions</Label>
                <Textarea
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  data-testid="input-payment-instructions"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingTemplate(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingTemplate) {
                  updateMutation.mutate({ id: editingTemplate.id, data: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-template"
            >
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Invoices() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const { isAdmin } = useAuth();

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<InvoiceWithDetails[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: hospitals = [] } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  const { data: templates = [] } = useQuery<InvoiceTemplate[]>({
    queryKey: ['/api/invoice-templates'],
  });

  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
    if (projectFilter !== "all" && invoice.projectId !== projectFilter) return false;
    return true;
  });

  if (invoicesLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and billing</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowGenerateDialog(true)} data-testid="button-generate-from-timesheet">
              <Receipt className="h-4 w-4 mr-2" />
              From Timesheet
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-invoice">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        )}
      </div>

      <InvoiceStats invoices={invoices} />

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices" data-testid="tab-invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Settings className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>All Invoices</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {INVOICE_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="filter-project">
                      <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                  {isAdmin && <p className="text-sm">Create your first invoice to get started</p>}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <InvoiceRow
                        key={invoice.id}
                        invoice={invoice}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Templates</CardTitle>
                <CardDescription>
                  Manage invoice templates with company branding and standard terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoiceTemplateManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          {selectedInvoiceId && (
            <InvoiceDetailPanel
              invoiceId={selectedInvoiceId}
              onClose={() => setSelectedInvoiceId(null)}
              isAdmin={isAdmin}
            />
          )}
        </DialogContent>
      </Dialog>

      <CreateInvoiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projects={projects}
        hospitals={hospitals}
        templates={templates}
      />

      <GenerateFromTimesheetDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        templates={templates}
      />
    </div>
  );
}
