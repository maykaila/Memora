"use client"; // Required for hooks and event handlers

import { useState } from 'react';
import { auth, sendPasswordResetEmail } from '../../../initializeFirebase'; // Check path

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); // For success
  const [error, setError] = useState<string | null>(null);     // For errors

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // Use the function we just exported
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
        
        {/* Show success or error messages */}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!message && ( // Hide input after success if you want
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