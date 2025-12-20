CREATE TYPE "public"."access_status" AS ENUM('pending_invitation', 'active', 'suspended', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('login', 'logout', 'page_view', 'create', 'update', 'delete', 'upload', 'download', 'approve', 'reject', 'assign', 'submit');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."assessment_status" AS ENUM('not_started', 'in_progress', 'passed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."auto_assignment_mode" AS ENUM('recommendation', 'auto_assign');--> statement-breakpoint
CREATE TYPE "public"."auto_assignment_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."availability_type" AS ENUM('available', 'unavailable', 'vacation', 'sick', 'training', 'other');--> statement-breakpoint
CREATE TYPE "public"."badge_category" AS ENUM('performance', 'training', 'engagement', 'milestone', 'special');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."booking_type" AS ENUM('flight', 'hotel', 'rental_car');--> statement-breakpoint
CREATE TYPE "public"."carpool_member_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."carpool_role" AS ENUM('driver', 'rider');--> statement-breakpoint
CREATE TYPE "public"."carpool_status" AS ENUM('open', 'full', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."compliance_check_status" AS ENUM('pending', 'passed', 'failed', 'expired', 'waived');--> statement-breakpoint
CREATE TYPE "public"."compliance_check_type" AS ENUM('hipaa', 'oig', 'sam', 'insurance', 'credential', 'background');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('draft', 'pending_signature', 'partially_signed', 'completed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."corrective_action_status" AS ENUM('pending', 'in_progress', 'completed', 'verified');--> statement-breakpoint
CREATE TYPE "public"."cost_variance_status" AS ENUM('on_track', 'at_risk', 'over_budget', 'under_budget');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."course_type" AS ENUM('online', 'in_person', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."data_retention_entity" AS ENUM('tickets', 'reports', 'audit_logs', 'documents', 'user_data');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."ehr_incident_severity" AS ENUM('critical', 'major', 'minor', 'informational');--> statement-breakpoint
CREATE TYPE "public"."ehr_system_status" AS ENUM('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('sent', 'failed', 'pending');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('enrolled', 'in_progress', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."eod_report_status" AS ENUM('draft', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."escalation_action_type" AS ENUM('notify_email', 'notify_slack', 'notify_sms', 'assign_user', 'change_priority', 'create_incident');--> statement-breakpoint
CREATE TYPE "public"."escalation_trigger_type" AS ENUM('time_based', 'priority_based', 'sla_breach', 'manual');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('travel', 'lodging', 'meals', 'transportation', 'parking', 'mileage', 'per_diem', 'equipment', 'supplies', 'training', 'other');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'reimbursed');--> statement-breakpoint
CREATE TYPE "public"."handoff_status" AS ENUM('pending', 'acknowledged', 'completed');--> statement-breakpoint
CREATE TYPE "public"."id_document_type" AS ENUM('drivers_license', 'passport', 'state_id', 'military_id', 'other');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('reported', 'investigating', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('google_calendar', 'outlook_calendar', 'ical', 'adp', 'workday', 'paychex', 'gusto', 'epic', 'cerner', 'meditech', 'allscripts');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('connected', 'disconnected', 'error', 'pending', 'expired');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."itinerary_status" AS ENUM('draft', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."lab_session_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'success', 'warning', 'error', 'schedule', 'document', 'project', 'system');--> statement-breakpoint
CREATE TYPE "public"."onboarding_task_status" AS ENUM('pending', 'submitted', 'under_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payroll_batch_status" AS ENUM('draft', 'processing', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payroll_sync_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."permission_domain" AS ENUM('dashboard', 'projects', 'consultants', 'hospitals', 'timesheets', 'support_tickets', 'eod_reports', 'training', 'travel', 'financials', 'quality', 'compliance', 'reports', 'admin', 'rbac', 'analytics');--> statement-breakpoint
CREATE TYPE "public"."phase_step_status" AS ENUM('not_started', 'in_progress', 'completed', 'blocked', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."point_transaction_type" AS ENUM('earned', 'redeemed', 'bonus', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('none', 'beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."profile_visibility" AS ENUM('public', 'members_only', 'private');--> statement-breakpoint
CREATE TYPE "public"."project_phase_status" AS ENUM('not_started', 'in_progress', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'true_false', 'short_answer');--> statement-breakpoint
CREATE TYPE "public"."questionnaire_status" AS ENUM('draft', 'submitted', 'verified');--> statement-breakpoint
CREATE TYPE "public"."raci_role" AS ENUM('responsible', 'accountable', 'consulted', 'informed');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'contacted', 'interviewing', 'hired', 'declined');--> statement-breakpoint
CREATE TYPE "public"."rental_car_preference" AS ENUM('economy', 'compact', 'midsize', 'fullsize', 'suv', 'luxury');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('page', 'api', 'feature');--> statement-breakpoint
CREATE TYPE "public"."risk_impact" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."risk_probability" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."risk_status" AS ENUM('identified', 'mitigating', 'resolved', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('base', 'implementation', 'custom');--> statement-breakpoint
CREATE TYPE "public"."scenario_type" AS ENUM('baseline', 'optimistic', 'pessimistic', 'what_if');--> statement-breakpoint
CREATE TYPE "public"."schedule_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."scorecard_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."seat_preference" AS ENUM('window', 'middle', 'aisle');--> statement-breakpoint
CREATE TYPE "public"."shift_type" AS ENUM('day', 'night', 'swing');--> statement-breakpoint
CREATE TYPE "public"."sign_in_status" AS ENUM('checked_in', 'checked_out', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."signer_role" AS ENUM('consultant', 'admin', 'hospital_staff', 'witness');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('ehr_systems', 'clinical_modules', 'revenue_cycle', 'ancillary_systems', 'technical_skills', 'soft_skills', 'certifications', 'work_preferences');--> statement-breakpoint
CREATE TYPE "public"."skill_verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."survey_type" AS ENUM('pulse', 'nps', 'feedback', 'exit');--> statement-breakpoint
CREATE TYPE "public"."swap_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sync_direction" AS ENUM('import', 'export', 'bidirectional');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'blocked', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."team_role_category" AS ENUM('nicehr', 'hospital');--> statement-breakpoint
CREATE TYPE "public"."ticket_action_type" AS ENUM('created', 'updated', 'assigned', 'escalated', 'resolved', 'closed', 'commented', 'reopened');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('technical', 'clinical', 'workflow', 'training', 'access', 'integration', 'other');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'escalated', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."timesheet_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'paid');--> statement-breakpoint
CREATE TYPE "public"."transportation_role" AS ENUM('driver', 'shuttle_driver', 'coordinator', 'other');--> statement-breakpoint
CREATE TYPE "public"."tshirt_size" AS ENUM('xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'hospital_staff', 'consultant');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'in_review', 'verified', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "achievement_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"category" "badge_category" NOT NULL,
	"icon_url" varchar,
	"color" varchar,
	"point_value" integer DEFAULT 0,
	"criteria" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "achievement_badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"score" integer,
	"passed" boolean DEFAULT false,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"answers" jsonb
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"question_type" "question_type" DEFAULT 'multiple_choice' NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"points" integer DEFAULT 1,
	"order_index" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"course_module_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"passing_score" integer DEFAULT 70,
	"max_attempts" integer DEFAULT 3,
	"time_limit_minutes" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auto_assignment_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"schedule_id" varchar,
	"run_by" varchar NOT NULL,
	"mode" "auto_assignment_mode" NOT NULL,
	"consultants_evaluated" integer DEFAULT 0,
	"consultants_eligible" integer DEFAULT 0,
	"assignments_made" integer DEFAULT 0,
	"conflicts_found" integer DEFAULT 0,
	"parameters" jsonb,
	"status" "auto_assignment_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automation_workflows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"trigger_event" varchar NOT NULL,
	"conditions" jsonb,
	"actions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"execution_count" integer DEFAULT 0,
	"last_executed_at" timestamp,
	"created_by_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "availability_blocks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"type" "availability_type" DEFAULT 'available' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"is_all_day" boolean DEFAULT true,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" varchar,
	"title" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_calculations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"estimated_consultants" integer NOT NULL,
	"optimized_consultants" integer NOT NULL,
	"avg_pay_rate" numeric(10, 2),
	"avg_flight_cost" numeric(10, 2),
	"avg_hotel_cost" numeric(10, 2),
	"avg_per_diem" numeric(10, 2),
	"total_estimated_cost" numeric(12, 2),
	"total_optimized_cost" numeric(12, 2),
	"total_savings" numeric(12, 2),
	"savings_percentage" numeric(5, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"scenario_type" "scenario_type" DEFAULT 'what_if' NOT NULL,
	"is_baseline" boolean DEFAULT false NOT NULL,
	"estimated_hours" numeric(10, 2),
	"hourly_rate" numeric(10, 2),
	"consultant_count" integer,
	"duration_weeks" integer,
	"labor_cost" numeric(12, 2),
	"travel_cost" numeric(12, 2),
	"expense_cost" numeric(12, 2),
	"overhead_cost" numeric(12, 2),
	"total_budget" numeric(12, 2),
	"actual_labor_cost" numeric(12, 2),
	"actual_travel_cost" numeric(12, 2),
	"actual_expense_cost" numeric(12, 2),
	"actual_total_cost" numeric(12, 2),
	"budget_variance" numeric(12, 2),
	"variance_percentage" numeric(5, 2),
	"assumptions" jsonb,
	"created_by" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_sync_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"connection_id" varchar NOT NULL,
	"sync_schedules" boolean DEFAULT true,
	"sync_availability" boolean DEFAULT true,
	"sync_time_off" boolean DEFAULT true,
	"sync_training" boolean DEFAULT false,
	"calendar_id" varchar,
	"color_coding" jsonb,
	"reminder_minutes" integer DEFAULT 30,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carpool_groups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"group_name" varchar NOT NULL,
	"driver_id" varchar,
	"departure_location" varchar NOT NULL,
	"destination_location" varchar NOT NULL,
	"departure_time" time NOT NULL,
	"departure_date" date NOT NULL,
	"seats_available" integer DEFAULT 0,
	"vehicle_description" varchar,
	"status" "carpool_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carpool_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carpool_id" varchar NOT NULL,
	"consultant_id" varchar NOT NULL,
	"role" "carpool_role" DEFAULT 'rider' NOT NULL,
	"pickup_location" varchar,
	"pickup_time" time,
	"status" "carpool_member_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channel_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"last_read_at" timestamp,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_channels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"channel_type" varchar NOT NULL,
	"project_id" varchar,
	"unit_id" varchar,
	"is_private" boolean DEFAULT false NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT true NOT NULL,
	"quiet_hours_start" time DEFAULT '19:00:00',
	"quiet_hours_end" time DEFAULT '07:00:00',
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_message_reads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar DEFAULT 'text' NOT NULL,
	"reply_to_id" varchar,
	"attachment_url" varchar,
	"attachment_type" varchar,
	"is_edited" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_audits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"audit_type" varchar NOT NULL,
	"project_id" varchar,
	"hospital_id" varchar,
	"audit_date" date NOT NULL,
	"findings" jsonb,
	"overall_score" numeric(5, 2),
	"passed_checks" integer DEFAULT 0,
	"failed_checks" integer DEFAULT 0,
	"total_checks" integer DEFAULT 0,
	"auditor_id" varchar,
	"status" varchar DEFAULT 'draft',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"check_type" "compliance_check_type" NOT NULL,
	"status" "compliance_check_status" DEFAULT 'pending' NOT NULL,
	"check_date" date NOT NULL,
	"expiration_date" date,
	"verification_source" varchar,
	"verification_id" varchar,
	"notes" text,
	"document_url" varchar,
	"checked_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_availability" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"awarded_by_id" varchar,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "consultant_certifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"certification_type" varchar NOT NULL,
	"certification_name" varchar NOT NULL,
	"issuing_organization" varchar,
	"issue_date" date,
	"expiry_date" date,
	"credential_id" varchar,
	"document_id" varchar,
	"verification_status" "skill_verification_status" DEFAULT 'pending',
	"verified_by" varchar,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"document_type_id" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"file_url" varchar NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"expiration_date" date,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_ehr_experience" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"ehr_system" varchar NOT NULL,
	"years_experience" integer DEFAULT 0,
	"proficiency" "proficiency_level" DEFAULT 'none' NOT NULL,
	"is_certified" boolean DEFAULT false,
	"certifications" text[] DEFAULT '{}'::text[],
	"last_used" date,
	"project_count" integer DEFAULT 0,
	"verification_status" "skill_verification_status" DEFAULT 'pending',
	"verified_by" varchar,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_questionnaires" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"status" "questionnaire_status" DEFAULT 'draft' NOT NULL,
	"completed_sections" text[] DEFAULT '{}'::text[],
	"last_saved_at" timestamp DEFAULT now(),
	"submitted_at" timestamp,
	"verified_at" timestamp,
	"verified_by" varchar,
	"personal_info" jsonb,
	"work_preferences" jsonb,
	"additional_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "consultant_questionnaires_consultant_id_unique" UNIQUE("consultant_id")
);
--> statement-breakpoint
CREATE TABLE "consultant_ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"rated_by" varchar NOT NULL,
	"mannerism" integer,
	"professionalism" integer,
	"knowledge" integer,
	"overall_rating" integer,
	"comments" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_scorecards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"project_id" varchar,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"overall_score" numeric(5, 2),
	"quality_score" numeric(5, 2),
	"punctuality_score" numeric(5, 2),
	"communication_score" numeric(5, 2),
	"technical_score" numeric(5, 2),
	"teamwork_score" numeric(5, 2),
	"tickets_resolved" integer DEFAULT 0,
	"avg_response_time" integer,
	"trainings_completed" integer DEFAULT 0,
	"attendance_rate" numeric(5, 2),
	"status" "scorecard_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"reviewed_by_id" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_skills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"skill_item_id" varchar NOT NULL,
	"proficiency" "proficiency_level" DEFAULT 'none' NOT NULL,
	"years_experience" integer DEFAULT 0,
	"is_certified" boolean DEFAULT false,
	"certification_name" varchar,
	"certification_expiry" date,
	"notes" text,
	"verification_status" "skill_verification_status" DEFAULT 'pending',
	"verified_by" varchar,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultant_utilization_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_consultants" integer NOT NULL,
	"average_utilization" numeric(5, 2),
	"scheduled_hours" numeric(10, 2),
	"actual_hours" numeric(10, 2),
	"billable_hours" numeric(10, 2),
	"utilization_by_role" jsonb,
	"utilization_trend" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tng_id" varchar,
	"phone" varchar,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"location" varchar,
	"years_experience" integer DEFAULT 0,
	"emr_systems" text[],
	"modules" text[],
	"units" text[],
	"positions" text[],
	"certifications" text[],
	"shift_preference" "shift_type",
	"flight_preference" text,
	"flight_rewards_number" varchar,
	"hotel_preference" text,
	"hotel_rewards_number" varchar,
	"preferred_colleagues" text[],
	"bio" text,
	"linkedin_url" varchar,
	"twitter_url" varchar,
	"website_url" varchar,
	"pay_rate" numeric(10, 2),
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"background_check_complete" boolean DEFAULT false,
	"drug_screen_complete" boolean DEFAULT false,
	"preferred_name" varchar,
	"birthday" date,
	"tshirt_size" "tshirt_size",
	"dietary_restrictions" text,
	"allergies" text,
	"languages" text[],
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar,
	"emergency_contact_relation" varchar,
	"personal_info_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "consultants_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "consultants_tng_id_unique" UNIQUE("tng_id")
);
--> statement-breakpoint
CREATE TABLE "content_access_audit" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"rule_id" varchar,
	"resource_type" "resource_type" NOT NULL,
	"resource_key" varchar NOT NULL,
	"action" varchar NOT NULL,
	"allowed" boolean NOT NULL,
	"user_role" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_access_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"resource_key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"allowed_roles" text[] NOT NULL,
	"denied_roles" text[],
	"restriction_message" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_audit_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"user_id" varchar,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" varchar NOT NULL,
	"signer_id" varchar NOT NULL,
	"signature_image_url" varchar,
	"signature_data" text,
	"ip_address" varchar,
	"user_agent" text,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_signers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" "signer_role" NOT NULL,
	"signing_order" integer DEFAULT 1 NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"signed_at" timestamp,
	"declined_at" timestamp,
	"decline_reason" text,
	"reminder_sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"template_type" varchar NOT NULL,
	"content" text NOT NULL,
	"placeholders" jsonb,
	"required_signers" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_number" varchar,
	"template_id" varchar,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"consultant_id" varchar,
	"project_id" varchar,
	"hospital_id" varchar,
	"status" "contract_status" DEFAULT 'draft' NOT NULL,
	"effective_date" date,
	"expiration_date" date,
	"metadata" jsonb,
	"created_by_id" varchar,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "corrective_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"status" "corrective_action_status" DEFAULT 'pending' NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"assigned_to_id" varchar,
	"due_date" date,
	"completed_at" timestamp,
	"verified_by_id" varchar,
	"verified_at" timestamp,
	"evidence" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cost_variance_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"snapshot_date" date NOT NULL,
	"budgeted_amount" numeric(12, 2) NOT NULL,
	"actual_amount" numeric(12, 2) NOT NULL,
	"variance_amount" numeric(12, 2),
	"variance_percentage" numeric(5, 2),
	"status" "cost_variance_status" DEFAULT 'on_track' NOT NULL,
	"category_breakdown" jsonb,
	"forecast_to_complete" numeric(12, 2),
	"estimate_at_completion" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"status" "enrollment_status" DEFAULT 'enrolled' NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"progress_percent" integer DEFAULT 0,
	"ce_credits_earned" numeric(5, 2),
	"certificate_url" varchar
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"content_type" varchar,
	"content_url" varchar,
	"duration_minutes" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"course_type" "course_type" DEFAULT 'online' NOT NULL,
	"level" "course_level" DEFAULT 'beginner' NOT NULL,
	"status" "course_status" DEFAULT 'draft' NOT NULL,
	"duration_minutes" integer,
	"ce_credits" numeric(5, 2),
	"module_id" varchar,
	"hospital_id" varchar,
	"thumbnail_url" varchar,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dashboard_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"widget_type" varchar NOT NULL,
	"data_source" varchar NOT NULL,
	"config" jsonb NOT NULL,
	"position" jsonb NOT NULL,
	"refresh_interval" integer,
	"drill_down_config" jsonb,
	"thresholds" jsonb,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_retention_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "data_retention_entity" NOT NULL,
	"retention_days" integer NOT NULL,
	"description" text,
	"hipaa_required" boolean DEFAULT false,
	"auto_delete" boolean DEFAULT false,
	"archive_before_delete" boolean DEFAULT true,
	"last_run_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_types" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT true NOT NULL,
	"has_expiration" boolean DEFAULT false NOT NULL,
	"expiration_months" integer,
	"category" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ehr_incident_updates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" varchar NOT NULL,
	"status" varchar NOT NULL,
	"message" text NOT NULL,
	"posted_by_user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ehr_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ehr_system_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"severity" "ehr_incident_severity" NOT NULL,
	"status" varchar DEFAULT 'investigating' NOT NULL,
	"impacted_modules" text[],
	"affected_users" integer,
	"started_at" timestamp NOT NULL,
	"identified_at" timestamp,
	"resolved_at" timestamp,
	"resolution" text,
	"root_cause" text,
	"preventive_measures" text,
	"reported_by_user_id" varchar,
	"assigned_to_user_id" varchar,
	"notifications_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ehr_status_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ehr_system_id" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"status" "ehr_system_status" NOT NULL,
	"response_time" integer,
	"error_rate" numeric(5, 2),
	"active_users" integer,
	"transactions_per_minute" integer,
	"cpu_usage" numeric(5, 2),
	"memory_usage" numeric(5, 2),
	"disk_usage" numeric(5, 2),
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "ehr_systems" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"vendor" varchar NOT NULL,
	"version" varchar,
	"hospital_id" varchar,
	"environment" varchar DEFAULT 'production',
	"status" "ehr_system_status" DEFAULT 'operational' NOT NULL,
	"base_url" varchar,
	"health_check_endpoint" varchar,
	"last_health_check" timestamp,
	"uptime_percent" numeric(5, 2),
	"avg_response_time" integer,
	"is_monitored" boolean DEFAULT true NOT NULL,
	"alert_thresholds" jsonb,
	"notification_channels" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"recipient_email" varchar NOT NULL,
	"template_type" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"metadata" jsonb,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eod_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"report_date" date NOT NULL,
	"submitted_by_id" varchar NOT NULL,
	"status" "eod_report_status" DEFAULT 'draft' NOT NULL,
	"issues_resolved" integer DEFAULT 0,
	"issues_pending" integer DEFAULT 0,
	"issues_escalated" integer DEFAULT 0,
	"resolved_summary" text,
	"pending_summary" text,
	"highlights" text,
	"challenges" text,
	"tomorrow_plan" text,
	"notes" text,
	"approved_by_id" varchar,
	"approved_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escalation_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_id" varchar NOT NULL,
	"ticket_id" varchar,
	"incident_id" varchar,
	"trigger_reason" text NOT NULL,
	"actions_taken" jsonb,
	"notifications_sent" jsonb,
	"previous_priority" varchar,
	"new_priority" varchar,
	"previous_assignee" varchar,
	"new_assignee" varchar,
	"was_successful" boolean DEFAULT true,
	"error_message" text,
	"acknowledged_by_user_id" varchar,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escalation_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"trigger_type" "escalation_trigger_type" DEFAULT 'time_based' NOT NULL,
	"priority" "ticket_priority",
	"time_threshold_minutes" integer,
	"escalate_to_priority" "ticket_priority",
	"notify_roles" text[],
	"notify_user_ids" text[],
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escalation_triggers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"trigger_type" varchar NOT NULL,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"cooldown_minutes" integer DEFAULT 60,
	"max_triggers_per_hour" integer DEFAULT 5,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp,
	"trigger_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "executive_dashboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"user_id" varchar NOT NULL,
	"layout" jsonb,
	"refresh_interval" integer DEFAULT 300,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"theme" varchar DEFAULT 'light',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"project_id" varchar,
	"category" "expense_category" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"expense_date" date NOT NULL,
	"receipt_url" varchar,
	"receipt_file_name" varchar,
	"status" "expense_status" DEFAULT 'draft' NOT NULL,
	"mileage_start" varchar,
	"mileage_end" varchar,
	"mileage_distance" numeric(10, 2),
	"mileage_rate_id" varchar,
	"per_diem_policy_id" varchar,
	"per_diem_days" integer,
	"meals_included" jsonb,
	"submitted_at" timestamp,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"reimbursed_at" timestamp,
	"invoice_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "export_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"export_type" varchar NOT NULL,
	"source_type" varchar NOT NULL,
	"format" varchar NOT NULL,
	"row_count" integer,
	"file_size_bytes" integer,
	"file_url" varchar,
	"filters" jsonb,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_flags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"verification_id" varchar,
	"flag_type" varchar NOT NULL,
	"severity" varchar DEFAULT 'medium' NOT NULL,
	"description" text,
	"evidence" jsonb,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_by_id" varchar,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "go_live_readiness_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"snapshot_date" date NOT NULL,
	"overall_score" numeric(5, 2) NOT NULL,
	"confidence_level" numeric(5, 2),
	"indicators" jsonb,
	"risk_factors" jsonb,
	"recommendations" jsonb,
	"calculated_by_user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "go_live_signins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"consultant_id" varchar NOT NULL,
	"schedule_id" varchar,
	"sign_in_time" timestamp,
	"sign_out_time" timestamp,
	"status" "sign_in_status" DEFAULT 'checked_in' NOT NULL,
	"location" varchar,
	"unit" varchar,
	"badge_number" varchar,
	"notes" text,
	"late_arrival" boolean DEFAULT false,
	"late_minutes" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"consultants_required" integer DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_staff" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"hospital_id" varchar NOT NULL,
	"position" varchar,
	"department" varchar,
	"phone" varchar,
	"is_leadership" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hospital_staff_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "hospital_units" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospital_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"staff_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"phone" varchar,
	"email" varchar,
	"website" varchar,
	"emr_system" varchar,
	"total_staff" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identity_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verification_id" varchar NOT NULL,
	"document_type" "id_document_type" NOT NULL,
	"document_number" varchar,
	"issuing_state" varchar,
	"issuing_country" varchar,
	"issue_date" date,
	"expiration_date" date,
	"front_image_url" varchar,
	"back_image_url" varchar,
	"selfie_image_url" varchar,
	"is_valid" boolean,
	"validation_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identity_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"consultant_id" varchar,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"verification_type" varchar DEFAULT 'manual' NOT NULL,
	"legal_first_name" varchar,
	"legal_last_name" varchar,
	"date_of_birth" date,
	"ssn_last_4" varchar,
	"address_verified" boolean DEFAULT false,
	"identity_score" integer,
	"reviewed_by_id" varchar,
	"review_notes" text,
	"verified_at" timestamp,
	"expires_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"severity" "incident_severity" DEFAULT 'medium' NOT NULL,
	"status" "incident_status" DEFAULT 'reported' NOT NULL,
	"project_id" varchar,
	"hospital_id" varchar,
	"consultant_id" varchar,
	"reported_by_id" varchar NOT NULL,
	"assigned_to_id" varchar,
	"incident_date" timestamp NOT NULL,
	"location" varchar,
	"category" varchar,
	"root_cause" text,
	"resolution" text,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"category" varchar NOT NULL,
	"status" "integration_status" DEFAULT 'pending' NOT NULL,
	"configuration" jsonb,
	"credentials" jsonb,
	"last_sync_at" timestamp,
	"last_sync_status" "sync_status",
	"sync_frequency" varchar DEFAULT 'manual',
	"is_active" boolean DEFAULT true NOT NULL,
	"connected_by_user_id" varchar NOT NULL,
	"connected_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"token" varchar NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"role" "user_role" DEFAULT 'consultant' NOT NULL,
	"invited_by_user_id" varchar NOT NULL,
	"message" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"accepted_by_user_id" varchar,
	"revoked_at" timestamp,
	"revoked_by_user_id" varchar,
	"revoked_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1',
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" varchar,
	"timesheet_entry_id" varchar,
	"expense_id" varchar,
	"consultant_id" varchar,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"header_text" text,
	"footer_text" text,
	"terms_and_conditions" text,
	"logo_url" varchar,
	"company_name" varchar,
	"company_address" text,
	"company_phone" varchar,
	"company_email" varchar,
	"payment_instructions" text,
	"layout_config" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar,
	"project_id" varchar,
	"hospital_id" varchar,
	"template_id" varchar,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"issue_date" date,
	"due_date" date,
	"period_start" date,
	"period_end" date,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"total_amount" numeric(12, 2) DEFAULT '0',
	"paid_amount" numeric(12, 2) DEFAULT '0',
	"notes" text,
	"internal_notes" text,
	"pdf_url" varchar,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "itinerary_bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itinerary_id" varchar NOT NULL,
	"booking_id" varchar NOT NULL,
	"sequence_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"category" varchar,
	"module_id" varchar,
	"tags" text[],
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"author_id" varchar,
	"version" integer DEFAULT 1,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kpi_definitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"calculation" text NOT NULL,
	"unit" varchar,
	"format" varchar DEFAULT 'number',
	"target_value" numeric(15, 2),
	"warning_threshold" numeric(15, 2),
	"critical_threshold" numeric(15, 2),
	"trend_direction" varchar DEFAULT 'higher_is_better',
	"data_source" varchar NOT NULL,
	"refresh_frequency" varchar DEFAULT 'hourly',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kpi_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kpi_id" varchar NOT NULL,
	"value" numeric(15, 4) NOT NULL,
	"previous_value" numeric(15, 4),
	"percent_change" numeric(10, 2),
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "login_lab_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"login_lab_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"access_validated" boolean DEFAULT false,
	"customization_notes" text,
	"attended_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "login_labs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"hospital_id" varchar NOT NULL,
	"module_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"facilitator_id" varchar,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60,
	"max_participants" integer DEFAULT 20,
	"status" "lab_session_status" DEFAULT 'scheduled' NOT NULL,
	"location" varchar,
	"room" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mileage_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"rate_per_mile" numeric(10, 4) NOT NULL,
	"vehicle_type" varchar,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar NOT NULL,
	"recipient_user_id" varchar,
	"recipient_email" varchar,
	"recipient_phone" varchar,
	"subject" varchar,
	"message" text NOT NULL,
	"priority" varchar DEFAULT 'normal',
	"source_type" varchar,
	"source_id" varchar,
	"status" varchar DEFAULT 'pending',
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"failed_at" timestamp,
	"retry_count" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"link" varchar,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nps_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar,
	"hospital_id" varchar,
	"project_id" varchar,
	"score" integer NOT NULL,
	"feedback" text,
	"category" varchar,
	"respondent_type" varchar,
	"respondent_id" varchar,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"task_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"document_type_id" varchar,
	"is_required" boolean DEFAULT true NOT NULL,
	"status" "onboarding_task_status" DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"submitted_at" timestamp,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pay_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"overtime_rate" numeric(10, 2),
	"effective_from" date NOT NULL,
	"effective_to" date,
	"notes" text,
	"approved_by" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "paycheck_stubs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_entry_id" varchar NOT NULL,
	"consultant_id" varchar NOT NULL,
	"pay_date" date NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"regular_hours" numeric(10, 2),
	"overtime_hours" numeric(10, 2),
	"gross_pay" numeric(12, 2),
	"expense_reimbursement" numeric(12, 2),
	"net_pay" numeric(12, 2),
	"pdf_url" varchar,
	"details" jsonb,
	"viewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_number" varchar,
	"name" varchar NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"status" "payroll_batch_status" DEFAULT 'draft' NOT NULL,
	"total_hours" numeric(10, 2) DEFAULT '0',
	"total_regular_hours" numeric(10, 2) DEFAULT '0',
	"total_overtime_hours" numeric(10, 2) DEFAULT '0',
	"total_gross_pay" numeric(12, 2) DEFAULT '0',
	"total_expenses" numeric(12, 2) DEFAULT '0',
	"total_amount" numeric(12, 2) DEFAULT '0',
	"consultant_count" integer DEFAULT 0,
	"processed_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"paid_at" timestamp,
	"exported_at" timestamp,
	"export_format" varchar,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payroll_batches_batch_number_unique" UNIQUE("batch_number")
);
--> statement-breakpoint
CREATE TABLE "payroll_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" varchar NOT NULL,
	"consultant_id" varchar NOT NULL,
	"timesheet_id" varchar,
	"regular_hours" numeric(10, 2) DEFAULT '0',
	"overtime_hours" numeric(10, 2) DEFAULT '0',
	"hourly_rate" numeric(10, 2) NOT NULL,
	"overtime_rate" numeric(10, 2),
	"regular_pay" numeric(12, 2) DEFAULT '0',
	"overtime_pay" numeric(12, 2) DEFAULT '0',
	"gross_pay" numeric(12, 2) DEFAULT '0',
	"expense_reimbursement" numeric(12, 2) DEFAULT '0',
	"total_pay" numeric(12, 2) DEFAULT '0',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_export_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"batch_id" varchar,
	"status" "payroll_sync_status" DEFAULT 'pending' NOT NULL,
	"export_format" varchar NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"record_count" integer DEFAULT 0,
	"total_amount" numeric(12, 2),
	"file_path" varchar,
	"file_name" varchar,
	"file_size" integer,
	"error_message" text,
	"exported_by_user_id" varchar NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_sync_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"connection_id" varchar,
	"export_format" varchar DEFAULT 'csv' NOT NULL,
	"field_mappings" jsonb,
	"include_overtime" boolean DEFAULT true,
	"include_bonuses" boolean DEFAULT true,
	"include_deductions" boolean DEFAULT true,
	"auto_export_schedule" varchar,
	"last_export_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "per_diem_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"daily_rate" numeric(10, 2) NOT NULL,
	"breakfast_rate" numeric(10, 2),
	"lunch_rate" numeric(10, 2),
	"dinner_rate" numeric(10, 2),
	"incidental_rate" numeric(10, 2),
	"location" varchar,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" "permission_domain" NOT NULL,
	"action" varchar NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "phase_deliverables" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_id" varchar NOT NULL,
	"step_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"file_url" varchar,
	"file_name" varchar,
	"is_required" boolean DEFAULT true NOT NULL,
	"is_submitted" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp,
	"submitted_by" varchar,
	"is_approved" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp,
	"approved_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "phase_steps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_id" varchar NOT NULL,
	"step_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"key_activities" text[],
	"completed_activities" integer[],
	"expected_deliverables" text[],
	"timeline_weeks" varchar,
	"status" "phase_step_status" DEFAULT 'not_started' NOT NULL,
	"assigned_to" varchar,
	"planned_start_date" date,
	"planned_end_date" date,
	"actual_start_date" date,
	"actual_end_date" date,
	"completion_percentage" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"type" "point_transaction_type" NOT NULL,
	"points" integer NOT NULL,
	"balance" integer NOT NULL,
	"description" varchar NOT NULL,
	"reference_type" varchar,
	"reference_id" varchar,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"phase_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"completed_date" date,
	"is_completed" boolean DEFAULT false NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	"reminder_days" integer DEFAULT 7,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_phases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"phase_name" varchar NOT NULL,
	"phase_number" integer NOT NULL,
	"description" text,
	"status" "project_phase_status" DEFAULT 'not_started' NOT NULL,
	"planned_start_date" date,
	"planned_end_date" date,
	"actual_start_date" date,
	"actual_end_date" date,
	"completion_percentage" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_requirements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"unit_id" varchar,
	"module_id" varchar,
	"consultants_needed" integer DEFAULT 1 NOT NULL,
	"shift_type" "shift_type",
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_risks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"phase_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"probability" "risk_probability" DEFAULT 'medium' NOT NULL,
	"impact" "risk_impact" DEFAULT 'medium' NOT NULL,
	"risk_score" integer,
	"mitigation" text,
	"contingency" text,
	"status" "risk_status" DEFAULT 'identified' NOT NULL,
	"owner_id" varchar,
	"identified_date" date DEFAULT now(),
	"resolved_date" date,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_schedules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"schedule_date" date NOT NULL,
	"shift_type" "shift_type" NOT NULL,
	"status" "schedule_status" DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"phase_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"assigned_to" varchar,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"completed_at" timestamp,
	"estimated_hours" numeric(6, 2),
	"actual_hours" numeric(6, 2),
	"order_index" integer DEFAULT 0,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_team_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role_template_id" varchar,
	"custom_role_name" varchar,
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospital_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"estimated_consultants" integer DEFAULT 0,
	"actual_consultants" integer DEFAULT 0,
	"estimated_budget" numeric(12, 2),
	"actual_budget" numeric(12, 2),
	"savings" numeric(12, 2),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulse_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" varchar NOT NULL,
	"consultant_id" varchar NOT NULL,
	"responses" jsonb NOT NULL,
	"mood" integer,
	"sentiment" varchar,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulse_surveys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"survey_type" "survey_type" DEFAULT 'pulse' NOT NULL,
	"questions" jsonb NOT NULL,
	"project_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" date,
	"end_date" date,
	"frequency" varchar,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "raci_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"phase_id" varchar,
	"task_id" varchar,
	"user_id" varchar NOT NULL,
	"role" "raci_role" NOT NULL,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referred_name" varchar NOT NULL,
	"referred_email" varchar NOT NULL,
	"referred_phone" varchar,
	"status" "referral_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"hired_as_consultant_id" varchar,
	"bonus_points" integer DEFAULT 0,
	"bonus_paid" boolean DEFAULT false,
	"bonus_paid_at" timestamp,
	"contacted_at" timestamp,
	"hired_at" timestamp,
	"declined_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saved_report_id" varchar,
	"scheduled_report_id" varchar,
	"user_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"export_format" varchar,
	"row_count" integer,
	"file_url" varchar,
	"file_size_bytes" integer,
	"execution_time_ms" integer,
	"error_message" text,
	"parameters" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"data_source" varchar NOT NULL,
	"available_columns" jsonb NOT NULL,
	"default_columns" text[],
	"available_filters" jsonb,
	"default_filters" jsonb,
	"supported_formats" text[] DEFAULT '{"csv","pdf","excel"}' NOT NULL,
	"sort_options" jsonb,
	"group_by_options" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roi_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"category" varchar,
	"question_type" varchar DEFAULT 'rating',
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roi_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" varchar NOT NULL,
	"question_id" varchar NOT NULL,
	"rating" integer,
	"text_response" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roi_surveys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"respondent_id" varchar NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" varchar NOT NULL,
	"permission_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"role_type" "role_type" DEFAULT 'custom' NOT NULL,
	"base_role_id" varchar,
	"hospital_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "saved_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"template_id" varchar,
	"user_id" varchar NOT NULL,
	"selected_columns" text[] NOT NULL,
	"filters" jsonb,
	"sort_by" varchar,
	"sort_order" varchar DEFAULT 'asc',
	"group_by" varchar,
	"chart_type" varchar,
	"chart_config" jsonb,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scenario_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"metric_date" date NOT NULL,
	"metric_type" varchar NOT NULL,
	"metric_name" varchar NOT NULL,
	"planned_value" numeric(12, 2),
	"actual_value" numeric(12, 2),
	"forecast_value" numeric(12, 2),
	"variance" numeric(12, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schedule_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" varchar NOT NULL,
	"consultant_id" varchar NOT NULL,
	"unit_id" varchar,
	"module_id" varchar,
	"start_time" timestamp,
	"end_time" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saved_report_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"schedule" varchar NOT NULL,
	"timezone" varchar DEFAULT 'America/New_York' NOT NULL,
	"export_format" varchar DEFAULT 'pdf' NOT NULL,
	"recipients" text[],
	"include_charts" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduling_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospital_id" varchar,
	"project_id" varchar,
	"emr_weight" numeric(4, 2) DEFAULT '0.25',
	"module_weight" numeric(4, 2) DEFAULT '0.20',
	"proficiency_weight" numeric(4, 2) DEFAULT '0.15',
	"availability_weight" numeric(4, 2) DEFAULT '0.15',
	"performance_weight" numeric(4, 2) DEFAULT '0.10',
	"shift_weight" numeric(4, 2) DEFAULT '0.08',
	"colleague_weight" numeric(4, 2) DEFAULT '0.05',
	"location_weight" numeric(4, 2) DEFAULT '0.02',
	"minimum_rating_threshold" numeric(3, 1) DEFAULT '0',
	"minimum_proficiency_level" varchar DEFAULT 'beginner',
	"prefer_experienced_consultants" boolean DEFAULT true,
	"allow_partial_availability" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduling_recommendations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requirement_id" varchar,
	"schedule_id" varchar,
	"consultant_id" varchar NOT NULL,
	"total_score" numeric(8, 4) NOT NULL,
	"emr_score" numeric(8, 4),
	"module_score" numeric(8, 4),
	"proficiency_score" numeric(8, 4),
	"availability_score" numeric(8, 4),
	"performance_score" numeric(8, 4),
	"shift_score" numeric(8, 4),
	"colleague_score" numeric(8, 4),
	"location_score" numeric(8, 4),
	"hard_constraints_failed" text[],
	"is_eligible" boolean DEFAULT true NOT NULL,
	"rank" integer,
	"calculated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift_chat_summaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"shift_date" date NOT NULL,
	"shift_type" "shift_type" NOT NULL,
	"summary" text NOT NULL,
	"key_points" jsonb,
	"issues_mentioned" jsonb,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shift_handoffs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"outgoing_consultant_id" varchar NOT NULL,
	"incoming_consultant_id" varchar,
	"shift_date" date NOT NULL,
	"outgoing_shift_type" "shift_type" NOT NULL,
	"incoming_shift_type" "shift_type",
	"active_issues" text,
	"pending_tasks" text,
	"escalations" text,
	"general_notes" text,
	"units_covered" text[],
	"status" "handoff_status" DEFAULT 'pending' NOT NULL,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shift_swap_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" varchar NOT NULL,
	"target_consultant_id" varchar,
	"original_assignment_id" varchar NOT NULL,
	"target_assignment_id" varchar,
	"status" "swap_request_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"responded_by" varchar,
	"response_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shuttle_schedules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"shuttle_name" varchar NOT NULL,
	"route" varchar,
	"departure_location" varchar NOT NULL,
	"arrival_location" varchar NOT NULL,
	"departure_time" time NOT NULL,
	"arrival_time" time NOT NULL,
	"days_of_week" text[],
	"start_date" date,
	"end_date" date,
	"capacity" integer,
	"driver_name" varchar,
	"driver_phone" varchar,
	"vehicle_info" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"category" "skill_category" NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "skill_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "skill_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skill_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_skill_id" varchar NOT NULL,
	"verified_by" varchar NOT NULL,
	"previous_status" "skill_verification_status",
	"new_status" "skill_verification_status" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar,
	"project_id" varchar NOT NULL,
	"reported_by_id" varchar,
	"assigned_to_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"category" "ticket_category" DEFAULT 'other' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"unit" varchar,
	"module" varchar,
	"affected_users" integer,
	"resolution" text,
	"response_time_minutes" integer,
	"resolution_time_minutes" integer,
	"escalated_at" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "sync_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sync_job_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"resource_type" varchar NOT NULL,
	"resource_id" varchar,
	"external_id" varchar,
	"details" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sync_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" varchar NOT NULL,
	"direction" "sync_direction" NOT NULL,
	"status" "sync_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"records_processed" integer DEFAULT 0,
	"records_succeeded" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"error_log" jsonb,
	"metadata" jsonb,
	"triggered_by_user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_role_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" "team_role_category" NOT NULL,
	"responsibilities" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" varchar NOT NULL,
	"action" "ticket_action_type" NOT NULL,
	"performed_by_id" varchar NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"comment" text,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_forecast_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"forecast_date" date NOT NULL,
	"original_end_date" date NOT NULL,
	"predicted_end_date" date NOT NULL,
	"confidence_level" numeric(5, 2),
	"variance_days" integer,
	"risk_drivers" jsonb,
	"scenario_analysis" jsonb,
	"assumptions" jsonb,
	"created_by_user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timesheet_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timesheet_id" varchar NOT NULL,
	"entry_date" date NOT NULL,
	"clock_in" timestamp,
	"clock_out" timestamp,
	"break_minutes" integer DEFAULT 0,
	"total_hours" real DEFAULT 0,
	"location" varchar,
	"notes" text,
	"is_manual_entry" boolean DEFAULT false,
	"edited_by" varchar,
	"edit_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"project_id" varchar,
	"schedule_id" varchar,
	"week_start_date" date NOT NULL,
	"week_end_date" date NOT NULL,
	"status" timesheet_status DEFAULT 'draft' NOT NULL,
	"total_hours" real DEFAULT 0 NOT NULL,
	"regular_hours" real DEFAULT 0 NOT NULL,
	"overtime_hours" real DEFAULT 0 NOT NULL,
	"submitted_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejection_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transportation_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"name" varchar NOT NULL,
	"role" "transportation_role" DEFAULT 'driver' NOT NULL,
	"phone" varchar,
	"email" varchar,
	"photo_url" varchar,
	"company" varchar,
	"vehicle_info" varchar,
	"availability" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "travel_bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"project_id" varchar,
	"booking_type" "booking_type" NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"departure_date" date,
	"return_date" date,
	"airline" varchar,
	"flight_number" varchar,
	"departure_airport" varchar,
	"arrival_airport" varchar,
	"departure_time" time,
	"arrival_time" time,
	"hotel_name" varchar,
	"hotel_address" varchar,
	"hotel_confirmation_number" varchar,
	"check_in_date" date,
	"check_out_date" date,
	"rental_company" varchar,
	"pickup_location" varchar,
	"dropoff_location" varchar,
	"vehicle_type" varchar,
	"rental_confirmation_number" varchar,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"confirmation_number" varchar,
	"booking_reference" varchar,
	"notes" text,
	"booked_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "travel_itineraries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"project_id" varchar,
	"trip_name" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "itinerary_status" DEFAULT 'draft' NOT NULL,
	"total_estimated_cost" numeric(12, 2),
	"notes" text,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "travel_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" varchar NOT NULL,
	"preferred_airlines" text[],
	"seat_preference" "seat_preference",
	"rental_car_preference" "rental_car_preference",
	"rental_car_company" varchar,
	"rental_car_rewards_number" varchar,
	"meal_preference" varchar,
	"special_requests" text,
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar,
	"emergency_contact_relation" varchar,
	"travel_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "travel_preferences_consultant_id_unique" UNIQUE("consultant_id")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"resource_type" varchar,
	"resource_id" varchar,
	"resource_name" varchar,
	"description" text,
	"metadata" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_role_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"role_id" varchar NOT NULL,
	"project_id" varchar,
	"hospital_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_by" varchar,
	"assigned_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"cover_photo_url" varchar,
	"linkedin_url" varchar,
	"website_url" varchar,
	"role" "user_role" DEFAULT 'consultant' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"access_status" "access_status" DEFAULT 'pending_invitation' NOT NULL,
	"invitation_id" varchar,
	"profile_visibility" "profile_visibility" DEFAULT 'public' NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"show_email" boolean DEFAULT false NOT NULL,
	"show_phone" boolean DEFAULT false NOT NULL,
	"deletion_requested_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verification_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"performed_by_id" varchar,
	"details" jsonb,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" varchar NOT NULL,
	"trigger_data" jsonb,
	"status" varchar DEFAULT 'pending',
	"started_at" timestamp,
	"completed_at" timestamp,
	"actions_executed" jsonb,
	"results" jsonb,
	"error_message" text,
	"triggered_by_user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_module_id_course_modules_id_fk" FOREIGN KEY ("course_module_id") REFERENCES "public"."course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_assignment_logs" ADD CONSTRAINT "auto_assignment_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_assignment_logs" ADD CONSTRAINT "auto_assignment_logs_schedule_id_project_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."project_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_assignment_logs" ADD CONSTRAINT "auto_assignment_logs_run_by_users_id_fk" FOREIGN KEY ("run_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_calculations" ADD CONSTRAINT "budget_calculations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_scenarios" ADD CONSTRAINT "budget_scenarios_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_scenarios" ADD CONSTRAINT "budget_scenarios_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_sync_settings" ADD CONSTRAINT "calendar_sync_settings_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carpool_groups" ADD CONSTRAINT "carpool_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carpool_groups" ADD CONSTRAINT "carpool_groups_driver_id_consultants_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carpool_members" ADD CONSTRAINT "carpool_members_carpool_id_carpool_groups_id_fk" FOREIGN KEY ("carpool_id") REFERENCES "public"."carpool_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carpool_members" ADD CONSTRAINT "carpool_members_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_unit_id_hospital_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."hospital_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_auditor_id_users_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_checked_by_id_users_id_fk" FOREIGN KEY ("checked_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_availability" ADD CONSTRAINT "consultant_availability_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_badges" ADD CONSTRAINT "consultant_badges_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_badges" ADD CONSTRAINT "consultant_badges_badge_id_achievement_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."achievement_badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_badges" ADD CONSTRAINT "consultant_badges_awarded_by_id_users_id_fk" FOREIGN KEY ("awarded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_certifications" ADD CONSTRAINT "consultant_certifications_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_certifications" ADD CONSTRAINT "consultant_certifications_document_id_consultant_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."consultant_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_certifications" ADD CONSTRAINT "consultant_certifications_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_documents" ADD CONSTRAINT "consultant_documents_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_documents" ADD CONSTRAINT "consultant_documents_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_documents" ADD CONSTRAINT "consultant_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_ehr_experience" ADD CONSTRAINT "consultant_ehr_experience_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_ehr_experience" ADD CONSTRAINT "consultant_ehr_experience_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_questionnaires" ADD CONSTRAINT "consultant_questionnaires_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_questionnaires" ADD CONSTRAINT "consultant_questionnaires_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_ratings" ADD CONSTRAINT "consultant_ratings_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_ratings" ADD CONSTRAINT "consultant_ratings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_ratings" ADD CONSTRAINT "consultant_ratings_rated_by_users_id_fk" FOREIGN KEY ("rated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_scorecards" ADD CONSTRAINT "consultant_scorecards_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_scorecards" ADD CONSTRAINT "consultant_scorecards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_scorecards" ADD CONSTRAINT "consultant_scorecards_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_skills" ADD CONSTRAINT "consultant_skills_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_skills" ADD CONSTRAINT "consultant_skills_skill_item_id_skill_items_id_fk" FOREIGN KEY ("skill_item_id") REFERENCES "public"."skill_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_skills" ADD CONSTRAINT "consultant_skills_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_utilization_snapshots" ADD CONSTRAINT "consultant_utilization_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_access_audit" ADD CONSTRAINT "content_access_audit_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_access_audit" ADD CONSTRAINT "content_access_audit_rule_id_content_access_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."content_access_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_access_rules" ADD CONSTRAINT "content_access_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_audit_events" ADD CONSTRAINT "contract_audit_events_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_audit_events" ADD CONSTRAINT "contract_audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_signer_id_contract_signers_id_fk" FOREIGN KEY ("signer_id") REFERENCES "public"."contract_signers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signers" ADD CONSTRAINT "contract_signers_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signers" ADD CONSTRAINT "contract_signers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_template_id_contract_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."contract_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_variance_snapshots" ADD CONSTRAINT "cost_variance_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_module_id_hospital_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."hospital_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_dashboard_id_executive_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."executive_dashboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_retention_policies" ADD CONSTRAINT "data_retention_policies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ehr_incident_updates" ADD CONSTRAINT "ehr_incident_updates_incident_id_ehr_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."ehr_incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ehr_incidents" ADD CONSTRAINT "ehr_incidents_ehr_system_id_ehr_systems_id_fk" FOREIGN KEY ("ehr_system_id") REFERENCES "public"."ehr_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ehr_status_metrics" ADD CONSTRAINT "ehr_status_metrics_ehr_system_id_ehr_systems_id_fk" FOREIGN KEY ("ehr_system_id") REFERENCES "public"."ehr_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ehr_systems" ADD CONSTRAINT "ehr_systems_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eod_reports" ADD CONSTRAINT "eod_reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eod_reports" ADD CONSTRAINT "eod_reports_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eod_reports" ADD CONSTRAINT "eod_reports_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_trigger_id_escalation_triggers_id_fk" FOREIGN KEY ("trigger_id") REFERENCES "public"."escalation_triggers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_rules" ADD CONSTRAINT "escalation_rules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_rules" ADD CONSTRAINT "escalation_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_triggers" ADD CONSTRAINT "escalation_triggers_rule_id_escalation_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."escalation_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_dashboards" ADD CONSTRAINT "executive_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_mileage_rate_id_mileage_rates_id_fk" FOREIGN KEY ("mileage_rate_id") REFERENCES "public"."mileage_rates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_per_diem_policy_id_per_diem_policies_id_fk" FOREIGN KEY ("per_diem_policy_id") REFERENCES "public"."per_diem_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_logs" ADD CONSTRAINT "export_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_verification_id_identity_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."identity_verifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "go_live_readiness_snapshots" ADD CONSTRAINT "go_live_readiness_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "go_live_readiness_snapshots" ADD CONSTRAINT "go_live_readiness_snapshots_calculated_by_user_id_users_id_fk" FOREIGN KEY ("calculated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "go_live_signins" ADD CONSTRAINT "go_live_signins_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "go_live_signins" ADD CONSTRAINT "go_live_signins_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "go_live_signins" ADD CONSTRAINT "go_live_signins_schedule_id_project_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."project_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_modules" ADD CONSTRAINT "hospital_modules_unit_id_hospital_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."hospital_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_staff" ADD CONSTRAINT "hospital_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_staff" ADD CONSTRAINT "hospital_staff_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_units" ADD CONSTRAINT "hospital_units_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_documents" ADD CONSTRAINT "identity_documents_verification_id_identity_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."identity_verifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_id_users_id_fk" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_template_id_invoice_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."invoice_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_bookings" ADD CONSTRAINT "itinerary_bookings_itinerary_id_travel_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."travel_itineraries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_bookings" ADD CONSTRAINT "itinerary_bookings_booking_id_travel_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."travel_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_module_id_hospital_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."hospital_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_snapshots" ADD CONSTRAINT "kpi_snapshots_kpi_id_kpi_definitions_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpi_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_lab_participants" ADD CONSTRAINT "login_lab_participants_login_lab_id_login_labs_id_fk" FOREIGN KEY ("login_lab_id") REFERENCES "public"."login_labs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_lab_participants" ADD CONSTRAINT "login_lab_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_labs" ADD CONSTRAINT "login_labs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_labs" ADD CONSTRAINT "login_labs_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_labs" ADD CONSTRAINT "login_labs_module_id_hospital_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."hospital_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_labs" ADD CONSTRAINT "login_labs_facilitator_id_users_id_fk" FOREIGN KEY ("facilitator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nps_responses" ADD CONSTRAINT "nps_responses_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nps_responses" ADD CONSTRAINT "nps_responses_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nps_responses" ADD CONSTRAINT "nps_responses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_rates" ADD CONSTRAINT "pay_rates_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_rates" ADD CONSTRAINT "pay_rates_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paycheck_stubs" ADD CONSTRAINT "paycheck_stubs_payroll_entry_id_payroll_entries_id_fk" FOREIGN KEY ("payroll_entry_id") REFERENCES "public"."payroll_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paycheck_stubs" ADD CONSTRAINT "paycheck_stubs_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_batches" ADD CONSTRAINT "payroll_batches_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_batches" ADD CONSTRAINT "payroll_batches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_batch_id_payroll_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."payroll_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_export_jobs" ADD CONSTRAINT "payroll_export_jobs_profile_id_payroll_sync_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."payroll_sync_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_export_jobs" ADD CONSTRAINT "payroll_export_jobs_batch_id_payroll_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."payroll_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_sync_profiles" ADD CONSTRAINT "payroll_sync_profiles_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_deliverables" ADD CONSTRAINT "phase_deliverables_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_deliverables" ADD CONSTRAINT "phase_deliverables_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_deliverables" ADD CONSTRAINT "phase_deliverables_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_steps" ADD CONSTRAINT "phase_steps_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_steps" ADD CONSTRAINT "phase_steps_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_requirements" ADD CONSTRAINT "project_requirements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_requirements" ADD CONSTRAINT "project_requirements_unit_id_hospital_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."hospital_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_requirements" ADD CONSTRAINT "project_requirements_module_id_hospital_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."hospital_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_schedules" ADD CONSTRAINT "project_schedules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_schedules" ADD CONSTRAINT "project_schedules_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_assignments" ADD CONSTRAINT "project_team_assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_assignments" ADD CONSTRAINT "project_team_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_assignments" ADD CONSTRAINT "project_team_assignments_role_template_id_team_role_templates_id_fk" FOREIGN KEY ("role_template_id") REFERENCES "public"."team_role_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_responses" ADD CONSTRAINT "pulse_responses_survey_id_pulse_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."pulse_surveys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_responses" ADD CONSTRAINT "pulse_responses_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_surveys" ADD CONSTRAINT "pulse_surveys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_surveys" ADD CONSTRAINT "pulse_surveys_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raci_assignments" ADD CONSTRAINT "raci_assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raci_assignments" ADD CONSTRAINT "raci_assignments_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raci_assignments" ADD CONSTRAINT "raci_assignments_task_id_project_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raci_assignments" ADD CONSTRAINT "raci_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raci_assignments" ADD CONSTRAINT "raci_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_consultants_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_hired_as_consultant_id_consultants_id_fk" FOREIGN KEY ("hired_as_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_saved_report_id_saved_reports_id_fk" FOREIGN KEY ("saved_report_id") REFERENCES "public"."saved_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_scheduled_report_id_scheduled_reports_id_fk" FOREIGN KEY ("scheduled_report_id") REFERENCES "public"."scheduled_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roi_responses" ADD CONSTRAINT "roi_responses_survey_id_roi_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."roi_surveys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roi_responses" ADD CONSTRAINT "roi_responses_question_id_roi_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."roi_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roi_surveys" ADD CONSTRAINT "roi_surveys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roi_surveys" ADD CONSTRAINT "roi_surveys_respondent_id_users_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_base_role_id_roles_id_fk" FOREIGN KEY ("base_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_template_id_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenario_metrics" ADD CONSTRAINT "scenario_metrics_scenario_id_budget_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."budget_scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_schedule_id_project_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."project_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_unit_id_hospital_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."hospital_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_module_id_hospital_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."hospital_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_saved_report_id_saved_reports_id_fk" FOREIGN KEY ("saved_report_id") REFERENCES "public"."saved_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_configs" ADD CONSTRAINT "scheduling_configs_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_configs" ADD CONSTRAINT "scheduling_configs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_recommendations" ADD CONSTRAINT "scheduling_recommendations_requirement_id_project_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."project_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_recommendations" ADD CONSTRAINT "scheduling_recommendations_schedule_id_project_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."project_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_recommendations" ADD CONSTRAINT "scheduling_recommendations_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_chat_summaries" ADD CONSTRAINT "shift_chat_summaries_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_chat_summaries" ADD CONSTRAINT "shift_chat_summaries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_handoffs" ADD CONSTRAINT "shift_handoffs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_handoffs" ADD CONSTRAINT "shift_handoffs_outgoing_consultant_id_consultants_id_fk" FOREIGN KEY ("outgoing_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_handoffs" ADD CONSTRAINT "shift_handoffs_incoming_consultant_id_consultants_id_fk" FOREIGN KEY ("incoming_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_requester_id_consultants_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_target_consultant_id_consultants_id_fk" FOREIGN KEY ("target_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_original_assignment_id_schedule_assignments_id_fk" FOREIGN KEY ("original_assignment_id") REFERENCES "public"."schedule_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_target_assignment_id_schedule_assignments_id_fk" FOREIGN KEY ("target_assignment_id") REFERENCES "public"."schedule_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shuttle_schedules" ADD CONSTRAINT "shuttle_schedules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_items" ADD CONSTRAINT "skill_items_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_verifications" ADD CONSTRAINT "skill_verifications_consultant_skill_id_consultant_skills_id_fk" FOREIGN KEY ("consultant_skill_id") REFERENCES "public"."consultant_skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_verifications" ADD CONSTRAINT "skill_verifications_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_reported_by_id_users_id_fk" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_id_consultants_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_sync_job_id_sync_jobs_id_fk" FOREIGN KEY ("sync_job_id") REFERENCES "public"."sync_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_forecast_snapshots" ADD CONSTRAINT "timeline_forecast_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_forecast_snapshots" ADD CONSTRAINT "timeline_forecast_snapshots_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_schedule_id_project_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."project_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transportation_contacts" ADD CONSTRAINT "transportation_contacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_bookings" ADD CONSTRAINT "travel_bookings_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_bookings" ADD CONSTRAINT "travel_bookings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_bookings" ADD CONSTRAINT "travel_bookings_booked_by_id_users_id_fk" FOREIGN KEY ("booked_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_itineraries" ADD CONSTRAINT "travel_itineraries_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_itineraries" ADD CONSTRAINT "travel_itineraries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_itineraries" ADD CONSTRAINT "travel_itineraries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_preferences" ADD CONSTRAINT "travel_preferences_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_verification_id_identity_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."identity_verifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."automation_workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_attempts_assessment" ON "assessment_attempts" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_user" ON "assessment_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_questions_assessment" ON "assessment_questions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_assessments_course" ON "assessments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_assessments_module" ON "assessments" USING btree ("course_module_id");--> statement-breakpoint
CREATE INDEX "idx_assignment_logs_project" ON "auto_assignment_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_assignment_logs_schedule" ON "auto_assignment_logs" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "idx_assignment_logs_status" ON "auto_assignment_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_assignment_logs_date" ON "auto_assignment_logs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_automation_workflows_category" ON "automation_workflows" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_automation_workflows_trigger" ON "automation_workflows" USING btree ("trigger_event");--> statement-breakpoint
CREATE INDEX "idx_availability_consultant" ON "availability_blocks" USING btree ("consultant_id");--> statement-breakpoint
CREATE INDEX "idx_availability_dates" ON "availability_blocks" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_availability_type" ON "availability_blocks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_calendar_sync_user" ON "calendar_sync_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_sync_connection" ON "calendar_sync_settings" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_consultant_utilization_project" ON "consultant_utilization_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_consultant_utilization_period" ON "consultant_utilization_snapshots" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "idx_content_access_resource" ON "content_access_rules" USING btree ("resource_type","resource_key");--> statement-breakpoint
CREATE INDEX "idx_cost_variance_project" ON "cost_variance_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_cost_variance_date" ON "cost_variance_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "idx_cost_variance_status" ON "cost_variance_snapshots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_course" ON "course_enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_user" ON "course_enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_status" ON "course_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_course_modules_course" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_courses_status" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_courses_module" ON "courses" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_courses_hospital" ON "courses" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_ehr_incident_updates_incident" ON "ehr_incident_updates" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_ehr_incidents_system" ON "ehr_incidents" USING btree ("ehr_system_id");--> statement-breakpoint
CREATE INDEX "idx_ehr_incidents_severity" ON "ehr_incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_ehr_incidents_status" ON "ehr_incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ehr_metrics_system" ON "ehr_status_metrics" USING btree ("ehr_system_id");--> statement-breakpoint
CREATE INDEX "idx_ehr_metrics_timestamp" ON "ehr_status_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_ehr_systems_hospital" ON "ehr_systems" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_ehr_systems_vendor" ON "ehr_systems" USING btree ("vendor");--> statement-breakpoint
CREATE INDEX "idx_ehr_systems_status" ON "ehr_systems" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_eod_reports_project" ON "eod_reports" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_eod_reports_date" ON "eod_reports" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "idx_eod_reports_submitted_by" ON "eod_reports" USING btree ("submitted_by_id");--> statement-breakpoint
CREATE INDEX "idx_escalation_events_trigger" ON "escalation_events" USING btree ("trigger_id");--> statement-breakpoint
CREATE INDEX "idx_escalation_events_ticket" ON "escalation_events" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_escalation_events_incident" ON "escalation_events" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_escalation_rules_project" ON "escalation_rules" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_escalation_rules_active" ON "escalation_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_escalation_triggers_rule" ON "escalation_triggers" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "idx_escalation_triggers_type" ON "escalation_triggers" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "idx_go_live_readiness_project" ON "go_live_readiness_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_go_live_readiness_date" ON "go_live_readiness_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "idx_integration_connections_provider" ON "integration_connections" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_integration_connections_category" ON "integration_connections" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_integration_connections_status" ON "integration_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invitations_email" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_invitations_token" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_invitations_status" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_articles_status" ON "knowledge_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_articles_module" ON "knowledge_articles" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_articles_category" ON "knowledge_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_articles_author" ON "knowledge_articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_lab_participants_lab" ON "login_lab_participants" USING btree ("login_lab_id");--> statement-breakpoint
CREATE INDEX "idx_lab_participants_user" ON "login_lab_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_login_labs_project" ON "login_labs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_login_labs_hospital" ON "login_labs" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_login_labs_status" ON "login_labs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_login_labs_scheduled" ON "login_labs" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_notification_queue_status" ON "notification_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notification_queue_recipient" ON "notification_queue" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_queue_scheduled" ON "notification_queue" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payroll_export_jobs_profile" ON "payroll_export_jobs" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_export_jobs_batch" ON "payroll_export_jobs" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_export_jobs_status" ON "payroll_export_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payroll_sync_profiles_connection" ON "payroll_sync_profiles" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_permissions_domain" ON "permissions" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_permissions_name" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_raci_project" ON "raci_assignments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_raci_phase" ON "raci_assignments" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "idx_raci_task" ON "raci_assignments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_raci_user" ON "raci_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_role" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_permission" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "idx_roles_type" ON "roles" USING btree ("role_type");--> statement-breakpoint
CREATE INDEX "idx_roles_hospital" ON "roles" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_scheduling_config_hospital" ON "scheduling_configs" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_scheduling_config_project" ON "scheduling_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_requirement" ON "scheduling_recommendations" USING btree ("requirement_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_schedule" ON "scheduling_recommendations" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_consultant" ON "scheduling_recommendations" USING btree ("consultant_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_score" ON "scheduling_recommendations" USING btree ("total_score");--> statement-breakpoint
CREATE INDEX "idx_recommendations_eligible" ON "scheduling_recommendations" USING btree ("is_eligible");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_swap_requester" ON "shift_swap_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "idx_swap_target" ON "shift_swap_requests" USING btree ("target_consultant_id");--> statement-breakpoint
CREATE INDEX "idx_swap_status" ON "shift_swap_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sync_events_job" ON "sync_events" USING btree ("sync_job_id");--> statement-breakpoint
CREATE INDEX "idx_sync_events_type" ON "sync_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_sync_jobs_connection" ON "sync_jobs" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_sync_jobs_status" ON "sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ticket_comments_ticket" ON "ticket_comments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_comments_author" ON "ticket_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_history_ticket" ON "ticket_history" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_history_performed_by" ON "ticket_history" USING btree ("performed_by_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_history_created_at" ON "ticket_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_timeline_forecast_project" ON "timeline_forecast_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_timeline_forecast_date" ON "timeline_forecast_snapshots" USING btree ("forecast_date");--> statement-breakpoint
CREATE INDEX "idx_timesheet_entries_timesheet" ON "timesheet_entries" USING btree ("timesheet_id");--> statement-breakpoint
CREATE INDEX "idx_timesheet_entries_date" ON "timesheet_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "idx_timesheets_consultant" ON "timesheets" USING btree ("consultant_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_project" ON "timesheets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_week" ON "timesheets" USING btree ("week_start_date");--> statement-breakpoint
CREATE INDEX "idx_timesheets_status" ON "timesheets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_activities_user" ON "user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_activities_type" ON "user_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_user_activities_created" ON "user_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_roles_user" ON "user_role_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_role" ON "user_role_assignments" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_project" ON "user_role_assignments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_hospital" ON "user_role_assignments" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_executions_workflow" ON "workflow_executions" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_executions_status" ON "workflow_executions" USING btree ("status");