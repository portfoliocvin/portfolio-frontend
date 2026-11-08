import { useEffect, useState } from "react";
import { apiRequest } from "../admin/adminApi";

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
.auth-page{min-height:100vh;display:grid;place-items:center;padding:32px 18px;box-sizing:border-box;background:radial-gradient(ellipse at 15% 15%,rgba(99,102,241,.16),transparent 35%),radial-gradient(ellipse at 85% 85%,rgba(14,165,233,.13),transparent 35%),#f5f7ff;font-family:'DM Sans',sans-serif;color:#17213b;position:relative;overflow:hidden}
.auth-page:before,.auth-page:after{content:"";position:fixed;border-radius:50%;pointer-events:none;animation:authFloat 9s ease-in-out infinite}
.auth-page:before{width:230px;height:230px;top:8%;right:7%;background:linear-gradient(135deg,rgba(129,140,248,.14),rgba(56,189,248,.05))}
.auth-page:after{width:170px;height:170px;bottom:7%;left:7%;background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(167,139,250,.08));animation-delay:-4s}
.auth-card{position:relative;z-index:1;width:min(100%,490px);box-sizing:border-box;padding:38px 40px 34px;background:rgba(255,255,255,.95);border:1px solid rgba(255,255,255,.9);border-radius:25px;box-shadow:0 24px 70px rgba(37,55,110,.13);backdrop-filter:blur(16px);animation:authEnter .55s cubic-bezier(.2,.8,.2,1) both}
.auth-brand{display:flex;align-items:center;gap:11px;margin-bottom:27px}.auth-brand-mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;color:#fff;font:800 20px Manrope,sans-serif;background:linear-gradient(135deg,#4f46e5,#0ea5e9);box-shadow:0 8px 18px rgba(79,70,229,.25)}.auth-brand-name{font:800 16px Manrope,sans-serif;color:#17213b}.auth-brand-sub{font-size:11px;color:#8490a8;margin-top:2px}
.auth-card h1{font:800 clamp(25px,5vw,30px) Manrope,sans-serif;letter-spacing:-1px;margin:0 0 8px;color:#17213b}.auth-intro{color:#69758e;font-size:14px;line-height:1.65;margin:0 0 23px}
.auth-label{display:block;font-size:13px;font-weight:700;color:#34415d;margin:17px 0 8px}.auth-input{display:block;width:100%;height:49px;box-sizing:border-box;border:1px solid #dce3f0;border-radius:12px;padding:0 15px;background:#fbfcff;color:#17213b;font:500 14px 'DM Sans',sans-serif;outline:none;transition:border .2s,box-shadow .2s,background .2s}.auth-input:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 4px rgba(99,102,241,.12)}.auth-input::placeholder{color:#a4aec0}
.auth-primary{width:100%;min-height:50px;margin-top:22px;border:0;border-radius:12px;color:white;background:linear-gradient(100deg,#4f46e5,#2563eb 55%,#0891b2);font:700 14px 'DM Sans',sans-serif;cursor:pointer;box-shadow:0 9px 20px rgba(59,91,219,.2);transition:transform .2s,box-shadow .2s}.auth-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 13px 25px rgba(59,91,219,.28)}.auth-primary:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
.auth-secondary{display:block;margin:14px auto 0;border:0;background:transparent;color:#4f46e5;font:700 13px 'DM Sans',sans-serif;cursor:pointer;padding:8px}.auth-link-row{text-align:center;font-size:13px;color:#77829a;margin-top:23px}.auth-link{color:#4f46e5;font-weight:700;text-decoration:none}.auth-link:hover{text-decoration:underline}
.auth-divider{height:1px;background:#edf0f6;margin:23px 0 17px}.auth-message{padding:11px 13px;border-radius:11px;font-size:13px;line-height:1.5;margin:15px 0 0}.auth-error{background:#fff1f2;color:#be123c;border:1px solid #ffe0e5;animation:authShake .3s}.auth-info{background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe}
.auth-otp{text-align:center;letter-spacing:9px;font-size:21px;font-weight:700}.auth-spinner{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%;vertical-align:-3px;margin-right:8px;animation:authSpin .7s linear infinite}
.auth-username-status{font-size:12px;margin:7px 2px 0;display:flex;align-items:center;gap:6px;min-height:18px}.auth-available{color:#15803d}.auth-taken,.auth-invalid,.auth-error-text{color:#dc2626}.auth-checking{color:#64748b}.auth-password-hint{font-size:11px;color:#8792a8;margin:-5px 2px 12px}.auth-success{display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 0 12px;animation:authEnter .4s ease both}.auth-success-icon{width:78px;height:78px;border-radius:50%;display:grid;place-items:center;background:#dcfce7;color:#16a34a;font-size:41px;font-weight:700;animation:authPop .55s cubic-bezier(.2,1.5,.4,1) both;box-shadow:0 0 0 9px rgba(34,197,94,.08)}.auth-success h2{font:800 23px Manrope,sans-serif;margin:22px 0 7px}.auth-success p{color:#718096;font-size:14px;margin:0;line-height:1.6}
@keyframes authEnter{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}@keyframes authPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.13)}100%{transform:scale(1);opacity:1}}@keyframes authSpin{to{transform:rotate(360deg)}}@keyframes authShake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}@keyframes authFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@media(max-width:520px){.auth-card{padding:30px 23px 26px;border-radius:21px}.auth-page{padding:18px}}@media(prefers-reduced-motion:reduce){.auth-page:before,.auth-page:after,.auth-card,.auth-success-icon{animation:none!important;transition:none!important}}
`;

export default function AcceptInvitation() {
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" });
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiRequest("/api/csrf/").catch(() => {});
  }, []);

  useEffect(() => {
    const value = username.trim();
    if (!value) {
      setUsernameStatus({ state: "idle", message: "" });
      return;
    }
    if (value.length < 4 || value.length > 150 || !/^[A-Za-z0-9_-]+$/.test(value)) {
      setUsernameStatus({
        state: "invalid",
        message: "Use 4–150 characters: letters, numbers, hyphens or underscores.",
      });
      return;
    }

    let cancelled = false;
    setUsernameStatus({ state: "checking", message: "Checking username..." });
    const timer = window.setTimeout(async () => {
      try {
        const result = await apiRequest(
          `/api/builder/customer/username-availability/?username=${encodeURIComponent(value)}`
        );
        if (!cancelled) {
          setUsernameStatus({
            state: result.available ? "available" : "taken",
            message: result.message || (result.available ? "Username is available." : "Username is not available."),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setUsernameStatus({ state: "error", message: "Couldn't check username. Please try again." });
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username]);

  async function requestOtp() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest(
        "/api/builder/customer/request-otp/",
        { method: "POST", body: { token } }
      );
      setMessage(result.message || "Verification code sent to the invited email address.");
      setStep("setup");
    } catch (err) {
      setError(err.message || "Unable to send the verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndCreate(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (usernameStatus.state !== "available") {
      setError("Please choose a username that is available.");
      setLoading(false);
      return;
    }

    try {
      await apiRequest(
        "/api/builder/customer/verify-otp/",
        { method: "POST", body: { token, otp, username, password } }
      );
      setSuccess(true);
      window.setTimeout(() => {
        window.location.replace("/customer/dashboard");
      }, 1200);
    } catch (err) {
      setError(err.message || "Unable to verify your code. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  const usernameClass = {
    available: "auth-available",
    taken: "auth-taken",
    invalid: "auth-invalid",
    checking: "auth-checking",
    error: "auth-error-text",
  }[usernameStatus.state] || "";

  return (
    <main className="auth-page">
      <style>{pageStyles}</style>
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">P</div>
          <div>
            <div className="auth-brand-name">Portfolio Studio</div>
            <div className="auth-brand-sub">YOUR PERSONAL WEBSITE WORKSPACE</div>
          </div>
        </div>

        {success ? (
          <div className="auth-success" role="status">
            <div className="auth-success-icon">✓</div>
            <h2>Account created!</h2>
            <p>Your email is verified and your portfolio workspace is ready. Taking you to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1>{step === "request" ? "Welcome aboard" : "Set up your account"}</h1>
            <p className="auth-intro">
              {step === "request"
                ? "Your portfolio journey starts here. Verify your invitation email to create your secure account."
                : "Verify your email and choose the username and password you'll use to manage your portfolio."}
            </p>

            {!token ? (
              <div className="auth-message auth-error" role="alert">
                Invitation token is missing. Please open the invitation link sent to your email.
              </div>
            ) : step === "request" ? (
              <>
                <div className="auth-message auth-info">
                  <strong>One quick step.</strong> We'll send a one-time verification code to the email address associated with your invitation.
                </div>
                <button className="auth-primary" disabled={loading} onClick={requestOtp}>
                  {loading ? <><span className="auth-spinner" />Sending secure code…</> : "Send email verification code"}
                </button>
              </>
            ) : (
              <form onSubmit={verifyAndCreate}>
                {message && <div className="auth-message auth-info" role="status">{message}</div>}

                <label className="auth-label" htmlFor="invite-otp">Email verification code</label>
                <input
                  id="invite-otp"
                  className="auth-input auth-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="••••••"
                />

                <label className="auth-label" htmlFor="invite-username">Choose your username</label>
                <input
                  id="invite-username"
                  className="auth-input"
                  minLength={4}
                  maxLength={150}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  aria-describedby="username-status"
                  placeholder="Create a unique username"
                />
                {usernameStatus.message && (
                  <p id="username-status" role="status" className={`auth-username-status ${usernameClass}`}>
                    {usernameStatus.state === "available" ? "✓" : usernameStatus.state === "checking" ? "◌" : usernameStatus.state === "taken" || usernameStatus.state === "invalid" || usernameStatus.state === "error" ? "!" : ""}
                    {usernameStatus.message}
                  </p>
                )}

                <label className="auth-label" htmlFor="invite-password">Create password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="invite-password"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    style={{ paddingRight: 76 }}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: 12, top: 0, height: 49, border: 0, background: "transparent", color: "#586783", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                <div className="auth-password-hint">
                  {password.length === 0 ? "Use at least 8 characters." : password.length < 8 ? "Password is too short." : /[A-Za-z]/.test(password) && /\d/.test(password) ? "Good: your password includes letters and numbers." : "For a stronger password, combine letters and numbers."}
                </div>

                <label className="auth-label" htmlFor="invite-confirm-password">Confirm password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="invite-confirm-password"
                    className="auth-input"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    style={{ paddingRight: 76 }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} style={{ position: "absolute", right: 12, top: 0, height: 49, border: 0, background: "transparent", color: "#586783", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {showConfirmPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`auth-username-status ${password === confirmPassword ? "auth-available" : "auth-taken"}`}>
                    {password === confirmPassword ? "✓ Passwords match." : "! Passwords do not match."}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-primary"
                  disabled={loading || otp.length !== 6 || usernameStatus.state !== "available"}
                >
                  {loading ? <><span className="auth-spinner" />Creating your account…</> : "Verify email and create account"}
                </button>
                <button type="button" className="auth-secondary" disabled={loading} onClick={requestOtp}>
                  Resend verification code
                </button>
              </form>
            )}

            {error && <div className="auth-message auth-error" role="alert">{error}</div>}
            <div className="auth-divider" />
            <div className="auth-link-row">
              Already have an account?{" "}
              <a className="auth-link" href="/customer/login">Customer login</a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
