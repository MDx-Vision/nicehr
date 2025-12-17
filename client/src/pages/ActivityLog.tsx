import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity,
  Search,
  RefreshCw,
  LogIn, 
  LogOut, 
  Eye, 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  Download, 
  Check, 
  X, 
  UserPlus, 
  Send,
  Filter
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { UserActivityWithUser } from "@shared/schema";

const activityIcons: Record<string, typeof Activity> = {
  login: LogIn,
  logout: LogOut,
  page_view: Eye,
  create: Plus,
  update: Pencil,
  delete: Trash2,
  upload: Upload,
  download: Download,
  approve: Check,
  reject: X,
  assign: UserPlus,
  submit: Send,
};

const activityColors: Record<string, string> = {
  login: "bg-green-500/10 text-green-600 dark:text-green-400",
  logout: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  page_view: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  create: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  update: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  delete: "bg-red-500/10 text-red-600 dark:text-red-400",
  upload: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  download: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  approve: "bg-green-500/10 text-green-600 dark:text-green-400",
  reject: "bg-red-500/10 text-red-600 dark:text-red-400",
  assign: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  submit: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

const activityLabels: Record<string, string> = {
  login: "Sign In",
  logout: "Sign Out",
  page_view: "Page View",
  create: "Created",
  update: "Updated",
  delete: "Removed",
  upload: "Uploaded",
  download: "Downloaded",
  approve: "Approved",
  reject: "Rejected",
  assign: "Assigned",
  submit: "Submitted",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  consultant: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  hospital_staff: "bg-green-500/10 text-green-600 dark:text-green-400",
};

export default function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const { data: activities = [], isLoading, refetch, isRefetching } = useQuery<UserActivityWithUser[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 30000,
  });

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  const uniqueUsers = Array.from(new Map(
    activities.map(a => [a.userId, { 
      id: a.userId, 
      name: a.user ? ([a.user.firstName, a.user.lastName].filter(Boolean).join(" ") || a.user.email) : "Unknown User"
    }])
  ).values());

  const uniqueActivityTypes = Array.from(new Set(activities.map(a => a.activityType)));

  const filteredActivities = activities.filter(activity => {
    const userSearchFields = activity.user 
      ? [activity.user.firstName, activity.user.lastName, activity.user.email]
      : [];
    const matchesSearch = searchQuery === "" || 
      [...userSearchFields, activity.resourceName, activity.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    const matchesType = activityTypeFilter === "all" || activity.activityType === activityTypeFilter;
    const matchesUser = userFilter === "all" || activity.userId === userFilter;

    return matchesSearch && matchesType && matchesUser;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-activity-log-title">
            <Activity className="h-8 w-8" />
            Activity Log
          </h1>
          <p className="text-muted-foreground">
            Monitor all user activities across the platform
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          data-testid="button-refresh-activities"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card data-testid="card-activity-filters">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, resource, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-activities"
                />
              </div>
            </div>

            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-activity-type">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueActivityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {activityLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-user-filter">
                <SelectValue placeholder="Filter by User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All People</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-activity-table">
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Showing {filteredActivities.length} of {activities.length} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="text-no-activities">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No activities found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">User</TableHead>
                    <TableHead className="w-[120px]">Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map(activity => {
                    const IconComponent = activityIcons[activity.activityType] || Activity;
                    const badgeClass = activityColors[activity.activityType] || "bg-gray-500/10 text-gray-500";
                    const user = activity.user;
                    const userName = user 
                      ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown User")
                      : "Unknown User";

                    return (
                      <TableRow key={activity.id} data-testid={`activity-row-${activity.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage 
                                src={user?.profileImageUrl || undefined} 
                                alt={userName}
                              />
                              <AvatarFallback>
                                {getInitials(user?.firstName || null, user?.lastName || null)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{userName}</p>
                              <p className="text-xs text-muted-foreground">{user?.email || "No email"}</p>
                              {user?.role && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${roleColors[user.role] || ""}`}
                                >
                                  {user.role.replace("_", " ")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={badgeClass}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {activityLabels[activity.activityType] || activity.activityType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {activity.resourceType && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Resource: </span>
                                <span className="font-medium">{activity.resourceType}</span>
                                {activity.resourceName && (
                                  <span className="text-muted-foreground"> - {activity.resourceName}</span>
                                )}
                              </p>
                            )}
                            {activity.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            {activity.ipAddress && (
                              <p className="text-xs text-muted-foreground">
                                IP: {activity.ipAddress}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {activity.createdAt ? format(new Date(activity.createdAt), "MMM d, yyyy") : "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.createdAt ? format(new Date(activity.createdAt), "h:mm a") : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : ""}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
