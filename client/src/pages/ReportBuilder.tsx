import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Plus, 
  Save, 
  Play, 
  Download, 
  Clock, 
  Filter, 
  Columns, 
  LayoutGrid,
  ChevronRight,
  Settings2,
  Calendar,
  BarChart3,
  Table,
  Trash2,
  Star,
  StarOff,
  Share2,
  Copy,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  FileSpreadsheet,
  FileImage,
  FileType
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  dataSource: string;
  availableFields: Record<string, unknown>;
  defaultFilters: Record<string, unknown>;
  defaultGrouping: Record<string, unknown>;
  isActive: boolean;
  createdAt: string | null;
}

interface SavedReport {
  id: string;
  name: string;
  description: string | null;
  templateId: string | null;
  userId: string;
  configuration: ReportConfiguration;
  isFavorite: boolean;
  isPublic: boolean;
  lastRunAt: string | null;
  createdAt: string | null;
}

interface ReportConfiguration {
  selectedFields: string[];
  filters: ReportFilter[];
  groupBy: string[];
  sortBy: { field: string; direction: 'asc' | 'desc' }[];
  aggregations: { field: string; function: string }[];
  dateRange?: { start: string; end: string };
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: string | string[] | number | number[];
}

interface FieldDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable: boolean;
  filterable: boolean;
  groupable: boolean;
  aggregatable: boolean;
}

