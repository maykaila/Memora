"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { auth } from "../../../initializeFirebase"; // Adjust path as needed
import styles from "./student-joinClass.module.css"; // We'll create this CSS next

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to refresh the list after joining
}

export default function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!classCode.trim()) {
      setError("Please enter a class code.");
      setIsLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in.");
        return;
      }
      const idToken = await user.getIdToken();

      const response = await fetch(`http://localhost:5261/api/classes/join/${classCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        let errorMsg = "Failed to join class.";
        try {
            const data = await response.json();
            if (data.message) errorMsg = data.message;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      // Success!
      alert("Successfully joined class!");
      setClassCode(""); // Reset input
      onSuccess(); // Refresh parent list
      onClose(); // Close modal

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 className={styles.title}>Join a Class</h2>
        <p className={styles.subtitle}>Enter the 6-character code shared by your teacher.</p>

        <form onSubmit={handleJoin}>
          <input
            className={styles.input}
            placeholder="e.g. X9A2B1"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={styles.joinButton}>
              {isLoading ? "Joining..." : "Join Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}