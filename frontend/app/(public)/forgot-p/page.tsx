"use client"; 

import { useState } from 'react';
import { auth, sendPasswordResetEmail } from '../../../initializeFirebase'; 
import { validateEmail } from '../../../services/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); 
  const [error, setError] = useState<string | null>(null);     

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // --- VALIDATION START ---
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
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
    }
  };

  return (
    <div className="center-page">
      <form className="auth-container" onSubmit={handleResetPassword}>
        <h2>Forgot Password</h2>
        
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!message && ( 
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="auth-button">Reset Password</button>
          </>
        )}
      </form>
    </div>
  );
}