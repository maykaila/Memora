"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { auth } from "../../initializeFirebase"; // Make sure this path is correct!
import styles from "./createFolder.module.css";

export default function CreateFolderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Validation ---
    if (!title.trim()) {
      alert("Please enter a folder name.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. GET THE USER & TOKEN (This was missing!)
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create a folder.");
        router.push("/login");
        return;
      }
      const idToken = await user.getIdToken();

      // 2. SEND TO BACKEND
      const response = await fetch('http://localhost:5261/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` // Now idToken is defined
        },
        body: JSON.stringify({ 
          Title: title, 
          Description: description 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create folder.");
      }

      // 3. SUCCESS
      alert("Folder created successfully!");
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error creating folder:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      
      <div className={styles.card}>
        
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FolderPlus size={28} />
          </div>
          <h1 className={styles.title}>
            Create New Folder
          </h1>
        </div>

        <form onSubmit={handleSave}>
          
          {/* Folder Name Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Folder Name</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biology 101"
            />
          </div>

          {/* Description Input */}
          <div className={`${styles.formGroup} ${styles.last}`}>
            <label className={styles.label}>
              Description <span className={styles.optional}>(Optional)</span>
            </label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this folder for?"
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? "Creating..." : "Create Folder"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}