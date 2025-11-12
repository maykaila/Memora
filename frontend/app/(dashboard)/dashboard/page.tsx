"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { BookOpen } from "lucide-react";
import styles from "./dashboardLayout.module.css";

interface Deck {
  title: string;
  items: number;
  owner: string;
}

// 🔹 For now, some mock data so UX isn’t empty.
// You can later replace these with real data from your API.
const mockRecents: Deck[] = [
  {
    title: "Introduction to Programming",
    items: 120,
    owner: "you",
  },
  {
    title: "Programming II",
    items: 120,
    owner: "you",
  },
  {
    title: "Data Structures and Algorithm",
    items: 200,
    owner: "you",
  },
  {
    title: "Network Security",
    items: 200,
    owner: "you",
  },
  {
    title: "Object-Oriented Programming",
    items: 170,
    owner: "alexa548",
  },
  {
    title: "Advanced Mobile Development",
    items: 170,
    owner: "alexa548",
  },
];

// For Library placeholders we only care about layout (cards)
const mockLibrary: Deck[] = []; // set to [] to show "empty" msg, or fill with decks
// const mockLibrary: Deck[] = mockRecents; // example if you want cards

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setAuthed(true);
      }
      setChecking(false);
    });
    return () => off();
  }, [router]);

  if (checking || !authed) return null;

  const recents = mockRecents;   // later: from backend
  const library = mockLibrary;   // later: from backend

  return (
    <div className={styles.dashboardContent}>
      {/* Recents */}
      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Recents</h2>

        {recents.length === 0 ? (
          <p className={styles.emptyText}>
            You don&apos;t have any recent decks yet. Use the + button to create
            your first flashcard set.
          </p>
        ) : (
          <div className={styles.recentsGrid}>
            {recents.map((deck, index) => (
              <div key={index} className={styles.recentCard}>
                <div className={styles.recentIcon}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className={styles.recentTitle}>{deck.title}</div>
                  <div className={styles.recentMeta}>
                    {deck.items} items · by {deck.owner}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Library */}
      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Library</h2>

        {library.length === 0 ? (
          <>
            <p className={styles.emptyText}>
              Your library is empty. Create a flashcard set or folder from the
              + menu to see it here.
            </p>
            <div className={styles.libraryGrid}>
              {/* subtle placeholder blocks just like the mock */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.libraryPlaceholder} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.libraryGrid}>
            {library.map((deck, i) => (
              <div key={i} className={styles.libraryCard}>
                <div className={styles.recentTitle}>{deck.title}</div>
                <div className={styles.recentMeta}>
                  {deck.items} items · by {deck.owner}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
