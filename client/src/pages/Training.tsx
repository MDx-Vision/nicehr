import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  Clock, 
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Play,
  Download,
  Eye,
  CheckCircle,
  Monitor,
  MapPin,
  Layers
} from "lucide-react";
import type { Course, CourseEnrollment, HospitalModule } from "@shared/schema";

interface CourseWithDetails extends Course {
  module?: { name: string } | null;
  hospital?: { name: string } | null;
  enrollmentCount?: number;
}

interface EnrollmentWithCourse extends CourseEnrollment {
  course: {
    id: string;
    title: string;
    description: string | null;
    courseType: string;
    level: string;
    durationMinutes: number | null;
    ceCredits: string | null;
    thumbnailUrl: string | null;
  };
}

function getLevelBadgeVariant(level: string) {
  switch (level) {
    case "beginner":
      return "secondary";
    case "intermediate":
      return "default";
    case "advanced":
      return "destructive";
    default:
      return "outline";
  }
}

function getCourseTypeIcon(type: string) {
  switch (type) {
    case "online":
      return <Monitor className="h-4 w-4" />;
    case "in_person":
      return <MapPin className="h-4 w-4" />;
    case "hybrid":
      return <Layers className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "enrolled":
      return <Badge variant="secondary">Enrolled</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    case "dropped":
      return <Badge variant="destructive">Dropped</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getCourseStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "published":
      return <Badge className="bg-green-500 text-white">Published</Badge>;
    case "archived":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function CourseCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-40 w-full rounded-t-lg" />
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function CourseCard({
  course,
  isEnrolled,
  onEnroll,
  isPending,
}: {
  course: CourseWithDetails;
  isEnrolled: boolean;
  onEnroll: () => void;
  isPending: boolean;
}) {
  return (
    <Card className="flex flex-col h-full" data-testid={`card-course-${course.id}`}>
      <div className="h-40 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
          <Badge variant={getLevelBadgeVariant(course.level) as any} className="shrink-0 capitalize">
            {course.level}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {course.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {getCourseTypeIcon(course.courseType)}
            <span className="capitalize">{course.courseType.replace("_", " ")}</span>
          </div>
          {course.durationMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.durationMinutes} min</span>
            </div>
          )}
          {course.ceCredits && parseFloat(course.ceCredits) > 0 && (
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{course.ceCredits} CE</span>
            </div>
          )}
        </div>
        {course.module && (
          <Badge variant="outline" className="text-xs">
            {course.module.name}
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        {isEnrolled ? (
          <Button variant="secondary" className="w-full" disabled data-testid={`button-enrolled-${course.id}`}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Already Enrolled
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onEnroll}
            disabled={isPending || course.status !== "published"}
            data-testid={`button-enroll-${course.id}`}
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            {course.status !== "published" ? "Not Available" : "Enroll Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function EnrollmentCard({
  enrollment,
  onContinue,
}: {
  enrollment: EnrollmentWithCourse;
  onContinue: () => void;
}) {
  const isCompleted = enrollment.status === "completed";
  
  return (
    <Card className="flex flex-col" data-testid={`card-enrollment-${enrollment.id}`}>
      <div className="h-32 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
        {enrollment.course.thumbnailUrl ? (
          <img 
            src={enrollment.course.thumbnailUrl} 
            alt={enrollment.course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-1">{enrollment.course.title}</CardTitle>
          {getStatusBadge(enrollment.status)}
        </div>
        <CardDescription className="line-clamp-1">
          {enrollment.course.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{enrollment.progressPercent || 0}%</span>
          </div>
          <Progress value={enrollment.progressPercent || 0} className="h-2" />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {enrollment.course.durationMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{enrollment.course.durationMinutes} min</span>
            </div>
          )}
          {enrollment.course.ceCredits && parseFloat(enrollment.course.ceCredits) > 0 && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{enrollment.course.ceCredits} CE Credits</span>
            </div>
          )}
        </div>
        {enrollment.enrolledAt && (
          <p className="text-xs text-muted-foreground">
            Enrolled: {format(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
          </p>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {isCompleted && enrollment.certificateUrl ? (
          <Button variant="outline" className="w-full" asChild data-testid={`button-certificate-${enrollment.id}`}>
            <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer">
              <Award className="h-4 w-4 mr-2" />
              View Certificate
            </a>
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onContinue}
            disabled={isCompleted}
            data-testid={`button-continue-${enrollment.id}`}
          >
            <Play className="h-4 w-4 mr-2" />
            {isCompleted ? "Completed" : "Continue"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function CertificateCard({ enrollment }: { enrollment: EnrollmentWithCourse }) {
  if (enrollment.status !== "completed") return null;
  
  return (
    <Card data-testid={`card-certificate-${enrollment.id}`}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Award className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{enrollment.course.title}</CardTitle>
            <CardDescription>
              Completed: {enrollment.completedAt ? format(new Date(enrollment.completedAt), "MMMM d, yyyy") : "N/A"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 text-sm">
          {enrollment.ceCreditsEarned && parseFloat(enrollment.ceCreditsEarned) > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{enrollment.ceCreditsEarned} CE Credits Earned</span>
            </div>
          )}
          <Badge variant="outline" className="capitalize">
            {enrollment.course.level}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        {enrollment.certificateUrl ? (
          <Button variant="outline" className="w-full" asChild data-testid={`button-download-certificate-${enrollment.id}`}>
            <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </a>
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" disabled>
            Certificate Processing
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

type CourseType = "online" | "in_person" | "hybrid";
type CourseLevel = "beginner" | "intermediate" | "advanced";
type CourseStatus = "draft" | "published" | "archived";

interface CourseFormData {
  title: string;
  description: string;
  courseType: CourseType;
  level: CourseLevel;
  durationMinutes: string;
  ceCredits: string;
  moduleId: string;
  thumbnailUrl: string;
  status: CourseStatus;
}

function CreateCourseDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  modules,
  editingCourse,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
  modules: HospitalModule[];
  editingCourse?: CourseWithDetails | null;
}) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: editingCourse?.title || "",
    description: editingCourse?.description || "",
    courseType: (editingCourse?.courseType as CourseType) || "online",
    level: (editingCourse?.level as CourseLevel) || "beginner",
    durationMinutes: editingCourse?.durationMinutes?.toString() || "",
    ceCredits: editingCourse?.ceCredits || "",
    moduleId: editingCourse?.moduleId || "",
    thumbnailUrl: editingCourse?.thumbnailUrl || "",
    status: (editingCourse?.status as CourseStatus) || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
      ceCredits: formData.ceCredits || null,
      moduleId: formData.moduleId || null,
      thumbnailUrl: formData.thumbnailUrl || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
          <DialogDescription>
            {editingCourse ? "Update the course details below." : "Add a new training course to the catalog."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Course title"
              required
              data-testid="input-course-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Course description"
              rows={3}
              data-testid="input-course-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseType">Course Type</Label>
              <Select
                value={formData.courseType}
                onValueChange={(value: CourseType) => setFormData({ ...formData, courseType: value })}
              >
                <SelectTrigger data-testid="select-course-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value: CourseLevel) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger data-testid="select-course-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="60"
                data-testid="input-course-duration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceCredits">CE Credits</Label>
              <Input
                id="ceCredits"
                type="number"
                step="0.5"
                value={formData.ceCredits}
                onChange={(e) => setFormData({ ...formData, ceCredits: e.target.value })}
                placeholder="1.5"
                data-testid="input-course-credits"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moduleId">EMR Module (optional)</Label>
            <Select
              value={formData.moduleId}
              onValueChange={(value) => setFormData({ ...formData, moduleId: value === "none" ? "" : value })}
            >
              <SelectTrigger data-testid="select-course-module">
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              data-testid="input-course-thumbnail"
            />
          </div>

          {editingCourse && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: CourseStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-course-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.title} data-testid="button-save-course">
              {isPending ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Training() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithDetails | null>(null);

  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ["/api/my-enrollments"],
  });

  const { data: modules } = useQuery<HospitalModule[]>({
    queryKey: ["/api/modules"],
  });

  const enrolledCourseIds = new Set(enrollments?.map(e => e.courseId) || []);

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the course.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCreateDialogOpen(false);
      toast({
        title: "Course Created",
        description: "The course has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditingCourse(null);
      toast({
        title: "Course Updated",
        description: "The course has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = !levelFilter || levelFilter === "all" || course.level === levelFilter;
    const matchesType = !typeFilter || typeFilter === "all" || course.courseType === typeFilter;
    const matchesModule = !moduleFilter || moduleFilter === "all" || course.moduleId === moduleFilter;

    return matchesSearch && matchesLevel && matchesType && matchesModule;
  }) || [];

  const publishedCourses = filteredCourses.filter(c => c.status === "published");
  const completedEnrollments = enrollments?.filter(e => e.status === "completed") || [];

  const handleContinueCourse = (enrollment: EnrollmentWithCourse) => {
    toast({
      title: "Continue Learning",
      description: `Resuming ${enrollment.course.title}`,
    });
  };

  const handleSubmitCourse = (data: any) => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data });
    } else {
      createCourseMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-training-title">Training Portal</h1>
        <p className="text-muted-foreground">
          Enhance your skills with our comprehensive EMR training courses
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-4 gap-1">
          <TabsTrigger value="catalog" data-testid="tab-catalog">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Catalog
          </TabsTrigger>
          <TabsTrigger value="my-courses" data-testid="tab-my-courses">
            <GraduationCap className="h-4 w-4 mr-2" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="certificates" data-testid="tab-certificates">
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="manage" data-testid="tab-manage">
              <Users className="h-4 w-4 mr-2" />
              Manage Courses
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-courses"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger data-testid="select-filter-level">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger data-testid="select-filter-type">
                    <SelectValue placeholder="Course Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger data-testid="select-filter-module">
                    <SelectValue placeholder="EMR Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules?.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {coursesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : publishedCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Courses Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || levelFilter || typeFilter || moduleFilter
                    ? "Try adjusting your filters to find courses."
                    : "No courses are currently available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.has(course.id)}
                  onEnroll={() => enrollMutation.mutate(course.id)}
                  isPending={enrollMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-courses" className="space-y-6">
          {enrollmentsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : !enrollments || enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Enrolled Courses</h3>
                <p className="text-muted-foreground mb-4">
                  Start learning by enrolling in a course from the catalog.
                </p>
                <Button onClick={() => setActiveTab("catalog")} data-testid="button-browse-catalog">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Catalog
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onContinue={() => handleContinueCourse(enrollment)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          {enrollmentsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : completedEnrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn certificates and CE credits.
                </p>
                <Button onClick={() => setActiveTab("my-courses")} data-testid="button-view-courses">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  View My Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedEnrollments.map((enrollment) => (
                <CertificateCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="manage" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold">Manage Courses</h2>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and manage training courses
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-course">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>CE Credits</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursesLoading ? (
                    [1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : !courses || courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No courses found. Create your first course to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course) => (
                      <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {course.title}
                        </TableCell>
                        <TableCell className="capitalize">
                          <div className="flex items-center gap-1">
                            {getCourseTypeIcon(course.courseType)}
                            <span>{course.courseType.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getLevelBadgeVariant(course.level) as any} className="capitalize">
                            {course.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {course.durationMinutes ? `${course.durationMinutes} min` : "-"}
                        </TableCell>
                        <TableCell>
                          {course.ceCredits ? course.ceCredits : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{course.enrollmentCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCourseStatusBadge(course.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingCourse(course)}
                              data-testid={`button-edit-${course.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this course?")) {
                                  deleteCourseMutation.mutate(course.id);
                                }
                              }}
                              data-testid={`button-delete-${course.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <CreateCourseDialog
              open={createDialogOpen || !!editingCourse}
              onOpenChange={(open) => {
                if (!open) {
                  setCreateDialogOpen(false);
                  setEditingCourse(null);
                }
              }}
              onSubmit={handleSubmitCourse}
              isPending={createCourseMutation.isPending || updateCourseMutation.isPending}
              modules={modules || []}
              editingCourse={editingCourse}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
