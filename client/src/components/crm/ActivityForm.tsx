import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ActivityType = "email" | "call" | "meeting" | "task" | "note";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  defaultType?: ActivityType;
  contactName?: string;
  companyName?: string;
  dealName?: string;
}

const CALL_OUTCOMES = [
  { value: "connected", label: "Connected" },
  { value: "voicemail", label: "Left Voicemail" },
  { value: "no_answer", label: "No Answer" },
  { value: "busy", label: "Line Busy" },
];

const MEETING_OUTCOMES = [
  { value: "meeting_held", label: "Meeting Held" },
  { value: "meeting_cancelled", label: "Meeting Cancelled" },
];

const EMAIL_OUTCOMES = [
  { value: "email_sent", label: "Email Sent" },
  { value: "email_bounced", label: "Email Bounced" },
];

const SENTIMENTS = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

export default function ActivityForm({
  open,
  onOpenChange,
  contactId,
  companyId,
  dealId,
  defaultType = "call",
  contactName,
  companyName,
  dealName,
}: ActivityFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState<ActivityType>(defaultType);

  const createActivity = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create activity");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      onOpenChange(false);
      toast({
        title: "Activity logged",
        description: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} has been logged successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to log activity",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: Record<string, any> = {
      type: activityType,
      subject: formData.get("subject") as string,
      description: formData.get("description") as string,
      contactId: contactId || undefined,
      companyId: companyId || undefined,
      dealId: dealId || undefined,
    };

    // Type-specific fields
    if (activityType === "call") {
      data.outcome = formData.get("outcome") as string;
      data.durationMinutes = parseInt(formData.get("duration") as string) || undefined;
      data.sentiment = formData.get("sentiment") as string || undefined;
      data.nextAction = formData.get("nextAction") as string || undefined;
    } else if (activityType === "meeting") {
      data.outcome = formData.get("outcome") as string;
      data.durationMinutes = parseInt(formData.get("duration") as string) || undefined;
      data.sentiment = formData.get("sentiment") as string || undefined;
      data.nextAction = formData.get("nextAction") as string || undefined;
    } else if (activityType === "email") {
      data.outcome = formData.get("outcome") as string || "email_sent";
    } else if (activityType === "task") {
      const dueDate = formData.get("dueDate") as string;
      if (dueDate) {
        data.dueDate = new Date(dueDate).toISOString();
      }
    }

    createActivity.mutate(data);
  };

  const getContextLabel = () => {
    const parts = [];
    if (contactName) parts.push(contactName);
    if (companyName) parts.push(companyName);
    if (dealName) parts.push(dealName);
    return parts.join(" | ") || "Activity";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            {getContextLabel()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="call" data-testid="tab-activity-call">
              <Phone className="w-4 h-4 mr-1" />
              Call
            </TabsTrigger>
            <TabsTrigger value="email" data-testid="tab-activity-email">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="meeting" data-testid="tab-activity-meeting">
              <Calendar className="w-4 h-4 mr-1" />
              Meeting
            </TabsTrigger>
            <TabsTrigger value="task" data-testid="tab-activity-task">
              <CheckCircle className="w-4 h-4 mr-1" />
              Task
            </TabsTrigger>
            <TabsTrigger value="note" data-testid="tab-activity-note">
              <FileText className="w-4 h-4 mr-1" />
              Note
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Common fields */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder={`${activityType === "call" ? "Call" : activityType === "email" ? "Email" : activityType === "meeting" ? "Meeting" : activityType === "task" ? "Task" : "Note"} subject...`}
                required
                data-testid="input-activity-subject"
              />
            </div>

            {/* Call-specific fields */}
            <TabsContent value="call" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome *</Label>
                  <Select name="outcome" defaultValue="connected">
                    <SelectTrigger data-testid="select-call-outcome">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALL_OUTCOMES.map((outcome) => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          {outcome.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    placeholder="5"
                    data-testid="input-call-duration"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sentiment">Sentiment</Label>
                <Select name="sentiment">
                  <SelectTrigger data-testid="select-call-sentiment">
                    <SelectValue placeholder="How did it go?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENTIMENTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Email-specific fields */}
            <TabsContent value="email" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="outcome">Status</Label>
                <Select name="outcome" defaultValue="email_sent">
                  <SelectTrigger data-testid="select-email-outcome">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_OUTCOMES.map((outcome) => (
                      <SelectItem key={outcome.value} value={outcome.value}>
                        {outcome.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Meeting-specific fields */}
            <TabsContent value="meeting" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome *</Label>
                  <Select name="outcome" defaultValue="meeting_held">
                    <SelectTrigger data-testid="select-meeting-outcome">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_OUTCOMES.map((outcome) => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          {outcome.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    data-testid="input-meeting-duration"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sentiment">Meeting Sentiment</Label>
                <Select name="sentiment">
                  <SelectTrigger data-testid="select-meeting-sentiment">
                    <SelectValue placeholder="How did it go?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENTIMENTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Task-specific fields */}
            <TabsContent value="task" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  data-testid="input-task-due-date"
                />
              </div>
            </TabsContent>

            {/* Note - no extra fields needed */}
            <TabsContent value="note" className="mt-0">
              {/* Just uses description */}
            </TabsContent>

            {/* Description - common to all */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {activityType === "note" ? "Note *" : "Notes"}
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={activityType === "note" ? "Write your note..." : "Additional details..."}
                rows={3}
                required={activityType === "note"}
                data-testid="input-activity-description"
              />
            </div>

            {/* Next Action - for calls and meetings */}
            {(activityType === "call" || activityType === "meeting") && (
              <div className="space-y-2">
                <Label htmlFor="nextAction">Next Action</Label>
                <Input
                  id="nextAction"
                  name="nextAction"
                  placeholder="Follow-up needed..."
                  data-testid="input-next-action"
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createActivity.isPending}
                data-testid="button-log-activity"
              >
                {createActivity.isPending ? "Logging..." : "Log Activity"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
