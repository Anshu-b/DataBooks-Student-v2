import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeacherAuth } from "../../hooks/useTeacherAuth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a2e;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(99, 62, 130, 0.35) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(22, 90, 150, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(180, 80, 120, 0.2) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .login-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .login-card {
    position: relative;
    width: 420px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 48px 44px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.05) inset,
      0 40px 80px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(100, 60, 140, 0.2);
    animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }

  .login-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(140, 90, 200, 0.2);
    border: 1px solid rgba(160, 110, 220, 0.35);
    border-radius: 100px;
    padding: 4px 14px 4px 10px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c4a0f0;
    margin-bottom: 20px;
  }

  .login-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a070e0;
    box-shadow: 0 0 6px #a070e0;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: #f0ece8;
    margin: 0 0 6px 0;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .login-subtitle {
    font-size: 14px;
    color: rgba(200, 190, 210, 0.6);
    margin: 0 0 36px 0;
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 10px;
  }

  .field-wrapper {
    position: relative;
  }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.7);
    margin-bottom: 7px;
  }

  .field-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #f0ece8;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .field-input::placeholder {
    color: rgba(200, 185, 220, 0.3);
  }

  .field-input:focus {
    border-color: rgba(160, 110, 230, 0.6);
    background: rgba(255, 255, 255, 0.09);
    box-shadow: 0 0 0 3px rgba(140, 90, 200, 0.15);
  }

  .error-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(220, 60, 80, 0.12);
    border: 1px solid rgba(220, 60, 80, 0.3);
    border-radius: 10px;
    padding: 10px 14px;
    margin: 14px 0 0;
    color: #f08090;
    font-size: 13px;
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-4px); }
    75%       { transform: translateX(4px); }
  }

  .submit-btn {
    width: 100%;
    padding: 15px;
    margin-top: 24px;
    background: linear-gradient(135deg, #8b4fcf 0%, #5b6ef5 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(100, 70, 200, 0.35);
    position: relative;
    overflow: hidden;
  }

  .submit-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    border-radius: inherit;
  }

  .submit-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(100, 70, 200, 0.45);
  }

  .submit-btn:active {
    transform: translateY(0);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0 20px;
    color: rgba(200, 185, 220, 0.3);
    font-size: 12px;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  .toggle-link {
    text-align: center;
    font-size: 13.5px;
    color: rgba(200, 185, 220, 0.6);
  }

  .toggle-link button {
    background: none;
    border: none;
    color: #b08ae0;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s;
  }

  .toggle-link button:hover {
    color: #c8a8f4;
  }

  .back-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    padding: 7px 14px 7px 10px;
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f0ece8;
  }
`;

function TeacherLoginPage() {
  const navigate = useNavigate();
  const { login, register } = useTeacherAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit() {
    try {
      setError("");
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate("/teacher");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <main className="login-root">
        <button className="back-btn" onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="login-card">
          <div className="login-badge">
            <span className="login-badge-dot" />
            Teacher Portal
          </div>

          <h2 className="login-title">
            {isRegister ? "Create your\naccount" : "Welcome\nback"}
          </h2>
          <p className="login-subtitle">
            {isRegister
              ? "Sign up to manage your classes"
              : "Sign in to your teaching dashboard"}
          </p>

          <div className="field-group">
            <div className="field-wrapper">
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="field-wrapper">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#f08090"/>
                <path d="M7 4v3.5" stroke="#f08090" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="10" r="0.75" fill="#f08090"/>
              </svg>
              {error}
            </div>
          )}

          <button className="submit-btn" onClick={handleSubmit}>
            {isRegister ? "Create Account" : "Sign In"}
          </button>

          <div className="divider">or</div>

          <p className="toggle-link">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button onClick={() => { setIsRegister(!isRegister); setError(""); }}>
              {isRegister ? "Sign in" : "Register"}
            </button>
          </p>
        </div>
      </main>
    </>
  );
}

export default TeacherLoginPage;