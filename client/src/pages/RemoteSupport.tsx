import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video,
  Phone,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Monitor,
  Headphones,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface HealthStatus {
  status: string;
  timestamp: string;
  seeded: boolean;
  services: {
    video: string;
    websocket: string;
  };
}

interface Consultant {
  id: number;
  name: string;
  email: string;
  status: string;
  sessionsToday: number;
  specialties: { department: string; proficiency: string }[];
}

interface QueueItem {
  id: number;
  department: string;
  urgency: string;
  issueSummary: string;
  createdAt: string;
  position: number;
  requesterName: string;
  hospitalName: string;
}

const REMOTE_SUPPORT_URL = "http://localhost:3002";
const REMOTE_CLIENT_URL = "http://localhost:5173";

// Helper to fetch with timeout
const fetchWithTimeout = async (url: string, timeout = 3000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export default function RemoteSupport() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, consultantsRes, queueRes] = await Promise.all([
        fetchWithTimeout(`${REMOTE_SUPPORT_URL}/api/health`),
        fetchWithTimeout(`${REMOTE_SUPPORT_URL}/api/consultants/available`),
        fetchWithTimeout(`${REMOTE_SUPPORT_URL}/api/support/queue`),
      ]);

      if (!healthRes.ok) throw new Error("Failed to connect to Remote Support server");

      const healthData = await healthRes.json();
      const consultantsData = await consultantsRes.json();
      const queueData = await queueRes.json();

      setHealth(healthData);
      setConsultants(consultantsData);
      setQueue(queueData);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? (err.name === 'AbortError' ? 'Connection timed out' : err.message)
        : "Failed to connect to Remote Support server";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "busy":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "away":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "urgent":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-500" />
            Remote Support
          </h1>
          <p className="text-muted-foreground">
            Live video support for hospital staff with smart consultant matching
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <a href={REMOTE_CLIENT_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full App
            </a>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {error}. Make sure the Remote Support server is running on port 3002.
            <br />
            <code className="text-xs mt-2 block">
              cd remote-support && npm run dev
            </code>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            {health?.status === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {health?.status || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.services?.websocket || "0 clients connected"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Service</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {health?.services?.video || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Video service status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultants.length}</div>
            <p className="text-xs text-muted-foreground">Ready to help</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queue.length}</div>
            <p className="text-xs text-muted-foreground">Waiting for support</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consultants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultants">
            <Headphones className="h-4 w-4 mr-2" />
            Available Consultants
          </TabsTrigger>
          <TabsTrigger value="queue">
            <Clock className="h-4 w-4 mr-2" />
            Support Queue
          </TabsTrigger>
          <TabsTrigger value="about">
            <BarChart3 className="h-4 w-4 mr-2" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultants" className="space-y-4">
          {consultants.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No consultants available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {consultants.map((consultant) => (
                <Card key={consultant.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{consultant.name}</CardTitle>
                      <Badge className={getStatusColor(consultant.status)}>
                        {consultant.status}
                      </Badge>
                    </div>
                    <CardDescription>{consultant.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{consultant.sessionsToday} sessions today</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {consultant.specialties.map((spec) => (
                          <Badge
                            key={spec.department}
                            variant={spec.proficiency === "expert" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {spec.department}
                            {spec.proficiency === "expert" && " (Expert)"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          {queue.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No requests in queue</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {item.requesterName} - {item.hospitalName}
                        </CardTitle>
                        <CardDescription>{item.department}</CardDescription>
                      </div>
                      <Badge className={getUrgencyColor(item.urgency)}>
                        {item.urgency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.issueSummary}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Position: #{item.position} | Requested: {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Remote Support</CardTitle>
              <CardDescription>
                Live video support system for hospital staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-500" />
                    Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Instant video calls with screen sharing</li>
                    <li>Smart consultant matching based on expertise</li>
                    <li>Real-time queue with priority handling</li>
                    <li>Session recording for training</li>
                    <li>Relationship-based matching</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    Scheduling
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Schedule dedicated support sessions</li>
                    <li>All-day consultant booking</li>
                    <li>Recurring session support</li>
                    <li>Staff availability management</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Video Configuration Required</AlertTitle>
                <AlertDescription>
                  Video calls require API credentials to be configured in the environment
                  variables to enable video functionality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
