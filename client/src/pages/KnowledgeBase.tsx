import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Book, 
  Search, 
  FileText, 
  Tag, 
  Eye, 
  User,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Folder,
  Clock,
  CheckCircle,
  Archive,
  Loader2,
  FileQuestion
} from "lucide-react";
import type { KnowledgeArticle, HospitalModule } from "@shared/schema";

interface KnowledgeArticleWithDetails extends KnowledgeArticle {
  module: { id: string; name: string } | null;
  author: { id: string; firstName: string | null; lastName: string | null } | null;
}

type ArticleStatus = "draft" | "published" | "archived";

const CATEGORIES = [
  { value: "workflow", label: "Workflow Documentation" },
  { value: "tips", label: "Tip Sheets" },
  { value: "troubleshooting", label: "Troubleshooting Guides" },
  { value: "training", label: "Training Materials" },
  { value: "general", label: "General Information" },
];

function getCategoryLabel(category: string | null): string {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.label || category || "Uncategorized";
}

function getCategoryBadgeVariant(category: string | null) {
  switch (category) {
    case "workflow":
      return "default";
    case "tips":
      return "secondary";
    case "troubleshooting":
      return "destructive";
    case "training":
      return "outline";
    default:
      return "outline";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary" data-testid="badge-status-draft">Draft</Badge>;
    case "published":
      return <Badge className="bg-green-500 text-white" data-testid="badge-status-published">Published</Badge>;
    case "archived":
      return <Badge variant="outline" data-testid="badge-status-archived">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function ArticleCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function ArticleCard({
  article,
  onReadMore,
}: {
  article: KnowledgeArticleWithDetails;
  onReadMore: () => void;
}) {
  const contentPreview = article.content.length > 150 
    ? article.content.substring(0, 150) + "..." 
    : article.content;

  return (
    <Card className="flex flex-col h-full" data-testid={`card-article-${article.id}`}>
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant={getCategoryBadgeVariant(article.category) as any}>
            {getCategoryLabel(article.category)}
          </Badge>
          {article.module && (
            <Badge variant="outline" className="text-xs">
              {article.module.name}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-3 mt-2">
          {contentPreview}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {article.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{article.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {article.author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>
                {[article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Unknown"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{article.viewCount || 0} views</span>
          </div>
          {article.updatedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(article.updatedAt), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onReadMore} data-testid={`button-read-more-${article.id}`}>
          <Book className="h-4 w-4 mr-2" />
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
}

function CategoryCard({
  category,
  articleCount,
  onClick,
}: {
  category: { value: string; label: string };
  articleCount: number;
  onClick: () => void;
}) {
  return (
    <Card 
      className="hover-elevate cursor-pointer transition-colors" 
      onClick={onClick}
      data-testid={`card-category-${category.value}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="secondary">{articleCount} articles</Badge>
        </div>
        <CardTitle className="text-base mt-3">{category.label}</CardTitle>
        <CardDescription>
          Browse all {category.label.toLowerCase()} articles
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ArticleView({
  article,
  onBack,
}: {
  article: KnowledgeArticleWithDetails;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6" data-testid={`article-view-${article.id}`}>
      <Button variant="outline" onClick={onBack} data-testid="button-back-to-articles">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Articles
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant={getCategoryBadgeVariant(article.category) as any}>
              {getCategoryLabel(article.category)}
            </Badge>
            {article.module && (
              <Badge variant="outline">
                {article.module.name}
              </Badge>
            )}
            {getStatusBadge(article.status)}
          </div>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {[article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Unknown Author"}
                </span>
              </div>
            )}
            {article.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Created: {format(new Date(article.createdAt), "MMMM d, yyyy")}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.viewCount || 0} views</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} data-testid={`article-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Tags:</span>
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ArticleFormData {
  title: string;
  content: string;
  category: string;
  moduleId: string;
  tags: string;
  status: ArticleStatus;
}

function ArticleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  modules,
  editingArticle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
  modules: HospitalModule[];
  editingArticle?: KnowledgeArticleWithDetails | null;
}) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: editingArticle?.title || "",
    content: editingArticle?.content || "",
    category: editingArticle?.category || "",
    moduleId: editingArticle?.moduleId || "",
    tags: editingArticle?.tags?.join(", ") || "",
    status: (editingArticle?.status as ArticleStatus) || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
    
    onSubmit({
      title: formData.title,
      content: formData.content,
      category: formData.category || null,
      moduleId: formData.moduleId || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingArticle ? "Edit Article" : "Create New Article"}
          </DialogTitle>
          <DialogDescription>
            {editingArticle 
              ? "Update the article details below." 
              : "Fill in the details to create a new knowledge base article."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
                required
                data-testid="input-article-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter article content..."
                className="min-h-[200px]"
                required
                data-testid="textarea-article-content"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-article-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="moduleId">EMR Module (Optional)</Label>
                <Select
                  value={formData.moduleId}
                  onValueChange={(value) => setFormData({ ...formData, moduleId: value })}
                >
                  <SelectTrigger data-testid="select-article-module">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., epic, documentation, training"
                data-testid="input-article-tags"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as ArticleStatus })}
              >
                <SelectTrigger data-testid="select-article-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} data-testid="button-save-article">
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingArticle ? "Update Article" : "Create Article"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function KnowledgeBase() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticleWithDetails | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticleWithDetails | null>(null);

  const articlesQueryKey = ['/api/knowledge-articles', searchQuery, categoryFilter, moduleFilter, statusFilter];
  
  const { data: articles = [], isLoading: isLoadingArticles } = useQuery<KnowledgeArticleWithDetails[]>({
    queryKey: articlesQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (moduleFilter) params.append('moduleId', moduleFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`/api/knowledge-articles?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },
  });

  const { data: modules = [] } = useQuery<HospitalModule[]>({
    queryKey: ['/api/modules/all'],
    queryFn: async () => {
      const res = await fetch('/api/hospitals', { credentials: 'include' });
      if (!res.ok) return [];
      const hospitals = await res.json();
      const allModules: HospitalModule[] = [];
      for (const hospital of hospitals) {
        const unitsRes = await fetch(`/api/hospitals/${hospital.id}/units`, { credentials: 'include' });
        if (unitsRes.ok) {
          const units = await unitsRes.json();
          for (const unit of units) {
            const modulesRes = await fetch(`/api/units/${unit.id}/modules`, { credentials: 'include' });
            if (modulesRes.ok) {
              const mods = await modulesRes.json();
              allModules.push(...mods);
            }
          }
        }
      }
      return allModules;
    },
  });

  const { data: articleDetails } = useQuery<KnowledgeArticleWithDetails>({
    queryKey: ['/api/knowledge-articles', selectedArticle?.id],
    queryFn: async () => {
      const res = await fetch(`/api/knowledge-articles/${selectedArticle?.id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch article');
      return res.json();
    },
    enabled: !!selectedArticle?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/knowledge-articles', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-articles'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Article Created",
        description: "The knowledge base article has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create article",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/knowledge-articles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-articles'] });
      setEditingArticle(null);
      toast({
        title: "Article Updated",
        description: "The knowledge base article has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update article",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/knowledge-articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-articles'] });
      toast({
        title: "Article Deleted",
        description: "The knowledge base article has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (!isAdmin) {
      result = result.filter(a => a.status === 'published');
    }
    return result;
  }, [articles, isAdmin]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      counts[cat.value] = filteredArticles.filter(a => a.category === cat.value).length;
    });
    return counts;
  }, [filteredArticles]);

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category);
    setActiveTab("browse");
  };

  if (selectedArticle && articleDetails) {
    return (
      <div className="space-y-6">
        <ArticleView article={articleDetails} onBack={() => setSelectedArticle(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Knowledge Base</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            Access documentation, guides, and training materials for EMR implementation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-articles"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse" data-testid="tab-browse-articles">
            <FileText className="h-4 w-4 mr-2" />
            Browse Articles
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Folder className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="manage" data-testid="tab-manage-articles">
              <Edit className="h-4 w-4 mr-2" />
              Manage Articles
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-module">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isAdmin && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {(categoryFilter || moduleFilter || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("");
                  setModuleFilter("");
                  setStatusFilter("");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {isLoadingArticles ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2" data-testid="text-no-articles">No articles found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || categoryFilter || moduleFilter || statusFilter
                    ? "Try adjusting your search or filters"
                    : "No knowledge base articles available yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onReadMore={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.value}
                category={category}
                articleCount={categoryCounts[category.value] || 0}
                onClick={() => handleCategoryClick(category.value)}
              />
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="manage" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold" data-testid="text-manage-title">Manage Articles</h2>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-article">
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </div>

            {isLoadingArticles ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ) : articles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first knowledge base article to get started.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id} data-testid={`row-article-${article.id}`}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {article.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCategoryBadgeVariant(article.category) as any} className="text-xs">
                            {getCategoryLabel(article.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {article.module?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(article.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.viewCount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.author 
                            ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Unknown"
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {article.status === "draft" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateMutation.mutate({ 
                                  id: article.id, 
                                  data: { status: "published" } 
                                })}
                                disabled={updateMutation.isPending}
                                data-testid={`button-publish-${article.id}`}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Publish
                              </Button>
                            )}
                            {article.status === "published" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateMutation.mutate({ 
                                  id: article.id, 
                                  data: { status: "archived" } 
                                })}
                                disabled={updateMutation.isPending}
                                data-testid={`button-archive-${article.id}`}
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Archive
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingArticle(article)}
                              data-testid={`button-edit-${article.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this article?")) {
                                  deleteMutation.mutate(article.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${article.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      <ArticleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        modules={modules}
      />

      <ArticleFormDialog
        open={!!editingArticle}
        onOpenChange={(open) => !open && setEditingArticle(null)}
        onSubmit={(data) => editingArticle && updateMutation.mutate({ id: editingArticle.id, data })}
        isPending={updateMutation.isPending}
        modules={modules}
        editingArticle={editingArticle}
      />
    </div>
  );
}
