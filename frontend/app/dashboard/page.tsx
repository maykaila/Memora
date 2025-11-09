"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Home,
  Library,
  LayoutGrid,
  Brain,
  Search,
  Plus,
  User,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "../../initializeFirebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./homepage.module.css";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, collapsed, active = false }) => (
  <a
    href="#"
    className={`${styles.navItem} ${active ? styles.active : ""}`}
    id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
  >
    <Icon className={styles.navItemIcon} />
    {!collapsed && <span className={styles.navItemLabel}>{label}</span>}
  </a>
);

const Sidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      id="sidebar"
    >
      {/* Header */}
      <div className={styles.sidebarHeader}>
        {!collapsed && <span className={styles.sidebarLogo}>MEMORA</span>}
        <button className={styles.menuBtn} id="menu-btn" onClick={onToggle}>
          <Menu />
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.navSection} id="nav-section">
        <NavItem icon={Home} label="Home" collapsed={collapsed} active={activeNav === "Home"} />
        <NavItem icon={Library} label="Library" collapsed={collapsed} active={activeNav === "Library"} />
        <NavItem icon={LayoutGrid} label="Categories" collapsed={collapsed} active={activeNav === "Categories"} />
      </nav>

      {/* Footer / Streak */}
      <div className={styles.sidebarFooter} id="streak-section">
        {!collapsed && <p className={styles.sidebarTip}>Use MEMORA for 3 days to unlock streak.</p>}
        <div className={styles.sidebarStreak}>
          <Brain className={styles.sidebarStreakIcon} />
          {!collapsed && <span className={styles.sidebarStreakText}>0 Streak</span>}
        </div>
      </div>
    </aside>
  );
};

const Header: React.FC = () => (
  <header className={styles.header} id="header">
    <div className={styles.searchBar}>
      <Search className={styles.searchIcon} />
      <input
        id="search-input"
        type="text"
        placeholder="Search for titles, authors, categories..."
        className={styles.searchInput}
      />
    </div>

    <div className={styles.headerActions}>
      <button className={styles.headerBtn} id="add-btn">
        <Plus />
      </button>
      <button className={styles.headerBtn} id="user-btn">
        <User />
      </button>
    </div>
  </header>
);

interface RecentDeckCardProps {
  title: string;
  items: number;
  author: string;
}

const RecentDeckCard: React.FC<RecentDeckCardProps> = ({ title, items, author }) => (
  <div className={styles.recentCard}>
    <div className={styles.recentCardInner}>
      <div className={styles.recentCardIcon}>
        <BookOpen />
      </div>
      <div className={styles.recentCardContent}>
        <h3 className={styles.recentCardTitle}>{title}</h3>
        <p className={styles.recentCardMeta}>
          {items} items - {author}
        </p>
      </div>
    </div>
  </div>
);

const CategoryCard: React.FC = () => <div className={styles.categoryCard}></div>;

export default function App() {
  const [decks, setDecks] = useState<RecentDeckCardProps[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setAuthed(true);
      setChecking(false);
    });
    return () => off();
  }, [router]);

  if (checking || !authed) return null;

  return (
    <div className={styles.homepage} id="homepage">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={styles.mainContent} id="main-content">
        <Header />
        <main className={styles.content} id="content">
          <section className={styles.recentsSection}>
            <h2 className={styles.sectionTitle}>Recents</h2>
            {decks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No recent decks.</p>
                <p>Create a new deck to get started!</p>
              </div>
            ) : (
              <div className={styles.recentsGrid}>
                {decks.map((deck, i) => (
                  <RecentDeckCard key={i} {...deck} />
                ))}
              </div>
            )}
          </section>

          <section className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>Categories</h2>
            {categories.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No categories added yet.</p>
              </div>
            ) : (
              <div className={styles.categoriesGrid}>
                {categories.map((_, i) => (
                  <CategoryCard key={i} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
