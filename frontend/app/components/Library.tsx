"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./library.css";
import { auth } from "../../initializeFirebase"; 
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link"; 

import {
  MoreVertical, Edit, Trash2, BookOpen, Clock, Search, Filter, Plus, Loader2, Calendar, FolderPlus, Folder, Layers
} from "lucide-react";

import AddToFolderModal from "./AddToFolderModal";
import FolderCreator from "./FolderCreator"; 

// --- Types ---
type LibrarySet = {
  id: string;
  title: string;
  formattedDate: string;
  daysAgo: number;
  category: string;
  cardCount: number;
};

type LibraryFolder = {
  folderId: string;
  title: string;
  itemCount: number;
};

// 1. Add Props Interface
interface LibraryPageProps {
  role?: "student" | "teacher";
}

// 2. Accept Role Prop (Defaults to student)
export default function LibraryPage({ role = "student" }: LibraryPageProps) {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<"sets" | "folders">("sets");
  const [sets, setSets] = useState<LibrarySet[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  // Modal States
  const [isAddToFolderOpen, setIsAddToFolderOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  // --- Helper: Calculate Days Ago ---
  const calculateDaysAgo = (dateString: string) => {
    if (!dateString) return 0;
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // --- Helper: Format Date ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // --- Data Fetching Logic ---
  const fetchData = async (user: any) => {
    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Sets
      const setsRes = await fetch("http://localhost:5261/api/flashcardsets/my-sets", { headers });
      if (setsRes.ok) {
        const data = await setsRes.json();
        setSets(data.map((item: any) => ({
          id: item.SetId || item.setId || "unknown",
          title: item.Title || item.title || "Untitled Set", 
          formattedDate: formatDate(item.DateCreated || item.dateCreated),
          daysAgo: calculateDaysAgo(item.DateCreated || item.dateCreated),

          cardCount: item.Flashcards ? item.Flashcards.length : (item.flashcards ? item.flashcards.length : 0),
          
          category: (item.TagIds && item.TagIds.length > 0) 
            ? item.TagIds[0] 
            : (item.tagIds && item.tagIds.length > 0) 
            ? item.tagIds[0] 
            : "General",
        })));
      }

      // 2. Fetch Folders
      const foldersRes = await fetch("http://localhost:5261/api/folders/my-folders", { headers });
      if (foldersRes.ok) {
        const folderData = await foldersRes.json();
        
        // Manual mapping to handle PascalCase vs camelCase issues safely
        setFolders(folderData.map((f: any) => ({
             folderId: f.FolderId || f.folderId || "unknown_id",
             title: f.Title || f.title || "Untitled Folder",
             itemCount: f.FlashcardSetIds ? f.FlashcardSetIds.length : (f.flashcardSetIds ? f.flashcardSetIds.length : 0)
        })));
      }

    } catch (err) {
      console.error("Failed to fetch library:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshData = () => {
    if(auth.currentUser) fetchData(auth.currentUser);
  };

  // --- Filtering ---
  const filteredSets = sets.filter((s) => {
    const safeTitle = s.title ? s.title.toLowerCase() : "";
    return safeTitle.includes(search.toLowerCase());
  });

  const filteredFolders = folders.filter((f) => {
    const safeTitle = f.title ? f.title.toLowerCase() : "";
    return safeTitle.includes(search.toLowerCase());
  });

  // --- Handlers ---
  const handleCreateSet = () => {
    if (role === "teacher") router.push("/teacher-create");
    else router.push("/create");
  };

  const handleSearchByCategory = () => {
    alert("Search by category clicked — hook this to tag-based filtering.");
  };

  const handleEdit = (id: string) => {
    if (role === "teacher") router.push(`/teacher-create?id=${id}`);
    else router.push(`/create?id=${id}`);
    setMenuOpen(null);
  };

  const handleAddToFolderClick = (id: string) => {
    setSelectedDeckId(id);
    setIsAddToFolderOpen(true);
    setMenuOpen(null);
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this set? This cannot be undone.");
    if (!ok) {
      setMenuOpen(null);
      return;
    }

    const previousSets = [...sets];
    setSets((prev) => prev.filter((s) => s.id !== id));
    setMenuOpen(null);

    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const token = await user.getIdToken();

        const response = await fetch(`http://localhost:5261/api/flashcardsets/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to delete from server");

    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete the set. Please try again.");
        setSets(previousSets);
    }
  };

  const toggleMenu = (id: string) => {
    setMenuOpen((prev) => (prev === id ? null : id));
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (menuOpen && !target.closest('.lib-popup-menu-inline') && !target.closest('.lib-dots-btn')) {
      setMenuOpen(null);
    }
  };

  // --- Render ---
  return (
    <div className="lib-main-content-only" onClick={handleOutsideClick}>

      {/* Modals */}
      <AddToFolderModal 
        isOpen={isAddToFolderOpen} 
        onClose={() => setIsAddToFolderOpen(false)} 
        deckId={selectedDeckId} 
      />
      
      {/* Folder Creator Popup */}
      <FolderCreator 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
        onSuccess={refreshData}
        role={role}
      />

      <section className="lib-content-wrapper">

        <div className="lib-top-row">
          <div className="lib-search-input-wrapper">
            <Search size={20} className="lib-search-icon" />
            <input
              className="lib-search-input-main"
              placeholder={activeTab === 'sets' ? "Search flashcards" : "Search folders"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="lib-top-btn lib-top-btn-outline"
            onClick={handleSearchByCategory}
          >
            <Filter size={18} />
            Search by category
          </button>

          {/* DYNAMIC CREATE BUTTON */}
          {activeTab === 'sets' ? (
            <button
              className="lib-top-btn lib-top-btn-solid"
              onClick={handleCreateSet}
            >
              <Plus size={18} />
              Create Flashcards
            </button>
          ) : (
            <button
              className="lib-top-btn lib-top-btn-solid"
              onClick={() => setIsCreateFolderOpen(true)}
            >
              <FolderPlus size={18} />
              Create Folder
            </button>
          )}
        </div>

        {/* TABS WITH GRAY-OUT EFFECT */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '25px', alignItems: 'baseline', borderBottom:'1px solid #eee', paddingBottom:'10px' }}>
          <h1 
            onClick={() => setActiveTab('sets')}
            style={{ 
                cursor: 'pointer', 
                margin: 0,
                fontSize: '2rem',
                // Active vs Inactive Styles
                color: activeTab === 'sets' ? '#4a1942' : '#94718fff', 
                borderBottom: activeTab === 'sets' ? '3px solid #4a1942' : '3px solid transparent',
                paddingBottom: '5px',
                transition: 'all 0.2s ease'
            }}
          >
            Your Library
          </h1>
          <h1 
            onClick={() => setActiveTab('folders')}
            style={{ 
                cursor: 'pointer', 
                margin: 0,
                fontSize: '2rem',
                // Active vs Inactive Styles
                color: activeTab === 'folders' ? '#4a1942' : '#94718fff', 
                borderBottom: activeTab === 'folders' ? '3px solid #4a1942' : '3px solid transparent',
                paddingBottom: '5px',
                transition: 'all 0.2s ease'
            }}
          >
            Folders
          </h1>
        </div>

        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
              <Loader2 className="animate-spin" size={40} color="#666" />
           </div>
        ) : activeTab === 'sets' ? (
          /* --- SETS LIST --- */
          <div className="lib-list">
            {filteredSets.length === 0 && (
              <div className="lib-empty">
                No sets found. Create one to get started!
              </div>
            )}

            {filteredSets.map((set) => (
              <div key={set.id} className="lib-card" onClick={() => {
                if(menuOpen !== set.id) {
                   router.push(`/overviewOfCards?id=${set.id}`);
                }
              }}>
                <div className="lib-card-main">
                  <div className="lib-pill-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="lib-card-text">
                    <div className="lib-card-title">{set.title}</div>
                    <div className="lib-card-meta">
                      <span className="lib-cards-count" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> Created: {set.formattedDate}
                      </span>
                      <span>|</span>
                      <span className="lib-card-time-meta">
                    <Clock size={12} /> 
                    {/* Check if it is exactly 1 */}
                    {set.daysAgo} {set.daysAgo === 1 ? "day" : "days"} ago
                  </span>
                      <span>|</span>
                      {/* <span className="lib-card-category-pill">
                        {set.category}
                      </span> */}
                    </div>
                  </div>
                </div>

                <div className="lib-card-actions">
                  {menuOpen === set.id && (
                    <div className="lib-popup-menu-inline" onClick={e => e.stopPropagation()}>
                      <button
                        className="lib-action-btn lib-edit-btn"
                        onClick={(e) => { e.stopPropagation(); handleEdit(set.id); }}
                      >
                        <Edit size={16} /> Edit
                      </button>

                      {/* Add to Folder */}
                      <button
                        className="lib-action-btn lib-folder-btn"
                        onClick={(e) => { e.stopPropagation(); handleAddToFolderClick(set.id); }}
                      >
                        <FolderPlus size={16} /> Add to Folder
                      </button>

                      <button
                        className="lib-action-btn lib-delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDelete(set.id); }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}

                  <button
                    className="lib-dots-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(set.id);
                    }}
                  >
                    <MoreVertical />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- FOLDERS LIST --- */
          <div className="lib-list">
            {folders.length === 0 ? (
              <div className="lib-empty">
                No folders yet. 
                <button onClick={() => setIsCreateFolderOpen(true)} style={{background:'none', border:'none', color:'#4a1942', textDecoration:'underline', cursor:'pointer', marginLeft:'5px', fontSize:'inherit', fontWeight:'bold'}}>
                  Create one?
                </button>
              </div>
            ) : (
              filteredFolders.map((folder) => (
                <div 
                    key={folder.folderId} 
                    className="lib-card" 
                    onClick={() => {
                        // Dynamic Routing based on Role to avoid collision
                        const path = role === 'teacher' ? `/teacher-folder/${folder.folderId}` : `/folder/${folder.folderId}`;
                        router.push(path);
                    }}
                >
                  <div className="lib-card-main">
                    <div className="lib-pill-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      <Folder size={20} />
                    </div>
                    <div className="lib-card-text">
                      <div className="lib-card-title">{folder.title}</div>
                      <div className="lib-card-meta">{folder.itemCount} items</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </section>
    </div>
  );
}