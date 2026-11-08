
import React, { useEffect, useState } from "react";

const IS_LOCAL_FRONTEND =
  window.location.hostname === "localhost" &&
  window.location.port === "3000";

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  (IS_LOCAL_FRONTEND ? "http://localhost:8080" : "")
).replace(/\/+$/, "");

const dashboardStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap');

.customer-app {
  min-height: 100vh;
  background: #f5f7fc;
  color: #18233d;
  font-family: 'DM Sans', sans-serif;
}

.customer-topbar {
  min-height: 82px;
  padding: 0 clamp(18px, 6%, 88px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: rgba(255,255,255,.94);
  border-bottom: 1px solid #e9edf5;
  box-shadow: 0 5px 24px rgba(31,45,80,.035);
}

.customer-brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.customer-brand-avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  flex: 0 0 48px;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg,#4f46e5,#0891b2);
  color: #fff;
  font: 800 20px Manrope,sans-serif;
  box-shadow: 0 7px 18px rgba(79,70,229,.22);
  border: 3px solid #fff;
}

.customer-brand-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.customer-brand-copy {
  min-width: 0;
}

.customer-brand-name {
  font: 800 16px Manrope,sans-serif;
  color: #18233d;
}

.customer-brand-sub {
  font-size: 10px;
  color: #929db1;
  letter-spacing: 1px;
  margin-top: 3px;
}

.customer-brand-name {
  font: 800 16px Manrope,sans-serif;
  color: #18233d;
}

.customer-brand-sub {
  font-size: 10px;
  color: #929db1;
  letter-spacing: 1px;
  margin-top: 2px;
}

.customer-logout {
  border: 1px solid #e5e9f1;
  background: white;
  padding: 10px 19px;
  border-radius: 10px;
  color: #47536b;
  font: 700 13px 'DM Sans',sans-serif;
  cursor: pointer;
  transition: .2s ease;
}

.customer-logout:hover {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.customer-content {
  max-width: 1120px;
  margin: auto;
  padding: 52px 24px 70px;
  animation: dashboardEnter .55s ease both;
}

.customer-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 35px;
}

.customer-eyebrow {
  color: #6258dc;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  margin: 0 0 12px;
}

.customer-welcome h1 {
  font: 800 clamp(27px,5vw,37px) Manrope,sans-serif;
  letter-spacing: -1.3px;
  margin: 0;
  color: #17213b;
}

.customer-welcome p {
  color: #77839a;
  font-size: 15px;
  margin: 10px 0 0;
}

.customer-avatar {
  width: 66px;
  height: 66px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: linear-gradient(135deg,#e0e7ff,#dbeafe);
  color: #4f46e5;
  font: 800 25px Manrope,sans-serif;
}

.customer-section-heading {
  font: 800 19px Manrope,sans-serif;
  margin: 0 0 18px;
  color: #1e293b;
}

.customer-portfolio-card {
  background: white;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  padding: 27px;
  box-shadow: 0 8px 30px rgba(34,49,85,.045);
  transition: transform .25s, box-shadow .25s;
}

.customer-portfolio-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 38px rgba(34,49,85,.09);
}

.customer-portfolio-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
}

.customer-portfolio-title {
  font: 800 20px Manrope,sans-serif;
  margin: 0;
  color: #1e293b;
}

.customer-portfolio-subtitle {
  color: #8792a7;
  font-size: 13px;
  margin: 6px 0 0;
}

.customer-status {
  padding: 7px 12px;
  border-radius: 30px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
  white-space: nowrap;
}

.customer-status.published {
  background: #dcfce7;
  color: #15803d;
}

.customer-status.in_review {
  background: #eff6ff;
  color: #1d4ed8;
}

.customer-details-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 14px;
}

.customer-detail {
  background: #f8faff;
  border: 1px solid #edf0f7;
  border-radius: 13px;
  padding: 16px;
  min-width: 0;
}

