import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="center-page">
      <div className="auth-container">
        <h2>Login</h2>
        <input type="email" placeholder="Email" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />
        
        <Link href="/forgot-password" className="auth-link">Forgot Password?</Link>
        
        <button className="auth-button">Login</button>
        <p className="logo-placeholder">Logo somewhere here</p>
      </div>
    </div>
  );
}
