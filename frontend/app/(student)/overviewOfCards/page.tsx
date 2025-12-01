"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OverviewOfCardsPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const router = useRouter();

  const [setData, setSetData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Normalize set object from backend */
  const normalizeSet = (raw: any) => ({
    id: raw.setId || raw.id,
    title: raw.title,
    description: raw.description,
    createdBy: raw.createdBy || raw.createdByUser || raw.owner || raw.ownerName,
    tags: raw.tagIds || raw.tag_ids || [],
  });

  /** Normalize card object */
  const normalizeCard = (raw: any) => ({
    id: raw.cardId || raw.id,
    term: raw.term,
    definition: raw.definition,
  });

  /** Fetch flashcard set info */
  const fetchSetDetails = async (id: string) => {
    const res = await fetch(`http://localhost:5261/api/flashcardsets/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return normalizeSet(data);
  };

  /** Fetch all cards in the set */
  const fetchCards = async (id: string) => {
    const res = await fetch(`http://localhost:5261/api/flashcardsets/${id}/cards`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) return [];
    const data = await res.json();

    return data.map((c: any) => normalizeCard(c));
  };

  /** Load set + cards */
  useEffect(() => {
    const loadData = async () => {
      if (!setId) return;

      try {
        const [setInfo, cardList] = await Promise.all([
          fetchSetDetails(setId),
          fetchCards(setId),
        ]);

        if (!setInfo) {
          setError("Flashcard set not found.");
          return;
        }

        setSetData(setInfo);
        setCards(cardList);
      } catch (err) {
        console.error(err);
        setError("Failed to load flashcard set.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setId]);

  if (loading) {
    return (
      <PageContainer>
        <p>Loading flashcards...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <p style={{ color: "red" }}>{error}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* FLASHCARD SET BOX */}
      <div style={cardContainer}>
        <h1 style={titleText}>{setData.title}</h1>

        <p style={subtitleText}>{setData.description}</p>

        {setData.createdBy && (
          <p style={{ color: "#777", fontSize: 14, marginBottom: 15 }}>
            Created by: <i>{setData.createdBy}</i>
          </p>
        )}

        {setData.tags.length > 0 && (
          <p style={tagStyle}>{setData.tags.join(", ")}</p>
        )}

        {/* BUTTON GROUP */}
        <div style={buttonGroup}>
          <PrimaryButton
            label="Flashcards"
            onClick={() => router.push(`/flashcards?id=${setId}`)}
          />
          <PrimaryButton
            label="Multiple Choice"
            onClick={() => router.push(`/multipleChoice?id=${setId}`)}
          />
          <PrimaryButton
            label="Quiz"
            onClick={() => router.push(`/quiz?id=${setId}`)}
          />
        </div>

        <h2 style={sectionTitle}>Terms & Definitions</h2>

        {/* TERMS LIST */}
        {cards.length === 0 ? (
          <p style={{ color: "#999" }}>No cards available.</p>
        ) : (
          <div style={{ marginTop: 10 }}>
            {cards.map((card) => (
              <div key={card.id} style={termItem}>
                <strong style={{ fontSize: 16 }}>{card.term}</strong>
                <p style={{ marginTop: 5, color: "#444" }}>{card.definition}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

/* ============================= */
/*      REUSABLE COMPONENTS      */
/* ============================= */

const PageContainer = ({ children }: any) => (
  <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: 900 }}>{children}</div>
  </div>
);

const PrimaryButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 20px",
      backgroundColor: "#4a1942",
      color: "white",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 14,
      transition: "0.2s",
    }}
    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
  >
    {label}
  </button>
);

/* ============================ */
/*            STYLES            */
/* ============================ */

const cardContainer = {
  backgroundColor: "#fff",
  padding: 40,
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
};

const titleText = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 10,
};

const subtitleText = {
  color: "#555",
  marginBottom: 5,
};

const tagStyle = {
  color: "#6a0dad",
  fontStyle: "italic",
  marginBottom: 20,
};

const buttonGroup = {
  display: "flex",
  gap: 15,
  margin: "20px 0 30px 0",
};

const sectionTitle = {
  fontSize: 20,
  marginTop: 20,
  marginBottom: 10,
};

const termItem = {
  padding: "12px 0",
  borderBottom: "1px solid #eee",
};