"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function FlashcardPage() {
  const { id } = useParams();
  const setId = id as string;

  const [cards, setCards] = useState<any[]>([]);
  const [setName, setSetName] = useState("");
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  /** Fetch cards from backend API */
  const fetchCards = async () => {
    const res = await fetch(
      `https://memora-api.dcism.org/api/flashcardsets/${setId}/cards`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (!res.ok) {
      console.error("Failed to fetch cards");
      return;
    }

    const data = await res.json();

    const normalized = data.map((c: any) => ({
      id: c.cardId || c.id,
      term: c.term,
      definition: c.definition,
    }));

    setCards(normalized);
    setLoading(false);
  };

  /** Fetch set info */
  const fetchSetInfo = async () => {
    const res = await fetch(
      `https://memora-api.dcism.org/api/flashcardsets/${setId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (!res.ok) {
      console.error("Failed to fetch set info");
      return;
    }

    const data = await res.json();
    setSetName(data.name || data.title || "Flashcards");
  };

  useEffect(() => {
    fetchCards();
    fetchSetInfo();
  }, []);

  const nextCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1 < cards.length ? prev + 1 : 0));
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev - 1 >= 0 ? prev - 1 : cards.length - 1));
  };

  const shuffleCards = () => {
    setFlipped(false);
    setCurrent(0);
    setCards([...cards].sort(() => Math.random() - 0.5));
  };

  /** SWIPE HANDLER */
  let touchStartX = 0;

  const handleTouchStart = (e: any) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: any) => {
    const dist = e.changedTouches[0].clientX - touchStartX;
    if (dist > 50) prevCard();
    if (dist < -50) nextCard();
  };

  if (loading) return <p>Loading flashcards...</p>;
  if (cards.length === 0) return <p>No flashcards available.</p>;

  const currentCard = cards[current];
  const progress = ((current + 1) / cards.length) * 100;

  return (
    <div
      style={pageWrapper}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h2 style={title}>{setName}</h2>

      {/* Progress Bar */}
      <div style={progressBarContainer}>
        <div style={{ ...progressBarFill, width: `${progress}%` }} />
      </div>
      <p style={{ fontSize: 14, marginTop: 5 }}>
        {current + 1} / {cards.length}
      </p>

      {/* FLASHCARD */}
      <motion.div
        style={flashcard}
        onClick={() => setFlipped(!flipped)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {!flipped ? (
          <div style={front}>
            <strong style={cardText}>{currentCard.definition}</strong>
          </div>
        ) : (
          <div style={back}>
            <strong style={cardText}>{currentCard.term}</strong>
          </div>
        )}
      </motion.div>

      {/* CONTROLS */}
      <div style={buttonRow}>
        <button style={btn} onClick={prevCard}>⟵ Previous</button>
        <button style={btn} onClick={shuffleCards}>🔀 Shuffle</button>
        <button style={btn} onClick={nextCard}>Next ⟶</button>
      </div>
    </div>
  );
}

/* ===================== */
/*        STYLES         */
/* ===================== */

const pageWrapper = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  paddingTop: 40,
};

const title = {
  marginBottom: 20,
  fontSize: 26,
  fontWeight: 700,
};

const flashcard = {
  width: 700,
  height: 400,
  backgroundColor: "white",
  borderRadius: 16,
  boxShadow: "0px 6px 16px rgba(0,0,0,0.15)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  transformStyle: "preserve-3d" as const,
  marginTop: 20,
  position: "relative" as const,
};

const cardText = {
  fontSize: 30,
  textAlign: "center" as const,
  lineHeight: 1.3,
};

const front = {
  backfaceVisibility: "hidden" as const,
  position: "absolute" as const,
  padding: 60,
};

const back = {
  backfaceVisibility: "hidden" as const,
  transform: "rotateY(180deg)",
  position: "absolute" as const,
  padding: 30,
};

const buttonRow = {
  display: "flex",
  gap: 15,
  marginTop: 30,
};

const btn = {
  padding: "12px 22px",
  background: "#4A1942",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600,
};

/* Progress Bar */
const progressBarContainer = {
  width: "80%",
  height: 10,
  background: "#eee",
  borderRadius: 5,
  overflow: "hidden",
  marginTop: 10,
};

const progressBarFill = {
  height: "100%",
  background: "#4A1942",
  transition: "0.3s",
};
