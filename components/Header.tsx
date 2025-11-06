'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';

const styles = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.5rem 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userEmail: {
    fontSize: '0.875rem',
    color: '#374151',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  signInButton: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  signOutButton: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  navLink: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
  },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    setIsAuthModalOpen(true);
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.message || 'Failed to sign out');
    }
  };

  // Dynamic header title based on pathname
  const isLandingPage = pathname === '/';
  const headerStyle = isLandingPage 
    ? { ...styles.header, background: 'transparent', borderBottom: 'none' }
    : styles.header;
  
  const titleColor = isLandingPage ? '#fff' : '#111827';
  const subtitleColor = isLandingPage ? 'rgba(255, 255, 255, 0.9)' : '#6b7280';

  return (
    <>
      <header style={headerStyle}>
        <div style={styles.container}>
          <div style={styles.titleSection}>
            <h1 style={{ ...styles.title, color: titleColor }}>
              {isLandingPage ? 'HIRELab' : 'HIRELab'}
            </h1>
            <p style={{ ...styles.subtitle, color: subtitleColor }}>
              {isLandingPage 
                ? 'Your complete talent sourcing solution'
                : 'Build searches, track requisitions, and manage your pipeline'
              }
            </p>
          </div>

          <div style={styles.authSection}>
            {loading ? (
              <span style={{ fontSize: '0.875rem', color: isLandingPage ? '#fff' : '#6b7280' }}>Loading...</span>
            ) : user ? (
              <>
                <span style={{ ...styles.userEmail, color: isLandingPage ? '#fff' : '#374151' }}>
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  style={{ 
                    ...styles.button, 
                    ...styles.signOutButton,
                    ...(isLandingPage && { background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)' })
                  }}
                  onMouseOver={(e) => {
                    if (isLandingPage) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    } else {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isLandingPage) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    } else {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  style={{ 
                    ...styles.button, 
                    ...styles.signInButton,
                    ...(isLandingPage && { background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)' })
                  }}
                  onMouseOver={(e) => {
                    if (isLandingPage) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    } else {
                      e.currentTarget.style.background = '#1d4ed8';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isLandingPage) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    } else {
                      e.currentTarget.style.background = '#2563eb';
                    }
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignUp}
                  style={{ 
                    ...styles.button, 
                    ...(isLandingPage 
                      ? { background: '#fff', color: '#2563eb', border: 'none' }
                      : { background: '#10b981', color: '#fff', border: 'none' }
                    )
                  }}
                  onMouseOver={(e) => {
                    if (isLandingPage) {
                      e.currentTarget.style.background = '#f9fafb';
                    } else {
                      e.currentTarget.style.background = '#059669';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isLandingPage) {
                      e.currentTarget.style.background = '#fff';
                    } else {
                      e.currentTarget.style.background = '#10b981';
                    }
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
