"use client"; 

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image"; 
import { useRouter } from 'next/navigation';
import { auth, signInWithEmailAndPassword } from '../../../initializeFirebase'; 
import styles from '../auth.module.css'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null); 
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // 2. Fetch User Profile from Backend to get the ROLE
      // We assume you have an endpoint like GET /api/users/me or GET /api/users/{uid}
      // If you don't have this, you must create it in your .NET backend.
      const response = await fetch(`http://localhost:5261/api/users/${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // 3. Redirect based on Role received from database
        const userRole = userData.role?.toUpperCase(); // Ensure case safety

        if (userRole === 'TEACHER') {
          router.push("/teacher-dashboard");
        } else {
          router.push("/dashboard"); // Default to student dashboard
        }
      } else {
        // Fallback if backend fails: Default to student dashboard or show error
        console.warn("Could not fetch user role, defaulting to student dashboard");
        router.push("/dashboard");
      }

    } catch (firebaseError: any) {
      console.error("Login failed:", firebaseError.code);
      if (firebaseError.code === 'auth/invalid-credential') {
         setError("Invalid email or password.");
      } else {
         setError("Login failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        
        {/* LEFT SIDE */}
        <div className={styles.formSection}>
          <form className={styles.formContainer} onSubmit={handleLogin}>
            <h2 style={{ color: '#4a1942', marginBottom: '1rem' }}>Welcome Back!</h2>
            {error && <p className={styles.error}>{error}</p>}

            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Link href="/forgot-p" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
            
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555'}}>
              Don't have an account? <Link href="/signup" style={{color: '#d16d6d', fontWeight: 'bold', textDecoration: 'none'}}>Sign Up</Link>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.imageSection}>
          <Image 
            src="/1.svg" 
            alt="Login Visual" 
            width={500} 
            height={500} 
            className={styles.heroImage}
            priority
          />
        </div>
      </div>
    </div>
  );
}