"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../../initializeFirebase";
import { onAuthStateChanged } from "firebase/auth";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";

export default function OverviewOfCardsPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const router = useRouter();

  const [setData, setSetData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // menu + edit mode states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // edit inputs
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTerms, setEditTerms] = useState<string[]>([]);
  const [editDefinitions, setEditDefinitions] = useState<string[]>([]);

  /* ============================= */
  /*       NORMALIZERS             */
  /* ============================= */

  const normalizeSet = (raw: any) => ({
    id: raw.setId || raw.id,
    title: raw.title,
    description: raw.description,
    createdBy: raw.createdBy,
    createdByUID: raw.userId,
    tags: raw.tagIds || [],
  });

  const normalizeCard = (c: any) => ({
      id: c.cardId || c.id,
      term: c.term,
      definition: c.definition,
  });


  /* ============================= */
  /*          API CALLS            */
  /* ============================= */

  const fetchSetDetails = async (id: string) => {
    const res = await fetch(`http://localhost:5261/api/flashcardsets/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) return null;
    return normalizeSet(await res.json());
  };

  const fetchCards = async (id: string) => {
    const res = await fetch(
      `http://localhost:5261/api/flashcardsets/${id}/cards`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: any) => normalizeCard(c));
  };

  /* ============================= */
  /*         LOAD DATA             */
  /* ============================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    const loadAll = async () => {
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

        // load edit fields
        setEditTitle(setInfo.title);
        setEditDescription(setInfo.description);
        setEditTerms(cardList.map((c: any) => c.term));
        setEditDefinitions(cardList.map((c: any) => c.definition));
      } catch (err) {
        setError("Failed to load flashcard set.");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    return () => unsub();
  }, [setId]);

  /* ============================= */
  /*            LOGIC              */
  /* ============================= */

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  const loggedInUID = firebaseUser?.uid;
  const isOwner =
    loggedInUID &&
    setData?.createdByUID &&
    setData.createdByUID === loggedInUID;

  /* ============================= */
  /*      UPDATE & DELETE          */
  /* ============================= */

  const handleUpdateSet = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const updatedCards = cards.map((c, i) => ({
        id: c.id,
        term: editTerms[i],
        definition: editDefinitions[i],
      }));

      const res = await fetch(
        `http://localhost:5261/api/flashcardsets/${setId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            cards: updatedCards,
          }),
        }
      );

      if (!res.ok) return alert("Failed to update set.");

      // Update UI instantly
      setSetData((prev: any) => ({
        ...prev,
        title: editTitle,
        description: editDescription,
      }));

      setCards(updatedCards);
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDeleteSet = async () => {
    if (!confirm("Delete this entire flashcard set?")) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        `http://localhost:5261/api/flashcardsets/${setId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return alert("Failed to delete set.");
      router.push("/library");
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================= */
  /*            UI                 */
  /* ============================= */

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 30,
          marginTop: 30,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            flex: "1 1 40%",
            background: "#fff",
            padding: 40,
            borderRadius: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            minWidth: 300,
            position: "relative",
          }}
        >
          {/* EDIT MODE */}
          {isEditMode ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  fontSize: 22,
                  fontWeight: 600,
                }}
              />

              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  minHeight: 120,
                  fontSize: 16,
                }}
              />

              <div style={{ marginTop: 20 }}>
                <h3>Edit Cards</h3>
                {cards.map((card, i) => (
                  <div key={card.id} style={{ marginBottom: 20 }}>
                    <input
                      value={editTerms[i]}
                      onChange={(e) =>
                        setEditTerms((prev) => {
                          const copy = [...prev];
                          copy[i] = e.target.value;
                          return copy;
                        })
                      }
                      placeholder="Term"
                      style={{
                        width: "100%",
                        padding: 10,
                        marginBottom: 6,
                        border: "1px solid #ccc",
                        borderRadius: 6,
                      }}
                    />

                    <input
                      value={editDefinitions[i]}
                      onChange={(e) =>
                        setEditDefinitions((prev) => {
                          const copy = [...prev];
                          copy[i] = e.target.value;
                          return copy;
                        })
                      }
                      placeholder="Definition"
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #ccc",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                ))}
              </div>


              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={handleUpdateSet}
                  style={{
                    background: "#4A1942",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                  }}
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setEditTitle(setData.title);
                    setEditDescription(setData.description);
                  }}
                  style={{
                    background: "#ccc",
                    color: "#333",
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>
                {setData.title}
              </h1>
              <p style={{ color: "#555", marginTop: 8 }}>
                {setData.description}
              </p>

              {/* MENU BUTTON */}
              {isOwner && (
                <div style={{ position: "absolute", top: 20, right: 20 }}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <MoreHorizontal size={24} />
                  </button>

                  {isMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 35,
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        minWidth: 150,
                        zIndex: 5,
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsEditMode(true);
                          setIsMenuOpen(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={16} /> Edit Deck
                      </button>

                      <button
                        onClick={handleDeleteSet}
                        style={{
                          padding: "10px 14px",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          cursor: "pointer",
                          color: "red",
                        }}
                      >
                        <Trash2 size={15} /> Delete Deck
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {setData.createdBy && (
            <p style={{ marginTop: 15, color: "#777" }}>
              Created by: <i>{setData.createdBy}</i>
            </p>
          )}

          {setData.tags.length > 0 && (
            <p style={{ marginTop: 6, color: "#6a0dad", fontStyle: "italic" }}>
              {setData.tags.join(", ")}
            </p>
          )}

          <button
            onClick={() => router.push(`/flashcards/${setId}`)}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              background: "#4A1942",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Flashcards
          </button>
        </div>

        {/* RIGHT COLUMN – TERMS */}
        <div
          style={{
            flex: "1 1 55%",
            background: "#fff",
            padding: 40,
            borderRadius: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            minWidth: 350,
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 10 }}>
            Terms & Definitions
          </h2>

          {cards.length === 0 ? (
            <p style={{ color: "#999" }}>No cards available.</p>
          ) : (
            <div>
              {cards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong style={{ fontSize: 16 }}>{card.term}</strong>
                  <p style={{ marginTop: 5, color: "#444" }}>
                    {card.definition}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}