const DATA_SOURCES: Record<string, { name: string; description: string; fields: FieldDefinition[] }> = {
  consultants: {
    name: "Consultants",
    description: "Consultant profiles and performance data",
    fields: [
      { name: "id", label: "Consultant ID", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "firstName", label: "First Name", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "lastName", label: "Last Name", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "email", label: "Email", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "location", label: "Location", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "yearsExperience", label: "Years Experience", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "isAvailable", label: "Available", type: "boolean", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "averageRating", label: "Average Rating", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "completedProjects", label: "Completed Projects", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "shiftPreference", label: "Shift Preference", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "createdAt", label: "Created Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
    ]
  },
  projects: {
    name: "Projects",
    description: "EHR implementation project data",
    fields: [
      { name: "id", label: "Project ID", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "name", label: "Project Name", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "hospitalName", label: "Hospital", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "status", label: "Status", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "phase", label: "Current Phase", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "startDate", label: "Start Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "endDate", label: "End Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "budget", label: "Budget", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "actualSpend", label: "Actual Spend", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "consultantCount", label: "Consultant Count", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "completionPercentage", label: "Completion %", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
    ]
  },
  timesheets: {
    name: "Timesheets",
    description: "Time tracking and attendance records",
    fields: [
      { name: "id", label: "Timesheet ID", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "consultantName", label: "Consultant", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "projectName", label: "Project", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "weekStartDate", label: "Week Start", type: "date", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "status", label: "Status", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "totalHours", label: "Total Hours", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "regularHours", label: "Regular Hours", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "overtimeHours", label: "Overtime Hours", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "billableAmount", label: "Billable Amount", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
    ]
  },
  expenses: {
    name: "Expenses",
    description: "Expense reports and reimbursements",
    fields: [
      { name: "id", label: "Expense ID", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "consultantName", label: "Consultant", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "projectName", label: "Project", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "category", label: "Category", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "description", label: "Description", type: "string", sortable: false, filterable: true, groupable: false, aggregatable: false },
      { name: "amount", label: "Amount", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "status", label: "Status", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "expenseDate", label: "Expense Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "submittedAt", label: "Submitted Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
    ]
  },
  supportTickets: {
    name: "Support Tickets",
    description: "Support ticket and issue tracking",
    fields: [
      { name: "id", label: "Ticket ID", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "title", label: "Title", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "category", label: "Category", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "priority", label: "Priority", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "status", label: "Status", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "assignedTo", label: "Assigned To", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "projectName", label: "Project", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "createdAt", label: "Created Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "resolvedAt", label: "Resolved Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "resolutionTime", label: "Resolution Time (hrs)", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
    ]
  },
  training: {
    name: "Training",
    description: "Training completion and assessments",
    fields: [
      { name: "id", label: "Enrollment ID", type: "string", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "consultantName", label: "Consultant", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "courseName", label: "Course", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "status", label: "Status", type: "string", sortable: true, filterable: true, groupable: true, aggregatable: false },
      { name: "progress", label: "Progress %", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "score", label: "Assessment Score", type: "number", sortable: true, filterable: true, groupable: false, aggregatable: true },
      { name: "startedAt", label: "Started Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
      { name: "completedAt", label: "Completed Date", type: "date", sortable: true, filterable: true, groupable: false, aggregatable: false },
    ]
  },
};

const FILTER_OPERATORS: Record<string, { label: string; allowedTypes: string[] }> = {
  equals: { label: "Equals", allowedTypes: ["string", "number", "boolean", "date"] },
  not_equals: { label: "Not Equals", allowedTypes: ["string", "number", "boolean", "date"] },
  contains: { label: "Contains", allowedTypes: ["string"] },
  greater_than: { label: "Greater Than", allowedTypes: ["number", "date"] },
  less_than: { label: "Less Than", allowedTypes: ["number", "date"] },
  between: { label: "Between", allowedTypes: ["number", "date"] },
  in: { label: "In List", allowedTypes: ["string"] },
};

const AGGREGATION_FUNCTIONS = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

export default function ReportBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [activeTab, setActiveTab] = useState("build");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }[]>([]);
  const [aggregations, setAggregations] = useState<{ field: string; function: string }[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly");
  const [scheduleRecipients, setScheduleRecipients] = useState("");
  const [scheduleFormat, setScheduleFormat] = useState("pdf");
  const [lastSavedReportId, setLastSavedReportId] = useState<string | null>(null);

  const { data: savedReports = [], isLoading: isLoadingSaved } = useQuery<SavedReport[]>({
    queryKey: ["/api/saved-reports"],
  });

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<ReportTemplate[]>({
    queryKey: ["/api/report-templates"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      description: string; 
      configuration: ReportConfiguration; 
      isPublic: boolean;
      templateId?: string;
    }) => {
      return apiRequest("POST", "/api/saved-reports", {
        name: data.name,
        description: data.description,
        templateId: data.templateId || null,
        configuration: data.configuration,
        isPublic: data.isPublic,
        isFavorite: false,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-reports"] });
      try {
        const savedReport = await response.json();
        if (savedReport?.id) {
          setLastSavedReportId(savedReport.id);
        }
      } catch (e) {}
      toast({ title: "Report saved successfully" });
      setShowSaveDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to save report", variant: "destructive" });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      return apiRequest("PATCH", `/api/saved-reports/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-reports"] });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/saved-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-reports"] });
      toast({ title: "Report deleted" });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: { reportId: string; schedule: string; recipients: string[]; format: string }) => {
      return apiRequest("POST", "/api/scheduled-reports", {
        reportId: data.reportId,
        schedule: data.schedule,
        recipients: data.recipients,
        format: data.format,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-reports"] });
      toast({ title: "Schedule created", description: "Your report will be generated automatically" });
      setShowScheduleDialog(false);
      setScheduleRecipients("");
    },
    onError: () => {
      toast({ title: "Failed to create schedule", variant: "destructive" });
    },
  });

  const currentDataSource = selectedDataSource ? DATA_SOURCES[selectedDataSource] : null;
  const availableFields = currentDataSource?.fields || [];

  const handleFieldToggle = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) 
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const addFilter = () => {
    if (availableFields.length > 0) {
      const filterableField = availableFields.find(f => f.filterable);
      if (filterableField) {
        setFilters([...filters, { 
          field: filterableField.name, 
          operator: 'equals', 
          value: '' 
        }]);
      }
    }
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleGroupToggle = (fieldName: string) => {
    setGroupBy(prev => 
      prev.includes(fieldName) 
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const addSort = () => {
    if (availableFields.length > 0) {
      const sortableField = availableFields.find(f => f.sortable);
      if (sortableField) {
        setSortBy([...sortBy, { field: sortableField.name, direction: 'asc' }]);
      }
    }
  };

  const updateSort = (index: number, updates: Partial<{ field: string; direction: 'asc' | 'desc' }>) => {
    setSortBy(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const removeSort = (index: number) => {
    setSortBy(prev => prev.filter((_, i) => i !== index));
  };

  const addAggregation = () => {
    const aggField = availableFields.find(f => f.aggregatable);
    if (aggField) {
      setAggregations([...aggregations, { field: aggField.name, function: 'count' }]);
    }
  };

  const updateAggregation = (index: number, updates: Partial<{ field: string; function: string }>) => {
    setAggregations(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a));
  };

  const removeAggregation = (index: number) => {
    setAggregations(prev => prev.filter((_, i) => i !== index));
  };

  const previewMutation = useMutation({
    mutationFn: async (config: { dataSource: string; selectedFields: string[]; filters: ReportFilter[]; groupBy: string[]; sortBy: { field: string; direction: 'asc' | 'desc' }[] }) => {
      const response = await apiRequest("POST", "/api/reports/preview", config);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.data && data.data.length > 0) {
        setPreviewData(data.data);
      } else {
        setPreviewData(generateMockData());
        toast({ title: "No data found. Showing sample data." });
      }
      setActiveTab("preview");
    },
    onError: () => {
      setPreviewData(generateMockData());
      toast({ title: "Could not fetch live data. Showing sample data." });
      setActiveTab("preview");
    },
  });

  const generatePreview = () => {
    if (!selectedDataSource || selectedFields.length === 0) {
      toast({ title: "Please select a data source and at least one field", variant: "destructive" });
      return;
    }

    setIsPreviewLoading(true);
    previewMutation.mutate({
      dataSource: selectedDataSource,
      selectedFields,
      filters,
      groupBy,
      sortBy,
    }, {
      onSettled: () => {
        setIsPreviewLoading(false);
      }
    });
  };

  const generateMockData = () => {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      const row: Record<string, unknown> = {};
      selectedFields.forEach(fieldName => {
        const field = availableFields.find(f => f.name === fieldName);
        if (field) {
          switch (field.type) {
            case 'string':
              row[fieldName] = `Sample ${field.label} ${i + 1}`;
              break;
            case 'number':
              row[fieldName] = Math.floor(Math.random() * 100);
              break;
            case 'date':
              row[fieldName] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            case 'boolean':
              row[fieldName] = Math.random() > 0.5;
              break;
          }
        }
      });
      rows.push(row);
    }
    return rows;
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      toast({ title: "Please enter a report name", variant: "destructive" });
      return;
    }

    const configuration: ReportConfiguration = {
      selectedFields,
      filters,
      groupBy,
      sortBy,
      aggregations,
    };

    saveMutation.mutate({
      name: reportName,
      description: reportDescription,
      configuration,
      isPublic,
    });
  };

  const loadSavedReport = (report: SavedReport) => {
    const config = report.configuration;
    setReportName(report.name);
    setReportDescription(report.description || "");
    setSelectedFields(config.selectedFields || []);
    setFilters(config.filters || []);
    setGroupBy(config.groupBy || []);
    setSortBy(config.sortBy || []);
    setAggregations(config.aggregations || []);
    setIsPublic(report.isPublic);
    
    if (report.templateId) {
      const template = templates.find(t => t.id === report.templateId);
      if (template) {
        setSelectedDataSource(template.dataSource);
      }
    }
    
    setActiveTab("build");
    toast({ title: "Report loaded" });
  };

  const exportReport = (format: 'csv' | 'excel' | 'pdf') => {
    if (previewData.length === 0) {
      toast({ title: "Generate a preview first", variant: "destructive" });
      return;
    }

    const formatLabels = { csv: 'CSV', excel: 'Excel', pdf: 'PDF' };
    toast({ title: `Exporting as ${formatLabels[format]}...` });
    
    if (format === 'csv') {
      const headers = selectedFields.join(',');
      const rows = previewData.map(row => 
        selectedFields.map(f => String(row[f] ?? '')).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'report'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Report Builder</h1>
          <p className="text-muted-foreground">Create custom reports with drag-and-drop field selection</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowScheduleDialog(true)}
            disabled={selectedFields.length === 0}
            data-testid="button-schedule-report"
          >
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button 
            onClick={() => setShowSaveDialog(true)}
            disabled={selectedFields.length === 0}
            data-testid="button-save-report"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-report-builder">
          <TabsTrigger value="build" data-testid="tab-build">
            <Columns className="h-4 w-4 mr-2" />
            Build Report
          </TabsTrigger>
          <TabsTrigger value="preview" data-testid="tab-preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="saved" data-testid="tab-saved">
            <FileText className="h-4 w-4 mr-2" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Data Source</CardTitle>
                  <CardDescription>Select the type of data to report on</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                    <SelectTrigger data-testid="select-data-source">
                      <SelectValue placeholder="Choose a data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DATA_SOURCES).map(([key, source]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            {source.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentDataSource && (
                    <p className="text-sm text-muted-foreground mt-2">{currentDataSource.description}</p>
                  )}
                </CardContent>
              </Card>

              {currentDataSource && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Available Fields</CardTitle>
                    <CardDescription>Select fields to include in your report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {availableFields.map((field) => (
                          <div 
                            key={field.name}
                            className="flex items-center justify-between p-2 rounded-md border hover-elevate cursor-pointer"
                            onClick={() => handleFieldToggle(field.name)}
                            data-testid={`field-toggle-${field.name}`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={selectedFields.includes(field.name)} 
                                onCheckedChange={() => handleFieldToggle(field.name)}
                              />
                              <div>
                                <p className="text-sm font-medium">{field.label}</p>
                                <p className="text-xs text-muted-foreground capitalize">{field.type}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {field.filterable && (
                                <Badge variant="outline" className="text-xs">Filter</Badge>
                              )}
                              {field.groupable && (
                                <Badge variant="outline" className="text-xs">Group</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Selected Fields</CardTitle>
                      <CardDescription>{selectedFields.length} field(s) selected</CardDescription>
                    </div>
                    {selectedFields.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFields([])}>
                        Clear All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Columns className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Select fields from the available fields panel</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedFields.map((fieldName, index) => {
                        const field = availableFields.find(f => f.name === fieldName);
                        return (
                          <Badge 
                            key={fieldName} 
                            variant="secondary" 
                            className="flex items-center gap-1 px-3 py-1"
                            data-testid={`selected-field-${fieldName}`}
                          >
                            <GripVertical className="h-3 w-3 cursor-move" />
                            {field?.label || fieldName}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                              onClick={() => handleFieldToggle(fieldName)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </CardTitle>
                      <CardDescription>Add conditions to filter your data</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addFilter}
                      disabled={!currentDataSource}
                      data-testid="button-add-filter"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filters.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No filters applied. All data will be included.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filters.map((filter, index) => {
                        const field = availableFields.find(f => f.name === filter.field);
                        const allowedOperators = Object.entries(FILTER_OPERATORS)
                          .filter(([_, op]) => op.allowedTypes.includes(field?.type || 'string'));
                        
                        return (
                          <div key={index} className="flex items-center gap-2 p-3 rounded-md border">
                            <Select 
                              value={filter.field} 
                              onValueChange={(v) => updateFilter(index, { field: v })}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFields.filter(f => f.filterable).map(f => (
                                  <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Select 
                              value={filter.operator} 
                              onValueChange={(v) => updateFilter(index, { operator: v as ReportFilter['operator'] })}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {allowedOperators.map(([key, op]) => (
                                  <SelectItem key={key} value={key}>{op.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Input 
                              placeholder="Value"
                              value={String(filter.value)}
                              onChange={(e) => updateFilter(index, { value: e.target.value })}
                              className="flex-1"
                            />
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeFilter(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Grouping</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {availableFields.filter(f => f.groupable).map((field) => (
                        <div 
                          key={field.name}
                          className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer"
                          onClick={() => handleGroupToggle(field.name)}
                        >
                          <Checkbox 
                            checked={groupBy.includes(field.name)} 
                            onCheckedChange={() => handleGroupToggle(field.name)}
                          />
                          <span className="text-sm">{field.label}</span>
                        </div>
                      ))}
                      {availableFields.filter(f => f.groupable).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No groupable fields available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Sorting</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addSort}
                        disabled={!currentDataSource}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sortBy.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Default sorting will be applied
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {sortBy.map((sort, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Select 
                              value={sort.field} 
                              onValueChange={(v) => updateSort(index, { field: v })}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFields.filter(f => f.sortable).map(f => (
                                  <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateSort(index, { direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
                            >
                              {sort.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeSort(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Aggregations</CardTitle>
                      <CardDescription>Add calculations like sum, average, count</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addAggregation}
                      disabled={!currentDataSource || availableFields.filter(f => f.aggregatable).length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {aggregations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No aggregations defined. Raw data will be displayed.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {aggregations.map((agg, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md border">
                          <Select 
                            value={agg.function} 
                            onValueChange={(v) => updateAggregation(index, { function: v })}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AGGREGATION_FUNCTIONS.map(f => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">of</span>
                          <Select 
                            value={agg.field} 
                            onValueChange={(v) => updateAggregation(index, { field: v })}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.filter(f => f.aggregatable).map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeAggregation(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedFields([]);
                    setFilters([]);
                    setGroupBy([]);
                    setSortBy([]);
                    setAggregations([]);
                    setPreviewData([]);
                  }}
                  data-testid="button-reset"
                >
                  Reset
                </Button>
                <Button 
                  onClick={generatePreview}
                  disabled={selectedFields.length === 0 || isPreviewLoading}
                  data-testid="button-generate-preview"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isPreviewLoading ? "Generating..." : "Generate Preview"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>
                    {previewData.length > 0 
                      ? `Showing ${previewData.length} rows with ${selectedFields.length} columns`
                      : "Generate a preview to see your report data"
                    }
                  </CardDescription>
                </div>
                {previewData.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                      <FileType className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                      <FileImage className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {previewData.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No preview data yet</p>
                  <p className="text-sm">Configure your report and click "Generate Preview"</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {selectedFields.map(fieldName => {
                          const field = availableFields.find(f => f.name === fieldName);
                          return (
                            <th key={fieldName} className="text-left p-3 font-medium">
                              {field?.label || fieldName}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b hover-elevate">
                          {selectedFields.map(fieldName => (
                            <td key={fieldName} className="p-3">
                              {typeof row[fieldName] === 'boolean' 
                                ? (row[fieldName] ? 'Yes' : 'No')
                                : String(row[fieldName] ?? '-')
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Your saved report configurations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSaved ? (
                <div className="text-center py-8 text-muted-foreground">Just a moment...</div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No saved reports</p>
                  <p className="text-sm">Build and save your first report</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {savedReports.map((report) => (
                    <Card key={report.id} className="hover-elevate" data-testid={`saved-report-${report.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{report.name}</CardTitle>
                            {report.description && (
                              <CardDescription className="truncate">{report.description}</CardDescription>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0"
                            onClick={() => toggleFavoriteMutation.mutate({ 
                              id: report.id, 
                              isFavorite: !report.isFavorite 
                            })}
                          >
                            {report.isFavorite ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Columns className="h-4 w-4" />
                          <span>{report.configuration?.selectedFields?.length || 0} fields</span>
                          {report.isPublic && (
                            <Badge variant="outline" className="ml-auto">
                              <Share2 className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => loadSavedReport(report)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Load
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteReportMutation.mutate(report.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured report templates to get started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="text-center py-8 text-muted-foreground">Just a moment...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No templates available</p>
                  <p className="text-sm">Templates will appear here when created by administrators</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover-elevate" data-testid={`template-${template.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{template.category}</Badge>
                          {template.isActive && <Badge variant="secondary">Active</Badge>}
                        </div>
                        <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                        {template.description && (
                          <CardDescription>{template.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setSelectedDataSource(template.dataSource);
                            const fields = template.availableFields as { fields?: string[] };
                            if (fields.fields) {
                              setSelectedFields(fields.fields);
                            }
                            setActiveTab("build");
                            toast({ title: `Template "${template.name}" loaded` });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Report</DialogTitle>
            <DialogDescription>Save your report configuration for later use</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input 
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="My Custom Report"
                data-testid="input-report-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-description">Description (optional)</Label>
              <Textarea 
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="What does this report show?"
                data-testid="input-report-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Make Public</Label>
                <p className="text-sm text-muted-foreground">Allow others to view and use this report</p>
              </div>
              <Switch 
                checked={isPublic} 
                onCheckedChange={setIsPublic}
                data-testid="switch-public"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveReport}
              disabled={saveMutation.isPending || !reportName.trim()}
              data-testid="button-confirm-save"
            >
              {saveMutation.isPending ? "Saving..." : "Save Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>Set up automatic report generation and delivery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger data-testid="select-schedule-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Input 
                placeholder="email@example.com, another@example.com" 
                value={scheduleRecipients}
                onChange={(e) => setScheduleRecipients(e.target.value)}
                data-testid="input-schedule-recipients"
              />
              <p className="text-sm text-muted-foreground">Comma-separated email addresses</p>
            </div>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={scheduleFormat} onValueChange={setScheduleFormat}>
                <SelectTrigger data-testid="select-schedule-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!lastSavedReportId && (
              <p className="text-sm text-amber-600">Save the report first before scheduling.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)} data-testid="button-cancel-schedule">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!lastSavedReportId) {
                  toast({ title: "Save the report first", variant: "destructive" });
                  return;
                }
                const recipients = scheduleRecipients.split(',').map(e => e.trim()).filter(Boolean);
                scheduleMutation.mutate({
                  reportId: lastSavedReportId,
                  schedule: scheduleFrequency,
                  recipients,
                  format: scheduleFormat,
                });
              }}
              disabled={scheduleMutation.isPending || !lastSavedReportId}
              data-testid="button-confirm-schedule"
            >
              {scheduleMutation.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
