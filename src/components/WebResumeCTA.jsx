import React from "react";
import "../css/WebResumeCTA.css";

function WebResumeCTA() {
  return (
    <section className="webresume-cta" aria-labelledby="webresume-cta-title">
      <div className="webresume-cta-glow" aria-hidden="true" />
      <div className="webresume-cta-content">
        <span className="webresume-cta-eyebrow">INTRODUCING WEBRESUME</span>
        <h2 id="webresume-cta-title">Want to build your own portfolio and resume?</h2>
        <p>
          Create a professional online presence, showcase your skills and projects,
          and build a resume that helps you stand out.
        </p>
        <div className="webresume-cta-actions">
          <a className="webresume-cta-primary" href="/customer/register">
            Create your free account <span aria-hidden="true">→</span>
          </a>
          <a className="webresume-cta-secondary" href="/customer/login">
            Already have an account? Sign in
          </a>
        </div>
        <div className="webresume-cta-note">
          Start building today · Submit your portfolio for review when you're ready
        </div>
      </div>
    </section>
  );
}

export default WebResumeCTA;
