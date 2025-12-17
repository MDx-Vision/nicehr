import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Settings as SettingsIcon, Users, Shield, Plus, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User, DocumentType } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const docTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
});

type DocTypeFormValues = z.infer<typeof docTypeFormSchema>;

export default function Settings() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: documentTypes, isLoading } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  const form = useForm<DocTypeFormValues>({
    resolver: zodResolver(docTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isRequired: false,
    },
  });

  const createDocTypeMutation = useMutation({
    mutationFn: async (data: DocTypeFormValues) => {
      return await apiRequest("POST", "/api/document-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-types"] });
      toast({ title: "Document type created" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create document type", variant: "destructive" });
    },
  });

  const handleSubmit = (data: DocTypeFormValues) => {
    createDocTypeMutation.mutate(data);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Preferences</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You do not have permission to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">Preferences</h1>
        <p className="text-muted-foreground">
          Configure platform settings and document types
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Types
                </CardTitle>
                <CardDescription>
                  Configure required documents for consultant onboarding
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-doc-type">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Document Type</DialogTitle>
                    <DialogDescription>
                      Create a new document type for consultant onboarding
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Driver's License" data-testid="input-doc-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional description" data-testid="input-doc-desc" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isRequired"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>Required for onboarding</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-required"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createDocTypeMutation.isPending} data-testid="button-submit-doc-type">
                          Create
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {documentTypes && documentTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.map((docType) => (
                    <TableRow key={docType.id} data-testid={`row-doc-type-${docType.id}`}>
                      <TableCell className="font-medium">{docType.name}</TableCell>
                      <TableCell>
                        <Badge variant={docType.isRequired ? "default" : "secondary"}>
                          {docType.isRequired ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No document types configured yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Platform Configuration
            </CardTitle>
            <CardDescription>
              General platform settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Platform Version</p>
                <p className="text-sm text-muted-foreground">Current version of NICEHR</p>
              </div>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authentication</p>
                <p className="text-sm text-muted-foreground">Login provider</p>
              </div>
              <Badge>Replit Auth</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-muted-foreground">Data storage</p>
              </div>
              <Badge variant="outline">PostgreSQL</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">File Storage</p>
                <p className="text-sm text-muted-foreground">Document uploads</p>
              </div>
              <Badge variant="outline">Object Storage</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
