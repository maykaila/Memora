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
    if (user) router.push("/dashboard");
    else router.push("/");
  };

  return (
    <nav id="memora-nav" className={styles.navbar}>
      <div className={styles.navbarInner}>
        <div
          className={styles.logo}
          style={{ cursor: "pointer" }}
          onClick={handleLogoClick}
        >
          <Image
            src={logo}
            alt="Memora logo"
            width={120}
            height={25}
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
                color: "#fff",
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Login
              </Link>
              <Link
                href="/signup"
                className={`${styles.link} ${styles.signupButton}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
