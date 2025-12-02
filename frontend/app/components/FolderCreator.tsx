"use client";

import { useState } from "react";
import { auth } from "../../initializeFirebase"; 
import styles from "./createFolder.module.css";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to refresh the list
  role: string;
}

export default function CreateFolderModal({ isOpen, onClose, onSuccess, role }: CreateFolderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      
      const idToken = await user.getIdToken();

      const response = await fetch('http://localhost:5261/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          Title: title, 
          Description: description,
          CreatedByRole: role
          // Removed Color logic entirely
        })
      });

      if (!response.ok) throw new Error("Failed to create folder");

      // Reset and Close
      setTitle("");
      setDescription("");
      onSuccess(); // Tell dashboard to refresh data
      onClose();   // Close modal

    } catch (error) {
      console.error(error);
      // alert("Failed to create folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Stop click propagation so clicking inside the box doesn't close it */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Folder</h2>
        </div>

        <form onSubmit={handleCreate}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Folder Name</label>
            <input 
              className={styles.input}
              placeholder="e.g. Biology 101"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description (Optional)</label>
            <textarea 
              className={styles.textarea}
              placeholder="What is this folder for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!title.trim() || isLoading} 
              className={styles.createBtn}
            >
              {isLoading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}