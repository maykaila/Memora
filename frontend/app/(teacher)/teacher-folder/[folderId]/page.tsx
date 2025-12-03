"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Folder, BookOpen, Settings, Edit2, Trash2, MinusCircle } from "lucide-react";
import { auth } from "../../../../initializeFirebase"; 
import styles from "../../../components/folderDetails.module.css"; 

// ... interfaces remain the same ...
interface FolderDetails {
  id: string;
  title: string;
  description?: string;
}

interface DeckItem {
  setId: string;
  title: string;
  dateCreated: string;
}

export default function TeacherFolderDetailsPage({ params }: { params: Promise<{ folderId: string }> }) {
  const [folderId, setFolderId] = useState("");
  const [folder, setFolder] = useState<FolderDetails | null>(null);
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const router = useRouter();

  // 1. Unwrap Params
  useEffect(() => {
    params.then(p => setFolderId(p.folderId));
  }, [params]);

  // 2. Define Fetch Functions Separately
  
  // Only fetch Folder Metadata (Title/Desc) once or manually
  const fetchFolderData = useCallback(async () => {
    if (!folderId) return;
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    
    try {
      const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFolder(data);
        // We only set this once so we don't overwrite user typing
        setEditTitle(prev => prev || data.title); 
      }
    } catch (err) { console.error(err); }
  }, [folderId]);

  // Fetch Decks independently (Safe to poll this!)
  const fetchDecks = useCallback(async () => {
    if (!folderId) return;
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}/decks`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const rawDecks = await res.json();
        // Map the response to your interface
        const mappedDecks = rawDecks.map((d: any) => ({
           setId: d.setId || d.flashcardSetId || d.id,
           title: d.title,
           dateCreated: d.dateCreated
        }));
        setDecks(mappedDecks);
      }
    } catch (err) { console.error(err); }
  }, [folderId]);


  // 3. Initial Load & Polling Logic
  useEffect(() => {
    if (!folderId) return;

    const init = async () => {
      await Promise.all([fetchFolderData(), fetchDecks()]);
      setLoading(false);
    };
    init();

    // POLL: Check for new decks every 5 seconds
    // This makes the count update if a deck is added from elsewhere
    const interval = setInterval(() => {
      fetchDecks(); 
    }, 3000); 

    return () => clearInterval(interval);
  }, [folderId, fetchFolderData, fetchDecks]);


  // ... Handle Updates / Delete functions remain the same ...
  const handleUpdateFolder = async () => {
    // ... (Your existing code)
    if (!editTitle.trim()) return;
    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        
        const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}`, {
            method: 'PUT',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: editTitle, description: folder?.description })
        });

        if (res.ok) {
            setFolder(prev => prev ? { ...prev, title: editTitle } : null);
            setIsEditMode(false);
        } else {
            alert("Failed to update folder.");
        }
    } catch (e) { console.error(e); }
  };

  const handleDeleteFolder = async () => {
     // ... (Your existing code)
     if (!confirm("Delete this folder?")) return;
     try {
         const user = auth.currentUser;
         if (!user) return;
         const token = await user.getIdToken();
 
         const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}`, {
             method: 'DELETE',
             headers: { Authorization: `Bearer ${token}` }
         });
 
         if (res.ok) router.push('/teacher-dashboard');
     } catch (e) { console.error(e); }
  };

  const handleRemoveDeckFromFolder = async (deckId: string) => {
    if (!confirm("Remove deck from folder?")) return;
    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}/sets/${deckId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        // This line updates the UI instantly for removal!
        if (res.ok) setDecks(prev => prev.filter(d => d.setId !== deckId));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Loading...</div>;
  if (!folder) return <div style={{padding:'50px', textAlign:'center'}}>Folder not found</div>;

  return (
    <div className={styles.container}>
       {/* ... Your JSX remains exactly the same ... */}
       <div className={styles.headerCard}>
        <div className={styles.iconContainer} style={{ background: '#e0f2fe', color: '#0284c7' }}>
           <Folder size={32} />
        </div>
        
        <div className={styles.headerInfo}>
           {isEditMode ? (
             <div>
                <input 
                   className={styles.editTitleInput}
                   value={editTitle}
                   onChange={(e) => setEditTitle(e.target.value)}
                   autoFocus
                />
                <div className={styles.editActions}>
                   <button className={styles.saveBtn} onClick={handleUpdateFolder}>Save</button>
                   <button className={styles.cancelBtn} onClick={() => {
                       setIsEditMode(false);
                       setEditTitle(folder.title);
                   }}>Cancel</button>
                </div>
             </div>
           ) : (
             <>
                <h1 className={styles.folderTitle}>{folder.title}</h1>
                {/* decks.length will now update automatically via polling or manual delete */}
                <p className={styles.folderMeta}>{folder.description || "No description"} • {decks.length} Decks</p>
             </>
           )}
        </div>

        {!isEditMode && (
            <div className={styles.settingsWrapper}>
                <button className={styles.settingsBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Settings size={20} />
                </button>
                {isMenuOpen && (
                    <div className={styles.popupMenu}>
                        <button className={styles.menuItem} onClick={() => {
                            setIsEditMode(true);
                            setIsMenuOpen(false);
                        }}>
                            <Edit2 size={16} /> Edit Folder
                        </button>
                        <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={handleDeleteFolder}>
                            <Trash2 size={16} /> Delete Folder
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      <h2 className={styles.sectionTitle}>Decks in this Folder</h2>

      <div className={styles.decksGrid}>
        {decks.length === 0 ? (
            <p className={styles.emptyState}>This folder is empty.</p>
        ) : (
            decks.map((deck) => (
                <div key={deck.setId} style={{ position: 'relative' }}>
                    {isEditMode && (
                        <button 
                            className={styles.removeDeckBtn}
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemoveDeckFromFolder(deck.setId);
                            }}
                        >
                            <MinusCircle size={28} color="#dc2626" fill="white" />
                        </button>
                    )}
                    <Link href={`/teacher-cardOverview?id=${deck.setId}`} className={styles.deckCard}>
                        <div className={styles.deckIconBox}>
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <div className={styles.deckTitle}>{deck.title}</div>
                            <div className={styles.deckDate}>
                                Created: {new Date(deck.dateCreated).toLocaleDateString()}
                            </div>
                        </div>
                    </Link>
                </div>
            ))
        )}
      </div>
    </div>
  );
}