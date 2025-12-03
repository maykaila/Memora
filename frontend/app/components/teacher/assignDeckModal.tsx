"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, X } from "lucide-react";
import { auth } from "../../../initializeFirebase"; 
import styles from "./assignDeckModal.module.css";

interface FlashcardSet {
  setId: string;
  title: string;
  dateCreated: string;
}

interface AssignDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSuccess: () => void;
}

export default function AssignDeckModal({ isOpen, onClose, classId, onSuccess }: AssignDeckModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "create">("library");
  const [myDecks, setMyDecks] = useState<FlashcardSet[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch Teacher's Library when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchLibrary = async () => {
        const user = auth.currentUser;
        if (!user) return;
        
        const idToken = await user.getIdToken();
        try {
          const res = await fetch('https://memora-api.dcism.org/api/flashcardsets/my-sets', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setMyDecks(data);
          }
        } catch (error) {
          console.error("Failed to load library", error);
        }
      };
      fetchLibrary();
    }
  }, [isOpen]);

  // Toggle selection logic
  const handleDeckClick = (id: string) => {
    if (selectedDeckId === id) {
      setSelectedDeckId(null); // Unselect if clicked again
    } else {
      setSelectedDeckId(id); // Select new
    }
  };

  const handleAssign = async () => {
    if (!selectedDeckId) return;
    if (!classId) {
        alert("Error: Missing Class ID. Please refresh the page.");
        return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();

      const response = await fetch(`https://memora-api.dcism.org/api/classes/${classId}/assign/${selectedDeckId}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to assign deck");
      }

      onSuccess(); // Refresh parent page
      onClose();
      setSelectedDeckId(null); 

    } catch (error: any) {
      console.error(error);
      alert(`Failed to assign deck: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/teacher-create'); 
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Assign Deck</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Select from Library
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'create' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create New
          </button>
        </div>

        {activeTab === 'library' ? (
          <>
            <div className={styles.deckList}>
              {myDecks.length === 0 ? (
                <p style={{textAlign:'center', color:'#666', marginTop:'20px'}}>You have no decks yet.</p>
              ) : (
                myDecks.map((deck) => (
                  <div 
                    key={deck.setId} 
                    className={`${styles.deckItem} ${selectedDeckId === deck.setId ? styles.selectedDeck : ''}`}
                    onClick={() => handleDeckClick(deck.setId)} // Updated to use toggle handler
                  >
                    <div className={styles.deckIcon}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.deckInfo}>
                      <div className={styles.deckTitle}>{deck.title}</div>
                      <div className={styles.deckMeta}>{new Date(deck.dateCreated).toLocaleDateString()}</div>
                    </div>
                    {selectedDeckId === deck.setId && (
                        <div style={{color:'#4a1942', fontWeight:'bold'}}>Selected</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className={styles.actions}>
              <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
              <button 
                onClick={handleAssign} 
                disabled={!selectedDeckId || isLoading} 
                className={styles.assignBtn}
              >
                {isLoading ? "Assigning..." : "Assign Selected"}
              </button>
            </div>
          </>
        ) : (
          <div style={{textAlign:'center', padding:'30px'}}>
            <div onClick={handleCreateNew} style={{background:'#f0c9ff', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', cursor: 'pointer'}}>
               <Plus size={32} color="#4a1942" />
            </div>
            <h3 style={{color:'#4a1942', marginBottom:'10px'}}>Create a Brand New Deck</h3>
            <p style={{color:'#666', marginBottom:'30px'}}>Go to the deck creator to build a new set of flashcards.</p>
            {/* <button onClick={handleCreateNew} className={styles.assignBtn}>
              Go to Creator
            </button> */}
          </div>
        )}

      </div>
    </div>
  );
}