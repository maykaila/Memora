export default function ForgotPasswordPage() {
  return (
    <div className="center-page">
        <div className="auth-container">
            <h2>Forgot Password</h2>
            <input type="email" placeholder="Enter your email" className="auth-input" />
            <button className="auth-button">Reset Password</button>
        </div>
    </div>
  );
}
