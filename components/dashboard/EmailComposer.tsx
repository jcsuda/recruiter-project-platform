'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/lib/communication-types';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  onSuccess: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1002,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
    borderRadius: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    minHeight: '120px',
    fontFamily: 'inherit',
  },
  templateSection: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  templateHeader: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  templateSelect: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  templatePreview: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '0.75rem',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    maxHeight: '150px',
    overflowY: 'auto' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
  },
  cancelButton: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  sendButton: {
    background: '#2563eb',
    color: '#fff',
  },
  scheduleButton: {
    background: '#10b981',
    color: '#fff',
  },
  error: {
    padding: '0.75rem',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#991b1b',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  success: {
    padding: '0.75rem',
    background: '#dcfce7',
    border: '1px solid #86efac',
    borderRadius: '6px',
    color: '#166534',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  scheduleSection: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    padding: '1rem',
    marginTop: '1rem',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
};

export default function EmailComposer({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  candidateEmail,
  onSuccess,
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    schedule: false,
    scheduled_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setFormData({
        subject: '',
        content: '',
        schedule: false,
        scheduled_at: '',
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has any templates
      const { data: existingTemplates } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id);

      // If no templates exist, create default ones
      if (!existingTemplates || existingTemplates.length === 0) {
        const defaultTemplates = [
          {
            user_id: user.id,
            name: 'Initial Contact',
            subject: 'Exciting Opportunity at [Company Name]',
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
            template_type: 'initial_contact',
            is_default: true
          },
          {
            user_id: user.id,
            name: 'Interview Invite',
            subject: 'Interview Invitation - [Position Title]',
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
            template_type: 'interview_invite',
            is_default: true
          },
          {
            user_id: user.id,
            name: 'Follow Up',
            subject: 'Following up on [Position Title] opportunity',
            body: `Hi [Candidate Name],

I wanted to follow up on our conversation about the [Position Title] opportunity.

I'm still very interested in moving forward with your application and would love to schedule the next step in our process.

Please let me know your availability for the coming week, and I'll send over some times that work for our team.

Best regards,
[Your Name]`,
            template_type: 'follow_up',
            is_default: true
          }
        ];

        await supabase
          .from('email_templates')
          .insert(defaultTemplates);
      }

      // Load templates
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        content: template.body,
      });
    }
    setSelectedTemplate(templateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase
        .from('communications')
        .insert({
          user_id: user.id,
          candidate_id: candidateId,
          type: 'email',
          subject: formData.subject,
          content: formData.content,
          direction: 'outbound',
          status: formData.schedule ? 'scheduled' : 'sent',
          scheduled_at: formData.schedule ? formData.scheduled_at : null,
          sent_at: formData.schedule ? null : new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setSuccess(formData.schedule ? 'Email scheduled successfully!' : 'Email sent successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Send Email to {candidateName}</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
          >
            ×
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Templates */}
          {templates.length > 0 && (
            <div style={styles.templateSection}>
              <div style={styles.templateHeader}>Use Email Template</div>
              <select
                style={styles.templateSelect}
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <div style={styles.templatePreview}>
                  <strong>Preview:</strong><br />
                  {templates.find(t => t.id === selectedTemplate)?.body.substring(0, 200)}...
                </div>
              )}
            </div>
          )}

          {/* Email Form */}
          <div style={styles.formGroup}>
            <label style={styles.label}>To</label>
            <input
              type="email"
              style={styles.input}
              value={candidateEmail}
              disabled
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Subject *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Message *</label>
            <textarea
              style={styles.textarea}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your message here..."
              required
            />
          </div>

          {/* Schedule Email */}
          <div style={styles.scheduleSection}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.checked })}
              />
              Schedule this email for later
            </label>
            {formData.schedule && (
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="datetime-local"
                  style={styles.input}
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  required
                />
              </div>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.cancelButton }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              Cancel
            </button>
            {formData.schedule ? (
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, ...styles.scheduleButton }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#059669')}
                onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#10b981')}
              >
                {loading ? 'Scheduling...' : 'Schedule Email'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, ...styles.sendButton }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
