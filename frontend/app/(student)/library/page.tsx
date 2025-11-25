"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./library.css";
import { auth } from "../../../initializeFirebase"; 
import { onAuthStateChanged } from "firebase/auth";

import {
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Search,
  Filter,
  Plus,
  Loader2,
  Calendar,
  FolderPlus // 1. Import the Folder icon
} from "lucide-react";

// --- Types ---
type LibrarySet = {
  id: string;
  title: string;
  formattedDate: string;
  daysAgo: number;
  category: string;
};

// --- Component ---
export default function LibraryPage() {
  const router = useRouter();

  const [sets, setSets] = useState<LibrarySet[]>([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // --- Helper: Calculate Days Ago ---
  const calculateDaysAgo = (dateString: string) => {
    if (!dateString) return 0;
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
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
  useEffect(() => {
    const fetchMySets = async (user: any) => {
      try {
        const token = await user.getIdToken();

        const response = await fetch("http://localhost:5261/api/flashcardsets/my-sets", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        const mappedSets: LibrarySet[] = data.map((item: any) => ({
          id: item.SetId || item.setId || "unknown",
          title: item.Title || item.title || "Untitled Set", 
          
          // Display Formatted Date
          formattedDate: formatDate(item.DateCreated || item.dateCreated),
          
          daysAgo: calculateDaysAgo(item.DateCreated || item.dateCreated),
          category: (item.TagIds && item.TagIds.length > 0) 
            ? item.TagIds[0] 
            : (item.tagIds && item.tagIds.length > 0) 
            ? item.tagIds[0] 
            : "General",
        }));

        setSets(mappedSets);
      } catch (err) {
        console.error("Failed to fetch library:", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMySets(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Filtering ---
  const filteredSets = sets.filter((s) => {
    const safeTitle = s.title ? s.title.toLowerCase() : "";
    return safeTitle.includes(search.toLowerCase());
  });

  // --- Handlers ---
  const handleCreate = () => {
    router.push("/create");
  };

  const handleSearchByCategory = () => {
    alert("Search by category clicked — hook this to tag-based filtering.");
  };

  const handleEdit = (id: string) => {
    router.push(`/create?id=${id}`);
    setMenuOpen(null);
  };

  // 2. NEW HANDLER: Add to Folder
  const handleAddToFolder = (id: string) => {
    // TODO: Connect this to your future "Folders" API
    alert(`Add Set ID: ${id} to a folder logic goes here.`);
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
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete from server");
        }

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

      <section className="lib-content-wrapper">

        <div className="lib-top-row">
          <div className="lib-search-input-wrapper">
            <Search size={20} className="lib-search-icon" />
            <input
              className="lib-search-input-main"
              placeholder="Search flashcards"
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

          <button
            className="lib-top-btn lib-top-btn-solid"
            onClick={handleCreate}
          >
            <Plus size={18} />
            Create Flashcards
          </button>
        </div>

        <h1 className="lib-title">Your Library</h1>

        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
              <Loader2 className="animate-spin" size={40} color="#666" />
           </div>
        ) : (
          <div className="lib-list">
            {filteredSets.length === 0 && (
              <div className="lib-empty">
                No sets found. Create one to get started!
              </div>
            )}

            {filteredSets.map((set) => (
              <div key={set.id} className="lib-card" onClick={() => {
                if(menuOpen !== set.id) {
                   alert(`Navigating to study set: ${set.title}`);
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
                        <Clock size={12} /> {set.daysAgo} days ago
                      </span>
                      
                      <span>|</span>
                      
                      <span className="lib-card-category-pill">
                        {set.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lib-card-actions">

                  {menuOpen === set.id ? (
                    <div className="lib-popup-menu-inline" onClick={e => e.stopPropagation()}>
                      
                      {/* Edit Button */}
                      <button
                        className="lib-action-btn lib-edit-btn"
                        onClick={(e) => { e.stopPropagation(); handleEdit(set.id); }}
                      >
                        <Edit size={16} />
                        Edit
                      </button>

                      {/* 3. NEW Add to Folder Button */}
                      <button
                        className="lib-action-btn lib-folder-btn"
                        onClick={(e) => { e.stopPropagation(); handleAddToFolder(set.id); }}
                      >
                        <FolderPlus size={16} />
                        Add to Folder
                      </button>

                      {/* Delete Button */}
                      <button
                        className="lib-action-btn lib-delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDelete(set.id); }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ) : null}

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
        )}
      </section>
    </div>
  );
}