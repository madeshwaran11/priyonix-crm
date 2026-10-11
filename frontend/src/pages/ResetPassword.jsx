import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/password/reset", {
        token,
        newPassword,
      });

      setMessage(
        response.data.message ||
          "Password reset successfully."
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">

      <div className="reset-stars reset-stars-one" />
      <div className="reset-stars reset-stars-two" />

      <div className="reset-glow reset-glow-one" />
      <div className="reset-glow reset-glow-two" />

      <div className="reset-card">

        <div className="reset-icon">
          🔐
        </div>

        {!success ? (
          <>
            <h1>Create New Password</h1>

            <p className="reset-subtitle">
              Enter a new password for your PriyoniX CRM
              account.
            </p>

            <form onSubmit={handleSubmit}>

              <label>New Password</label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
              />

              <label className="confirm-label">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
              />

              {error && (
                <div className="reset-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Updating Password..."
                  : "Reset Password"}
              </button>

            </form>

            <button
              className="back-login"
              onClick={() => navigate("/login")}
            >
              ← Back to Login
            </button>
          </>
        ) : (
          <div className="success-content">

            <div className="success-check">
              ✓
            </div>

            <h1>Password Updated</h1>

            <p>
              Your PriyoniX CRM password has been
              successfully changed.
            </p>

            <button
              className="login-button"
              onClick={() => navigate("/login")}
            >
              Continue to Login →
            </button>

          </div>
        )}

        <div className="reset-footer">
          <strong>PRIYONIX CRM</strong>
          <span>Secure Account Recovery</span>
        </div>

      </div>

      <style>{`

        * {
          box-sizing: border-box;
        }

        .reset-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 25px;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(37, 99, 235, .18),
              transparent 30%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(124, 58, 237, .18),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #020617 0%,
              #07132e 48%,
              #030712 100%
            );
        }

        .reset-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .reset-stars-one {
          background-image:
            radial-gradient(
              circle,
              rgba(255,255,255,.9) 1px,
              transparent 1px
            ),
            radial-gradient(
              circle,
              rgba(147,197,253,.8) 1px,
              transparent 1px
            );

          background-size:
            90px 90px,
            150px 150px;

          background-position:
            10px 20px,
            50px 80px;

          opacity: .65;

          animation:
            resetStarMove
            35s
            linear
            infinite;
        }

        .reset-stars-two {
          background-image:
            radial-gradient(
              circle,
              rgba(196,181,253,.8) 1px,
              transparent 1px
            );

          background-size: 210px 210px;

          opacity: .3;

          animation:
            resetStarMove
            50s
            linear
            infinite reverse;
        }

        @keyframes resetStarMove {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(-80px, 45px);
          }
        }

        .reset-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .reset-glow-one {
          width: 280px;
          height: 280px;

          left: -100px;
          top: -90px;

          background:
            rgba(37, 99, 235, .18);
        }

        .reset-glow-two {
          width: 320px;
          height: 320px;

          right: -120px;
          bottom: -120px;

          background:
            rgba(124, 58, 237, .16);
        }

        .reset-card {
          position: relative;
          z-index: 5;

          width: 100%;
          max-width: 470px;

          padding: 42px;

          border-radius: 28px;

          border:
            1px solid
            rgba(148, 163, 184, .2);

          background:
            rgba(15, 23, 42, .9);

          box-shadow:
            0 30px 80px rgba(0,0,0,.55),
            inset 0 1px 0
            rgba(255,255,255,.06);

          backdrop-filter: blur(20px);

          color: white;
        }

        .reset-icon {
          width: 70px;
          height: 70px;

          margin:
            0 auto 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          font-size: 31px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 15px 35px
            rgba(37,99,235,.3);
        }

        .reset-card h1 {
          margin: 0;

          text-align: center;

          font-size: 30px;
          font-weight: 900;

          letter-spacing: -1px;
        }

        .reset-subtitle {
          max-width: 350px;

          margin:
            12px auto 30px;

          text-align: center;

          color: #94a3b8;

          font-size: 14px;

          line-height: 1.7;
        }

        .reset-card label {
          display: block;

          margin-bottom: 8px;

          color: #cbd5e1;

          font-size: 12px;

          font-weight: 800;
        }

        .confirm-label {
          margin-top: 18px;
        }

        .reset-card input {
          width: 100%;
          height: 50px;

          padding: 0 15px;

          border:
            1px solid #334155;

          border-radius: 12px;

          outline: none;

          background:
            rgba(2,6,23,.75);

          color: white;

          font-size: 14px;

          transition: .2s;
        }

        .reset-card input::placeholder {
          color: #64748b;
        }

        .reset-card input:focus {
          border-color: #60a5fa;

          box-shadow:
            0 0 0 3px
            rgba(96,165,250,.12);
        }

        .reset-error {
          margin-top: 13px;

          padding: 11px 13px;

          border-radius: 10px;

          color: #fecaca;

          background:
            rgba(127,29,29,.25);

          border:
            1px solid
            rgba(248,113,113,.25);

          font-size: 12px;

          line-height: 1.5;
        }

        .reset-card form button[type="submit"] {
          width: 100%;
          height: 50px;

          margin-top: 20px;

          border: none;

          border-radius: 12px;

          cursor: pointer;

          color: white;

          font-size: 13px;
          font-weight: 900;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 12px 25px
            rgba(37,99,235,.22);

          transition: .2s;
        }

        .reset-card form button[type="submit"]:hover {
          transform: translateY(-2px);

          box-shadow:
            0 16px 30px
            rgba(37,99,235,.3);
        }

        .reset-card form button[type="submit"]:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
        }

        .back-login {
          width: 100%;

          margin-top: 18px;

          padding: 10px;

          border: none;

          background: transparent;

          color: #93c5fd;

          cursor: pointer;

          font-size: 12px;

          font-weight: 800;
        }

        .back-login:hover {
          color: white;
        }

        .success-content {
          text-align: center;
        }

        .success-check {
          width: 72px;
          height: 72px;

          margin:
            0 auto 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: white;

          font-size: 30px;
          font-weight: 900;

          background:
            linear-gradient(
              135deg,
              #10b981,
              #059669
            );

          box-shadow:
            0 15px 35px
            rgba(16,185,129,.3);

          animation:
            successPulse
            1.5s
            ease-in-out
            infinite;
        }

        @keyframes successPulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }
        }

        .success-content p {
          margin:
            12px auto 25px;

          max-width: 330px;

          color: #94a3b8;

          font-size: 14px;

          line-height: 1.7;
        }

        .login-button {
          width: 100%;
          height: 50px;

          border: none;

          border-radius: 12px;

          cursor: pointer;

          color: white;

          font-size: 13px;

          font-weight: 900;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          transition: .2s;
        }

        .login-button:hover {
          transform: translateY(-2px);
        }

        .reset-footer {
          margin-top: 28px;

          padding-top: 20px;

          border-top:
            1px solid
            rgba(148,163,184,.12);

          text-align: center;
        }

        .reset-footer strong {
          display: block;

          color: #e2e8f0;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .reset-footer span {
          display: block;

          margin-top: 5px;

          color: #64748b;

          font-size: 10px;
        }

        @media (max-width: 600px) {
          .reset-page {
            padding: 18px;
          }

          .reset-card {
            padding: 30px 22px;
            border-radius: 22px;
          }

          .reset-card h1 {
            font-size: 27px;
          }
        }

        /* ===== RESPONSIVE POLISH — all devices ===== */
        .reset-page {
          min-height: 100vh;
          min-height: 100dvh;
        }

        @media (max-width: 480px) {
          .reset-card input {
            font-size: 16px;
          }
        }

        @media (max-width: 360px) {
          .reset-page {
            padding: 12px;
          }

          .reset-card {
            padding: 24px 16px;
          }

          .reset-card h1 {
            font-size: 23px;
          }
        }

        @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
          .reset-page {
            padding: 14px;
            align-items: flex-start;
          }

          .reset-card {
            padding: 22px;
          }
        }

      `}</style>
    </div>
  );
}

export default ResetPassword;