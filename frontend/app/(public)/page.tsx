"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../initializeFirebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./landingPage.module.css";
import Image from "next/image";
import heroImage from "../../public/1.svg"; 
import { Pencil, Users, FolderOpen, ArrowRight, ChevronDown } from "lucide-react"; 

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
      {/* HERO SECTION - Now takes full height */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>
            Study smarter with <span className={styles.highlight}>Memora</span>
          </h1>
          <p className={styles.subtitle}>
            The simple way to create, organize, and share flashcards. 
            Perfect for independent learners and classrooms.
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

        {/* SCROLL INDICATOR ARROW */}
        <div className={styles.scrollIndicator}>
            <span style={{ fontSize: '0.8rem', marginBottom: '5px', fontWeight: 600 }}>Learn more</span>
            <ChevronDown size={28} />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.features}>
        <h2 className={styles.featuresHeader}>Why choose Memora?</h2>
        
        <div className={styles.featureList}>
          
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <Pencil size={32} strokeWidth={2} />
            </div>
            <div className={styles.featureContent}>
              <h3>Simple creation</h3>
              <p>
                Build your flashcards exactly the way you want. 
                Our manual editor gives you full control to create, edit, and 
                format your terms and definitions without unnecessary complexity.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <Users size={32} strokeWidth={2} />
            </div>
            <div className={styles.featureContent}>
              <h3>Classroom connected</h3>
              <p>
                Teachers can create classes and assign decks directly to students. 
                Students simply enter a class code to join and automatically see 
                everything their teacher has assigned.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <FolderOpen size={32} strokeWidth={2} />
            </div>
            <div className={styles.featureContent}>
              <h3>Organized library</h3>
              <p>
                Keep your study materials structured. Access your most recently 
                used decks instantly or organize your flashcard sets into 
                custom folders for easy retrieval.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className={styles.bottomCta}>
            <h3>Ready to start learning?</h3>
            <Link href="/signup" className={styles.textLink}>
                Create your free account <ArrowRight size={18} />
            </Link>
        </div>
      </section>
    </div>
  );
}