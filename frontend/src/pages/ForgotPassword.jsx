import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/password/forgot", {
        email: email.trim(),
      });

      setMessage(
        response.data?.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <style>{forgotStyles}</style>

      <div className="forgot-stars stars-one" aria-hidden="true" />
      <div className="forgot-stars stars-two" aria-hidden="true" />
      <div className="forgot-stars stars-three" aria-hidden="true" />
      <div className="forgot-nebula forgot-nebula-one" aria-hidden="true" />
      <div className="forgot-nebula forgot-nebula-two" aria-hidden="true" />
      <div className="forgot-grid" aria-hidden="true" />

      <main className="forgot-main">
        <section className="forgot-card" aria-labelledby="forgot-title">
          <div className="forgot-card-glow" aria-hidden="true" />

          <div className="forgot-brand">
            <div className="forgot-brand-mark" aria-hidden="true">
              <span className="brand-orbit orbit-a" />
              <span className="brand-orbit orbit-b" />
              <span className="brand-core">P</span>
            </div>
            <div>
              <div className="forgot-brand-name">PriyoniX</div>
              <div className="forgot-brand-caption">CRM PLATFORM</div>
            </div>
          </div>

          <div className="forgot-status">
            <span className="forgot-status-dot" />
            SECURE ACCOUNT RECOVERY
          </div>

          <h1 id="forgot-title">
            Forgot your
            <br />
            <span>password?</span>
          </h1>

          <p className="forgot-subtitle">
            Enter your registered email address and we’ll send you a secure
            password reset link.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="forgot-field">
              <label htmlFor="recovery-email">Email address</label>
              <input
                id="recovery-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                  if (message) setMessage("");
                }}
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="forgot-feedback forgot-error" role="alert">
                <span className="feedback-symbol">!</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="forgot-feedback forgot-success" role="status">
                <span className="feedback-symbol">✓</span>
                <span>{message}</span>
              </div>
            )}

            <button className="forgot-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="forgot-spinner" aria-hidden="true" />
                  Sending reset link…
                </>
              ) : (
                <>
                  Send Reset Link <span className="forgot-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <button
            className="forgot-back"
            type="button"
            onClick={() => navigate("/login")}
          >
            <span aria-hidden="true">←</span> Back to Login
          </button>

          <div className="forgot-footer">
            <div className="footer-divider">
              <span />
              <b>PRIYONIX CRM</b>
              <span />
            </div>
            <small>Secure access to your business universe.</small>
          </div>
        </section>
      </main>
    </div>
  );
}

