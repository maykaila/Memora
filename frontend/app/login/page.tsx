"use client"; // Required for hooks and event handlers

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { auth, signInWithEmailAndPassword } from '../../initializeFirebase'; // Check this path

export default function LoginPage() {
  // State for inputs and errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from reloading the page
    setError(null); // Clear any previous errors

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Use the function we exported from initializeFirebase.js
      await signInWithEmailAndPassword(auth, email, password);
      // Success! Redirect to the home page
      router.push('/');
    } catch (firebaseError: any) {
      // Handle login errors
      console.error("Login failed:", firebaseError.code);
      // Provide a user-friendly error message
      if (firebaseError.code === 'auth/invalid-credential') {
         setError("Invalid email or password.");
      } else {
         setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="center-page">
      {/* Wrap everything in a form and use onSubmit */}
      <form className="auth-container" onSubmit={handleLogin}>
        <h2>Login</h2>

        {/* Display error message if it exists */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Link href="/forgot-p" className="auth-link">Forgot Password?</Link>
        
        {/* Make sure the button is type="submit" */}
        <button type="submit" className="auth-button">Login</button>
      </form>
    </div>
  );
}