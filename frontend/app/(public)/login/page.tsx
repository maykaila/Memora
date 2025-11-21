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

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null); 

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (firebaseError: any) {
      console.error("Login failed:", firebaseError.code);
      if (firebaseError.code === 'auth/invalid-credential') {
         setError("Invalid email or password.");
      } else {
         setError("Login failed. Please try again.");
      }
    }
  };

  return (
    // 1. Outer Wrapper (Pink Background)
    <div className={styles.pageWrapper}>
      
      {/* 2. Inner Card (Cream Box) */}
      <div className={styles.authCard}>
        
        {/* LEFT SIDE */}
        <div className={styles.formSection}>
          <form className={styles.formContainer} onSubmit={handleLogin}>
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
            
            <button type="submit" className={styles.submitButton}>
              Login
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