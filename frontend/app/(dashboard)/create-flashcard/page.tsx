"use client";

import { useState } from "react";
import styles from "./createFlashcard.module.css";
import { auth } from "../../../initializeFirebase";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
=======
import { Globe, Lock } from "lucide-react"; 
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c

interface Card {
  id: number;
  term: string;
  definition: string;
}

export default function CreateFlashcardPage() {
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

<<<<<<< HEAD
  // 4. Implement the handleSave function
=======
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

<<<<<<< HEAD
    // --- Validation ---
    if (!title) {
      // setError("Please add a title.");
      alert("Please add a title."); // comment once testing is done
=======
    if (!title) {
      alert("Please add a title.");
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
      setIsLoading(false);
      return;
    }
    const validCards = cards.filter(c => c.term && c.definition);
    if (validCards.length === 0) {
<<<<<<< HEAD
      // setError("Please add at least one card with a term and definition.");
=======
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
      alert("Please add at least one card with a term and definition.");
      setIsLoading(false);
      return;
    }

<<<<<<< HEAD
    // --- Get Auth Token ---
    // could be commented out bc users cant access this page without logging in man
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to create a deck.");
      setIsLoading(false);
      // You could redirect to login here
=======
    const user = auth.currentUser;
    if (!user) {
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
      router.push('/login');
      return;
    }
    const idToken = await user.getIdToken();

<<<<<<< HEAD
    // --- Format Data for Backend ---
    const cardData = validCards.map(card => ({
      Term: card.term,
      Definition: card.definition,
      // We'll skip ImageUrl for now
=======
    const cardData = validCards.map(card => ({
      Term: card.term,
      Definition: card.definition,
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
    }));

    const body = JSON.stringify({
      Title: title,
      Description: description,
<<<<<<< HEAD
      Visibility: false, // Hardcode for now
      Cards: cardData,
    });

    // --- Send to Backend ---
=======
      Visibility: isPublic, 
      Cards: cardData,
    });

>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
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
<<<<<<< HEAD
        // Try to get error message from backend
=======
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c
        let errorMessage = "Failed to save deck.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("Could not parse error response", jsonError);
        }
        throw new Error(errorMessage);
      }

<<<<<<< HEAD
      // Uncomment alert once testing is done
      alert("Deck saved successfully!");
      router.push('/dashboard'); // dashboard for now, might change in the future
=======
      alert("Deck saved successfully!");
      router.push('/dashboard');
>>>>>>> 43eef863bc6be0f2f8b15964579ac7a9047f148c

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