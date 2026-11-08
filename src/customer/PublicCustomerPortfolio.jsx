
import { useEffect, useMemo, useState } from "react";
import { assetUrl } from "../admin/adminApi";
import "./PublicCustomerPortfolio.css";

const IS_LOCAL_FRONTEND =
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1") &&
  window.location.port === "3000";

const API_BASE = (
  IS_LOCAL_FRONTEND
    ? process.env.REACT_APP_API_URL || "http://localhost:8080"
    : process.env.REACT_APP_API_URL || ""
).replace(/\/+$/, "");

const SECTION_CONFIG = [
  { key: "about", title: "About", number: "01", empty: "A little more about this professional will be shared here soon." },
  { key: "experience", title: "Experience", number: "02", empty: "Professional experience will be updated here soon." },
  { key: "skills", title: "Skills & Expertise", number: "03", empty: "Skills and areas of expertise will be updated soon." },
  { key: "projects", title: "Selected Projects", number: "04", empty: "Exciting projects are being prepared. Check back soon." },
  { key: "education", title: "Education", number: "05", empty: "Education details will be added here soon." },
  { key: "certifications", title: "Certifications", number: "06", empty: "Professional achievements will be showcased here soon." },
];

function hasContent(value) {
  if (Array.isArray(value)) return value.some(hasContent);
  if (value && typeof value === "object") return Object.values(value).some(hasContent);
  return typeof value === "string" ? value.trim().length > 0 : value != null && value !== false;
}

function safeExternalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const raw = value.trim();

  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  if (/^(javascript|data):/i.test(raw)) return "";

  return `https://${raw}`;
}

function getPhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function getWhatsAppUrl(value, name) {
  let digits = getPhoneDigits(value);

  if (!digits) return "";

  // Indian 10-digit mobile numbers automatically receive country code 91.
  // International numbers should include their country code.
  if (digits.length === 10) digits = `91${digits}`;

  const message = `Hello ${name || "there"}, I found your portfolio and would like to connect.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function Placeholder({ title = "Coming soon", children }) {
  return (
    <div className="public-empty-state" role="note">
      <span className="public-empty-icon" aria-hidden="true">✦</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function PublicCustomerPortfolio({ slug }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/builder/public/${encodeURIComponent(slug)}/`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail ||
            data.error ||
            "This portfolio is not published yet."
          );
        }

        if (!data || !data.portfolio) {
          throw new Error(
            "The public portfolio API did not return portfolio data. Check the API URL and publishing status."
          );
        }

        return data.portfolio;
      })
      .then((data) => {
        if (active) setPortfolio(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load this portfolio.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const content = portfolio?.content || {};
  const profile = content.profile || {};
  const template = portfolio?.template || "minimal";

  const sections = useMemo(() => SECTION_CONFIG, []);

  const fullName =
    profile.fullName ||
    portfolio?.title ||
    "Your Name";

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const email = String(profile.email || "").trim();
  const phone = String(profile.mobileNumber || "").trim();
  const phoneDigits = getPhoneDigits(phone);

  const whatsappUrl = getWhatsAppUrl(phone, fullName);

  const emailSubject = `Professional enquiry for ${fullName}`;

const emailBody =
  `Hello ${fullName},\n\n` +
  `I visited your portfolio and would like to connect with you.\n\n` +
  `Regards,`;

const emailUrl = email
  ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(
      emailBody
    )}`
  : "";

  const resumeUrl = content.resumeUrl
    ? assetUrl(content.resumeUrl)
    : "";

  const socialLinks = Object.entries(profile.socialLinks || {})
    .map(([label, value]) => ({
      label,
      url: safeExternalUrl(value),
    }))
    .filter((item) => item.url);

  useEffect(() => {
    if (portfolio?.title) {
      document.title = `${portfolio.title} | Portfolio`;
    }
  }, [portfolio?.title]);

  if (loading) {
    return (
      <main className="public-portfolio-state">
        <div className="public-loader" />
        <p>Preparing this portfolio…</p>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="public-portfolio-state">
        <div className="public-state-icon">↗</div>
        <h1>Portfolio unavailable</h1>
        <p>{error || "This portfolio is not available right now."}</p>
      </main>
    );
  }

  return (
    <main className={`public-customer-portfolio template-${template}`}>
      <div className="public-page-glow public-page-glow-one" aria-hidden="true" />
      <div className="public-page-glow public-page-glow-two" aria-hidden="true" />

      {/* NAVIGATION */}
      <nav className="public-portfolio-nav" aria-label="Main navigation">
        <a href="#top" className="public-brand">
          <span className="public-brand-mark">{initials || "P"}</span>
          <span>{fullName}</span>
        </a>

        <div className="public-nav-links">
          {sections.map((section) => (
            <a key={section.key} href={`#${section.key}`}>
              {section.title === "Selected Projects"
                ? "Projects"
                : section.title}
            </a>
          ))}

          <a href="#resume">Resume</a>

          <a href="#contact" className="public-nav-contact">
            Let's talk <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="public-portfolio-hero" id="top">
        <div className="public-hero-copy">
          <div className="public-availability">
            <span className="public-availability-dot" />
            PERSONAL PORTFOLIO
          </div>

          <p className="public-eyebrow">HELLO, I'M</p>

          <h1 className={fullName.length > 17 ? "public-name-long" : ""}>
            {fullName}
          </h1>

          <h2>
            {profile.headline ||
              "Building meaningful work with curiosity and purpose."}
          </h2>

          <p className="public-hero-about">
            {hasContent(profile.about)
              ? profile.about
              : "Welcome to my professional portfolio. Explore my experience, skills, projects and the work I'm passionate about."}
          </p>

          {/* CONTACT BUTTONS */}
          <div className="public-hero-actions">
            {emailUrl && (
              <a
  className="public-button primary"
  href={emailUrl}
  target="_blank"
  rel="noopener noreferrer"
>
                Email me <span aria-hidden="true">↗</span>
              </a>
            )}

            {whatsappUrl && (
              <a
                className="public-button whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp <span aria-hidden="true">↗</span>
              </a>
            )}

            {phoneDigits && (
              <a
                className="public-button secondary"
                href={`tel:${phoneDigits}`}
              >
                Call me <span aria-hidden="true">↗</span>
              </a>
            )}

            {resumeUrl && (
              <a
                className="public-button resume"
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">↓</span> View résumé
              </a>
            )}
          </div>

          {profile.location && (
            <p className="public-location">
              <span aria-hidden="true">⌖</span> {profile.location}
            </p>
          )}
        </div>

        <div className="public-hero-visual">
          <div className="public-portrait-halo" />

          {profile.profileImageUrl ? (
            <img
              className="public-profile-image"
              src={assetUrl(profile.profileImageUrl)}
              alt={`${fullName} profile`}
            />
          ) : (
            <div className="public-profile-fallback" aria-label={fullName}>
              {initials || "P"}
            </div>
          )}

          <div className="public-visual-note">
            <span>✦</span>
            <div>
              <strong>Driven by ideas</strong>
              <small>Focused on what's next</small>
            </div>
          </div>

          <span className="public-visual-orbit orbit-one" />
          <span className="public-visual-orbit orbit-two" />
        </div>

        <a className="public-scroll-cue" href="#about">
          <span /> SCROLL TO EXPLORE
        </a>
      </header>

      {/* SECTION INTRO */}
      <div className="public-content-intro">
        <span>THE JOURNEY</span>
        <p>
          A closer look at my background, capabilities, and selected work.
        </p>
      </div>

      {/* PORTFOLIO SECTIONS */}
      <div className="public-sections">
        {sections.map((section) => {
          const value =
            section.key === "about"
              ? content.about || profile.about
              : content[section.key];

          const empty = !hasContent(value);

          return (
            <section
              className={`public-content-section public-section-${section.key}`}
              id={section.key}
              key={section.key}
            >
              <div className="public-section-heading">
                <span className="public-section-number">
                  {section.number}
                </span>

                <div>
                  <p className="public-section-kicker">GET TO KNOW ME</p>
                  <h2>{section.title}</h2>
                </div>

                <span className="public-heading-line" />
              </div>

              {empty ? (
                <Placeholder
                  title={
                    section.key === "projects"
                      ? "In progress"
                      : "Coming soon"
                  }
                >
                  {section.empty}
                </Placeholder>
              ) : (
                <SectionContent
                  sectionKey={section.key}
                  value={value}
                />
              )}
            </section>
          );
        })}

        {/* RESUME SECTION */}
        <section className="public-content-section public-section-resume" id="resume">
          <div className="public-section-heading">
            <span className="public-section-number">07</span>
            <div>
              <p className="public-section-kicker">MY PROFESSIONAL PROFILE</p>
              <h2>Resume</h2>
            </div>
            <span className="public-heading-line" />
          </div>

          <div className="public-resume-card">
            <div className="public-resume-icon" aria-hidden="true">PDF</div>
            <div className="public-resume-copy">
              <h3>{resumeUrl ? `${fullName} — Resume` : "Resume coming soon"}</h3>
              <p>
                {resumeUrl
                  ? "View or download the latest copy of my professional resume."
                  : "My professional resume will be available here soon."}
              </p>
            </div>
            {resumeUrl ? (
              <a
                className="public-button resume public-resume-action"
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View resume <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="public-resume-status">In progress</span>
            )}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="public-contact-panel" id="contact">
          <div>
            <p className="public-eyebrow">
              HAVE AN OPPORTUNITY OR PROJECT?
            </p>

            <h2>
              Let's start a
              <br />
              <em>conversation.</em>
            </h2>

            <p className="public-contact-copy">
              Whether you're an HR professional, recruiter, client or
              collaborator, I'd be happy to hear from you.
            </p>
          </div>

          <div className="public-contact-actions">
            <div className="public-contact-buttons">
              {emailUrl && (
                <a
  className="public-button primary"
  href={emailUrl}
  target="_blank"
  rel="noopener noreferrer"
>
                  Send an email <span aria-hidden="true">↗</span>
                </a>
              )}

              {whatsappUrl && (
                <a
                  className="public-button contact-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp <span aria-hidden="true">↗</span>
                </a>
              )}

              {phoneDigits && (
                <a
                  className="public-button contact-call"
                  href={`tel:${phoneDigits}`}
                >
                  Call {phone} <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div
                className="public-contact-list"
                aria-label="Social profiles"
              >
                {socialLinks.map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (c) => c.toUpperCase())}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}

            {!emailUrl && !whatsappUrl && !phoneDigits && (
              <Placeholder title="Contact details coming soon">
                Contact options will appear here once they are added to
                the profile.
              </Placeholder>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="public-portfolio-footer">
        <div className="public-footer-main">
          <a href="#top" className="public-footer-brand">
            <span className="public-brand-mark">{initials || "P"}</span>
            <span>{fullName}</span>
          </a>

          <p>
            Thank you for taking the time to explore my portfolio.
          </p>

          <div className="public-footer-links">
            {sections.map((section) => (
              <a key={section.key} href={`#${section.key}`}>
                {section.title === "Selected Projects"
                  ? "Projects"
                  : section.title}
              </a>
            ))}
            <a href="#resume">Resume</a>
            <a href="#contact">Contact</a>
          </div>

          <a className="public-footer-top" href="#top">
            Back to top ↑
          </a>
        </div>

        <div className="public-footer-bottom">
          <span>
            © {new Date().getFullYear()} {fullName}. All rights reserved.
          </span>
          <span>Personal portfolio · Built to share my journey</span>
        </div>
      </footer>
    </main>
  );
}