.customer-detail-label {
  color: #929db1;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.customer-detail-value {
  color: #27344f;
  font-size: 14px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.customer-live-site-card {
  margin-top: 18px;
  padding: 23px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  background: #fff;
  border: 1px solid #e5eaf4;
  border-radius: 18px;
  box-shadow: 0 8px 26px rgba(34,49,85,.04);
}
.customer-live-site-copy { min-width: 0; }
.customer-live-site-eyebrow {
  margin: 0 0 7px;
  color: #6258dc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.customer-live-site-card h3 {
  margin: 0;
  color: #1e293b;
  font: 800 17px Manrope,sans-serif;
}
.customer-live-site-message {
  margin: 8px 0;
  color: #718096;
  font-size: 13px;
  line-height: 1.6;
}
.customer-live-site-url {
  display: inline-block;
  max-width: 100%;
  color: #4338ca;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.customer-live-site-state {
  display: inline-flex;
  align-items: center;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.customer-live-site-state.pending { color: #9a5700; background: #fff7e6; }
.customer-live-site-state.changes { color: #b42318; background: #fff0ee; }
.customer-review-feedback {
  margin: 10px 0;
  padding: 10px 12px;
  border-left: 3px solid #f59e0b;
  border-radius: 7px;
  background: #fffbeb;
  color: #78350f;
  font-size: 12px;
  line-height: 1.55;
}
.customer-live-site-button {
  flex: 0 0 auto;
  padding: 11px 16px;
  border-radius: 10px;
  background: #4338ca;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  transition: .2s ease;
}
.customer-live-site-button:hover { background: #3730a3; transform: translateY(-1px); }

.customer-resume-banner {
  margin-top: 16px;
  border: 1px solid #e5e7ff;
  border-radius: 18px;
  padding: 24px 25px;
  background: linear-gradient(110deg,#f8f7ff,#eef2ff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.customer-resume-banner h3 { font: 800 18px Manrope,sans-serif; margin: 0 0 7px; color: #252b55; }
.customer-resume-banner p { color: #69748b; font-size: 13px; line-height: 1.6; margin: 0; }

.customer-editor-banner {
  margin-top: 22px;
  border-radius: 18px;
  padding: 25px;
  background: linear-gradient(110deg,#312e81,#4f46e5 55%,#2563eb);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: white;
  box-shadow: 0 12px 28px rgba(79,70,229,.19);
}

.customer-editor-banner h3 {
  font: 800 18px Manrope,sans-serif;
  margin: 0 0 7px;
}

.customer-editor-banner p {
  color: rgba(255,255,255,.78);
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.customer-primary-button {
  flex-shrink: 0;
  border: 0;
  border-radius: 11px;
  padding: 13px 20px;
  background: white;
  color: #4338ca;
  font: 800 13px 'DM Sans',sans-serif;
  cursor: pointer;
  transition: .2s ease;
}

.customer-primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0,0,0,.15);
}

.customer-footer {
  text-align: center;
  color: #a0aabd;
  font-size: 12px;
  padding: 35px 15px 15px;
}

.customer-loading,
.customer-error {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f7fc;
  font-family: 'DM Sans',sans-serif;
  color: #334155;
  padding: 20px;
  text-align: center;
}

.customer-loading-inner {
  animation: dashboardEnter .4s ease both;
}

.customer-spinner {
  width: 38px;
  height: 38px;
  border: 3px solid #e0e7ff;
  border-top-color: #4f46e5;
  border-radius: 50%;
  margin: 0 auto 17px;
  animation: dashboardSpin .8s linear infinite;
}

.customer-error-card {
  background: white;
  padding: 35px;
  border-radius: 18px;
  max-width: 420px;
  box-shadow: 0 10px 35px rgba(34,49,85,.07);
}

.customer-error-card h1 {
  font: 800 22px Manrope,sans-serif;
}

.customer-error-card p {
  color: #718096;
  font-size: 14px;
  line-height: 1.6;
}

@keyframes dashboardEnter {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes dashboardSpin {
  to { transform: rotate(360deg); }
}

@media(max-width:650px) {
  .customer-topbar { padding: 0 17px; min-height: 72px; }
  .customer-content { padding: 34px 17px 45px; }
  .customer-welcome { margin-bottom: 27px; }
  .customer-welcome h1 { font-size: 27px; }
  .customer-avatar { width: 51px; height: 51px; border-radius: 15px; }
  .customer-portfolio-card { padding: 19px; }
  .customer-portfolio-top { flex-direction: column; }
  .customer-details-grid { grid-template-columns: 1fr; }
  .customer-editor-banner,.customer-resume-banner { flex-direction: column; align-items: stretch; padding: 21px; }\n  .customer-live-site-card { flex-direction: column; align-items: stretch; padding: 20px; }\n  .customer-live-site-button { text-align: center; }
  .customer-primary-button { width: 100%; }
}

@media(prefers-reduced-motion:reduce) {
  .customer-content,.customer-spinner { animation: none; }
  .customer-portfolio-card,.customer-logout,.customer-primary-button { transition: none; }
}
`;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [error, setError] = useState("");
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetch(
          `${API_BASE}/api/builder/customer/me/`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.replace("/customer/login");
            return;
          }
          throw new Error(data.error || "Unable to load your dashboard.");
        }

        if (!cancelled) {
          setCustomerData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/builder/customer/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    window.location.replace("/customer/login");
  }

  if (loading) {
    return (
      <>
        <style>{dashboardStyles}</style>
        <main className="customer-loading">
          <div className="customer-loading-inner">
            <div className="customer-spinner" />
            <p>Preparing your portfolio workspace...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{dashboardStyles}</style>
        <main className="customer-error">
          <section className="customer-error-card">
            <h1>Unable to open dashboard</h1>
            <p>{error}</p>
            <button
              className="customer-primary-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </section>
        </main>
      </>
    );
  }

  const customer = customerData?.customer || {};
  const portfolio = customerData?.portfolio || {};
  const profile = portfolio.profile || {};

  const displayName =
    profile.fullName || customer.email || "Customer";

  const initials = displayName
    .trim()
    .charAt(0)
    .toUpperCase();

  const status = (portfolio.status || "draft").toLowerCase();
  // A previously approved snapshot remains public while a newer draft is under review.
  const hasPublishedVersion = Boolean(portfolio.publishedAt && portfolio.slug);
  const livePortfolioUrl = hasPublishedVersion
    ? `${window.location.origin}/portfolio/${encodeURIComponent(portfolio.slug)}`
    : "";
  const reviewStatus = (portfolio.review?.status || "").toLowerCase();

  return (
    <>
      <style>{dashboardStyles}</style>

      <main className="customer-app">
        <header className="customer-topbar">
          <div className="customer-brand">
            <div className="customer-brand-avatar" aria-label="Your profile photo">
              {profile.profileImageUrl && !profileImageFailed ? (
                <img
                  src={profile.profileImageUrl}
                  alt={`${displayName}'s profile`}
                  onError={() => setProfileImageFailed(true)}
                />
              ) : (
                initials
              )}
            </div>
            <div className="customer-brand-copy">
              <div className="customer-brand-name">Portfolio Studio</div>
              <div className="customer-brand-sub">
                YOUR PERSONAL WEBSITE WORKSPACE
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="customer-logout"
          >
            Log out ↗
          </button>
        </header>

        <div className="customer-content">
          <section className="customer-welcome">
            <div>
              <p className="customer-eyebrow">YOUR WORKSPACE</p>
              <h1>Welcome back, {displayName.split(' ')[0]}.</h1>
              <p>
                Hello, {displayName}. Your portfolio journey continues here.
              </p>
            </div>

          </section>

          <section>
            <h2 className="customer-section-heading">
              Your portfolio overview
            </h2>

            <div className="customer-portfolio-card">
              <div className="customer-portfolio-top">
                <div>
                  <h3 className="customer-portfolio-title">
                    {portfolio.title || "My Portfolio"}
                  </h3>
                  <p className="customer-portfolio-subtitle">
                    Your personal website at a glance
                  </p>
                </div>

                <span className={`customer-status ${status}`}>
                  ● {status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="customer-details-grid">
                <div className="customer-detail">
                  <div className="customer-detail-label">
                    Portfolio title
                  </div>
                  <div className="customer-detail-value">
                    {portfolio.title || "My Portfolio"}
                  </div>
                </div>

                <div className="customer-detail">
                  <div className="customer-detail-label">
                    Selected template
                  </div>
                  <div className="customer-detail-value">
                    {portfolio.selectedTemplate || "minimal"}
                  </div>
                </div>

                <div className="customer-detail">
                  <div className="customer-detail-label">
                    Account email
                  </div>
                  <div className="customer-detail-value">
                    {customer.email || "Not available"}
                  </div>
                </div>

                <div className="customer-detail">
                  <div className="customer-detail-label">
                    Publishing status
                  </div>
                  <div className="customer-detail-value">
                    {status.replaceAll("_", " ")}
                  </div>
                </div>
              </div>
            </div>

            <section className="customer-live-site-card" aria-labelledby="customer-live-site-heading">
              <div className="customer-live-site-copy">
                <p className="customer-live-site-eyebrow">YOUR WEBSITE</p>
                <h3 id="customer-live-site-heading">Your Live Portfolio Website Address</h3>
                {hasPublishedVersion ? (
                  <>
                    <p className="customer-live-site-message">
                      Your approved portfolio is live and available to visitors.
                      {status === "in_review" ? " Your latest updates are waiting for approval; the current live version remains unchanged." : ""}
                    </p>
                    <a className="customer-live-site-url" href={livePortfolioUrl} target="_blank" rel="noreferrer">
                      {livePortfolioUrl}
                    </a>
                  </>
                ) : status === "changes_requested" || reviewStatus === "changes_requested" ? (
                  <>
                    <p className="customer-live-site-message">
                      Changes were requested by the portfolio owner. Update your portfolio and submit it again.
                    </p>
                    {portfolio.review?.notes && (
                      <p className="customer-review-feedback"><strong>Owner feedback:</strong> {portfolio.review.notes}</p>
                    )}
                    <span className="customer-live-site-state changes">Changes requested</span>
                  </>
                ) : status === "in_review" || reviewStatus === "pending" ? (
                  <>
                    <p className="customer-live-site-message">Your portfolio has been submitted successfully and is waiting for owner approval.</p>
                    <span className="customer-live-site-state pending">Yet to be approved</span>
                  </>
                ) : (
                  <>
                    <p className="customer-live-site-message">Your live website address will appear here after the owner reviews and approves your portfolio.</p>
                    <span className="customer-live-site-state pending">Yet to be approved</span>
                  </>
                )}
              </div>
              {hasPublishedVersion && (
                <a className="customer-live-site-button" href={livePortfolioUrl} target="_blank" rel="noreferrer">
                  Visit live website ↗
                </a>
              )}
            </section>

            <div className="customer-resume-banner">
              <div>
                <h3>Build your professional resume</h3>
                <p>Create a separate resume with four templates, live preview, saved drafts and A4 PDF download.</p>
              </div>
              <button type="button" className="customer-primary-button" onClick={() => { window.location.href = "/customer/resume"; }}>
                Create Resume →
              </button>
            </div>

            <div className="customer-editor-banner">
              <div>
                <h3>Make your portfolio stand out ✨</h3>
                <p>
                  Update your profile, add your skills and projects,
                  and create a website that represents you.
                </p>
              </div>

              <button
                type="button"
                className="customer-primary-button"
                onClick={() => {
                  window.location.href = "/customer/editor";
                }}
              >
                Edit my portfolio →
              </button>
            </div>
          </section>

          <footer className="customer-footer">
            Your personal portfolio workspace · Manage your presence online
          </footer>
        </div>
      </main>
    </>
  );
}
