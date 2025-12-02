"use client"; 

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { auth, sendPasswordResetEmail } from '../../../initializeFirebase'; 
import { validateEmail } from '../../../services/validation';
import styles from '../auth.module.css'; // Import the shared styles

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); 
  const [error, setError] = useState<string | null>(null);     
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // --- VALIDATION START ---
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }
    // --- VALIDATION END ---

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (firebaseError: any) {
      console.error("Password reset failed:", firebaseError);
      if (firebaseError.code === 'auth/invalid-email' || firebaseError.code === 'auth/user-not-found') {
        setError("No user found with this email.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.mainContent}>
        <div className={styles.pageWrapper}>
          <div className={styles.authCard}>
            
            {/* LEFT SIDE (Form) */}
            <div className={styles.formSection}>
              <form className={styles.formContainer} onSubmit={handleResetPassword}>
                <h2 style={{ color: '#4a1942', marginBottom: '1rem' }}>Forgot Password</h2>
                
                {message && <p style={{ color: 'green', background: '#e6ffe6', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>{message}</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                {!message && ( 
                  <>
                    <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center', fontSize: '0.95rem' }}>
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                      <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? "Sending..." : "Reset Password"}
                      </button>
                    </div>
                  </>
                )}

                <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555'}}>
                  Remember your password? <Link href="/login" style={{color: '#d16d6d', fontWeight: 'bold', textDecoration: 'none'}}>Login</Link>
                </div>
              </form>
            </div>

            {/* RIGHT SIDE (Image) */}
            <div className={styles.imageSection}>
              <Image 
                src="/1.svg" 
                alt="Forgot Password Visual" 
                width={500} 
                height={500} 
                className={styles.heroImage}
                priority
              />
            </div>

          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        © 2025 Memora. All rights reserved.
      </footer>
    </div>
  );
}