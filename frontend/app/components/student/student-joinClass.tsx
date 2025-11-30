"use client";

import { useState } from "react";
import { GraduationCap, ArrowRight, AlertCircle } from "lucide-react"; // Added AlertCircle
import { auth } from "../../../initializeFirebase"; 
import styles from "./student-joinClass.module.css";

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh parent page
}

export default function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // 1. Added missing error state
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 2. Get the current user and token
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to join a class.");
      }
      const idToken = await user.getIdToken();

      // 3. Use 'joinCode' state variable here (fixed from 'code')
      const response = await fetch(`http://localhost:5261/api/classes/join/${joinCode}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!response.ok) {
        let errorMessage = "Failed to join class";
        
        // 4. Safe Error Handling (fixes the stream already read error)
        const responseText = await response.text();

        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
        } catch {
            if (responseText) errorMessage = responseText;
        }

        throw new Error(errorMessage);
      }

      // 5. Show Success Screen instead of closing immediately
      setIsSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setJoinCode("");
    setIsSuccess(false);
    setIsLoading(false);
    setError(null);
    onClose();
  };

  const handleDone = () => {
    onSuccess(); // Refresh the dashboard data
    handleClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {!isSuccess ? (
          // 1. JOIN FORM
          <>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <GraduationCap size={28} />
              </div>
              <h2 className={styles.title}>Join a Class</h2>
            </div>

            <form onSubmit={handleJoinClass}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Class Code</label>
                <input
                  className={styles.input}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())} // Auto-uppercase
                  placeholder="e.g. X7Y2Z9"
                  autoFocus
                />
              </div>

              {/* Added Error Message Display */}
              {error && (
                <div style={{ color: '#d32f2f', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className={styles.actions}>
                <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                
                <button 
                  type="submit" 
                  disabled={isLoading || !joinCode.trim()} 
                  className={styles.joinBtn}
                >
                  {isLoading ? "Joining..." : "Join Class"}
                </button>
              </div>
            </form>
          </>
        ) : (
          // 2. SUCCESS STATE
          <div className={styles.successState}>
            <div className={styles.header} style={{justifyContent:'center', marginBottom: '5px'}}>
               <div className={styles.iconWrapper} style={{backgroundColor: '#dcfce7', color: '#166534'}}>
                <GraduationCap size={28} />
              </div>
            </div>
            <h2 className={styles.title} style={{color:'#166534', textAlign: 'center'}}>Success!</h2>
            <p style={{color:'#666', marginTop: '10px', textAlign: 'center'}}>You have successfully joined the class.</p>
            
            <button onClick={handleDone} className={styles.doneBtn} style={{marginTop: '20px', width: '25%'}}>
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}