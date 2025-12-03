"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Folder, BookOpen, Settings, Edit2, Trash2, MinusCircle, Check, X } from "lucide-react";
import { auth } from "../../../../initializeFirebase"; 
import styles from "../../../components/folderDetails.module.css"; // Import the new CSS

interface FolderDetails {
  id: string;
  title: string;
  description?: string;
  color?: string;
  Color?: string;
}

interface DeckItem {
  setId: string;
  title: string;
  dateCreated: string;
}

export default function StudentFolderDetailsPage({ params }: { params: Promise<{ folderId: string }> }) {
  const [folderId, setFolderId] = useState("");
  const [folder, setFolder] = useState<FolderDetails | null>(null);
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings & Edit Mode States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const router = useRouter();

  useEffect(() => {
    params.then(p => setFolderId(p.folderId));
  }, [params]);

  useEffect(() => {
    if (!folderId) return;
    fetchData();
  }, [folderId]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const folderRes = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}`, { headers });
      if (folderRes.ok) {
        const data = await folderRes.json();
        setFolder(data);
        setEditTitle(data.title);
      }

      const decksRes = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}/decks`, { headers });
      if (decksRes.ok) {
        const rawDecks = await decksRes.json();
        setDecks(rawDecks.map((d: any) => ({
           setId: d.setId || d.flashcardSetId || d.id,
           title: d.title,
           dateCreated: d.dateCreated
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---

  const handleUpdateFolder = async () => {
    if (!editTitle.trim()) return;
    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        
        // Assuming endpoint: PUT /api/folders/{id}
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
            alert("Failed to update folder name.");
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleDeleteFolder = async () => {
    const confirmed = confirm("Are you sure you want to delete this folder? The decks inside will NOT be deleted from your library.");
    if (!confirmed) return;

    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        // Assuming endpoint: DELETE /api/folders/{id}
        const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            router.push('/library'); // Go back to library
        } else {
            alert("Failed to delete folder.");
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleRemoveDeckFromFolder = async (deckId: string) => {
    const confirmed = confirm("Remove this deck from the folder?");
    if (!confirmed) return;

    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        // Assuming endpoint: DELETE /api/folders/{folderId}/sets/{setId}
        // You might need to add this endpoint to your C# controller if it doesn't exist yet
        const res = await fetch(`https://memora-api.dcism.org/api/folders/${folderId}/sets/${deckId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            setDecks(prev => prev.filter(d => d.setId !== deckId));
        } else {
            alert("Failed to remove deck.");
        }
    } catch (e) {
        console.error(e);
    }
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Loading...</div>;
  if (!folder) return <div style={{padding:'50px', textAlign:'center'}}>Folder not found</div>;

  const folderColor = folder.color || folder.Color || '#e0f2fe';

  return (
    <div className={styles.container}>

      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.iconContainer} style={{ background: folderColor, color: '#4a1942' }}>
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
                    <button className={styles.saveBtn} onClick={handleUpdateFolder}>
                        Save Changes
                    </button>
                    <button className={styles.cancelBtn} onClick={() => {
                        setIsEditMode(false);
                        setEditTitle(folder.title);
                    }}>
                        Cancel
                    </button>
                </div>
             </div>
           ) : (
             <>
                <h1 className={styles.folderTitle}>{folder.title}</h1>
                <p className={styles.folderMeta}>{folder.description || "No description"} • {decks.length} Decks</p>
             </>
           )}
        </div>

        {/* Settings Menu Button */}
        {!isEditMode && (
            <div className={styles.settingsWrapper}>
                <button 
                    className={styles.settingsBtn} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Settings size={20} />
                </button>
                {/* <button 
                    className={styles.primaryBtn} 
                    style={{background: '#4a1942', color: '#ffffffff', border: '1px solid #eee'}}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Settings size={18} /> Settings
                </button> */}

                {isMenuOpen && (
                    <div className={styles.popupMenu}>
                        <button className={styles.menuItem} onClick={() => {
                            setIsEditMode(true);
                            setIsMenuOpen(false);
                        }}>
                            <Edit2 size={16} /> Edit Folder
                        </button>
                        <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={() => {
                            handleDeleteFolder();
                        }}>
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
                    {/* The Delete Minus Circle (Only in Edit Mode) */}
                    {isEditMode && (
                        <button 
                            className={styles.removeDeckBtn}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveDeckFromFolder(deck.setId);
                            }}
                        >
                            <MinusCircle size={28} color="#dc2626" fill="white" />
                        </button>
                    )}

                    <Link href={`/overviewOfCards?id=${deck.setId}`} className={styles.deckCard}>
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