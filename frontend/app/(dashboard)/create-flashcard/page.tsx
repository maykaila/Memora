"use client";

import { useState } from "react";
import styles from "./createFlashcard.module.css";
import { auth } from "../../../initializeFirebase";
import { useRouter } from "next/navigation";

interface Card {
  id: number;
  term: string;
  definition: string;
}

export default function CreateFlashcardPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<Card[]>([
    { id: 1, term: "", definition: "" },
    { id: 2, term: "", definition: "" },
  ]);

  // 3. Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, term: "", definition: "" },
    ]);
  };

  const updateCard = (id: number, field: "term" | "definition", value: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const removeCard = (id: number) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  // 4. Implement the handleSave function
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // --- Validation ---
    if (!title) {
      // setError("Please add a title.");
      alert("Please add a title."); // comment once testing is done
      setIsLoading(false);
      return;
    }
    const validCards = cards.filter(c => c.term && c.definition);
    if (validCards.length === 0) {
      // setError("Please add at least one card with a term and definition.");
      alert("Please add at least one card with a term and definition.");
      setIsLoading(false);
      return;
    }

    // --- Get Auth Token ---
    // could be commented out bc users cant access this page without logging in man
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to create a deck.");
      setIsLoading(false);
      // You could redirect to login here
      router.push('/login');
      return;
    }
    const idToken = await user.getIdToken();

    // --- Format Data for Backend ---
    const cardData = validCards.map(card => ({
      Term: card.term,
      Definition: card.definition,
      // We'll skip ImageUrl for now
    }));

    const body = JSON.stringify({
      Title: title,
      Description: description,
      Visibility: false, // Hardcode for now
      Cards: cardData,
    });

    // --- Send to Backend ---
    try {
      const response = await fetch('http://localhost:5261/api/flashcardsets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: body,
      });

      if (!response.ok) {
        // Try to get error message from backend
        let errorMessage = "Failed to save deck.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("Could not parse error response", jsonError);
        }
        throw new Error(errorMessage);
      }

      // Uncomment alert once testing is done
      alert("Deck saved successfully!");
      router.push('/dashboard'); // dashboard for now, might change in the future

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.layout} onSubmit={handleSave}>
        {/* LEFT SIDE */}
        <section className={styles.leftColumn}>
          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>Create a new Flashcard</h2>
            <input
              className={styles.input}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Write a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.panel}>
            <h3 className={styles.sectionSubtitle}>Manage access</h3>
            <p className={styles.muted}>
              (Optional) Choose who can view or edit this deck.
            </p>
            <div className={styles.accessBox}>
              {/* slot for future access controls */}
              <span className={styles.muted}>Access settings coming soon.</span>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className={styles.rightColumn}>
          <div className={styles.toolbar}>
            <div className={styles.iconCircle}>≡</div>
            <div className={styles.iconCircle}>⇄</div>
            <button
              type="button"
              className={styles.addButton}
              onClick={addCard}
            >
              Add a card
            </button>
          </div>

          <div className={styles.cardsList}>
            {cards.map((card, index) => (
              <div key={card.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIndex}>{index + 1}</span>
                  <div className={styles.cardIcons}>
                    {/* duplicate icon space if needed */}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => removeCard(card.id)}
                      aria-label="Delete card"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.fieldGroup}>
                    <input
                      className={styles.smallInput}
                      placeholder="Enter term"
                      value={card.term}
                      onChange={(e) =>
                        updateCard(card.id, "term", e.target.value)
                      }
                    />
                    <span className={styles.fieldLabel}>Term</span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <input
                      className={styles.smallInput}
                      placeholder="Enter definition"
                      value={card.definition}
                      onChange={(e) =>
                        updateCard(card.id, "definition", e.target.value)
                      }
                    />
                    <span className={styles.fieldLabel}>Definition</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.secondaryAction}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryAction}>
              Save deck
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