function SectionContent({ sectionKey, value }) {
  if (sectionKey === "about") {
    return (
      <p className="public-prose">
        {typeof value === "string" ? value : value?.text || ""}
      </p>
    );
  }

  if (Array.isArray(value)) {
    if (
      sectionKey === "skills" &&
      value.every(
        (item) =>
          typeof item === "string" ||
          typeof item === "number"
      )
    ) {
      return (
        <div className="public-skill-cloud">
          {value.map((skill, index) => (
            <span key={`${skill}-${index}`}>{skill}</span>
          ))}
        </div>
      );
    }

    return (
      <div className={`public-items public-items-${sectionKey}`}>
        {value.map((item, index) => {
          const record =
            typeof item === "string" ? { title: item } : item || {};

          const title =
            record.title ||
            record.name ||
            record.institution ||
            record.role ||
            record.degree ||
            `Item ${index + 1}`;

          const description =
            record.description ||
            record.details ||
            record.about ||
            "";

          const itemUrl = safeExternalUrl(
            record.url ||
            record.projectUrl ||
            record.certificateUrl
          );

          return (
            <article
              className="public-item-card"
              key={record.id || `${title}-${index}`}
            >
              <span className="public-item-index">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{title}</h3>

              {(record.issuer ||
                record.organization ||
                record.company ||
                record.category) && (
                <p className="public-item-meta">
                  {record.issuer ||
                    record.organization ||
                    record.company ||
                    record.category}
                </p>
              )}

              {description && <p>{description}</p>}

              {Array.isArray(record.technologies) &&
                record.technologies.length > 0 && (
                  <div className="public-tags">
                    {record.technologies.map((tag, i) => (
                      <span key={i}>
                        {typeof tag === "string" ? tag : tag.name}
                      </span>
                    ))}
                  </div>
                )}

              {itemUrl && (
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore details <span aria-hidden="true">↗</span>
                </a>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="public-items">
        {Object.entries(value).map(([key, val]) => (
          <article className="public-item-card" key={key}>
            <h3>{key}</h3>
            <p>
              {Array.isArray(val)
                ? val.join(", ")
                : typeof val === "string"
                  ? val
                  : ""}
            </p>
          </article>
        ))}
      </div>
    );
  }

  return <p className="public-prose">{String(value)}</p>;
}

export default PublicCustomerPortfolio;
