export default function SignUpPage() {
  return (
    <div className="center-page">
        <div className="auth-container">
            <h2>Sign Up</h2>
            <input type="text" placeholder="Full Name" className="auth-input" />
            <input type="email" placeholder="Email" className="auth-input" />
            <input type="password" placeholder="Password" className="auth-input" />
            <input type="password" placeholder="Confirm Password" className="auth-input" />

            <div>
                <button className="auth-button">Sign Up</button>
                <button className="auth-button">Cancel</button>
            </div>
        </div>
    </div>
  );
}
