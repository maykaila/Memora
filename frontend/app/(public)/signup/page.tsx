"use client"; 

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { auth, createUserWithEmailAndPassword } from '../../../initializeFirebase'; 
import styles from '../auth.module.css'; 

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        console.error("Firebase Auth error:", firebaseError);
        if (firebaseError.code === "auth/email-already-in-use") {
          setError("This email is already in use.");
        } else {
          setError(firebaseError.message || "Sign-up failed.");
        }
        return;
      }

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await fetch("http://localhost:5261/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: username,
          email: user.email,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create user profile on server.";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch (jsonError) {
          console.error("Backend response could not be parsed:", jsonError);
        }
        setError(errorMessage);
        return;
      }

      router.push("/dashboard");

    } catch (error: any) {
      console.error("Unexpected error in handleSignUp:", error);
      setError(error.message || JSON.stringify(error));
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        
        {/* LEFT SIDE */}
        <div className={styles.formSection}>
          <form className={styles.formContainer} onSubmit={handleSignUp}>
            {error && <p className={styles.error}>{error}</p>}

            <input
              type="text"
              placeholder="Username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
            <input
              type="password"
              placeholder="Confirm Password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button type="submit" className={styles.submitButton}>
                Sign Up
              </button>
            </div>

            <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555'}}>
              Already have an account? <Link href="/login" style={{color: '#d16d6d', fontWeight: 'bold', textDecoration: 'none'}}>Login</Link>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.imageSection}>
          <Image 
            src="/1.svg" 
            alt="Sign Up Visual" 
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