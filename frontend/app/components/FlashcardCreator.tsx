"use client";

import { useState } from "react";
import styles from "./createFlashcard.module.css";
// Adjust this path to wherever your firebase init file is relative to components/shared
import { auth } from "../../initializeFirebase"; 
import { useRouter } from "next/navigation";
import { Globe, Lock } from "lucide-react"; 

interface Card {
  id: number;
  term: string;
  definition: string;
}

interface FlashcardCreatorProps {
  role: "student" | "teacher";
}

export default function FlashcardCreator({ role }: FlashcardCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false); 
 
  const [cards, setCards] = useState<Card[]>([
  { id: 1, term: "", definition: "" },
  { id: 2, term: "", definition: "" },
  ]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title) {
      alert("Please add a title.");
      setIsLoading(false);
      return;
    }
    const validCards = cards.filter(c => c.term && c.definition);
    if (validCards.length === 0) {
      alert("Please add at least one card with a term and definition.");
      setIsLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }
    const idToken = await user.getIdToken();

    const cardData = validCards.map(card => ({
      Term: card.term,
      Definition: card.definition,
    }));

    const body = JSON.stringify({
      Title: title,
      Description: description,
      Visibility: isPublic, 
      Cards: cardData,
      // We can optionally send the role to the backend if needed
      CreatedByRole: role 
    });

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
      let errorMessage = "Failed to save deck.";
      try {
        // Attempt to read the detailed error message from the backend response body
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If the response isn't JSON, use the status text
        console.error("Could not parse error response", jsonError);
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // alert("Deck saved successfully!");
  
  // ROUTING LOGIC BASED ON ROLE
    if (role === "teacher") {
      router.push('/teacher-dashboard');
    } else {
      router.push('/dashboard');
    }

    } catch (err: any) {
    setError(err.message);
        // Added alert for immediate feedback on the detailed error
    // alert(`Error saving deck: ${err.message}`); 
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
            <h2 className={styles.sectionTitle}>
                {role === "teacher" ? "Create Class Deck" : "Create a new Flashcard"}
            </h2>
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
              Choose who can view this deck.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: !isPublic ? 'rgba(0,0,0,0.05)' : 'transparent',
                  border: !isPublic ? '1px solid #666' : '1px solid transparent'
                }}
              >
                <input 
                  type="radio" 
                  name="visibility" 
                  checked={!isPublic} 
                  onChange={() => setIsPublic(false)} 
                />
                <Lock size={18} />
                <div>
                  <span style={{display: 'block', fontWeight: 600}}>Private</span>
                  <span style={{fontSize: '0.85em', color: '#666'}}>Only you can see this.</span>
                </div>
              </label>

              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: isPublic ? 'rgba(0,0,0,0.05)' : 'transparent',
                  border: isPublic ? '1px solid #666' : '1px solid transparent'
                }}
              >
                <input 
                  type="radio" 
                  name="visibility" 
                  checked={isPublic} 
                  onChange={() => setIsPublic(true)} 
                />
                <Globe size={18} />
                <div>
                  <span style={{display: 'block', fontWeight: 600}}>Public Library</span>
                  <span style={{fontSize: '0.85em', color: '#666'}}>Anyone can view this deck.</span>
                </div>
              </label>
            </div>

          </div>
        </section>

        <section className={styles.rightColumn}>
          <div className={styles.toolbar}>
            <div className={styles.iconCircle}>≡</div>
            <div className={styles.iconCircle}>⇄</div>
            <button type="button" className={styles.addButton} onClick={addCard}>
              Add a card
            </button>
          </div>

          <div className={styles.cardsList}>
            {cards.map((card, index) => (
              <div key={card.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIndex}>{index + 1}</span>
                  <div className={styles.cardIcons}>
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
                      onChange={(e) => updateCard(card.id, "term", e.target.value)}
                    />
                    <span className={styles.fieldLabel}>Term</span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <input
                      className={styles.smallInput}
                      placeholder="Enter definition"
                      value={card.definition}
                      onChange={(e) => updateCard(card.id, "definition", e.target.value)}
                    />
                    <span className={styles.fieldLabel}>Definition</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.secondaryAction} onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryAction} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save deck"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}