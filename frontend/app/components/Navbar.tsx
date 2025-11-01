import styles from "./headerFooter.module.css";
import Link from "next/link";
import Image from "next/image";

import logo from '../../images/memoralogoSVG.svg'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Image 
          src={logo} 
          alt="Memora Logo" 
          width={178} 
          height={36}
          quality={100}
        />
      </div>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>Home</Link>
        <Link href="/login" className={styles.link}>Login</Link>
        <Link href="/signup" className={styles.link}>Sign Up</Link>
      </div>
    </nav>
  );
}
