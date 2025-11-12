"use client";

import { useState } from "react";
import styles from "./createFlashcard.module.css";

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send to backend
    console.log({ title, description, cards });
    alert("Flashcard set saved (stub). Hook this up to your API.");
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
