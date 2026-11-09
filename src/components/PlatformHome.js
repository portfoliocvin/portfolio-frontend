import React from "react";
import TemplateShowcases from "./TemplateShowcases";
import "../css/PlatformHome.css";

const PlatformHome = () => {
  return (
    <div className="platform-home">
      <header className="platform-header">
        <a className="platform-brand" href="/" aria-label="Portfolio.cv home">
          <span className="platform-brand-mark">P</span>
          <span>Portfolio<span className="platform-brand-dot">.</span>cv</span>
        </a>

        <nav className="platform-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#resume-builder">Resume Builder</a>
          <a href="#portfolio-builder">Portfolio Builder</a>
          <a href="#private-jobs">Private Jobs</a>
          <a href="#government-jobs">Government Jobs</a>
        </nav>

        <div className="platform-header-actions">
          <a className="platform-login" href="/customer/login">Sign in</a>
          <a className="platform-nav-cta" href="/portfolio-preview">See Portfolio Preview <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main>
        <section className="platform-hero" id="home">
          <div className="platform-hero-glow platform-hero-glow-one" />
          <div className="platform-hero-glow platform-hero-glow-two" />
          <div className="platform-hero-content">
            <div className="platform-eyebrow"><span /> YOUR CAREER, BUILT IN ONE PLACE</div>
            <h1>Build your future.<br /><span>Show the world</span> your potential.</h1>
            <p className="platform-hero-copy">
              Create a professional resume, publish a portfolio that tells your story,
              and discover career opportunities — all from one platform.
            </p>
            <div className="platform-hero-actions">
              <a className="platform-button platform-button-primary" href="/customer/register">Get started <span aria-hidden="true">→</span></a>
              <a className="platform-button platform-button-ghost" href="/portfolio-preview"><span aria-hidden="true">▶</span> See portfolio preview</a>
            </div>
            <div className="platform-hero-trust">
              <span><b>01</b> Build your resume</span>
              <span><b>02</b> Showcase your work</span>
              <span><b>03</b> Find opportunities</span>
            </div>
          </div>
          <div className="platform-hero-art" aria-label="Resume and portfolio preview illustration">
            <div className="platform-orbit platform-orbit-one" />
            <div className="platform-orbit platform-orbit-two" />
            <div className="platform-preview-card platform-resume-card">
              <div className="platform-card-topline"><span className="platform-mini-logo">P.</span><span>RESUME / 2026</span></div>
              <div className="platform-avatar">CV</div>
              <div className="platform-skeleton platform-skeleton-title" />
              <div className="platform-skeleton platform-skeleton-subtitle" />
              <div className="platform-resume-rule" />
              <div className="platform-skeleton platform-skeleton-wide" />
              <div className="platform-skeleton platform-skeleton-medium" />
              <div className="platform-skeleton platform-skeleton-wide" />
              <div className="platform-skeleton platform-skeleton-short" />
              <div className="platform-resume-tags"><i /> <i /> <i /></div>
            </div>
            <div className="platform-preview-card platform-portfolio-card">
              <div className="platform-portfolio-bar"><span /><span /><span /></div>
              <div className="platform-portfolio-inner">
                <div className="platform-portfolio-label">PERSONAL PORTFOLIO</div>
                <div className="platform-portfolio-heading">Make your<br /><em>work stand out.</em></div>
                <div className="platform-portfolio-line" />
                <div className="platform-portfolio-projects"><i /><i /><i /></div>
              </div>
            </div>
            <div className="platform-floating-chip"><span>✦</span> Your next chapter starts here</div>
          </div>
        </section>

        <section className="platform-feature-strip" aria-label="Platform features">
          <div><span className="platform-feature-icon">▤</span><span><b>Resume Builder</b><small>Professional, recruiter-ready resumes</small></span></div>
          <div><span className="platform-feature-icon">◈</span><span><b>Portfolio Builder</b><small>Your work, presented beautifully</small></span></div>
          <div><span className="platform-feature-icon">⌕</span><span><b>Job Opportunities</b><small>Private and government careers</small></span></div>
        </section>

        <TemplateShowcases />

        <section className="platform-section platform-tools-section">
          <div className="platform-section-heading">
            <div className="platform-eyebrow">TOOLS FOR YOUR NEXT STEP</div>
            <h2>Everything you need to move <span>forward.</span></h2>
            <p>Whether you're starting out or taking the next step in your career, build a stronger professional presence.</p>
          </div>
          <div className="platform-tool-grid">
            <article className="platform-tool-card" id="resume-builder">
              <div className="platform-tool-icon resume-icon">▤</div>
              <div className="platform-card-kicker">CREATE WITH CONFIDENCE</div>
              <h3>Resume Builder</h3>
              <p>Turn your education, skills and experience into a clear, professional resume that is ready to share.</p>
              <ul><li>Structured resume sections</li><li>Professional templates</li><li>Easy editing and updates</li></ul>
              <a href="/customer/register">Create your resume <span>→</span></a>
            </article>
            <article className="platform-tool-card platform-tool-card-featured" id="portfolio-builder">
              <div className="platform-tool-icon portfolio-icon">◈</div>
              <div className="platform-card-kicker">MAKE YOUR WORK VISIBLE</div>
              <h3>Portfolio Builder</h3>
              <p>Showcase your projects, skills and achievements with a personal website you can share anywhere.</p>
              <ul><li>Personal portfolio page</li><li>Projects, skills and certificates</li><li>Publish after review</li></ul>
              <a href="/customer/register">Build your portfolio <span>→</span></a>
            </article>
            <article className="platform-tool-card">
              <div className="platform-tool-icon preview-icon">↗</div>
              <div className="platform-card-kicker">SEE WHAT'S POSSIBLE</div>
              <h3>Portfolio Preview</h3>
              <p>Explore the live personal portfolio that demonstrates how a published Portfolio.cv page can look.</p>
              <ul><li>Real portfolio layout</li><li>Projects and experience</li><li>Contact and resume sections</li></ul>
              <a href="/portfolio-preview">View portfolio preview <span>→</span></a>
            </article>
          </div>
        </section>

        <section className="platform-jobs-section">
          <div className="platform-section-heading">
            <div className="platform-eyebrow">TAKE THE NEXT CAREER STEP</div>
            <h2>Explore opportunities. <span>Find your path.</span></h2>
            <p>Dedicated spaces for private-sector openings and government recruitment updates.</p>
          </div>
          <div className="platform-jobs-grid">
            <article className="platform-job-card private-job-card" id="private-jobs">
              <div className="platform-job-icon">▣</div>
              <div className="platform-job-label">PRIVATE SECTOR</div>
              <h3>Private Jobs</h3>
              <p>Discover opportunities across technology, engineering, business, operations and more — for freshers and experienced professionals.</p>
              <div className="platform-job-tags"><span>Freshers</span><span>Experienced</span><span>Internships</span></div>
              <div className="platform-job-status"><span /> Job listings are being prepared</div>
            </article>
            <article className="platform-job-card government-job-card" id="government-jobs">
              <div className="platform-job-icon">▥</div>
              <div className="platform-job-label">PUBLIC SECTOR</div>
              <h3>Government Jobs</h3>
              <p>Find a dedicated space for central and state government recruitment, examinations, eligibility and important dates.</p>
              <div className="platform-job-tags"><span>Central</span><span>State</span><span>PSU</span></div>
              <div className="platform-job-status"><span /> Job listings are being prepared</div>
            </article>
          </div>
          <p className="platform-jobs-note">We’ll publish job details here once listings are verified. Always confirm eligibility and deadlines on the official recruiting organisation’s website.</p>
        </section>

        <section className="platform-final-cta">
          <div className="platform-final-cta-content">
            <div className="platform-eyebrow">YOUR NEXT CHAPTER STARTS NOW</div>
            <h2>Make your skills<br /><span>impossible to miss.</span></h2>
            <p>Create your account and start building your professional presence with Portfolio.cv.</p>
            <a className="platform-button platform-button-primary" href="/customer/register">Create your free account <span>→</span></a>
          </div>
          <div className="platform-final-cta-mark">P<span>.</span></div>
        </section>
      </main>

      <footer className="platform-footer">
        <a className="platform-brand" href="/"><span className="platform-brand-mark">P</span><span>Portfolio<span className="platform-brand-dot">.</span>cv</span></a>
        <p>Build your career. Showcase your talent.</p>
        <div><a href="/portfolio-preview">Portfolio preview</a><a href="/customer/login">Sign in</a></div>
        <small>© {new Date().getFullYear()} Portfolio.cv. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default PlatformHome;
