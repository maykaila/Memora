// --- Landing Page ---

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Home, 
  Library, 
  LayoutGrid, 
  Brain, 
  Search, 
  Plus, 
  User, 
  BookOpen 
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { auth } from "../../initializeFirebase";
import { onAuthStateChanged } from "firebase/auth";

// --- Sub-components ---

/**
 * Represents a navigation item in the sidebar
 */
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false }) => {
  // Active prop is no longer used visually without CSS
  return (
    <a href="#">
      <Icon />
      <span>{label}</span>
    </a>
  );
};

/**
 * The left sidebar component
 */
const Sidebar: React.FC = () => {
  const [activeNav, setActiveNav] = useState('Home');

  return (
    <div>
      {/* Header */}
      <div>
        <span>MEMORA</span>
        <button>
          <Menu />
        </button>
      </div>

      {/* Navigation */}
      <nav>
        <NavItem
          icon={Home}
          label="Home"
          active={activeNav === 'Home'}
        />
        <NavItem
          icon={Library}
          label="Library"
          active={activeNav === 'Library'}
        />
        <NavItem
          icon={LayoutGrid}
          label="Categories"
          active={activeNav === 'Categories'}
        />
      </nav>

      {/* Streak Footer */}
      <div>
        <div>
          <p>
            Use MEMORA for 3 days to unlock streak.
          </p>
          <div>
            <Brain />
            <span>0 Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * The top header bar for the main content area
 */
const Header: React.FC = () => {
  return (
    <header>
      <div>
        {/* Search Bar */}
        <div>
          <div>
            <Search />
          </div>
          <input
            type="text"
            placeholder="Search for titles, authors, categories..."
          />
        </div>

        {/* Header Actions */}
        <div>
          <button>
            <Plus />
          </button>
          <button>
            <User />
          </button>
        </div>
      </div>
    </header>
  );
};

/**
 * Card for the "Recents" section
 */
interface RecentDeckCardProps {
  title: string;
  items: number;
  author: string;
}

const RecentDeckCard: React.FC<RecentDeckCardProps> = ({ title, items, author }) => {
  return (
    <div>
      <div>
        <div>
          <BookOpen />
        </div>
        <div>
          <h3>
            {title}
          </h3>
          <p>
            {items} items - {author}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Placeholder card for the "Categories" section
 */
const CategoryCard: React.FC = () => {
  return (
    <div>
      {/* This is a visual placeholder, matching the image */}
    </div>
  );
};

/**
 * Main Application Component
 */
export default function App() {
  // Use state to hold decks and categories, starting empty.
  const [decks, setDecks] = useState<RecentDeckCardProps[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");      // not logged in → go to login
      } else {
        setAuthed(true);
      }
      setChecking(false);
    });
    return () => off();
  }, [router]);

  if (checking) return null;     // or a loader
  if (!authed) return null;      // router already sent them away

  return (
    <div>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div>
        {/* Top Header */}
        <Header />

        {/* Scrollable Content */}
        <main>
          {/* Recents Section */}
          <section>
            <h2>
              Recents
            </h2>
            {decks.length === 0 ? (
              <div>
                <div>
                  <p>No recent decks.</p>
                  <p>Create a new deck to get started!</p>
                </div>
              </div>
            ) : (
              <div>
                {decks.map((deck, index) => (
                  <RecentDeckCard
                    key={index}
                    title={deck.title}
                    items={deck.items}
                    author={deck.author}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Categories Section */}
          <section>
            <h2>
              Categories
            </h2>
            {categories.length === 0 ? (
              <div>
                <p>No categories added yet.</p>
              </div>
            ) : (
              <div>
                {categories.map((_, index) => (
                  <CategoryCard key={index} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}