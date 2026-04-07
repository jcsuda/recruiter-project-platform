"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/Toast";
import type { EmailTemplate } from "@/lib/communication-types";

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  onSuccess: () => void;
}

export default function EmailComposer({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  candidateEmail,
  onSuccess,
}: EmailComposerProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    schedule: false,
    scheduled_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingTemplates } = await supabase
        .from("email_templates")
        .select("*")
        .eq("user_id", user.id);

      // Seed default templates idempotently using ON CONFLICT so re-opening the
      // modal never creates duplicates even if a prior query returned empty due
      // to a transient error. Requires UNIQUE(user_id, template_type, is_default).
      const defaultTemplates = [
        {
          user_id: user.id,
          name: "Initial Contact",
          subject: "Exciting Opportunity at [Company Name]",
          body: `Hi [Candidate Name],

I hope this message finds you well. I came across your profile and was impressed by your background in [Skill/Experience].

We have an exciting opportunity for a [Position Title] role at [Company Name] that I believe would be a great fit for your skills and career goals.

Key highlights of the role:
- [Key Point 1]
- [Key Point 2]
- [Key Point 3]

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss the role and answer any questions you might have.

Best regards,
[Your Name]`,
          template_type: "initial_contact",
          is_default: true,
        },
        {
          user_id: user.id,
          name: "Interview Invite",
          subject: "Interview Invitation - [Position Title]",
          body: `Hi [Candidate Name],

Thank you for your interest in the [Position Title] position. We'd like to invite you for an interview.

Interview Details:
- Date: [Date]
- Time: [Time]
- Type: [Phone/Video/In-Person]
- Duration: [Duration]
- Location/Link: [Location or Meeting Link]

Please confirm your availability for this time slot. If you need to reschedule, please let me know as soon as possible.

Looking forward to speaking with you!

Best regards,
[Your Name]`,
          template_type: "interview_invite",
          is_default: true,
        },
        {
          user_id: user.id,
          name: "Follow Up",
          subject: "Following up on [Position Title] opportunity",
          body: `Hi [Candidate Name],

I wanted to follow up on our conversation about the [Position Title] opportunity.

I'm still very interested in moving forward with your application and would love to schedule the next step in our process.

Please let me know your availability for the coming week, and I'll send over some times that work for our team.

Best regards,
[Your Name]`,
          template_type: "follow_up",
          is_default: true,
        },
      ];

      await supabase
        .from("email_templates")
        .upsert(defaultTemplates, {
          onConflict: "user_id,template_type,is_default",
          ignoreDuplicates: true,
        });

      const { data } = await supabase
        .from("email_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      setTemplates(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load email templates.";
      toast(message, "error");
    }
  }, [supabase, toast]);

  useEffect(() => {
    if (isOpen) {
      void loadTemplates();
      setFormData({
        subject: "",
        content: "",
        schedule: false,
        scheduled_at: "",
      });
      setError("");
      setSuccess("");
    }
  }, [isOpen, loadTemplates]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        subject: template.subject,
        content: template.body,
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: insertError } = await supabase
        .from("communications")
        .insert({
          user_id: user.id,
          candidate_id: candidateId,
          type: "email",
          subject: formData.subject,
          content: formData.content,
          direction: "outbound",
          status: formData.schedule ? "scheduled" : "sent",
          scheduled_at: formData.schedule ? formData.scheduled_at : null,
          sent_at: formData.schedule ? null : new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setSuccess(
        formData.schedule
          ? "Communication scheduled and logged."
          : "Communication logged successfully. Note: actual email delivery requires an email service integration."
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send email. Please try again.";
      toast(message, "error");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="card relative w-[90%] max-w-[700px] max-h-[90vh] overflow-y-auto p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-composer-title"
      >
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <h2
            id="email-composer-title"
            className="m-0 text-xl font-semibold text-gray-900"
          >
            Log Communication — {candidateName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-2xl leading-none text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div
            className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-3 text-sm text-green-800"
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {templates.length > 0 && (
            <div className="card mb-4 bg-gray-50 p-4">
              <div className="mb-2 text-sm font-semibold text-gray-900">
                Use Email Template
              </div>
              <select
                className="select-field"
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                aria-label="Email template"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <div className="card mt-2 max-h-[150px] overflow-y-auto p-3 text-sm text-gray-700">
                  <strong>Preview:</strong>
                  <br />
                  {templates
                    .find((t) => t.id === selectedTemplate)
                    ?.body.substring(0, 200)}
                  ...
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email-composer-to"
              className="text-sm font-medium text-gray-700"
            >
              To
            </label>
            <input
              id="email-composer-to"
              type="email"
              className="input-field opacity-70"
              value={candidateEmail}
              disabled
              readOnly
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email-composer-subject"
              className="text-sm font-medium text-gray-700"
            >
              Subject *
            </label>
            <input
              id="email-composer-subject"
              type="text"
              className="input-field"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email-composer-message"
              className="text-sm font-medium text-gray-700"
            >
              Message *
            </label>
            <textarea
              id="email-composer-message"
              className="input-field min-h-[120px] resize-y font-[inherit]"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your message here..."
              required
            />
          </div>

          <div className="card mt-4 border-amber-500 bg-amber-50 p-4">
            <label className="flex cursor-pointer items-center text-sm text-gray-800">
              <input
                type="checkbox"
                className="mr-2 rounded border-gray-300"
                checked={formData.schedule}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schedule: e.target.checked,
                  }))
                }
              />
              Schedule this email for later
            </label>
            {formData.schedule && (
              <div className="mt-2">
                <input
                  type="datetime-local"
                  className="input-field"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduled_at: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            {formData.schedule ? (
              <button
                type="submit"
                disabled={loading}
                className="btn-success"
              >
                {loading ? "Scheduling..." : "Schedule Email"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Sending..." : "Send Email"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
