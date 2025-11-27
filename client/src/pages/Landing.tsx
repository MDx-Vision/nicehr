import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Calendar, Calculator, BarChart3, FileCheck, Shield, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="font-semibold text-xl">NICEHR Group</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Healthcare Consultant Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your hospital go-live projects with intelligent consultant scheduling, 
              budget optimization, and comprehensive ROI tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                data-testid="button-learn-more"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-elevate" data-testid="card-feature-hospitals">
                <CardHeader>
                  <Building2 className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Hospital Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage hospital details, units, modules, and staff positions with ease.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-consultants">
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Consultant Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track experience, certifications, availability, and match consultants to projects.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-scheduling">
                <CardHeader>
                  <Calendar className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Smart Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automated consultant-to-position matching based on skills and availability.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-budget">
                <CardHeader>
                  <Calculator className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Budget Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Optimize consultant allocation and calculate cost savings automatically.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-roi">
                <CardHeader>
                  <BarChart3 className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>ROI Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track performance metrics and gather feedback from hospital staff.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-documents">
                <CardHeader>
                  <FileCheck className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Document Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Streamlined onboarding with document uploads and approval workflows.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-compliance">
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Compliance Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Monitor certifications, background checks, and document expirations.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-feature-projects">
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Project Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create and manage go-live projects with full visibility into progress.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Healthcare Consulting?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hospitals and healthcare organizations that trust NICEHR Group 
              for their consultant management needs.
            </p>
            <Button size="lg" asChild data-testid="button-start-now">
              <a href="/api/login">Start Now</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NICEHR Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
