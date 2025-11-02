"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../initializeFirebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./landingPage.module.css";
import Image from "next/image";
import heroImage from "../public/1.svg"; // replace with your own hero art

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
      else setChecking(false);
    });
    return () => off();
  }, [router]);

  if (checking) return null;

  return (
    <div className={styles.landing}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>
            Remember better with <span className={styles.highlight}>Memora</span>
          </h1>
          <p className={styles.subtitle}>
            Lightweight spaced-repetition flashcards and notes. Fast. Private.
            Cross-device.
          </p>

          <div className={styles.cta}>
            <Link href="/signup" className={`${styles.pill} ${styles.primary}`}>
              Get started
            </Link>
            <Link href="/login" className={`${styles.pill} ${styles.secondary}`}>
              I already have an account
            </Link>
          </div>
        </div>

        {/* IMAGE SIDE */}
        <div className={styles.heroImageWrapper}>
          <Image
            src={heroImage}
            alt="Fan of flashcards in Memora brand colors"
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Quick capture</h3>
            <p>Create decks and cards in seconds without leaving your flow.</p>
          </div>
          <div className={styles.card}>
            <h3>Smart reviews</h3>
            <p>Stay on track with gentle streaks and thoughtful reminders.</p>
          </div>
          <div className={styles.card}>
            <h3>Organized library</h3>
            <p>Tags & categories keep everything tidy and easy to find.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
