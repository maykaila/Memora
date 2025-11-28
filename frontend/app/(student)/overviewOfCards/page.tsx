"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OverviewOfCardsPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const router = useRouter();

  const [title, setTitle] = useState("Loading...");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!setId) return;

    async function fetchSet() {
      try {
        const res = await fetch(`http://localhost:5261/api/flashcardsets/${setId}`);

        if (!res.ok) {
          console.error("Failed to fetch set");
          return;
        }

        const data = await res.json();

        setTitle(data.title);
        setDescription(data.description || "No description.");
        setCards(data.cards || []);
      } catch (err) {
        console.error("Error loading set:", err);
      }
    }

    fetchSet();
  }, [setId]);

  return (
    <div style={{ padding: "40px" }}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Title */}
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>{title}</h1>

        {/* Description */}
        <p style={{ color: "#666", marginBottom: "30px" }}>{description}</p>

        {/* Buttons */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "16px" }}>
          <button
            onClick={() => router.push(`/flashcards/practice?id=${setId}`)}
            style={buttonStyle}
          >
            Flashcards
          </button>

          <button
            onClick={() => router.push(`/flashcards/mcq?id=${setId}`)}
            style={buttonStyle}
          >
            Multiple Choice
          </button>

          <button
            onClick={() => router.push(`/flashcards/quiz?id=${setId}`)}
            style={buttonStyle}
          >
            Quiz
          </button>
        </div>

        {/* List of terms */}
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Terms</h2>

        {cards.length === 0 ? (
          <p>No flashcards available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cards.map((card, index) => (
              <li
                key={index}
                style={{
                  padding: "16px",
                  marginBottom: "12px",
                  backgroundColor: "#f7f7ff",
                  borderRadius: "8px",
                }}
              >
                <strong>{card.term}</strong>
                <p style={{ color: "#666", marginTop: "4px" }}>{card.definition}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#6a4dc4",
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
};