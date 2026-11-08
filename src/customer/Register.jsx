import { useEffect, useState } from "react";
import { apiRequest } from "../admin/adminApi";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
.wr-register{min-height:100vh;display:grid;place-items:center;padding:28px 16px;background:radial-gradient(circle at 15% 10%,rgba(99,102,241,.15),transparent 34%),radial-gradient(circle at 90% 90%,rgba(14,165,233,.13),transparent 35%),#f5f7ff;font-family:'DM Sans',sans-serif;color:#17213b;box-sizing:border-box}.wr-register-card{width:min(100%,490px);padding:38px 40px;background:#fff;border:1px solid #e8ecf5;border-radius:24px;box-shadow:0 24px 70px rgba(37,55,110,.13);box-sizing:border-box}.wr-register-brand{display:flex;align-items:center;gap:11px;margin-bottom:28px}.wr-register-mark{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;color:#fff;font:800 19px Manrope,sans-serif;background:linear-gradient(135deg,#4f46e5,#0891b2)}.wr-register-title{font:800 28px Manrope,sans-serif;letter-spacing:-.8px;margin:0 0 8px}.wr-register-sub{color:#69758e;font-size:14px;line-height:1.65;margin:0 0 22px}.wr-register-label{display:block;font-size:13px;font-weight:700;color:#34415d;margin:16px 0 7px}.wr-register-input{width:100%;height:48px;border:1px solid #dce3f0;border-radius:11px;padding:0 13px;box-sizing:border-box;background:#fbfcff;font:14px 'DM Sans',sans-serif;outline:none}.wr-register-input:focus{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.11)}.wr-register-button{width:100%;height:50px;margin-top:22px;border:0;border-radius:11px;color:#fff;background:linear-gradient(100deg,#4f46e5,#2563eb 55%,#0891b2);font:700 14px 'DM Sans',sans-serif;cursor:pointer}.wr-register-button:disabled{opacity:.55;cursor:not-allowed}.wr-register-alert{margin-top:15px;padding:11px 13px;border-radius:10px;font-size:13px;line-height:1.5}.wr-register-error{background:#fff1f2;color:#be123c;border:1px solid #ffe0e5}.wr-register-info{background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe}.wr-register-foot{text-align:center;color:#77829a;font-size:13px;margin:21px 0 0}.wr-register-foot a{color:#4f46e5;font-weight:700;text-decoration:none}.wr-register-username-status{font-size:12px;margin-top:7px;min-height:18px;font-weight:600}.wr-register-note{font-size:11px;color:#8792a8;line-height:1.55;margin:14px 0 0;text-align:center}@media(max-width:520px){.wr-register-card{padding:29px 22px;border-radius:20px}}
`;

export default function Register() {
  const [step, setStep] = useState("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameCheck, setUsernameCheck] = useState({ status: "idle", message: "", value: "" });
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { apiRequest("/api/csrf/").catch(() => {}); }, []);

  // Check username availability as the customer types. Debouncing avoids
  // sending a request for every keystroke; stale requests are aborted.
  useEffect(() => {
    const value = username.trim();
    if (!value) {
      setUsernameCheck({ status: "idle", message: "", value: "" });
      return undefined;
    }
    if (value.length < 4 || value.length > 150 || !/^[A-Za-z0-9_-]+$/.test(value)) {
      setUsernameCheck({
        status: "invalid",
        message: "Use 4–150 characters: letters, numbers, hyphens or underscores.",
        value,
      });
      return undefined;
    }

    const controller = new AbortController();
    setUsernameCheck({ status: "checking", message: "Checking username…", value });
    const timer = setTimeout(async () => {
      try {
        const result = await apiRequest(
          `/api/builder/customer/username-availability/?username=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );
        setUsernameCheck({
          status: result.available ? "available" : "taken",
          message: result.message || (result.available ? "Username is available." : "That username is already taken."),
          value,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setUsernameCheck({ status: "error", message: "Could not check username. Please try again.", value });
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username]);

  async function requestCode(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const result = await apiRequest("/api/builder/customer/register/request-otp/", { method: "POST", body: { email } });
      setMessage(result.message || "Verification code sent."); setStep("verify");
    } catch (err) { setError(err.message || "Unable to send verification code."); }
    finally { setLoading(false); }
  }

  async function verifyAndCreate(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      await apiRequest("/api/builder/customer/register/verify-otp/", {
        method: "POST", body: { fullName, email, username, password, otp },
      });
      window.location.replace("/customer/dashboard");
    } catch (err) { setError(err.message || "Unable to create your account."); }
    finally { setLoading(false); }
  }

  return <><style>{styles}</style><main className="wr-register"><section className="wr-register-card">
    <div className="wr-register-brand"><div className="wr-register-mark">W</div><div><strong style={{fontFamily:"Manrope",fontSize:16}}>WebResume</strong><div style={{fontSize:11,color:"#8490a8"}}>Build your professional identity</div></div></div>
    {step === "details" ? <>
      <h1 className="wr-register-title">Create your account</h1><p className="wr-register-sub">Start building your professional portfolio and resume. No invitation is required.</p>
      <form onSubmit={requestCode}>
        <label className="wr-register-label" htmlFor="wr-email">Email address</label><input id="wr-email" className="wr-register-input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        <button className="wr-register-button" disabled={loading}>{loading ? "Sending code…" : "Continue with email"}</button>
      </form>
    </> : <>
      <h1 className="wr-register-title">Verify and create account</h1><p className="wr-register-sub">We sent a six-digit verification code to <strong>{email}</strong>. Complete your details below.</p>
      <form onSubmit={verifyAndCreate}>
        <label className="wr-register-label" htmlFor="wr-name">Full name</label><input id="wr-name" className="wr-register-input" required maxLength={200} autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" />
        <label className="wr-register-label" htmlFor="wr-username">Username</label><input id="wr-username" className="wr-register-input" required minLength={4} maxLength={150} pattern="[A-Za-z0-9_-]+" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Choose a username" aria-describedby="wr-username-status" />
        <div id="wr-username-status" className="wr-register-username-status" role="status" aria-live="polite" style={{color: usernameCheck.status === "available" ? "#15803d" : usernameCheck.status === "taken" || usernameCheck.status === "invalid" || usernameCheck.status === "error" ? "#be123c" : "#64748b"}}>{usernameCheck.message}</div>
        <label className="wr-register-label" htmlFor="wr-password">Password</label><input id="wr-password" className="wr-register-input" type="password" required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a strong password" />
        <label className="wr-register-label" htmlFor="wr-otp">Email verification code</label><input id="wr-otp" className="wr-register-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g, "").slice(0,6))} placeholder="6-digit code" />
        <button className="wr-register-button" disabled={loading || usernameCheck.status !== "available" || usernameCheck.value !== username.trim()}>{loading ? "Creating account…" : "Verify email & create account"}</button>
      </form>
      <button type="button" onClick={()=>{setStep("details");setOtp("");setError("");}} style={{display:"block",margin:"13px auto 0",border:0,background:"transparent",color:"#4f46e5",fontWeight:700,cursor:"pointer"}}>Change email address</button>
    </>}
    {error && <div className="wr-register-alert wr-register-error" role="alert">{error}</div>}{message && <div className="wr-register-alert wr-register-info" role="status">{message}</div>}
    <p className="wr-register-foot">Already have an account? <a href="/customer/login">Sign in</a></p>
    <p className="wr-register-note">Your portfolio starts as a private draft. It becomes publicly visible only after owner approval.</p>
  </section></main></>;
}
