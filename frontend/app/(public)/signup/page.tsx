"use client"; 

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { auth, createUserWithEmailAndPassword } from '../../../initializeFirebase'; 
import { GraduationCap, School } from "lucide-react"; 
import styles from '../auth.module.css'; 
import { updateProfile } from "firebase/auth";
import { validateEmail, validatePassword, validateUsername } from '../../../services/validation'; // <--- Check this path

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student'); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // --- VALIDATION START ---
    
    // 1. Validate Username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      setIsLoading(false);
      return;
    }

    // 2. Validate Email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    // 3. Validate Password Match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // 4. Validate Password Complexity (Min 6 chars)
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }
    // --- VALIDATION END ---

    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        if (firebaseError.code === "auth/email-already-in-use") {
          setError("This email is already in use.");
        } else {
          setError(firebaseError.message || "Sign-up failed.");
        }
        setIsLoading(false);
        return;
      }

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username
      });

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
          role: role.toUpperCase(), 
          firebaseId: user.uid 
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
        setIsLoading(false);
        return;
      }

      if (role === 'teacher') {
        router.push("/teacher-dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error("Unexpected error in handleSignUp:", error);
      setError(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        
        {/* LEFT SIDE */}
        <div className={styles.formSection}>
          <form className={styles.formContainer} onSubmit={handleSignUp}>
            <h2 style={{ color: '#4a1942', marginBottom: '0px' }}>Create Account</h2>
            
            {error && <p className={styles.error}>{error}</p>}

            {/* Role Selector */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '15px', 
              background: '#f0c9ff', 
              padding: '5px', 
              borderRadius: '10px' 
            }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  background: role === 'student' ? '#4a1942' : 'transparent',
                  color: role === 'student' ? 'white' : '#4a1942',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <GraduationCap size={18} /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  background: role === 'teacher' ? '#4a1942' : 'transparent',
                  color: role === 'teacher' ? 'white' : '#4a1942',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <School size={18} /> Teacher
              </button>
            </div>

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
              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? "Creating..." : "Sign Up"}
              </button>
            </div>

            <div style={{textAlign: 'center', marginTop: '5px', fontSize: '14px', color: '#555'}}>
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