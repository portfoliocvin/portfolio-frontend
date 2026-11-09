import React, { useEffect, useRef, useState } from "react";
import { apiRequest, assetUrl } from "../admin/adminApi";
import "../css/TemplateShowcases.css";

const resumes = [
  ["classic", "Classic Professional", "Clean and ATS-friendly"],
  ["modern", "Modern", "Contemporary two-column"],
  ["ats", "ATS Optimized", "Recruiter-friendly layout"],
  ["executive", "Executive", "Formal and structured"],
  ["creative", "Creative", "Expressive accent style"],
  ["compact", "Compact One-Page", "Concise and space-saving"],
  ["academic", "Academic CV", "Education and research"],
  ["technical", "Technical Specialist", "Skills and projects first"],
  ["elegant", "Elegant Minimal", "Refined and minimal"],
  ["bold", "Bold Contemporary", "Strong modern header"],
  ["timeline", "Professional Timeline", "Timeline and sidebar"]
].map(([key, name, note]) => ({ key, name, note }));

const PortfolioCard = ({ item, index }) => (
  <article className="platform-showcase-card">
    <a className="platform-square-preview" href={"/template-preview/portfolio/" + item.key} aria-label={"Preview " + item.name + " portfolio template"}>
      {item.previewImageUrl ? <img src={assetUrl(item.previewImageUrl)} alt={item.name + " portfolio preview"} /> :
        <div className={"platform-mini-portfolio mini-portfolio-" + (index % 6)}>
          <div className="mini-portfolio-top"><i /><i /><i /></div>
          <div className="mini-portfolio-content">
            <span>PERSONAL PORTFOLIO</span>
            <b>{["Hello, I'm Alex.", "Design with purpose.", "Ideas into impact.", "Creative developer.", "Build something great.", "Your story, online."][index % 6]}</b>
            <i className="mini-portfolio-line" /><div className="mini-portfolio-blocks"><i /><i /><i /></div>
          </div>
        </div>}
      <span className="platform-preview-overlay">Open live preview <b>↗</b></span>
    </a>
    <div className="platform-showcase-card-info"><div><b>{item.name}</b><small>{item.category || "Portfolio design"}</small></div><span>PORTFOLIO</span></div>
  </article>
);

const ResumeCard = ({ item, index }) => (
  <article className="platform-showcase-card">
    <a className="platform-square-preview" href={"/template-preview/resume/" + item.key} aria-label={"Preview " + item.name + " resume template"}>
      <div className={"platform-mini-resume mini-resume-" + (index % 6)}>
        <div className="mini-resume-header"><i /><span><b /><small /></span></div>
        <div className="mini-resume-contact" />
        <div className="mini-resume-columns"><div><b /><i /><i /><i /><b /><i /><i /></div><div><b /><i /><i /><b /><i /><i /><i /></div></div>
      </div>
      <span className="platform-preview-overlay">Open live preview <b>↗</b></span>
    </a>
    <div className="platform-showcase-card-info"><div><b>{item.name}</b><small>{item.note}</small></div><span>RESUME</span></div>
  </article>
);

const Carousel = ({ type, eyebrow, title, description, items }) => {
  const track = useRef(null);
  const resume = type === "resume";
  const Card = resume ? ResumeCard : PortfolioCard;
  const scroll = (direction) => track.current && track.current.scrollBy({ left: direction * track.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="platform-showcase-section">
      <div className="platform-showcase-heading">
        <div><div className="platform-eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>
        <div className="platform-carousel-controls">
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous templates">←</button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next templates">→</button>
        </div>
      </div>
      <div className="platform-showcase-track" ref={track}>
        {items.map((item, index) => <Card key={item.key} item={item} index={index} />)}
      </div>
      <div className="platform-showcase-footer"><span>Swipe or use arrows to explore</span><a href="/customer/register">{resume ? "Create your resume" : "Build your portfolio"} <b>→</b></a></div>
    </section>
  );
};

export default function TemplateShowcases() {
  const [portfolios, setPortfolios] = useState([
    { key: "minimal", name: "Minimal", category: "Clean & simple" },
    { key: "dark_developer", name: "Dark Developer", category: "Developer" },
    { key: "creative", name: "Creative", category: "Creative" },
    { key: "professional", name: "Professional", category: "Business" },
    { key: "modern_profile", name: "Modern Profile", category: "Modern" },
    { key: "career_timeline", name: "Career Timeline", category: "Career" }
  ]);
  useEffect(() => {
    let active = true;
    apiRequest("/api/builder/templates/").then((data) => {
      if (active && Array.isArray(data.templates) && data.templates.length) setPortfolios(data.templates);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return (
    <>
      <Carousel type="portfolio" eyebrow="MAKE A GREAT FIRST IMPRESSION" title={<>Portfolio designs that <span>tell your story.</span></>} description="Explore the available portfolio styles. Choose a look that reflects your work, personality and goals." items={portfolios} />
      <Carousel type="resume" eyebrow="PRESENT YOUR EXPERIENCE" title={<>A resume style for <span>every next step.</span></>} description="Browse professional resume layouts, from ATS-friendly formats to creative and technical designs." items={resumes} />
    </>
  );
}
