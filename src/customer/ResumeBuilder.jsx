import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../admin/adminApi";
import "./ResumeBuilder.css";

const LEVELS = ["Class X", "Class XI", "Intermediate / Class XII", "Undergraduate", "Postgraduate"];
const EMPTY = {
  personal: { fullName: "", headline: "", email: "", mobile: "", location: "", linkedin: "", github: "", links: "", summary: "" },
  education: LEVELS.map((qualification) => ({ qualification, institution: "", board: "", start: "", completion: "", score: "" })),
  skills: "", languages: "", certifications: [], projects: [],
};
const TEMPLATES = [
  ["classic", "Classic Professional", "Clean, ATS-friendly"],
  ["modern", "Modern", "Contemporary two-column"],
  ["executive", "Executive", "Formal and structured"],
  ["creative", "Creative", "Distinctive accent style"],
  ["ats", "ATS Optimized", "Simple, recruiter-friendly layout"],
  ["compact", "Compact One-Page", "Space-saving and concise"],
  ["academic", "Academic CV", "Education and research focused"],
  ["technical", "Technical Specialist", "Skills and projects forward"],
  ["elegant", "Elegant Minimal", "Refined typography and spacing"],
  ["bold", "Bold Contemporary", "Strong header and modern accents"],
  ["timeline", "Professional Timeline Sidebar", "Photo-style header and timeline layout"],
];

const SAMPLE_RESUME = {
  personal: {
    fullName: "Alex Morgan",
    headline: "Computer Science Graduate | Software Developer",
    email: "alex.morgan@email.com",
    mobile: "+91 98765 43210",
    location: "Hyderabad, India",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
    links: "",
    summary: "Motivated computer science graduate with a strong foundation in programming, problem-solving and software development. Eager to contribute to practical projects, learn emerging technologies and deliver reliable solutions."
  },
  education: [
    { qualification: "Class X", institution: "City High School", board: "State Board", start: "", completion: "2016", score: "GPA: 9.2" },
    { qualification: "Class XI", institution: "", board: "", start: "", completion: "", score: "" },
    { qualification: "Intermediate / Class XII", institution: "City Junior College", board: "State Board", start: "", completion: "2018", score: "Percentage: 84%" },
    { qualification: "Undergraduate", institution: "ABC Institute of Technology", board: "B.Tech, Computer Science", start: "2018", completion: "2022", score: "CGPA: 8.1" },
    { qualification: "Postgraduate", institution: "", board: "", start: "", completion: "", score: "" }
  ],
  skills: "Python, JavaScript, React, SQL, Git, Communication, Problem Solving",
  languages: "English (Fluent), Hindi (Professional), Telugu (Native)",
  certifications: [
    { name: "Python Programming", issuer: "Online Learning Academy", date: "2023" },
    { name: "Web Development Fundamentals", issuer: "Tech Skills Institute", date: "2022" }
  ],
  projects: [
    { title: "Personal Portfolio Website", description: "Designed and developed a responsive portfolio website to showcase projects, technical skills and professional experience.", technologies: "React, CSS, JavaScript", url: "github.com/alexmorgan/portfolio" },
    { title: "Student Management System", description: "Built an application to manage student records, course details and academic information.", technologies: "Python, SQL", url: "" }
  ]
};

