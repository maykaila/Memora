import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="center-page">
      <div className="auth-container">
        <h2>Login</h2>
        <input type="email" placeholder="Email" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />
        
        <Link href="/forgot-p" className="auth-link">Forgot Password?</Link>
        
        <button className="auth-button">Login</button>
      </div>
    </div>
  );
}
