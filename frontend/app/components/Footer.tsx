import styles from "./headerFooter.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      © {new Date().getFullYear()} Memora. All rights reserved.
    </footer>
  );
}
    