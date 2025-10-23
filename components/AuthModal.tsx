'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2.5rem',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  button: {
    padding: '0.875rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
  },
  submitButton: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  cancelButton: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  successMessage: {
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  successTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#065f46',
    margin: '0 0 0.5rem 0',
  },
  successText: {
    fontSize: '0.875rem',
    color: '#047857',
    margin: 0,
    lineHeight: '1.5',
  },
  errorMessage: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '0.875rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#991b1b',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    gap: '1rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb',
  },
  dividerText: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    lineHeight: '1.4',
  },
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: name || undefined,
          },
        },
      });

      if (error) throw error;

      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    setEmail('');
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome!</h2>
          <p style={styles.subtitle}>
            {success
              ? 'Check your email for the magic link'
              : 'Sign in or create a new account to get started'}
          </p>
        </div>

        {success ? (
          <>
            <div style={styles.successMessage}>
              <h3 style={styles.successTitle}>✓ Email Sent!</h3>
              <p style={styles.successText}>
                We've sent a magic link to <strong>{email || 'your email'}</strong>.
                <br />
                Click the link in the email to sign in or complete your registration.
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{ ...styles.button, ...styles.submitButton }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
            >
              Got it!
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.errorMessage}>{error}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="name">
                Full Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="John Doe"
                disabled={loading}
                onFocus={(e) => Object.assign(e.currentTarget.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <p style={styles.helpText}>
                This helps us personalize your experience
              </p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="you@example.com"
                disabled={loading}
                onFocus={(e) => Object.assign(e.currentTarget.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <p style={styles.helpText}>
                We'll send you a magic link - no password needed!
              </p>
            </div>

            <button
              type="submit"
              style={{ ...styles.button, ...styles.submitButton }}
              disabled={loading}
              onMouseOver={(e) =>
                !loading && (e.currentTarget.style.background = '#1d4ed8')
              }
              onMouseOut={(e) =>
                !loading && (e.currentTarget.style.background = '#2563eb')
              }
            >
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>

            <button
              type="button"
              onClick={handleClose}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={loading}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

