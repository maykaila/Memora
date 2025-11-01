"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./headerFooter.module.css";
import { auth } from "../../initializeFirebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import logo from "../../images/memoralogoSVG.svg"; // adjust path if needed

export default function Navbar() {
  const [user, setUser] = useState<null | { email: string }>(null);
  const router = useRouter();

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u ? { email: u.email ?? "" } : null);
    });
    return () => off();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    router.push("/"); // after logout → landing page
  }

  const handleLogoClick = () => {
    if (user) {
      router.push("/dashboard"); // logged in → dashboard
    } else {
      router.push("/"); // not logged in → landing page
    }
  };

  return (
    <nav className={styles.navbar}>
      {/* ✅ Clickable logo (routes conditionally) */}
      <div
        className={styles.logo}
        style={{ cursor: "pointer" }}
        onClick={handleLogoClick}
      >
        <Image
          src={logo}
          alt="Memora Logo"
          width={150}
          height={28}
          quality={100}
          priority
        />
      </div>

      <div className={styles.links}>
        {user ? (
          <button
            onClick={handleLogout}
            className={styles.link}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link href="/login" className={styles.link}>
              Login
            </Link>
            <Link href="/signup" className={styles.link}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
