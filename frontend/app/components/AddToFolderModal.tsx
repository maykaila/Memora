"use client";

import { useState, useEffect } from "react";
import { X, Folder, Plus } from "lucide-react";
import { auth } from "../../initializeFirebase"; 
import styles from "./addToFolderModal.module.css";

interface FolderItem {
  folderId: string;
  title: string;
  itemCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deckId: string; // The deck we are moving
}

export default function AddToFolderModal({ isOpen, onClose, deckId }: Props) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Folders when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchFolders = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        
        try {
          const res = await fetch("http://localhost:5261/api/folders/my-folders", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            setFolders(await res.json());
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchFolders();
    }
  }, [isOpen]);

  const handleAddToFolder = async (folderId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      // API Call to add deck to folder
      // Assuming endpoint: POST /api/folders/{folderId}/add/{deckId}
      const res = await fetch(`http://localhost:5261/api/folders/${folderId}/add-set/${deckId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // alert("Added to folder successfully!");
        onClose();
      } else {
        // alert("Failed to add to folder.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding to folder.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add to Folder</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        <div className={styles.list}>
          {loading ? <p>Loading folders...</p> : folders.length === 0 ? (
            <p>No folders found.</p>
          ) : (
            folders.map(folder => (
              <div key={folder.folderId} className={styles.item} onClick={() => handleAddToFolder(folder.folderId)}>
                <div className={styles.iconBox}><Folder size={20} /></div>
                <div className={styles.info}>
                  <div className={styles.folderName}>{folder.title}</div>
                  <div className={styles.folderCount}>{folder.itemCount} items</div>
                </div>
                <Plus size={18} color="#4a1942" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}