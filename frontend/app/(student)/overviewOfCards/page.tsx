"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../../initializeFirebase";
import { onAuthStateChanged } from "firebase/auth";
import { Pencil } from "lucide-react";

export default function OverviewOfCardsPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const router = useRouter();

  const [setData, setSetData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // get the logged in user
  const loggedInUserUID = firebaseUser?.uid;
  console.log("Logged in UID:", loggedInUserUID);

  const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.uid || payload.userId || null;
    } catch {
      return null;
    }
  };
  

  /** Normalize set object from backend */
  const normalizeSet = (raw: any) => ({
    id: raw.setId || raw.id,
    title: raw.title,
    description: raw.description,
    createdBy: raw.createdBy,
    createdByUID: raw.userId, 
    tags: raw.tagIds || [],
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

  /* ============================= */
  /*             STYLES            */
  /* ============================= */ 

  const PageContainer = ({ children }: { children: React.ReactNode }) => {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
        {children}
      </div>
    );
  };

  const twoColumnWrapper = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 30,
    width: "65%",
    margin: "30px auto",
    flexWrap: "wrap" as const,
  };

  const leftColumn = {
    flex: "1 1 40%",
    backgroundColor: "#fff",
    padding: 50,
    borderRadius: 20,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    minWidth: 75,
    position: "relative" as const,
  };

  const rightColumn = {
    flex: "1 1 55%",
    backgroundColor: "#fff",
    padding: 50,
    borderRadius: 20,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    minWidth: 320,
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

  const editIconStyle = {
    position: "absolute" as const,
    top: 15,
    right: 15,
    cursor: "pointer",
    fontSize: 20,
    color: "#4a1942",
    opacity: 0.8,
    transition: "0.2s",
  };


  /* ============================= */
  /*      REUSABLE COMPONENTS      */
  /* ============================= */ 

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

  useEffect(() => {
    // listen for firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      console.log("Firebase Auth Loaded User:", user?.uid);
    });

    // load set and cards
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

      /** -----------------------------
     * TEMPORARY DEBUG: Decode JWT
     * ---------------------------- */
      const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            console.log("JWT PAYLOAD:", payload);
          } catch (err) {
            console.log("Could not parse JWT:", err);
          }
        } else {
          console.log("No token found.");
        }
    };

    loadData();

    return () => unsubscribe();
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

  const loggedInUID = firebaseUser?.uid;

  const isOwner =
    loggedInUID &&
    setData?.createdByUID &&
    setData.createdByUID === loggedInUID;

  console.log("Logged in user:", loggedInUID);
  console.log("Set created by:", setData?.createdBy);
  console.log("Is owner:", isOwner);
  console.log("Full setData:", setData);

  const handleEditSet = () => {
    router.push(`/edit-set/${setId}`);
  };

  return (
    <PageContainer>
      <div style={twoColumnWrapper}>
        
        {/* LEFT SIDE — SET INFORMATION */}
        <div style={leftColumn}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              gap: 10,
            }}
          >
            <h1 style={{ ...titleText, margin: 0 }}>{setData.title}</h1>

            {isOwner && (
              <button
                onClick={handleEditSet}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Pencil size={20} color="#4A1942" />
              </button>
            )}
          </div>

          <p style={subtitleText}>{setData.description}</p>

          {setData.createdBy && (
            <p style={{ color: "#777", fontSize: 14, marginBottom: 15 }}>
              Created by: <i>{setData.createdBy}</i>
            </p>
          )}

          {setData.tags.length > 0 && (
            <p style={tagStyle}>{setData.tags.join(", ")}</p>
          )}

          <div style={buttonGroup}>
            <PrimaryButton
              label="Flashcards"
              onClick={() => router.push(`/flashcards?id=${setId}`)}
            />
            {/* <PrimaryButton
              label="Multiple Choice"
              onClick={() => router.push(`/multipleChoice?id=${setId}`)}
            />
            <PrimaryButton
              label="Quiz"
              onClick={() => router.push(`/quiz?id=${setId}`)}
            /> */}
          </div>
        </div>

        {/* RIGHT SIDE — TERMS & DEFINITIONS */}
        <div style={rightColumn}>
          <h2 style={sectionTitle}>Terms & Definitions</h2>

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

      </div>
    </PageContainer>
  );
}