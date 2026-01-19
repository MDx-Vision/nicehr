import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Users,
  Building2,
  Handshake,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Activity,
  Target,
  Clock,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  contacts: { total: number; leads: number; customers: number };
  companies: { total: number; prospects: number; customers: number };
  deals: { total: number; open: number; totalValue: number; wonValue: number };
  activities: { total: number; today: number; upcoming: number };
}

export default function CRM() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWonRevenuePanel, setShowWonRevenuePanel] = useState(false);
  const [, navigate] = useLocation();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/crm/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/crm/dashboard");
      if (!res.ok) throw new Error("Failed to fetch CRM dashboard");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-crm-title">CRM</h1>
          <p className="text-muted-foreground">Manage your contacts, companies, and deals</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const defaultStats: DashboardStats = {
    contacts: { total: 0, leads: 0, customers: 0 },
    companies: { total: 0, prospects: 0, customers: 0 },
    deals: { total: 0, open: 0, totalValue: 0, wonValue: 0 },
    activities: { total: 0, today: 0, upcoming: 0 },
  };

  const dashboardStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-crm-title">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline, contacts, and customer relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-add-contact">
            <Users className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
          <Button data-testid="button-add-deal">
            <Handshake className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats Cards with Drill-Down */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/crm/contacts" className="block">
          <Card
            data-testid="card-total-contacts"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.contacts.total}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.contacts.leads} leads, {dashboardStats.contacts.customers} customers
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/crm/companies" className="block">
          <Card
            data-testid="card-total-companies"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.companies.total}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.companies.prospects} prospects, {dashboardStats.companies.customers} customers
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/crm/deals?status=open" className="block">
          <Card
            data-testid="card-open-deals"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Deals</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.deals.open}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  ${dashboardStats.deals.totalValue.toLocaleString()} pipeline value
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card
          data-testid="card-won-revenue"
          className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          onClick={() => setShowWonRevenuePanel(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardStats.deals.wonValue.toLocaleString()}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                <span className="text-green-500">12%</span> from last month
              </p>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Won Revenue Slide-Out Panel */}
      <Sheet open={showWonRevenuePanel} onOpenChange={setShowWonRevenuePanel}>
        <SheetContent className="sm:max-w-lg" data-testid="panel-won-revenue">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Won Revenue Details
            </SheetTitle>
            <SheetDescription>
              Breakdown of closed-won deals contributing to ${dashboardStats.deals.wonValue.toLocaleString()} total revenue
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div>
                <p className="text-sm font-medium">Total Won Revenue</p>
                <p className="text-2xl font-bold text-green-600">${dashboardStats.deals.wonValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Won Deals</h4>
              <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
                Won deals will appear here once data is available.
              </p>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                setShowWonRevenuePanel(false);
                navigate("/crm/deals?status=won");
              }}
              data-testid="button-view-all-won-deals"
            >
              View All Won Deals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activities" data-testid="tab-activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Contacts</CardTitle>
                <CardDescription>Latest contacts added to the CRM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No contacts yet. Add your first contact to get started.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Activities</CardTitle>
                <CardDescription>Tasks and meetings scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No upcoming activities. Schedule a meeting or task.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deals Closing Soon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deals Closing This Week</CardTitle>
              <CardDescription>Focus on these opportunities to hit your targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No deals closing this week. Add deals to your pipeline.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Pipeline</CardTitle>
              <CardDescription>Visual overview of your deal stages - click a stage to view deals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {["Lead", "Qualified", "Proposal", "Negotiation", "Closed"].map((stage) => (
                  <Link
                    key={stage}
                    href={`/crm/deals?stage=${stage.toLowerCase()}`}
                    className="block"
                  >
                    <div
                      className="border rounded-lg p-4 min-h-[200px] cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                      data-testid={`pipeline-stage-${stage.toLowerCase()}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{stage}</h3>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          data-testid={`badge-stage-${stage.toLowerCase()}`}
                        >
                          0
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No deals
                      </p>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          Click to view <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Activity Feed</CardTitle>
                <CardDescription>Recent sales activities and interactions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Log Call
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Log Email
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Today: {dashboardStats.activities.today} activities</span>
                  <Clock className="w-4 h-4 ml-4" />
                  <span>Upcoming: {dashboardStats.activities.upcoming} scheduled</span>
                </div>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activities. Start logging calls, emails, and meetings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