export default function ResumeBuilder() {
  const [content, setContent] = useState(EMPTY);
  const [template, setTemplate] = useState("classic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savedResumeOpen, setSavedResumeOpen] = useState(false);
  const [savedResumeLoading, setSavedResumeLoading] = useState(false);
  const [savedResume, setSavedResume] = useState(null);
  const [savedResumeError, setSavedResumeError] = useState("");
  const templateCarouselRef = useRef(null);
  const profileImageInputRef = useRef(null);

  // A saved indicator belongs to the exact template/content version that was saved.
  // Hide it as soon as the user selects another template or edits any resume field.
  useEffect(() => {
    setSaveSuccess(false);
  }, [template, content]);

const scrollTemplates = (direction) => {
  if (templateCarouselRef.current) {
    templateCarouselRef.current.scrollBy({
      left: direction * 300,
      behavior: "smooth",
    });
  }
};

  useEffect(() => {
    let active = true;
    apiRequest("/api/builder/customer/resume/")
      .then((data) => {
        if (!active || !data.resume) return;
        setTemplate(data.resume.template || "classic");
        setContent({ ...EMPTY, ...(data.resume.content || {}), personal: { ...EMPTY.personal, ...(data.resume.content?.personal || {}) }, education: LEVELS.map((level) => ({ ...EMPTY.education.find((x) => x.qualification === level), ...(data.resume.content?.education || []).find((x) => x.qualification === level) })) });
      })
      .catch((e) => { if (active) setError(e.message || "Unable to load your resume."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updatePersonal = (field, value) => setContent((old) => ({ ...old, personal: { ...old.personal, [field]: value } }));

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSide = 800;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressedImage = canvas.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(objectUrl);
      updatePersonal("profileImage", compressedImage);
      setError("");
      setMessage("Profile photo added to your timeline resume.");
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Unable to read that image. Please try another file.");
    };
    image.src = objectUrl;
  };
  const updateEducation = (index, field, value) => setContent((old) => ({ ...old, education: old.education.map((row, i) => i === index ? { ...row, [field]: value } : row) }));
  const updateList = (key, index, field, value) => setContent((old) => ({ ...old, [key]: old[key].map((row, i) => i === index ? { ...row, [field]: value } : row) }));
  const addList = (key, item) => setContent((old) => ({ ...old, [key]: [...(old[key] || []), item] }));
  const removeList = (key, index) => setContent((old) => ({ ...old, [key]: old[key].filter((_, i) => i !== index) }));

  async function saveDraft() {
    setSaving(true); setSaveSuccess(false); setMessage(""); setError("");
    try {
      const result = await apiRequest("/api/builder/customer/resume/save/", { method: "POST", body: { template, content } });
      setSavedResume({ template, content, updatedAt: result.updatedAt || new Date().toISOString() });
      setMessage("Your resume draft has been saved.");
      setSaveSuccess(true);
    } catch (e) { setError(e.message || "Unable to save your resume."); }
    finally { setSaving(false); }
  }

  async function openSavedResumes() {
    setSavedResumeOpen(true);
    setSavedResumeLoading(true);
    setSavedResumeError("");
    try {
      const data = await apiRequest("/api/builder/customer/resume/");
      setSavedResume(data.resume || null);
    } catch (e) {
      setSavedResumeError(e.message || "Unable to load saved resume.");
    } finally {
      setSavedResumeLoading(false);
    }
  }

  function loadSavedResume() {
    if (!savedResume) return;
    setTemplate(savedResume.template || "classic");
    const savedContent = savedResume.content || {};
    setContent({
      ...EMPTY,
      ...savedContent,
      personal: { ...EMPTY.personal, ...(savedContent.personal || {}) },
      education: LEVELS.map((level) => ({
        ...EMPTY.education.find((x) => x.qualification === level),
        ...(savedContent.education || []).find((x) => x.qualification === level),
      })),
      certifications: savedContent.certifications || [],
      projects: savedContent.projects || [],
    });
    setSavedResumeOpen(false);
    setMessage("Saved resume loaded into the editor.");
  }

  function downloadPdf() {
    if (!content.personal.fullName.trim()) { setError("Please enter your full name before downloading."); return; }
    if (!content.education.some((x) => x.qualification === "Class X" && x.institution.trim())) { setError("Please add your Class X education details before downloading. Other education levels are optional."); return; }
    setError(""); window.print();
  }

  const p = content.personal;
  
  const skills = useMemo(() => (content.skills || "").split(",").map((x) => x.trim()).filter(Boolean), [content.skills]);
  const hasUserContent = Object.values(p).some((value) => String(value || "").trim()) ||
    content.education.some((row) => Object.entries(row).some(([key, value]) => key !== "qualification" && String(value || "").trim())) ||
    Boolean((content.skills || "").trim() || (content.languages || "").trim()) ||
    content.certifications.some((row) => row.name) || content.projects.some((row) => row.title);
  const previewPersonal = hasUserContent
    ? { ...p, fullName: p.fullName || "Your Name", headline: p.headline || "Professional Headline" }
    : SAMPLE_RESUME.personal;
  const previewEducation = hasUserContent
    ? content.education.filter((row) => row.institution || row.board || row.completion || row.score)
    : SAMPLE_RESUME.education.filter((row) => row.institution);
  const previewSkills = hasUserContent ? skills : SAMPLE_RESUME.skills.split(",").map((x) => x.trim());
  const previewCertifications = hasUserContent ? content.certifications.filter((x) => x.name) : SAMPLE_RESUME.certifications;
  const previewProjects = hasUserContent ? content.projects.filter((x) => x.title) : SAMPLE_RESUME.projects;
  const previewLanguages = hasUserContent
    ? (content.languages || "").split(",").map((x) => x.trim()).filter(Boolean)
    : SAMPLE_RESUME.languages.split(",").map((x) => x.trim());
  if (loading) return <div className="rb-loading">Loading your Resume Builder…</div>;

  return <main className="rb-page">
    <header className="rb-header no-print"><div><p className="rb-kicker">CAREER DOCUMENT STUDIO</p><h1>Resume Builder</h1><p>Create, edit and download a professional resume.</p></div><div className="rb-header-actions"><button className="rb-view-saved" onClick={openSavedResumes}>View Saved Resumes</button><button className="rb-back" onClick={() => { window.location.href = "/customer/dashboard"; }}>← Dashboard</button></div></header>
    {error && <div className="rb-alert error no-print">{error}</div>}{message && <div className="rb-alert success no-print">{message}</div>}
    {savedResumeOpen && <div className="rb-modal-backdrop no-print" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSavedResumeOpen(false); }}>
      <section className="rb-saved-modal" role="dialog" aria-modal="true" aria-labelledby="rb-saved-title">
        <div className="rb-saved-modal-head"><div><p className="rb-kicker">YOUR DOCUMENTS</p><h2 id="rb-saved-title">Saved resumes</h2><p className="rb-saved-subtitle">Your saved resume is stored securely in your account.</p></div><button type="button" className="rb-modal-close" onClick={() => setSavedResumeOpen(false)} aria-label="Close">×</button></div>
        {savedResumeLoading ? <p className="rb-saved-state">Loading your saved resume…</p> : savedResumeError ? <p className="rb-saved-error">{savedResumeError}</p> : savedResume ? <div className="rb-saved-card">
          <div className="rb-saved-card-icon">PDF</div><div className="rb-saved-card-info"><strong>{savedResume.content?.personal?.fullName || "My Resume"}</strong><span>{TEMPLATES.find((x) => x[0] === savedResume.template)?.[1] || savedResume.template}</span><small>Last saved: {savedResume.updatedAt ? new Date(savedResume.updatedAt).toLocaleString() : "Date unavailable"}</small></div>
          <button type="button" className="rb-saved-open" onClick={loadSavedResume}>Open in editor</button>
        </div> : <div className="rb-saved-empty"><strong>No saved resume yet</strong><p>Complete your resume and select “Save draft”. Your saved resume will appear here.</p></div>}
        <div className="rb-saved-modal-foot"><span>One saved resume per customer account</span><button type="button" className="rb-back" onClick={() => setSavedResumeOpen(false)}>Close</button></div>
      </section>
    </div>}
    <div className="rb-layout">
      <section className="rb-editor no-print">
        <div className="rb-panel rb-template-panel">
  <div className="rb-template-heading">
    <h2>1. Choose a template</h2>

    <div className="rb-carousel-controls">
      <button
        type="button"
        onClick={() => scrollTemplates(-1)}
        aria-label="Previous templates"
      >
        &#8592;
      </button>

      <button
        type="button"
        onClick={() => scrollTemplates(1)}
        aria-label="Next templates"
      >
        &#8594;
      </button>
    </div>
  </div>

  <div className="rb-template-carousel" ref={templateCarouselRef}>
    {TEMPLATES.map(([key, name, desc]) => (
      <button
        type="button"
        key={key}
        className={`rb-template ${template === key ? "selected" : ""}`}
        onClick={() => setTemplate(key)}
        aria-pressed={template === key}
      >
        <span className={`rb-mini ${key}`}>
          <i />
          <i />
          <i />
        </span>

        <strong>{name}</strong>
        <small>{desc}</small>
      </button>
    ))}
  </div>
</div>
        <div className="rb-panel"><h2>2. Personal information</h2><div className="rb-fields">
          {[["fullName","Full name"],["headline","Professional headline"],["email","Email"],["mobile","Mobile number"],["location","Location"],["linkedin","LinkedIn URL"],["github","GitHub URL"],["links","Other links (separate with commas)"]].map(([field,label]) => <label key={field}>{label}<input value={p[field]} onChange={(e) => updatePersonal(field,e.target.value)} placeholder={label}/></label>)}
          <label className="wide">Career objective / professional summary<textarea rows="4" value={p.summary} onChange={(e) => updatePersonal("summary",e.target.value)} placeholder="Briefly describe your experience, strengths and career goals."/></label>
        </div></div>
        {template === "timeline" && <div className="rb-panel rb-profile-photo-panel">
          <h2>Profile photo for this template</h2>
          <p className="rb-hint">Add a clear portrait photo. It will appear in the circular photo area of this resume template.</p>
          <input ref={profileImageInputRef} className="rb-profile-photo-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileImage} />
          <div className="rb-profile-photo-actions">
            <button type="button" className="rb-view-saved" onClick={() => profileImageInputRef.current?.click()}>
              {p.profileImage ? "Change profile image" : "Add profile image"}
            </button>
            {p.profileImage && <button type="button" className="rb-remove" onClick={() => updatePersonal("profileImage", "")}>Remove image</button>}
            {p.profileImage && <span className="rb-profile-photo-status">Photo added</span>}
          </div>
        </div>}
        <div className="rb-panel"><h2>3. Education</h2><p className="rb-hint">Class X is required for a completed downloadable resume. All other levels are optional.</p>{content.education.map((row,index) => <div className="rb-education" key={row.qualification}><h3>{row.qualification}{index === 0 ? " · Required" : " · Optional"}</h3><div className="rb-fields">
          {[["institution","School / College / Institution"],["board","Board / University"],["start","Start month and year"],["completion","Completion month and year"],["score","Percentage / CGPA"]].map(([field,label]) => <label key={field}>{label}<input value={row[field]} onChange={(e) => updateEducation(index,field,e.target.value)} placeholder={label}/></label>)}
        </div></div>)}</div>
        <div className="rb-panel"><h2>4. Skills & languages</h2><label>Skills (comma-separated)<textarea rows="3" value={content.skills} onChange={(e) => setContent((old) => ({...old, skills:e.target.value}))} placeholder="Electrical design, AutoCAD, Communication…"/></label><label className="rb-language-input">Languages (comma-separated)<input value={content.languages || ""} onChange={(e) => setContent((old) => ({...old, languages:e.target.value}))} placeholder="English (Fluent), Telugu (Native)"/></label></div>
        <div className="rb-panel"><div className="rb-panel-title"><h2>5. Certifications</h2><button onClick={() => addList("certifications",{name:"",issuer:"",date:"",url:""})}>+ Add</button></div>{content.certifications.map((row,i) => <div className="rb-repeat" key={i}>{[["name","Certification name"],["issuer","Issuer"],["date","Issue date"],["url","Credential URL"]].map(([f,l]) => <label key={f}>{l}<input value={row[f] || ""} onChange={(e) => updateList("certifications",i,f,e.target.value)}/></label>)}<button className="rb-remove" onClick={() => removeList("certifications",i)}>Remove</button></div>)}</div>
        <div className="rb-panel"><div className="rb-panel-title"><h2>6. Projects</h2><button onClick={() => addList("projects",{title:"",description:"",technologies:"",url:""})}>+ Add</button></div>{content.projects.map((row,i) => <div className="rb-repeat" key={i}>{[["title","Project title"],["description","Description"],["technologies","Technologies"],["url","Project URL"]].map(([f,l]) => <label key={f}>{l}<input value={row[f] || ""} onChange={(e) => updateList("projects",i,f,e.target.value)}/></label>)}<button className="rb-remove" onClick={() => removeList("projects",i)}>Remove</button></div>)}</div>
        <div className="rb-actions"><button className={`rb-save ${saveSuccess ? "is-saved" : ""}`} onClick={saveDraft} disabled={saving} aria-live="polite">{saving ? <><span className="rb-save-spinner" aria-hidden="true" />Saving…</> : saveSuccess ? <><span className="rb-save-check" aria-hidden="true">✓</span>Saved successfully</> : "Save draft"}</button><button className="rb-download" onClick={downloadPdf}>Download PDF</button></div>
      </section>
      <section className={`rb-preview ${template}`}><div className="rb-preview-label no-print">LIVE PREVIEW · {TEMPLATES.find((x) => x[0] === template)?.[1]}</div><article className={`rb-paper ${template}`}>
        {template === "timeline" ? <>
          <header className="rb-timeline-header">
            <div className="rb-avatar">
              {previewPersonal.profileImage
                ? <img src={previewPersonal.profileImage} alt="Resume profile" />
                : (previewPersonal.fullName || "A").split(/\\s+/).map((part) => part[0]).slice(0, 2).join("")}
            </div>
            <div><h1>{previewPersonal.fullName}</h1><h2>{previewPersonal.headline}</h2></div>
          </header>
          <div className="rb-timeline-body">
            <aside className="rb-timeline-sidebar">
              <section><h3>Contact</h3><p>☎ {previewPersonal.mobile}</p><p>✉ {previewPersonal.email}</p><p>⌖ {previewPersonal.location}</p>{previewPersonal.linkedin && <p>in {previewPersonal.linkedin}</p>}{previewPersonal.github && <p>⌘ {previewPersonal.github}</p>}{previewPersonal.links && <p>{previewPersonal.links}</p>}</section>
              <section><h3>Certifications</h3><ul>{previewCertifications.map((item, i) => <li key={i}>{item.name}{item.issuer ? ` · ${item.issuer}` : ""}</li>)}</ul></section>
              <section><h3>Languages</h3><ul>{previewLanguages.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
            </aside>
            <div className="rb-timeline-main">
              <section><h3>Career Objective</h3><p>{previewPersonal.summary}</p></section>
              <section><h3>Key Skills</h3><ul>{previewSkills.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
              <section><h3>Education</h3>{previewEducation.map((item, i) => <div className="rb-timeline-item" key={i}><strong>{item.qualification}</strong><p>{item.institution}</p><p>{[item.board, item.score, item.completion].filter(Boolean).join(" · ")}</p></div>)}</section>
              <section><h3>Academic Projects</h3>{previewProjects.map((item, i) => <div className="rb-timeline-item" key={i}><strong>{item.title}</strong><p>{item.description}</p>{item.technologies && <p><em>{item.technologies}</em></p>}</div>)}</section>
            </div>
          </div>
        </> : <>
          <div className="rb-resume-head"><h1>{previewPersonal.fullName}</h1><h2>{previewPersonal.headline}</h2><p>{[previewPersonal.email,previewPersonal.mobile,previewPersonal.location,previewPersonal.linkedin,previewPersonal.github,previewPersonal.links].filter(Boolean).join("  |  ")}</p></div>
          <section><h3>Professional Summary</h3><p>{previewPersonal.summary}</p></section>
          <section><h3>Education</h3>{previewEducation.map((x,i) => <div className="rb-preview-item" key={i}><strong>{x.qualification} — {x.institution}</strong><p>{[x.board,[x.start,x.completion].filter(Boolean).join(" – "),x.score].filter(Boolean).join(" · ")}</p></div>)}</section>
          <section><h3>Skills</h3><p>{previewSkills.join(" · ")}</p></section>
          <section><h3>Certifications</h3>{previewCertifications.map((x,i) => <p key={i}><strong>{x.name}</strong>{x.issuer ? ` — ${x.issuer}` : ""}{x.date ? ` (${x.date})` : ""}</p>)}</section>
          <section><h3>Projects</h3>{previewProjects.map((x,i) => <div className="rb-preview-item" key={i}><strong>{x.title}</strong>{x.description && <p>{x.description}</p>}{x.technologies && <p>{x.technologies}</p>}{x.url && <p>{x.url}</p>}</div>)}</section>
        </>}
      </article></section>
    </div>
  </main>;
}
