"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; // Assuming you have lucide-react installed
import { useEffect, useState } from "react";

export default function OverviewOfCardsPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id"); // Get the ID from the URL
  const router = useRouter();
  
  // Optional: A simple state to simulate fetching title later
  const [setTitle, setSetTitle] = useState("Loading Set...");

  useEffect(() => {
    if (setId) {
      // Placeholder: In the future, your groupmate will fetch the real set details here
      setSetTitle(`Flashcard Set #${setId.substring(0, 5)}...`); 
    }
  }, [setId]);

  return (
    <div style={{ padding: "40px" }}>

      {/* Placeholder Content */}
      <div style={{ 
        backgroundColor: "#fff", 
        padding: "40px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{setTitle}</h1>
        <p style={{ color: "#888", marginBottom: "30px" }}>
          This is the overview page for set ID: <strong>{setId}</strong>
        </p>
        
        <div style={{ 
          padding: "20px", 
          border: "2px dashed #ccc", 
          borderRadius: "8px", 
          backgroundColor: "#f9f9f9",
          color: "#aaa"
        }}>
          [Placeholder: Your groupmate will list the flashcards here]
        </div>
      </div>
    </div>
  );
}