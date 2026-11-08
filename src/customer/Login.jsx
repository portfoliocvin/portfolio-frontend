import { useEffect, useState } from "react";
import { apiRequest } from "../admin/adminApi";

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
.auth-page{min-height:100vh;display:grid;place-items:center;padding:32px 18px;box-sizing:border-box;background:radial-gradient(ellipse at 15% 15%,rgba(99,102,241,.16),transparent 35%),radial-gradient(ellipse at 85% 85%,rgba(14,165,233,.13),transparent 35%),#f5f7ff;font-family:'DM Sans',sans-serif;color:#17213b;position:relative;overflow:hidden}
.auth-page:before,.auth-page:after{content:"";position:fixed;border-radius:50%;filter:blur(2px);pointer-events:none;animation:authFloat 9s ease-in-out infinite}
.auth-page:before{width:230px;height:230px;top:8%;right:7%;background:linear-gradient(135deg,rgba(129,140,248,.14),rgba(56,189,248,.05))}
.auth-page:after{width:170px;height:170px;bottom:7%;left:7%;background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(167,139,250,.08));animation-delay:-4s}
.auth-card{position:relative;z-index:1;width:min(100%,460px);box-sizing:border-box;padding:38px 40px 34px;background:rgba(255,255,255,.94);border:1px solid rgba(255,255,255,.9);border-radius:25px;box-shadow:0 24px 70px rgba(37,55,110,.13);backdrop-filter:blur(16px);animation:authEnter .55s cubic-bezier(.2,.8,.2,1) both}
.auth-brand{display:flex;align-items:center;gap:11px;margin-bottom:28px}
.auth-brand-mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;color:#fff;font:800 20px Manrope,sans-serif;background:linear-gradient(135deg,#4f46e5,#0ea5e9);box-shadow:0 8px 18px rgba(79,70,229,.25)}
.auth-brand-name{font:800 16px Manrope,sans-serif;letter-spacing:-.3px;color:#17213b}.auth-brand-sub{font-size:11px;color:#8490a8;margin-top:2px}
.auth-card h1{font:800 clamp(25px,5vw,30px) Manrope,sans-serif;letter-spacing:-1px;margin:0 0 8px;color:#17213b}
.auth-intro{color:#69758e;font-size:14px;line-height:1.65;margin:0 0 26px}
.auth-label{display:block;font-size:13px;font-weight:700;color:#34415d;margin:17px 0 8px}
.auth-input-wrap{position:relative}
.auth-input{display:block;width:100%;height:49px;box-sizing:border-box;border:1px solid #dce3f0;border-radius:12px;padding:0 15px;background:#fbfcff;color:#17213b;font:500 14px 'DM Sans',sans-serif;outline:none;transition:border .2s,box-shadow .2s,background .2s}
.auth-input:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 4px rgba(99,102,241,.12)}
.auth-input::placeholder{color:#a4aec0}
.auth-primary{width:100%;min-height:50px;margin-top:23px;border:0;border-radius:12px;color:white;background:linear-gradient(100deg,#4f46e5,#2563eb 55%,#0891b2);font:700 14px 'DM Sans',sans-serif;cursor:pointer;box-shadow:0 9px 20px rgba(59,91,219,.2);transition:transform .2s,box-shadow .2s,filter .2s}
.auth-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 13px 25px rgba(59,91,219,.28);filter:saturate(1.1)}
.auth-primary:active:not(:disabled){transform:translateY(0)}
.auth-primary:disabled{opacity:.6;cursor:not-allowed;box-shadow:none}
.auth-link-row{margin-top:22px;text-align:center;font-size:13px;color:#77829a}
.auth-link{color:#4f46e5;font-weight:700;text-decoration:none}.auth-link:hover{text-decoration:underline}
.auth-divider{height:1px;background:#edf0f6;margin:24px 0 18px}
.auth-note{font-size:12px;line-height:1.6;color:#8792a8;text-align:center;margin:0}
.auth-message{padding:11px 13px;border-radius:11px;font-size:13px;line-height:1.5;margin:16px 0 0}
.auth-error{background:#fff1f2;color:#be123c;border:1px solid #ffe0e5;animation:authShake .3s}
.auth-info{background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe}
.auth-otp{text-align:center;letter-spacing:9px;font-size:21px;font-weight:700}
.auth-secondary{display:block;margin:16px auto 0;border:0;background:transparent;color:#4f46e5;font:700 13px 'DM Sans',sans-serif;cursor:pointer;padding:8px}
.auth-success{display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 0 8px;animation:authEnter .4s ease both}
.auth-success-icon{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:#dcfce7;color:#16a34a;font-size:40px;font-weight:700;animation:authPop .55s cubic-bezier(.2,1.5,.4,1) both;box-shadow:0 0 0 9px rgba(34,197,94,.08)}
.auth-success h2{font:800 23px Manrope,sans-serif;margin:22px 0 7px}.auth-success p{color:#718096;font-size:14px;margin:0}
.auth-spinner{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%;vertical-align:-3px;margin-right:8px;animation:authSpin .7s linear infinite}
@keyframes authEnter{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
@keyframes authPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.13)}100%{transform:scale(1);opacity:1}}
@keyframes authSpin{to{transform:rotate(360deg)}}
@keyframes authShake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes authFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@media(max-width:520px){.auth-card{padding:30px 23px 26px;border-radius:21px}.auth-brand{margin-bottom:24px}.auth-page{padding:18px}}
@media(prefers-reduced-motion:reduce){.auth-page:before,.auth-page:after,.auth-card,.auth-success-icon{animation:none!important;transition:none!important}}
`;

export default function CustomerLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryPurpose, setRecoveryPurpose] = useState("");
  const [recoveryStep, setRecoveryStep] = useState("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryResult, setRecoveryResult] = useState("");

  useEffect(() => {
    apiRequest("/api/csrf/").catch(() => {});
  }, []);

  async function requestCode(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest(
        "/api/builder/customer/login/request-otp/",
        { method: "POST", body: { identifier, password } }
      );
      setMessage(result.message || "A verification code has been sent to your registered email.");
      setStep("otp");
    } catch (err) {
      setError(err.message || "Unable to start login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest(
        "/api/builder/customer/login/verify-otp/",
        { method: "POST", body: { identifier, password, otp } }
      );
      setSuccess(true);
      window.setTimeout(() => {
        window.location.replace("/customer/dashboard");
      }, 1100);
    } catch (err) {
      setError(err.message || "The verification code could not be confirmed.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function startRecovery(purpose) {
    setRecoveryPurpose(purpose);
    setRecoveryEmail(identifier.includes("@") ? identifier.trim() : "");
    setRecoveryOtp("");
    setRecoveryNewPassword("");
    setRecoveryResult("");
    setRecoveryStep("email");
    setError("");
    setMessage("");
  }

  async function requestRecoveryCode(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest(
        "/api/builder/customer/recovery/request-otp/",
        { method: "POST", body: { email: recoveryEmail, purpose: recoveryPurpose } }
      );
      setMessage(result.message || "If an account matches that email, a code has been sent.");
      setRecoveryStep("verify");
    } catch (err) {
      setError(err.message || "Unable to send a verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyRecovery(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest(
        "/api/builder/customer/recovery/verify-otp/",
        {
          method: "POST",
          body: {
            email: recoveryEmail,
            purpose: recoveryPurpose,
            otp: recoveryOtp,
            ...(recoveryPurpose === "password" ? { newPassword: recoveryNewPassword } : {}),
          },
        }
      );
      if (recoveryPurpose === "username") {
        setRecoveryResult(result.username || "");
        setRecoveryStep("result");
      } else {
        setMessage(result.message || "Your password has been reset. You can now sign in.");
        setRecoveryStep("complete");
      }
    } catch (err) {
      setError(err.message || "Unable to verify the code.");
      setRecoveryOtp("");
    } finally {
      setLoading(false);
    }
  }

  function closeRecovery() {
    setRecoveryPurpose("");
    setRecoveryStep("email");
    setRecoveryOtp("");
    setRecoveryNewPassword("");
    setRecoveryResult("");
    setError("");
    setMessage("");
  }

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
            <h2>You're verified!</h2>
            <p>Login successful. Opening your portfolio workspace…</p>
          </div>
        ) : (
          <>
            <h1>{step === "credentials" ? "Welcome back" : "Verify it's you"}</h1>
            <p className="auth-intro">
              {step === "credentials"
                ? "Sign in to manage and update your portfolio website."
                : "We've sent a secure verification code to your registered email address."}
            </p>

            {recoveryPurpose ? (
              <>
                <h1>
                  {recoveryPurpose === "username" ? "Recover username" : "Reset password"}
                </h1>
                <p className="auth-intro">
                  {recoveryPurpose === "username"
                    ? "Verify your registered email address to recover your username."
                    : "Verify your registered email address and choose a new password."}
                </p>
                {recoveryStep === "email" && (
                  <form onSubmit={requestRecoveryCode}>
                    <label className="auth-label" htmlFor="recovery-email">Registered email address</label>
                    <input
                      id="recovery-email"
                      className="auth-input"
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="Enter your registered email"
                    />
                    <button className="auth-primary" disabled={loading}>
                      {loading ? <><span className="auth-spinner" />Sending code…</> : "Send verification code"}
                    </button>
                  </form>
                )}
                {recoveryStep === "verify" && (
                  <form onSubmit={verifyRecovery}>
                    {message && <div className="auth-message auth-info" role="status">{message}</div>}
                    <label className="auth-label" htmlFor="recovery-otp">6-digit email verification code</label>
                    <input
                      id="recovery-otp"
                      className="auth-input auth-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      placeholder="••••••"
                    />
                    {recoveryPurpose === "password" && (
                      <>
                        <label className="auth-label" htmlFor="recovery-new-password">New password</label>
                        <input
                          id="recovery-new-password"
                          className="auth-input"
                          type="password"
                          minLength={8}
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                        />
                      </>
                    )}
                    <button className="auth-primary" disabled={loading || recoveryOtp.length !== 6 || (recoveryPurpose === "password" && recoveryNewPassword.length < 8)}>
                      {loading ? <><span className="auth-spinner" />Verifying…</> : recoveryPurpose === "username" ? "Verify and recover username" : "Verify and reset password"}
                    </button>
                  </form>
                )}
                {recoveryStep === "result" && (
                  <div className="auth-message auth-info" role="status">
                    Your registered username is: <strong>{recoveryResult}</strong>
                  </div>
                )}
                {recoveryStep === "complete" && (
                  <div className="auth-message auth-info" role="status">
                    Password reset successful. Return to login and use your new password.
                  </div>
                )}
                {error && <div className="auth-message auth-error" role="alert">{error}</div>}
                <button type="button" className="auth-secondary" disabled={loading} onClick={closeRecovery}>
                  ← Back to customer login
                </button>
              </>
            ) : step === "credentials" ? (
              <form onSubmit={requestCode}>
                <label className="auth-label" htmlFor="login-identifier">Email address or username</label>
                <input
                  id="login-identifier"
                  className="auth-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter your email or username"
                />

                <label className="auth-label" htmlFor="login-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="login-password"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    style={{ paddingRight: 76 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 12, top: 0, height: 49, border: 0, background: "transparent", color: "#586783", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, fontSize: 12 }}>
                  <button type="button" className="auth-link" style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }} onClick={() => startRecovery("username")}>Forgot username?</button>
                  <button type="button" className="auth-link" style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }} onClick={() => startRecovery("password")}>Forgot password?</button>
                </div>
                <button className="auth-primary" disabled={loading}>
                  {loading ? <><span className="auth-spinner" />Checking details…</> : "Continue securely"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode}>
                <div className="auth-message auth-info">{message}</div>
                <label className="auth-label" htmlFor="login-otp">6-digit email verification code</label>
                <input
                  id="login-otp"
                  className="auth-input auth-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="••••••"
                  autoFocus
                />
                <button className="auth-primary" disabled={loading || otp.length !== 6}>
                  {loading ? <><span className="auth-spinner" />Verifying…</> : "Verify and log in"}
                </button>
                <button
                  type="button"
                  className="auth-secondary"
                  disabled={loading}
                  onClick={() => { setStep("credentials"); setOtp(""); setError(""); setMessage(""); }}
                >
                  ← Back to login
                </button>
              </form>
            )}

            {error && <div className="auth-message auth-error" role="alert">{error}</div>}
            {!recoveryPurpose && (
              <>
                <div className="auth-divider" />
                <div className="auth-link-row">
                  Don't have an account?{" "}
                  <a className="auth-link" href="/customer/register">Create new account</a>
                </div>
                <p className="auth-note" style={{ marginTop: 18 }}>Secure access to your personal portfolio dashboard.</p>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
