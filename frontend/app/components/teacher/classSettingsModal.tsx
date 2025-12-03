"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { auth } from "../../../initializeFirebase"; 
import styles from "./classSettingsModal.module.css";

interface ClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  currentName: string;
  onUpdateSuccess: () => void; // To refresh page after update
}

export default function ClassSettingsModal({ isOpen, onClose, classId, currentName, onUpdateSuccess }: ClassSettingsModalProps) {
  const [className, setClassName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Reset name when modal opens
  useEffect(() => {
    if (isOpen) setClassName(currentName);
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (!className.trim()) return;
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();

      const response = await fetch(`https://memora-api.dcism.org/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ className: className })
      });

      if (!response.ok) throw new Error("Failed to update class");

      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you surely you want to delete this class? This action cannot be undone.")) return;
    
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();

      const response = await fetch(`https://memora-api.dcism.org/api/classes/${classId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!response.ok) throw new Error("Failed to delete class");

      // Redirect back to dashboard after deletion
      router.push('/teacher-dashboard');
      
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Class Settings</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        {/* Edit Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Class Name</label>
          <input
            className={styles.input}
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Biology 101"
          />
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button 
            onClick={handleUpdate} 
            disabled={isLoading || !className.trim()} 
            className={styles.saveBtn}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Delete Section */}
        <div className={styles.dangerZone}>
          <button onClick={handleDelete} className={styles.deleteBtn} disabled={isLoading}>
            <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                <Trash2 size={18} /> Delete Class
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}