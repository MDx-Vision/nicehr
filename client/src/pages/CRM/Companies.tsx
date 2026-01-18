import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Plus,
  Search,
  Globe,
  MapPin,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  annualRevenue?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  companyType: string;
  status: string;
  ehrSystem?: string;
  bedCount?: number;
  facilityType?: string;
  createdAt: string;
}

const COMPANY_TYPES = ["prospect", "customer", "partner", "vendor", "competitor"];
const COMPANY_STATUSES = ["active", "inactive", "churned"];
const INDUSTRIES = [
  "Healthcare",
  "Technology",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Other",
];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"];
const EHR_SYSTEMS = ["Epic", "Cerner", "Meditech", "Allscripts", "athenahealth", "NextGen", "Other"];
const FACILITY_TYPES = ["hospital", "clinic", "ambulatory", "long_term_care", "specialty", "other"];

export default function CRMCompanies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/crm/companies", searchTerm, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      const res = await fetch(`/api/crm/companies?${params}`);
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });

  const createCompany = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/companies"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Company created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create company", variant: "destructive" });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Company> }) => {
      const res = await fetch(`/api/crm/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/companies"] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast({ title: "Company updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update company", variant: "destructive" });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/crm/companies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/companies"] });
      toast({ title: "Company deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete company", variant: "destructive" });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCompany.mutate({
      name: formData.get("name") as string,
      domain: formData.get("domain") as string || undefined,
      industry: formData.get("industry") as string || undefined,
      size: formData.get("size") as string || undefined,
      address: formData.get("address") as string || undefined,
      city: formData.get("city") as string || undefined,
      state: formData.get("state") as string || undefined,
      country: formData.get("country") as string || undefined,
      companyType: formData.get("companyType") as string,
      status: "active",
      ehrSystem: formData.get("ehrSystem") as string || undefined,
      bedCount: formData.get("bedCount") ? parseInt(formData.get("bedCount") as string) : undefined,
      facilityType: formData.get("facilityType") as string || undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const formData = new FormData(e.currentTarget);
    updateCompany.mutate({
      id: selectedCompany.id,
      data: {
        name: formData.get("name") as string,
        domain: formData.get("domain") as string || undefined,
        industry: formData.get("industry") as string || undefined,
        size: formData.get("size") as string || undefined,
        address: formData.get("address") as string || undefined,
        city: formData.get("city") as string || undefined,
        state: formData.get("state") as string || undefined,
        country: formData.get("country") as string || undefined,
        companyType: formData.get("companyType") as string,
        status: formData.get("status") as string,
        ehrSystem: formData.get("ehrSystem") as string || undefined,
        bedCount: formData.get("bedCount") ? parseInt(formData.get("bedCount") as string) : undefined,
        facilityType: formData.get("facilityType") as string || undefined,
      },
    });
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      prospect: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      customer: "bg-green-500/20 text-green-400 border-green-500/30",
      partner: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      vendor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      competitor: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-companies-title">Companies</h1>
          <p className="text-muted-foreground">Manage your CRM companies and accounts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-company">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>Add a new company to your CRM</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" required data-testid="input-company-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Website Domain</Label>
                  <Input id="domain" name="domain" placeholder="example.com" data-testid="input-domain" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select name="industry">
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select name="size">
                    <SelectTrigger data-testid="select-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>{size} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyType">Company Type *</Label>
                  <Select name="companyType" defaultValue="prospect">
                    <SelectTrigger data-testid="select-company-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" data-testid="input-address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" data-testid="input-city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" data-testid="input-state" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" defaultValue="USA" data-testid="input-country" />
                </div>
              </div>

              {/* Healthcare IT Fields */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-4">Healthcare IT (Optional)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ehrSystem">EHR System</Label>
                    <Select name="ehrSystem">
                      <SelectTrigger data-testid="select-ehr-system">
                        <SelectValue placeholder="Select EHR" />
                      </SelectTrigger>
                      <SelectContent>
                        {EHR_SYSTEMS.map((ehr) => (
                          <SelectItem key={ehr} value={ehr}>{ehr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedCount">Bed Count</Label>
                    <Input id="bedCount" name="bedCount" type="number" data-testid="input-bed-count" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facilityType">Facility Type</Label>
                    <Select name="facilityType">
                      <SelectTrigger data-testid="select-facility-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACILITY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCompany.isPending} data-testid="button-create-company">
                  {createCompany.isPending ? "Creating..." : "Create Company"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-companies"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {COMPANY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            {companies?.length || 0} compan{(companies?.length || 0) !== 1 ? "ies" : "y"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>EHR System</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} data-testid={`company-row-${company.id}`}>
                    <TableCell className="font-medium">
                      {company.name}
                      {company.domain && (
                        <span className="block text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {company.domain}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{company.industry || "-"}</TableCell>
                    <TableCell>{getTypeBadge(company.companyType)}</TableCell>
                    <TableCell>
                      {company.city || company.state ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {[company.city, company.state].filter(Boolean).join(", ")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{company.ehrSystem || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-company-actions-${company.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedCompany(company);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteCompany.mutate(company.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No companies yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first company
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Company Name *</Label>
                <Input id="edit-name" name="name" defaultValue={selectedCompany.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-domain">Website Domain</Label>
                  <Input id="edit-domain" name="domain" defaultValue={selectedCompany.domain || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Select name="industry" defaultValue={selectedCompany.industry || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-companyType">Company Type *</Label>
                  <Select name="companyType" defaultValue={selectedCompany.companyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select name="status" defaultValue={selectedCompany.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input id="edit-city" name="city" defaultValue={selectedCompany.city || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input id="edit-state" name="state" defaultValue={selectedCompany.state || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input id="edit-country" name="country" defaultValue={selectedCompany.country || ""} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCompany.isPending}>
                  {updateCompany.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
