import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, Shield, AlertCircle, Scale, Gavel, Mail } from "lucide-react";

export default function TermsOfService() {
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

      <main className="container mx-auto px-4 py-8 max-w-4xl" role="main" aria-labelledby="terms-title">
        <div className="mb-8">
          <h1 id="terms-title" className="text-3xl font-bold mb-2" data-testid="text-terms-title">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-agreement">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                By accessing or using the NICEHR Group healthcare consultant management platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service, including healthcare consultants, hospital staff, administrators, and other authorized personnel.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-eligibility">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                Eligibility and Access
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>To use our Service, you must:</p>
              <ul>
                <li>Be at least 18 years of age</li>
                <li>Have received a valid invitation from an authorized administrator</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Be authorized to act on behalf of your organization (if applicable)</li>
              </ul>
              <p>
                Access to the Service is invitation-only. You may not share your credentials or allow unauthorized access to your account.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-acceptable-use">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>When using our Service, you agree to:</p>
              <ul>
                <li>Use the Service only for its intended purposes</li>
                <li>Maintain the confidentiality of all Protected Health Information (PHI)</li>
                <li>Comply with all applicable HIPAA regulations and other healthcare laws</li>
                <li>Report any suspected security breaches immediately</li>
                <li>Not attempt to bypass security controls or access restrictions</li>
                <li>Not share confidential information with unauthorized parties</li>
                <li>Not use the Service for any illegal or unauthorized purpose</li>
              </ul>
              <h4>Prohibited Activities</h4>
              <ul>
                <li>Attempting to gain unauthorized access to other user accounts</li>
                <li>Uploading malicious code or interfering with system operations</li>
                <li>Scraping or automated data collection without authorization</li>
                <li>Impersonating another user or misrepresenting your identity</li>
                <li>Sharing, selling, or distributing access credentials</li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-hipaa">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                HIPAA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                As a platform handling healthcare-related information, we maintain strict compliance with the Health Insurance Portability and Accountability Act (HIPAA). By using our Service, you acknowledge and agree to:
              </p>
              <ul>
                <li>Treat all patient and health-related information as confidential</li>
                <li>Access only the minimum necessary information required for your role</li>
                <li>Report any unauthorized access or potential breaches immediately</li>
                <li>Complete required HIPAA training as mandated by your organization</li>
                <li>Understand that violations may result in immediate account termination and legal consequences</li>
              </ul>
              <p>
                Business Associate Agreements (BAAs) may be required for certain users and organizations. Please contact your administrator for more information.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-intellectual-property">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of NICEHR Group. The Service is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-termination">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" aria-hidden="true" />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
              </p>
              <ul>
                <li>Breach of these Terms</li>
                <li>Violation of HIPAA or other healthcare regulations</li>
                <li>Security concerns or suspicious activity</li>
                <li>Request from law enforcement or government agencies</li>
                <li>Extended periods of inactivity</li>
                <li>Discontinuation of the Service</li>
              </ul>
              <p>
                Upon termination, your right to use the Service will immediately cease. You may request export of your data in accordance with our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-disclaimers">
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <h4>Disclaimers and Limitation of Liability</h4>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, NICEHR GROUP DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.
              </p>
              <p>
                IN NO EVENT SHALL NICEHR GROUP BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-governing-law">
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <h4>Governing Law</h4>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of [State], without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved in the state or federal courts located in [State].
              </p>
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
              <p>If you have questions about these Terms of Service, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> legal@nicehrgroup.com</li>
                <li><strong>Address:</strong> NICEHR Group, Legal Department, [Address]</li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-changes">
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <h4>Changes to Terms</h4>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after revisions become effective, you agree to be bound by the revised terms.
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