const forgotStyles = `
  * { box-sizing: border-box; }

  .forgot-page {
    isolation: isolate;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    padding: 42px 22px;
    overflow: hidden;
    color: #f7f9ff;
    background:
      radial-gradient(circle at 22% 22%, rgba(76, 98, 238, .18), transparent 31%),
      radial-gradient(circle at 82% 78%, rgba(126, 58, 237, .19), transparent 32%),
      linear-gradient(135deg, #03091b 0%, #08142f 47%, #080d25 100%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .forgot-main {
    position: relative;
    z-index: 2;
    width: min(100%, 560px);
    margin: auto;
  }

  .forgot-stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-repeat: repeat;
  }

  .stars-one {
    opacity: .75;
    background-image: radial-gradient(circle, rgba(255,255,255,.95) 0 1px, transparent 1.7px);
    background-size: 113px 113px;
    background-position: 13px 28px;
    animation: forgotStarDrift 35s linear infinite;
  }

  .stars-two {
    opacity: .48;
    background-image: radial-gradient(circle, rgba(125,190,255,.9) 0 1px, transparent 1.8px);
    background-size: 177px 177px;
    background-position: 57px 71px;
    animation: forgotStarDrift 48s linear infinite reverse;
  }

  .stars-three {
    opacity: .38;
    background-image: radial-gradient(circle, rgba(197,164,255,.95) 0 1.2px, transparent 1.9px);
    background-size: 241px 241px;
    background-position: 103px 11px;
  }

  @keyframes forgotStarDrift {
    from { transform: translate3d(0, 0, 0); }
    to { transform: translate3d(-35px, 22px, 0); }
  }

  .forgot-nebula {
    position: absolute;
    z-index: 0;
    border-radius: 50%;
    filter: blur(75px);
    pointer-events: none;
  }

  .forgot-nebula-one {
    width: 350px;
    height: 300px;
    left: -130px;
    top: 10%;
    background: rgba(44, 93, 238, .17);
  }

  .forgot-nebula-two {
    width: 390px;
    height: 340px;
    right: -150px;
    bottom: -80px;
    background: rgba(116, 53, 235, .18);
  }

  .forgot-grid {
    position: absolute;
    z-index: 0;
    left: -10%;
    right: -10%;
    bottom: -250px;
    height: 440px;
    opacity: .12;
    pointer-events: none;
    transform: perspective(550px) rotateX(62deg);
    transform-origin: center bottom;
    background-image:
      linear-gradient(rgba(92, 126, 255, .42) 1px, transparent 1px),
      linear-gradient(90deg, rgba(92, 126, 255, .42) 1px, transparent 1px);
    background-size: 72px 72px;
  }

  .forgot-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    padding: 42px 46px 30px;
    border: 1px solid rgba(151, 174, 255, .25);
    border-radius: 28px;
    background: linear-gradient(145deg, rgba(21, 31, 72, .96), rgba(9, 17, 43, .97));
    box-shadow: 0 32px 90px rgba(0, 0, 0, .43), inset 0 1px 0 rgba(255,255,255,.055);
    backdrop-filter: blur(24px);
  }

  .forgot-card::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: -150px;
    right: -115px;
    width: 310px;
    height: 310px;
    border-radius: 50%;
    background: rgba(92, 85, 255, .16);
    filter: blur(55px);
    pointer-events: none;
  }

  .forgot-card-glow {
    position: absolute;
    top: 0;
    left: 12%;
    right: 12%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6e8cff, #ae8cff, transparent);
    box-shadow: 0 0 18px rgba(117, 137, 255, .58);
    pointer-events: none;
  }

  .forgot-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 34px;
  }

  .forgot-brand-mark {
    position: relative;
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    border: 1px solid rgba(187, 205, 255, .4);
    border-radius: 15px;
    background: linear-gradient(140deg, #2e6ef2, #7650f1);
    box-shadow: 0 9px 25px rgba(70, 91, 239, .27);
  }

  .brand-core {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 29px;
    height: 29px;
    border-radius: 50%;
    color: #254bbd;
    background: #fff;
    font-size: 18px;
    font-weight: 950;
    font-style: italic;
  }

  .brand-orbit {
    position: absolute;
    z-index: 1;
    width: 38px;
    height: 16px;
    border: 1px solid rgba(223, 232, 255, .8);
    border-radius: 50%;
    transform: rotate(-28deg);
  }

  .brand-orbit.orbit-b {
    width: 41px;
    height: 22px;
    border-color: rgba(137, 235, 255, .75);
    transform: rotate(30deg);
  }

  .forgot-brand-name {
    color: #fff;
    font-size: 21px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -.5px;
  }

  .forgot-brand-caption {
    margin-top: 5px;
    color: #879bc2;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .13em;
  }

  .forgot-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(80, 218, 177, .2);
    border-radius: 999px;
    color: #7ee7c2;
    background: rgba(19, 153, 116, .08);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .09em;
  }

  .forgot-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #34dfad;
    box-shadow: 0 0 11px rgba(52, 223, 173, .9);
    animation: forgotStatusPulse 1.8s ease-in-out infinite;
  }

  @keyframes forgotStatusPulse {
    0%, 100% { opacity: .65; transform: scale(.85); }
    50% { opacity: 1; transform: scale(1.15); }
  }

  .forgot-card h1 {
    margin: 22px 0 0;
    color: #f7f8ff;
    font-size: clamp(35px, 5vw, 43px);
    line-height: 1.03;
    font-weight: 950;
    letter-spacing: -1.8px;
  }

  .forgot-card h1 span {
    color: #a59aff;
  }

  .forgot-subtitle {
    margin: 16px 0 30px;
    max-width: 420px;
    color: #9caccb;
    font-size: 13px;
    line-height: 1.75;
    font-weight: 500;
  }

  .forgot-field label {
    display: block;
    margin-bottom: 9px;
    color: #c2cde4;
    font-size: 11px;
    font-weight: 850;
  }

  .forgot-field input {
    display: block;
    width: 100%;
    height: 54px;
    padding: 0 16px;
    border: 1px solid rgba(143, 166, 220, .27);
    border-radius: 12px;
    outline: none;
    color: #f6f8ff;
    background: rgba(4, 12, 32, .76);
    font: inherit;
    font-size: 13px;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }

  .forgot-field input::placeholder {
    color: #7486aa;
    opacity: 1;
  }

  .forgot-field input:focus {
    border-color: #718dff;
    background: rgba(6, 15, 39, .94);
    box-shadow: 0 0 0 3px rgba(102, 126, 255, .13), 0 0 24px rgba(102, 126, 255, .07);
  }

  .forgot-field input:-webkit-autofill,
  .forgot-field input:-webkit-autofill:hover,
  .forgot-field input:-webkit-autofill:focus {
    -webkit-text-fill-color: #f6f8ff;
    caret-color: #f6f8ff;
    box-shadow: 0 0 0 1000px #0a1735 inset;
    transition: background-color 9999s ease-out;
  }

  .forgot-feedback {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-top: 13px;
    padding: 12px 13px;
    border-radius: 11px;
    font-size: 12px;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  .feedback-symbol {
    display: grid;
    place-items: center;
    width: 19px;
    height: 19px;
    flex: 0 0 19px;
    border-radius: 50%;
    font-weight: 900;
  }

  .forgot-error {
    color: #ffc0c5;
    border: 1px solid rgba(255, 108, 128, .24);
    background: rgba(132, 30, 54, .18);
  }

  .forgot-error .feedback-symbol {
    color: #ffd8dc;
    background: rgba(255, 107, 128, .2);
  }

  .forgot-success {
    color: #b9f7dc;
    border: 1px solid rgba(74, 222, 163, .23);
    background: rgba(20, 111, 77, .17);
  }

  .forgot-success .feedback-symbol {
    color: #c8ffe9;
    background: rgba(74, 222, 163, .2);
  }

  .forgot-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 53px;
    margin-top: 22px;
    padding: 0 18px;
    border: 0;
    border-radius: 12px;
    color: #fff;
    background: linear-gradient(100deg, #2e6ef0, #6248e9 56%, #7c43ed);
    box-shadow: 0 13px 28px rgba(64, 80, 222, .28);
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
  }

  .forgot-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 17px 34px rgba(64, 80, 222, .38);
  }

  .forgot-submit:disabled {
    opacity: .7;
    cursor: wait;
  }

  .forgot-arrow {
    font-size: 19px;
    line-height: 1;
  }

  .forgot-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: forgotSpin .7s linear infinite;
  }

  @keyframes forgotSpin { to { transform: rotate(360deg); } }

  .forgot-back {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 42px;
    margin-top: 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    color: #9fb9ff;
    background: transparent;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    transition: background .2s ease, border-color .2s ease, color .2s ease;
  }

  .forgot-back:hover {
    color: #fff;
    border-color: rgba(132, 153, 255, .17);
    background: rgba(255,255,255,.04);
  }

  .forgot-footer {
    margin-top: 23px;
    padding-top: 20px;
    border-top: 1px solid rgba(148, 163, 184, .13);
    text-align: center;
  }

  .footer-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .footer-divider span {
    width: 24%;
    height: 1px;
    background: rgba(127, 146, 186, .2);
  }

  .footer-divider b {
    color: #7183a8;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .2em;
  }

  .forgot-footer small {
    display: block;
    margin-top: 9px;
    color: #647698;
    font-size: 10px;
  }

  .forgot-submit:focus-visible,
  .forgot-back:focus-visible {
    outline: 2px solid #a5b4fc;
    outline-offset: 3px;
  }

  @media (max-width: 600px) {
    .forgot-page { padding: 22px 15px; }
    .forgot-card { padding: 30px 24px 24px; border-radius: 23px; }
    .forgot-brand { margin-bottom: 28px; }
    .forgot-card h1 { font-size: 35px; }
    .forgot-subtitle { margin-bottom: 25px; font-size: 12px; }
  }

  @media (max-width: 380px) {
    .forgot-card { padding: 26px 19px 22px; }
    .forgot-brand-name { font-size: 19px; }
    .forgot-card h1 { font-size: 31px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .forgot-page *, .forgot-page *::before, .forgot-page *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }

  /* ===== RESPONSIVE POLISH — all devices ===== */
  .forgot-page {
    min-height: 100vh;
    min-height: 100dvh;
  }

  @media (max-width: 480px) {
    .forgot-field input {
      font-size: 16px;
    }
  }

  @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
    .forgot-page {
      padding: 18px 15px;
      align-items: flex-start;
    }

    .forgot-card {
      padding: 24px 22px 20px;
    }

    .forgot-card h1 {
      font-size: 30px;
    }
  }
`;

export default ForgotPassword;
