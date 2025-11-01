//currently for checking if pages looks good this will be updated soon

import Link from "next/link";

export default function Home() {
  return (
    <div className="mainPage">
      <h2>Main Page</h2>

    <Link href="/signup" className="auth-link">Sign Up</Link>
    <Link href="/login" className="auth-link">Login</Link>
    <Link href="/dashboard/homepage" className="auth-link">Homepage</Link>

    </div>
  );
}
