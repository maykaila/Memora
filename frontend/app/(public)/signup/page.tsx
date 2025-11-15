"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, createUserWithEmailAndPassword } from '../../../initializeFirebase'; 

// export default function SignUpPage() {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const router = useRouter(); 

// //   const handleSignUp = async (e: React.FormEvent) => {
// //     e.preventDefault(); 
// //     setError(null); 

// //     if (!username || !email || !password || !confirmPassword) {
// //       setError("Please fill in all fields.");
// //       return;
// //     }
// //     if (password !== confirmPassword) {
// //       setError("Passwords do not match.");
// //       return;
// //     }
// //      if (password.length < 6) {
// //       setError("Password must be at least 6 characters long.");
// //       return;
// //     }

// //     try {
// //       // --- STEP 1: Create user in Firebase Auth (Client-side) ---
// //       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// //       const user = userCredential.user;
      
// //       const idToken = await user.getIdToken();

// //       // --- STEP 2: Call your ASP.NET backend (Server-side) ---
// //       const response = await fetch('http://localhost:5261/api/users/create', { // Make sure this URL is correct!
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `Bearer ${idToken}` 
// //         },
// //         body: JSON.stringify({
// //           username: username,
// //           email: user.email 
// //         })
// //       });

// //       // --- THIS IS THE NEW, SAFER ERROR HANDLING ---
// //       if (!response.ok) {
// //         let errorMessage = "Failed to create user profile on server.";
// //         try {
// //             // Try to parse JSON, but don't fail if it's empty
// //             const errorData = await response.json();
// //             if (errorData && errorData.message) {
// //                 errorMessage = errorData.message;
// //             }
// //         } catch (jsonError) {
// //             // The response was not JSON (it was empty or HTML)
// //             // Log the error but use the generic message
// //             console.error("Could not parse server error response:", jsonError);
// //         }
// //         throw new Error(errorMessage);
// //       }
// //       // --- END NEW ERROR HANDLING ---

// //       router.push("/dashboard"); 

// //     } catch (error: any) {
// //       if (error.code === 'auth/email-already-in-use') {
// //         setError('This email is already in use.');
// //       } else {
// //         setError(error.message); // Show error from backend or auth
// //       }
// //       console.error("Sign up failed:", error);
// //     }
// //   };
  
// //   const handleCancel = () => {
// //     router.push('/'); 
// //   };

// //   return (
// //     <div className="center-page">
// //       <form className="auth-container" onSubmit={handleSignUp}>
// //         <h2>Sign Up</h2>
        
// //         {error && <p style={{ color: 'red' }}>{error}</p>}

// //         <input
// //           type="text"
// //           placeholder="Username"
// //           className="auth-input"
// //           value={username}
// //           onChange={(e) => setUsername(e.target.value)}
// //         />
// //         <input
// //           type="email"
// //           placeholder="Email"
// //           className="auth-input"
// //           value={email}
// //           onChange={(e) => setEmail(e.target.value)}
// //         />
// //         <input
// //           type="password"
// //           placeholder="Password"
// //           className="auth-input"
// //           value={password}
// //           onChange={(e) => setPassword(e.target.value)}
// //         />
// //         <input
// //           type="password"
// //           placeholder="Confirm Password"
// //           className="auth-input"
// //           value={confirmPassword}
// //           onChange={(e) => setConfirmPassword(e.target.value)}
// //         />

// //         <div>
// //           <button type="submit" className="auth-button">Sign Up</button>
// //           <button type="button" className="auth-button" onClick={handleCancel}>Cancel</button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // }


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

    // --- Input validation ---
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
      // --- STEP 1: Create user in Firebase Auth ---
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        console.error("Firebase Auth error:", firebaseError);
        if (firebaseError.code === "auth/email-already-in-use") {
          setError("This email is already in use in Firebase Auth.");
        } else {
          setError(firebaseError.message || "Firebase sign-up failed.");
        }
        return;
      }

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // --- STEP 2: Call backend to create user profile ---
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
        console.error("Backend error response:", await response.text());
        return;
      }

              // After successful signup
        alert("Sign up successful!");
        router.push("/dashboard");


      // --- SUCCESS: Redirect to dashboard ---
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Unexpected error in handleSignUp:", error);
      setError(error.message || JSON.stringify(error));
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  // --- JSX RETURN ---
  return (
    <div className="center-page">
      <form className="auth-container" onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div>
          <button type="submit" className="auth-button">Sign Up</button>
          <button type="button" className="auth-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
