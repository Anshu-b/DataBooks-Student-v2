import { useNavigate } from "react-router-dom";
import { useRole } from "../state/RoleContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .role-select-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
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
    gap: 3rem;
  }

  .role-select-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  .role-hero {
    text-align: center;
    animation: fadeIn 0.6s ease both;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .role-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 800;
    color: #f0ece8;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .role-title span {
    background: linear-gradient(135deg, #b08ae0, #6b8ef5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .role-tagline {
    font-size: 15px;
    font-weight: 300;
    color: rgba(200, 190, 210, 0.55);
    letter-spacing: 0.04em;
    margin: 0;
  }

  .role-buttons {
    display: flex;
    gap: 1.5rem;
    animation: fadeIn 0.6s ease 0.15s both;
  }

  .role-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 40px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    color: #f0ece8;
    font-family: 'DM Sans', sans-serif;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-shadow: 
      0 0 0 1px rgba(255,255,255,0.05) inset,
      0 20px 40px rgba(0, 0, 0, 0.3);
    min-width: 200px;
  }

  .role-btn-icon {
    font-size: 48px;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
  }

  .role-btn:hover {
    transform: translateY(-4px);
    border-color: rgba(160, 110, 230, 0.4);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 
      0 0 0 1px rgba(255,255,255,0.08) inset,
      0 24px 48px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(140, 90, 200, 0.15);
  }

  .role-btn:active {
    transform: translateY(-2px);
  }
`;

function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  function choose(role: "student" | "teacher") {
    setRole(role);
    navigate("/");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="role-select-root">
        
        <div className="role-hero">
          <h1 className="role-title">
            Data<span>Organisms</span>
          </h1>
          <p className="role-tagline">Select your version to begin</p>
        </div>

        <div className="role-buttons">
          <button className="role-btn" onClick={() => choose("student")}>
            <span className="role-btn-icon">🎓</span>
            <span>Student</span>
          </button>

          <button className="role-btn" onClick={() => choose("teacher")}>
            <span className="role-btn-icon">🧑‍🏫</span>
            <span>Instructor</span>
          </button>
        </div>

      </div>
    </>
  );
}

export default RoleSelectPage;