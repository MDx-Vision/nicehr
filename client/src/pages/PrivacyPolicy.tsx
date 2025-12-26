import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, AlertTriangle, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild data-testid="button-back-home">
              <a href="/" aria-label="Return to home page">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Back to Home
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="font-semibold text-xl">NICEHR Group</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl" role="main" aria-labelledby="privacy-title">
        <div className="mb-8">
          <h1 id="privacy-title" className="text-3xl font-bold mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-intro">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                NICEHR Group ("we," "us," or "our") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare consultant management platform.
              </p>
              <p>
                As a healthcare technology platform, we are committed to compliance with the Health Insurance Portability and Accountability Act (HIPAA) and other applicable privacy regulations. We understand the sensitive nature of healthcare-related information and take our responsibility to protect it seriously.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-info-collected">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h4>Personal Information</h4>
              <ul>
                <li>Name, email address, and contact information</li>
                <li>Professional credentials and certifications</li>
                <li>Employment history and work experience</li>
                <li>Scheduling preferences and availability</li>
                <li>Profile photographs (optional)</li>
              </ul>

              <h4>Technical Information</h4>
              <ul>
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Usage patterns and interaction data</li>
                <li>Session information and cookies</li>
              </ul>

              <h4>Healthcare-Related Information</h4>
              <ul>
                <li>Hospital assignments and project involvement</li>
                <li>Training records and competency assessments</li>
                <li>Compliance documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-info-use">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" aria-hidden="true" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li>Providing and maintaining our platform services</li>
                <li>Matching consultants with appropriate hospital assignments</li>
                <li>Processing scheduling and availability management</li>
                <li>Managing compliance and credential verification</li>
                <li>Communicating about platform updates and assignments</li>
                <li>Improving our services and user experience</li>
                <li>Ensuring platform security and preventing fraud</li>
                <li>Meeting legal and regulatory requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-data-security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We implement robust security measures to protect your information:</p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access control ensures users only access necessary information</li>
                <li><strong>Session Security:</strong> Automatic session timeout after 15 minutes of inactivity</li>
                <li><strong>Audit Logging:</strong> All access to sensitive information is logged for compliance</li>
                <li><strong>Regular Security Reviews:</strong> Periodic security assessments and penetration testing</li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-data-sharing">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" aria-hidden="true" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We may share your information in the following circumstances:</p>
              <ul>
                <li><strong>With Healthcare Facilities:</strong> To facilitate consultant assignments and project coordination</li>
                <li><strong>Service Providers:</strong> Third parties who assist in operating our platform (under strict confidentiality agreements)</li>
                <li><strong>Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </CardContent>
          </Card>

          <Card data-testid="card-your-rights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" aria-hidden="true" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Opt out of non-essential communications</li>
              </ul>
              <p>To exercise any of these rights, please contact us using the information below.</p>
            </CardContent>
          </Card>

          <Card data-testid="card-contact">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact our Privacy Officer:</p>
              <ul>
                <li><strong>Email:</strong> privacy@nicehrgroup.com</li>
                <li><strong>Address:</strong> NICEHR Group, Privacy Officer, [Address]</li>
              </ul>
              <p>We will respond to all privacy-related inquiries within 30 days.</p>
            </CardContent>
          </Card>

          <Card data-testid="card-changes">
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <h4>Changes to This Policy</h4>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-8 px-4 mt-8">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NICEHR Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
