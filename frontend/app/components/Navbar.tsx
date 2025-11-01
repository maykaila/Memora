import styles from "./headerFooter.module.css";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Memora</div>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>Home</Link>
        <Link href="/login" className={styles.link}>Login</Link>
        <Link href="/signup" className={styles.link}>Sign Up</Link>
      </div>
    </nav>
  );
}
