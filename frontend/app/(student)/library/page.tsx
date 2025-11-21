"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./library.css";
// Remove this line, as it conflicts with file-based routing in Next.js
// import CreateFlashcardPage from '../create-flashcard/page';

import {
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Search,
  Filter,
  Plus,
} from "lucide-react";

// --- Types ---
type LibrarySet = {
  id: string;
  title: string;
  cards: number;
  daysAgo: number;
  category: string;
};

// --- Initial Data ---
const initialSets: LibrarySet[] = [
  {
    id: "1",
    title: "Cybersecurity Essentials Final Exam",
    cards: 22,
    daysAgo: 5,
    category: "Networking 2",
  },
  {
    id: "2",
    title: "Data Structures & Algorithm (Theoretical Concepts)",
    cards: 30,
    daysAgo: 2,
    category: "Programming 2",
  },
  {
    id: "3",
    title: "Linux Operating Systems",
    cards: 12,
    daysAgo: 8,
    category: "Linux 2",
  },
];

// --- Component ---
export default function LibraryPage() {
  const router = useRouter();

  const [sets, setSets] = useState<LibrarySet[]>(initialSets);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredSets = sets.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  // --- Handlers ---
  const handleCreate = () => {
    // UPDATED: Use the Next.js router to navigate to the /create-flashcard route
    router.push("/create-flashcard");
  };

  const handleSearchByCategory = () => {
    alert("Search by category clicked — hook this to tag-based filtering.");
  };

  const handleEdit = (id: string) => {
    alert(`Edit set ${id} — connect to /flashcards/${id}/edit`);
    setMenuOpen(null);
  };

  const handleDelete = (id: string) => {
    const ok = confirm("Delete this flashcard set?");
    if (!ok) {
      setMenuOpen(null);
      return;
    }
    setSets((prev) => prev.filter((s) => s.id !== id));
    setMenuOpen(null);
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

  return (
    // The main content area wrapper, including the background color
    <div className="lib-main-content-only" onClick={handleOutsideClick}>

      <section className="lib-content-wrapper">

        {/* Local Library Search + Actions Row */}
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
            onClick={handleCreate} // This handler now uses router.push
          >
            <Plus size={18} />
            Create Flashcards
          </button>
        </div>

        <h1 className="lib-title">Your Library</h1>

        <div className="lib-list">
          {filteredSets.length === 0 && (
            <div className="lib-empty">
              No sets found. Try another search.
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
                    <span className="lib-cards-count">{set.cards} Cards</span>
                    <span>|</span>
                    <span className="lib-card-time-meta"><Clock size={12} /> {set.daysAgo} days ago</span>
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
                    <button
                      className="lib-action-btn lib-edit-btn"
                      onClick={(e) => { e.stopPropagation(); handleEdit(set.id); }}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
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
      </section>
    </div>
  );
}