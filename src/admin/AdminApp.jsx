import { useEffect, useState } from "react";
import { apiRequest, assetUrl } from "./adminApi";

import "./admin.css";

const blankProject = {
  id: "",
  title: "",
  type: "PERSONAL PROJECT",
  description: "",
  technologies: "",
  projectUrl: "",
  githubUrl: "",
};
const blankSkill = { id: "", name: "", category: "", displayOrder: 0 };
const blankCertification = {
  id: "", name: "", issuer: "", issueDate: "", credentialId: "",
  certificateUrl: "", description: "",
};
const blankProfile = {
  fullName: "Vajrabilash Degapogu", mobileNumber: "", email: "", address: "",
};

const sections = [
  ["overview", "Overview"],
  ["projects", "Projects"],
  ["jobs", "Job listings"],
  ["skills", "Skills"],
  ["certifications", "Certifications"],
  ["profile", "Profile details"],
  ["media", "Resume & images"],
  ["settings", "Site settings"],
  ["customers", "Customers"],
  ["approvals", "Portfolio approvals"],
  ["changes", "Changes"],
];

function AdminApp() {
  useEffect(() => {
    apiRequest("/api/csrf/").catch((error) => {
      console.error("Could not initialize CSRF:", error);
    });
  }, []);
  const [user, setUser] = useState(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("login");
  const [section, setSection] = useState("overview");
  const [config, setConfig] = useState(null);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const blankJob = { id: "", category: "private", jobName: "", role: "", companyName: "", applicationStartDate: "", applicationEndDate: "", applicationUrl: "", isPublished: true };
  const [jobDraft, setJobDraft] = useState(blankJob);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [profile, setProfile] = useState(blankProfile);
  const [skillDraft, setSkillDraft] = useState(blankSkill);
  const [certDraft, setCertDraft] = useState(blankCertification);
  const [changes, setChanges] = useState([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [customerDraft, setCustomerDraft] = useState({ name: "", email: "", username: "" });
  const [portfolioReviews, setPortfolioReviews] = useState([]);
  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewBusyId, setReviewBusyId] = useState(null);
  const [draft, setDraft] = useState(blankProject);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const c = await apiRequest("/api/public");
    setConfig(c);
    const p = await apiRequest("/api/admin/projects");
    setProjects(p.projects || []);
    const j = await apiRequest("/api/admin/jobs/");
    setJobs(j.jobs || []);
    const sk = await apiRequest("/api/admin/skills");
    setSkills(sk.skills || []);
    const cert = await apiRequest("/api/admin/certifications");
    setCertifications(cert.certifications || []);
    const prof = await apiRequest("/api/admin/profile");
    setProfile(prof.profile || blankProfile);
  }
  
useEffect(() => {
  let active = true;

  apiRequest("/api/auth/session/")
    .then(async (result) => {
      if (!active) return;

      if (result.authenticated === true) {
        setUser({
          username: result.username,
          email: result.email || "",
        });

        await refresh();
      } else {
        setUser(null);
        setStep("login");
      }
    })
    .catch(() => {
      if (!active) return;
      setUser(null);
      setStep("login");
    });

  return () => {
    active = false;
  };
}, []);

  useEffect(() => {
    if (user && section === "changes") {
      apiRequest("/api/admin/changes")
        .then((d) => setChanges(d.changes || []))
        .catch((e) => setStatus(e.message));
    }
    if (user && section === "customers") {
      apiRequest("/api/builder/owner/invitations/")
        .then((d) => {
          setInvitations(d.invitations || []);
          setCustomers(d.customers || []);
        })
        .catch((e) => setStatus(e.message));
    }
    if (user && section === "approvals") {
      apiRequest("/api/builder/owner/reviews/")
        .then((d) => setPortfolioReviews(d.reviews || []))
        .catch((e) => setStatus(e.message));
    }
  }, [user, section]);

  async function decidePortfolioReview(reviewId, decision) {
    const promptText = decision === "approve"
      ? "Approve and publish this submitted portfolio?"
      : "Request changes from this customer?";
    if (!window.confirm(promptText)) return;
    setReviewBusyId(reviewId);
    setStatus("");
    try {
      const result = await apiRequest(
        `/api/builder/owner/reviews/${reviewId}/decision/`,
        {
          method: "POST",
          body: {
            decision,
            notes: reviewNotes[reviewId] || "",
          },
        },
      );
      setStatus(result.message || "Review decision saved.");
      const refreshed = await apiRequest("/api/builder/owner/reviews/");
      setPortfolioReviews(refreshed.reviews || []);
    } catch (error) {
      setStatus(error.message || "Unable to save review decision.");
    } finally {
      setReviewBusyId(null);
    }
  }

  async function requestCode(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");

    try {
      const result = await apiRequest("/api/auth/login/", {
        method: "POST",
        body: {
          username_or_email: identifier,
          password,
        },
      });

      setStep("code");
      setStatus(result.detail || "Check your registered email for the OTP.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");

    try {
      const result = await apiRequest("/api/auth/verify-otp/", {
        method: "POST",
        body: {
          username_or_email: identifier,
          password,
          otp: code,
        },
      });

      setUser({
        username: result.username,
        email: identifier.includes("@") ? identifier : "",
      });

      await refresh();
      setStatus("Signed in successfully.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  
async function logout() {
  try {
    await apiRequest("/api/auth/logout/", { method: "POST" });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    setUser(null);
    setIdentifier("");
    setPassword("");
    setCode("");
    setStep("login");
    setSection("overview");
    setStatus("Signed out.");
  }
}


  async function saveJob(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const id = jobDraft.id;
      await apiRequest(id ? `/api/admin/jobs/${id}/` : "/api/admin/jobs/", {
        method: id ? "PUT" : "POST",
        body: {
          category: jobDraft.category,
          jobName: jobDraft.jobName,
          role: jobDraft.role,
          companyName: jobDraft.companyName,
          applicationStartDate: jobDraft.applicationStartDate,
          applicationEndDate: jobDraft.applicationEndDate,
          applicationUrl: jobDraft.applicationUrl,
          isPublished: jobDraft.isPublished,
        },
      });
      setJobDraft(blankJob);
      const result = await apiRequest("/api/admin/jobs/");
      setJobs(result.jobs || []);
      setStatus(id ? "Job updated." : "Job added.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteJob(job) {
    if (!window.confirm(`Delete "${job.jobName}"?`)) return;
    try {
      await apiRequest(`/api/admin/jobs/${job.id}/`, { method: "DELETE" });
      setJobs((items) => items.filter((item) => item.id !== job.id));
      setStatus("Job deleted.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  function editProject(project) {
    setDraft({
      ...project,
      technologies: (project.technologies || []).join(", "),
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function saveProject(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    const body = {
      ...draft,
      technologies: draft.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      await apiRequest(
        draft.id
          ? `/api/admin/projects/${encodeURIComponent(draft.id)}`
          : "/api/admin/projects",
        { method: draft.id ? "PUT" : "POST", body },
      );
      setDraft(blankProject);
      setEditing(false);
      await refresh();
      setStatus("Project saved.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteProject(p) {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      await apiRequest(`/api/admin/projects/${encodeURIComponent(p.id)}`, {
        method: "DELETE",
      });
      await refresh();
      setStatus("Project deleted.");
    } catch (e) {
      setStatus(e.message);
    }
  }
  
  
async function saveSkill(e) {
  e.preventDefault();
  setBusy(true);
  setStatus("");
  try {
    const id = skillDraft.id;
    await apiRequest(id ? `/api/admin/skills/${id}` : "/api/admin/skills", {
      method: id ? "PUT" : "POST",
      body: {
        name: skillDraft.name,
        category: skillDraft.category,
        displayOrder: Number(skillDraft.displayOrder) || 0,
      },
    });
    setSkillDraft(blankSkill);
    const result = await apiRequest("/api/admin/skills");
    setSkills(result.skills || []);
    setStatus(id ? "Skill updated." : "Skill added.");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteSkill(skill) {
  if (!window.confirm(`Delete skill "${skill.name}"?`)) return;
  try {
    await apiRequest(`/api/admin/skills/${skill.id}`, { method: "DELETE" });
    setSkills((items) => items.filter((item) => item.id !== skill.id));
    setStatus("Skill deleted.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function saveCertification(e) {
  e.preventDefault();
  setBusy(true);
  setStatus("");
  try {
    const id = certDraft.id;
    const body = {
      name: certDraft.name,
      issuer: certDraft.issuer,
      issueDate: certDraft.issueDate || "",
      credentialId: certDraft.credentialId,
      certificateUrl: certDraft.certificateUrl,
      description: certDraft.description,
    };
    await apiRequest(
      id ? `/api/admin/certifications/${id}` : "/api/admin/certifications",
      { method: id ? "PUT" : "POST", body },
    );
    setCertDraft(blankCertification);
    const result = await apiRequest("/api/admin/certifications");
    setCertifications(result.certifications || []);
    setStatus(id ? "Certification updated." : "Certification added.");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteCertification(cert) {
  if (!window.confirm(`Delete certification "${cert.name}"?`)) return;
  try {
    await apiRequest(`/api/admin/certifications/${cert.id}`, { method: "DELETE" });
    setCertifications((items) => items.filter((item) => item.id !== cert.id));
    setStatus("Certification deleted.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function saveProfile(e) {
  e.preventDefault();
  setBusy(true);
  setStatus("");
  try {
    const result = await apiRequest("/api/admin/profile", {
      method: "PUT",
      body: profile,
    });
    setProfile(result.profile || profile);
    setStatus("Profile details saved.");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function upload(kind, file) {
  if (!file) return;

  const form = new FormData();
  form.append("file", file);

  setBusy(true);
  setStatus(`Uploading ${kind}...`);

  try {
    const result = await apiRequest(`/api/admin/upload/${kind}`, {
      method: "POST",
      body: form,
    });

    if (result.config) {
      const updatedConfig = {
        ...result.config,
        ...(result.config.profileImage && {
          profileImage: `${result.config.profileImage}?v=${Date.now()}`,
        }),
        ...(result.config.faviconUrl && {
          faviconUrl: `${result.config.faviconUrl}?v=${Date.now()}`,
        }),
        ...(result.config.resumeUrl && {
          resumeUrl: `${result.config.resumeUrl}?v=${Date.now()}`,
        }),
      };

      setConfig((previous) => ({
        ...previous,
        ...updatedConfig,
      }));
    }

    setStatus(
      `${kind[0].toUpperCase() + kind.slice(1)} uploaded successfully.`
    );
  } catch (error) {
    console.error(`${kind} upload failed:`, error);
    setStatus(`Upload failed: ${error.message}`);
  } finally {
    setBusy(false);
  }
}


  async function refreshCustomerData() {
    const result = await apiRequest("/api/builder/owner/invitations/");
    setCustomers(result.customers || []);
    setInvitations(result.invitations || []);
  }

  function beginCustomerEdit(customer) {
    setEditingCustomerId(customer.id);
    setCustomerDraft({
      name: customer.name || "",
      email: customer.email || "",
      username: customer.username || "",
    });
    setStatus("");
  }

  async function saveCustomerEdit(siteId) {
    setBusy(true);
    setStatus("");
    try {
      const result = await apiRequest(`/api/builder/owner/customers/${siteId}/update/`, {
        method: "POST",
        body: customerDraft,
      });
      setStatus(result.message || "Customer details updated.");
      setEditingCustomerId(null);
      await refreshCustomerData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function stopCustomerLive(customer) {
    const confirmed = window.confirm(
      `Take ${customer.name || customer.username}'s portfolio offline? Their account and saved content will remain.`
    );
    if (!confirmed) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await apiRequest(`/api/builder/owner/customers/${customer.id}/stop-live/`, {
        method: "POST",
        body: {},
      });
      setStatus(result.message || "Portfolio taken offline.");
      await refreshCustomerData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteCustomer(customer) {
    const confirmed = window.confirm(
      `Permanently delete ${customer.name || customer.username} (${customer.email}) and all associated portfolio data? This cannot be undone.`
    );
    if (!confirmed) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await apiRequest(`/api/builder/owner/customers/${customer.id}/delete/`, {
        method: "POST",
        body: {},
      });
      setStatus(result.message || "Customer deleted.");
      if (editingCustomerId === customer.id) setEditingCustomerId(null);
      await refreshCustomerData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendCustomerInvitation(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const result = await apiRequest("/api/builder/owner/invitations/create/", {
        method: "POST",
        body: { email: customerEmail.trim() },
      });
      setCustomerEmail("");
      setStatus(result.message || "Invitation sent.");
      const list = await apiRequest("/api/builder/owner/invitations/");
      setInvitations(list.invitations || []);
      setCustomers(list.customers || []);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const r = await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: {
          siteTitle: config.siteTitle,
          siteDescription: config.siteDescription,
        },
      });
      setConfig(r.config);
      setStatus("Site settings saved.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user)
    return (
      <main className="pa-login-shell">
        <section className="pa-login-card">
          <div className="pa-mark">
            VD<span>.</span>
          </div>
          <p className="pa-eyebrow">PRIVATE WORKSPACE</p>
          <h1>Portfolio admin</h1>
          <p className="pa-muted">
            Sign in with the authorised owner email to manage your portfolio.
          </p>
          
{step === 'login' ? (
  <form onSubmit={requestCode}>
    <label>Username or email</label>
    <input
      type="text"
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}
      placeholder="Enter username or email"
      required
      autoComplete="username"
    />

    <label>Password</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your admin password"
      required
      autoComplete="current-password"
    />

    <button disabled={busy}>
      {busy ? 'Sending…' : 'Sign in and send OTP'}
    </button>
  </form>
) : (
  <form onSubmit={verifyCode}>
    <label>Six-digit code</label>
    <input
      inputMode="numeric"
      pattern="[0-9]{6}"
      maxLength="6"
      value={code}
      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="000000"
      required
      autoComplete="one-time-code"
    />

    <button disabled={busy}>
      {busy ? 'Verifying…' : 'Verify and sign in'}
    </button>

    <button
      type="button"
      className="pa-link-button"
      onClick={() => {
        setStep('login');
        setCode('');
        setPassword('');
      }}
    >
      Back to login
    </button>
  </form>
)}

          {status && (
            <p className="pa-status" role="status">
              {status}
            </p>
          )}
          <p className="pa-footnote">
            Codes expire after 5 minutes. Never share your code.
          </p>
        </section>
      </main>
    );

  return (
    <main className="pa-shell">
      <aside className="pa-sidebar">
        <a className="pa-brand" href="/">
          VD<span>.</span> <small>ADMIN</small>
        </a>
        <p className="pa-nav-label">WORKSPACE</p>
        {sections.map(([id, label]) => (
          <button
            key={id}
            className={section === id ? "active" : ""}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
        <div className="pa-sidebar-bottom">
          <span>{user.email}</span>
          <button className="pa-logout" onClick={logout}>
            Sign out ↗
          </button>
        </div>
      </aside>
      <section className="pa-main">
        <header className="pa-header">
          <div>
            <p className="pa-eyebrow">PORTFOLIO CONTROL CENTER</p>
            <h1>{sections.find((s) => s[0] === section)?.[1]}</h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer">
            View live site ↗
          </a>
        </header>
        {status && (
          <div className="pa-alert" role="status">
            {status}
            <button onClick={() => setStatus("")} aria-label="Dismiss status">
              ×
            </button>
          </div>
        )}
        {section === "overview" && (
          <>
            <div className="pa-welcome">
              <div>
                <p className="pa-eyebrow">WELCOME BACK</p>
                <h2>Keep your portfolio current.</h2>
                <p>
                  Manage the projects, resume and visual identity shown to
                  visitors.
                </p>
              </div>
              <div className="pa-welcome-icon">✳</div>
            </div>
            <div className="pa-stat-grid">
              <div>
                <span>PROJECTS</span>
                <strong>{projects.length}</strong>
              </div>
              <div>
                <span>SKILLS</span>
                <strong>{skills.length}</strong>
              </div>
              <div>
                <span>CERTIFICATIONS</span>
                <strong>{certifications.length}</strong>
              </div>
              <div>
                <span>RESUME</span>
                <strong>
                  {config?.resumeUrl ? "Uploaded" : "Not uploaded"}
                </strong>
              </div>
              <div>
                <span>PROFILE IMAGE</span>
                <strong>
                  {config?.profileImage ? "Custom image" : "Default image"}
                </strong>
              </div>
              <div>
                <span>FAVICON</span>
                <strong>
                  {config?.faviconUrl ? "Custom icon" : "Default icon"}
                </strong>
              </div>
            </div>
            <div className="pa-panel">
              <h3>Quick actions</h3>
              <div className="pa-quick-actions">
                <button
                  onClick={() => {
                    setDraft(blankProject);
                    setEditing(true);
                    setSection("projects");
                  }}
                >
                  ＋ Add a project
                </button>
                <button onClick={() => setSection("media")}>
                  ↑ Replace resume
                </button>
                <button onClick={() => setSection("settings")}>
                  ✎ Edit site metadata
                </button>
                <button onClick={() => { setSkillDraft(blankSkill); setSection("skills"); }}>
                  ＋ Add a skill
                </button>
                <button onClick={() => { setCertDraft(blankCertification); setSection("certifications"); }}>
                  ＋ Add a certification
                </button>
                <button onClick={() => setSection("profile")}>
                  ✎ Edit profile details
                </button>
              </div>
            </div>
          </>
        )}
        {section === "projects" && (
          <>
            <div className="pa-panel">
              <div className="pa-panel-title">
                <div>
                  <h3>
                    {editing
                      ? draft.id
                        ? "Edit project"
                        : "Add a project"
                      : "Project library"}
                  </h3>
                  <p>Add or update a project shown on the public portfolio.</p>
                </div>
                {editing && (
                  <button
                    className="pa-secondary"
                    onClick={() => {
                      setDraft(blankProject);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
              {editing && (
                <form className="pa-form-grid" onSubmit={saveProject}>
                  <label>
                    Project title
                    <input
                      required
                      maxLength="120"
                      value={draft.title}
                      onChange={(e) =>
                        setDraft({ ...draft, title: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Project type
                    <input
                      value={draft.type}
                      onChange={(e) =>
                        setDraft({ ...draft, type: e.target.value })
                      }
                    />
                  </label>
                  <label className="wide">
                    Description
                    <textarea
                      rows="3"
                      value={draft.description}
                      onChange={(e) =>
                        setDraft({ ...draft, description: e.target.value })
                      }
                    />
                  </label>
                  <label className="wide">
                    Technologies (comma separated)
                    <input
                      value={draft.technologies}
                      onChange={(e) =>
                        setDraft({ ...draft, technologies: e.target.value })
                      }
                      placeholder="React, Node.js, PostgreSQL"
                    />
                  </label>
                  <label>
                    Project URL
                    <input
                      type="url"
                      value={draft.projectUrl}
                      onChange={(e) =>
                        setDraft({ ...draft, projectUrl: e.target.value })
                      }
                      placeholder="https://…"
                    />
                  </label>
                  <label>
                    GitHub URL
                    <input
                      type="url"
                      value={draft.githubUrl}
                      onChange={(e) =>
                        setDraft({ ...draft, githubUrl: e.target.value })
                      }
                      placeholder="https://github.com/…"
                    />
                  </label>
                  <div className="wide">
                    <button disabled={busy}>
                      {busy ? "Saving…" : "Save project"}
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="pa-project-list">
              {projects.map((p, i) => (
                <article className="pa-project-row" key={p.id}>
                  <span className="pa-project-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pa-project-copy">
                    <strong>{p.title}</strong>
                    <span>
                      {p.type || "PROJECT"} ·{" "}
                      {(p.technologies || []).join(", ")}
                    </span>
                    <p>{p.description}</p>
                  </div>
                  <div className="pa-row-actions">
                    <button onClick={() => editProject(p)}>Edit</button>
                    <button className="danger" onClick={() => deleteProject(p)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        {section === "skills" && (
          <>
            <div className="pa-panel">
              <div className="pa-panel-title">
                <div>
                  <h3>{skillDraft.id ? "Edit skill" : "Add a skill"}</h3>
                  <p>Manage the skills displayed on your portfolio.</p>
                </div>
                {skillDraft.id && (
                  <button className="pa-secondary" type="button" onClick={() => setSkillDraft(blankSkill)}>
                    Cancel edit
                  </button>
                )}
              </div>
              <form className="pa-form-grid" onSubmit={saveSkill}>
                <label>
                  Skill name
                  <input required maxLength="100" value={skillDraft.name}
                    onChange={(e) => setSkillDraft({ ...skillDraft, name: e.target.value })} />
                </label>
                <label>
                  Category
                  <input maxLength="100" placeholder="Frontend, Backend, Tools…"
                    value={skillDraft.category}
                    onChange={(e) => setSkillDraft({ ...skillDraft, category: e.target.value })} />
                </label>
                <label>
                  Display order
                  <input type="number" min="0" value={skillDraft.displayOrder}
                    onChange={(e) => setSkillDraft({ ...skillDraft, displayOrder: e.target.value })} />
                </label>
                <div className="wide">
                  <button disabled={busy}>{busy ? "Saving…" : skillDraft.id ? "Update skill" : "Add skill"}</button>
                </div>
              </form>
            </div>
            <div className="pa-project-list">
              {skills.map((skill) => (
                <article className="pa-project-row" key={skill.id}>
                  <div className="pa-project-copy">
                    <strong>{skill.name}</strong>
                    <span>{skill.category || "Uncategorized"} · Order {skill.displayOrder}</span>
                  </div>
                  <div className="pa-row-actions">
                    <button onClick={() => setSkillDraft({ ...skill })}>Edit</button>
                    <button className="danger" onClick={() => deleteSkill(skill)}>Delete</button>
                  </div>
                </article>
              ))}
              {!skills.length && <p className="pa-muted">No skills added yet.</p>}
            </div>
          </>
        )}
        {section === "certifications" && (
          <>
            <div className="pa-panel">
              <div className="pa-panel-title">
                <div>
                  <h3>{certDraft.id ? "Edit certification" : "Add a certification"}</h3>
                  <p>Manage certificates and credential links shown on your portfolio.</p>
                </div>
                {certDraft.id && (
                  <button className="pa-secondary" type="button" onClick={() => setCertDraft(blankCertification)}>
                    Cancel edit
                  </button>
                )}
              </div>
              <form className="pa-form-grid" onSubmit={saveCertification}>
                <label>
                  Certification name
                  <input required maxLength="200" value={certDraft.name}
                    onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })} />
                </label>
                <label>
                  Issuing organization
                  <input maxLength="200" value={certDraft.issuer}
                    onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })} />
                </label>
                <label>
                  Issue date
                  <input type="date" value={certDraft.issueDate || ""}
                    onChange={(e) => setCertDraft({ ...certDraft, issueDate: e.target.value })} />
                </label>
                <label>
                  Credential ID
                  <input maxLength="200" value={certDraft.credentialId}
                    onChange={(e) => setCertDraft({ ...certDraft, credentialId: e.target.value })} />
                </label>
                <label className="wide">
                  Certificate URL
                  <input type="url" placeholder="https://…" value={certDraft.certificateUrl}
                    onChange={(e) => setCertDraft({ ...certDraft, certificateUrl: e.target.value })} />
                </label>
                <label className="wide">
                  Description
                  <textarea rows="3" value={certDraft.description}
                    onChange={(e) => setCertDraft({ ...certDraft, description: e.target.value })} />
                </label>
                <div className="wide">
                  <button disabled={busy}>{busy ? "Saving…" : certDraft.id ? "Update certification" : "Add certification"}</button>
                </div>
              </form>
            </div>
            <div className="pa-project-list">
              {certifications.map((cert) => (
                <article className="pa-project-row" key={cert.id}>
                  <div className="pa-project-copy">
                    <strong>{cert.name}</strong>
                    <span>{cert.issuer || "Issuer not specified"}{cert.issueDate ? ` · ${cert.issueDate}` : ""}</span>
                    {cert.certificateUrl && <a href={cert.certificateUrl} target="_blank" rel="noreferrer">View certificate ↗</a>}
                    {cert.description && <p>{cert.description}</p>}
                  </div>
                  <div className="pa-row-actions">
                    <button onClick={() => setCertDraft({ ...cert })}>Edit</button>
                    <button className="danger" onClick={() => deleteCertification(cert)}>Delete</button>
                  </div>
                </article>
              ))}
              {!certifications.length && <p className="pa-muted">No certifications added yet.</p>}
            </div>
          </>
        )}
        {section === "profile" && (
          <form className="pa-panel pa-settings-form" onSubmit={saveProfile}>
            <h3>Profile details</h3>
            <p className="pa-muted">Update the contact and identity details used by your portfolio.</p>
            <label>
              Full name
              <input required maxLength="200" value={profile.fullName || ""}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            </label>
            <label>
              Mobile number
              <input type="tel" maxLength="30" value={profile.mobileNumber || ""}
                onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })} />
            </label>
            <label>
              Email address
              <input type="email" value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </label>
            <label>
              Address
              <textarea rows="3" value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </label>
            <button disabled={busy}>{busy ? "Saving…" : "Save profile details"}</button>
          </form>
        )}
        {section === "media" && (
          <>
            <div className="pa-panel">
              <h3>Resume</h3>
              <p className="pa-muted">
                Upload a PDF. The public resume URL changes after upload.
              </p>
              {config?.resumeUrl && (
                <a
                  className="pa-current-link"
                  href={assetUrl(config.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View current resume ↗
                </a>
              )}
              <label className="pa-upload">
                <span>↑</span>
                <strong>Choose new resume PDF</strong>
                <small>PDF only · maximum 5 MB</small>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => upload("resume", e.target.files?.[0])}
                  disabled={busy}
                />
              </label>
            </div>
            <div className="pa-media-grid">
              <div className="pa-panel">
                <h3>Profile image</h3>
                <p className="pa-muted">Replace the public profile portrait.</p>
                <div className="pa-avatar-preview">
                  {config?.profileImage ? (
                    <img
                      src={assetUrl(config.profileImage)}
                      alt="Current profile"
                    />
                  ) : (
                    <span>VD</span>
                  )}
                </div>
                <label className="pa-upload compact">
                  <strong>Choose image</strong>
                  <small>JPG, PNG, WebP or SVG · 5 MB max</small>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => upload("profile", e.target.files?.[0])}
                    disabled={busy}
                  />
                </label>
              </div>
              <div className="pa-panel">
                <h3>Browser favicon</h3>
                <p className="pa-muted">
                  Change the icon used in the browser tab.
                </p>
                <div className="pa-favicon-preview">
                  {config?.faviconUrl ? (
                    <img
                      src={assetUrl(config.faviconUrl)}
                      alt="Current favicon"
                    />
                  ) : (
                    <span>VD.</span>
                  )}
                </div>
                <label className="pa-upload compact">
                  <strong>Choose favicon</strong>
                  <small>PNG, JPG, WebP, SVG or ICO · 5 MB max</small>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon,.ico"
                    onChange={(e) => upload("favicon", e.target.files?.[0])}
                    disabled={busy}
                  />
                </label>
              </div>
            </div>
          </>
        )}
        {section === "settings" && config && (
          <form className="pa-panel pa-settings-form" onSubmit={saveSettings}>
            <h3>Website metadata</h3>
            <p className="pa-muted">
              These values are available from the public API. Social preview
              metadata in static HTML may still require a redeploy.
            </p>
            <label>
              Site title
              <input
                maxLength="250"
                value={config.siteTitle || ""}
                onChange={(e) =>
                  setConfig({ ...config, siteTitle: e.target.value })
                }
              />
            </label>
            <label>
              Site description
              <textarea
                rows="3"
                maxLength="250"
                value={config.siteDescription || ""}
                onChange={(e) =>
                  setConfig({ ...config, siteDescription: e.target.value })
                }
              />
            </label>
            <button disabled={busy}>Save settings</button>
          </form>
        )}
        {section === "customers" && (
          <>
            <div className="pa-panel">
              <h3>Invite a customer</h3>
              <p className="pa-muted">
                Enter the customer's email address. They will receive a private invitation link
                and must verify that email before their account is created.
              </p>
              <form className="pa-settings-form" onSubmit={sendCustomerInvitation}>
                <label>
                  Customer email
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <button disabled={busy}>
                  {busy ? "Sending invitation…" : "Send invitation"}
                </button>
              </form>
            </div>
            <div className="pa-panel">
              <div className="pa-panel-title">
                <div>
                  <h3>Registered customers</h3>
                  <p>All customer accounts created through direct signup or an owner invitation.</p>
                </div>
                <button
                  type="button"
                  className="pa-secondary"
                  onClick={async () => {
                    try {
                      const result = await apiRequest("/api/builder/owner/invitations/");
                      setCustomers(result.customers || []);
                      setInvitations(result.invitations || []);
                      setStatus("Customer accounts refreshed.");
                    } catch (error) {
                      setStatus(error.message);
                    }
                  }}
                >
                  Refresh
                </button>
              </div>
              {customers.length === 0 ? (
                <p className="pa-muted">No registered customer accounts yet.</p>
              ) : (
                <div className="pa-project-list">
                  {customers.map((customer) => (
                    <article className="pa-project-row pa-customer-row" key={customer.id}>
                      <div className="pa-project-copy" style={{ width: "100%" }}>
                        <strong>{customer.name || customer.username}</strong>
                        <span>
                          {customer.registrationMethod === "invitation"
                            ? "INVITATION REGISTRATION"
                            : "DIRECT WEBSITE REGISTRATION"}
                          {" · "}
                          {(customer.status || "draft").replaceAll("_", " ").toUpperCase()}
                        </span>
                        <p>{customer.email} · @{customer.username}</p>
                        <p>Created: {new Date(customer.createdAt).toLocaleString()}</p>
                        <p>
                          <a href={customer.portfolioUrl} target="_blank" rel="noreferrer">
                            Open portfolio ↗
                          </a>
                        </p>
                        {editingCustomerId === customer.id ? (
                          <div className="pa-customer-edit-form">
                            <label>
                              Full name
                              <input value={customerDraft.name} onChange={(e) => setCustomerDraft({ ...customerDraft, name: e.target.value })} />
                            </label>
                            <label>
                              Email
                              <input type="email" value={customerDraft.email} onChange={(e) => setCustomerDraft({ ...customerDraft, email: e.target.value })} />
                            </label>
                            <label>
                              Username
                              <input value={customerDraft.username} onChange={(e) => setCustomerDraft({ ...customerDraft, username: e.target.value })} />
                            </label>
                            <div className="pa-customer-actions">
                              <button type="button" disabled={busy} onClick={() => saveCustomerEdit(customer.id)}>{busy ? "Saving…" : "Save changes"}</button>
                              <button type="button" className="pa-secondary" disabled={busy} onClick={() => setEditingCustomerId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="pa-customer-actions">
                            <button type="button" className="pa-customer-action pa-customer-action-edit" disabled={busy} onClick={() => beginCustomerEdit(customer)}>Edit</button>
                            {customer.status === "published" ? (
                              <button type="button" className="pa-customer-action pa-customer-action-stop" disabled={busy} onClick={() => stopCustomerLive(customer)}>Stop live</button>
                            ) : (
                              <span className="pa-muted">Not currently live · publish again through approval</span>
                            )}
                            <button type="button" className="pa-customer-action pa-customer-action-delete" disabled={busy} onClick={() => deleteCustomer(customer)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div className="pa-panel">
              <div className="pa-panel-title">
                <div>
                  <h3>Customer invitations</h3>
                  <p>Invitation links expire after 48 hours.</p>
                </div>
                <button
                  type="button"
                  className="pa-secondary"
                  onClick={async () => {
                    try {
                      const result = await apiRequest("/api/builder/owner/invitations/");
                      setInvitations(result.invitations || []);
                      setCustomers(result.customers || []);
                      setStatus("Customer and invitation lists refreshed.");
                    } catch (error) {
                      setStatus(error.message);
                    }
                  }}
                >
                  Refresh
                </button>
              </div>
              {invitations.length === 0 ? (
                <p className="pa-muted">No invitations yet.</p>
              ) : (
                <div className="pa-project-list">
                  {invitations.map((invitation) => (
                    <article className="pa-project-row" key={invitation.id}>
                      <div className="pa-project-copy">
                        <strong>{invitation.email}</strong>
                        <span>
                          {invitation.acceptedAt
                            ? "ACCEPTED"
                            : invitation.valid
                              ? "AWAITING ACCEPTANCE"
                              : "EXPIRED"}
                        </span>
                        <p>Created: {new Date(invitation.createdAt).toLocaleString()}</p>
                        <p>Expires: {new Date(invitation.expiresAt).toLocaleString()}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {section === "approvals" && (
          <div className="pa-panel">
            <div className="pa-panel-title">
              <div>
                <h3>Portfolio approval requests</h3>
                <p className="pa-muted">Review the submitted snapshot. Approval publishes this version; requesting changes keeps the current public version unchanged.</p>
              </div>
              <button
                type="button"
                className="pa-button"
                onClick={() => apiRequest("/api/builder/owner/reviews/").then((d) => setPortfolioReviews(d.reviews || [])).catch((e) => setStatus(e.message))}
              >
                Refresh
              </button>
            </div>
            {portfolioReviews.filter((item) => item.status === "pending").length === 0 ? (
              <p>No portfolios are waiting for approval.</p>
            ) : (
              <div className="pa-review-list">
                {portfolioReviews.filter((item) => item.status === "pending").map((review) => (
                  <article className="pa-review-card" key={review.id}>
                    <div className="pa-review-heading">
                      <div>
                        <h4>{review.portfolioTitle || "Customer portfolio"}</h4>
                        <p>{review.customerEmail} {review.customerUsername ? `· @${review.customerUsername}` : ""}</p>
                        <p className="pa-muted">Template: {review.template} · Submitted: {new Date(review.submittedAt).toLocaleString()}</p>
                      </div>
                      <span className="pa-review-pending">Pending review</span>
                    </div>
                    <div className="pa-review-preview">
                      <h5>{review.content?.profile?.fullName || review.portfolioTitle}</h5>
                      <p><strong>{review.content?.profile?.headline || ""}</strong></p>
                      <p>{review.content?.profile?.about || review.content?.about || "No about section supplied."}</p>
                      <div className="pa-review-columns">
                        <div>
                          <strong>Projects ({review.content?.projects?.length || 0})</strong>
                          {(review.content?.projects || []).map((project) => (
                            <p key={project.id || project.title}>{project.title}</p>
                          ))}
                        </div>
                        <div>
                          <strong>Skills ({review.content?.skills?.length || 0})</strong>
                          <p>{(review.content?.skills || []).map((skill) => skill.name).join(", ") || "None added"}</p>
                          <strong>Certifications ({review.content?.certifications?.length || 0})</strong>
                          <p>{(review.content?.certifications || []).map((cert) => cert.name).join(", ") || "None added"}</p>
                        </div>
                      </div>
                      {review.content?.profile?.profileImageUrl && (
                        <a href={review.content.profile.profileImageUrl} target="_blank" rel="noreferrer">View profile photo</a>
                      )}
                      {review.content?.resumeUrl && (
                        <a href={review.content.resumeUrl} target="_blank" rel="noreferrer">View resume</a>
                      )}
                    </div>
                    <label className="pa-review-notes-label">
                      Notes for customer (required when requesting changes)
                      <textarea
                        rows={3}
                        value={reviewNotes[review.id] || ""}
                        onChange={(event) => setReviewNotes((current) => ({ ...current, [review.id]: event.target.value }))}
                        placeholder="Write feedback or approval notes..."
                      />
                    </label>
                    <div className="pa-review-actions">
                      <button
                        type="button"
                        className="pa-button pa-button-primary"
                        disabled={reviewBusyId === review.id}
                        onClick={() => decidePortfolioReview(review.id, "approve")}
                      >
                        {reviewBusyId === review.id ? "Saving..." : "Approve & publish"}
                      </button>
                      <button
                        type="button"
                        className="pa-button"
                        disabled={reviewBusyId === review.id || !(reviewNotes[review.id] || "").trim()}
                        onClick={() => decidePortfolioReview(review.id, "request_changes")}
                      >
                        Request changes
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}


        {section === "jobs" && (
          <>
            <form className="pa-panel pa-settings-form" onSubmit={saveJob}>
              <h3>{jobDraft.id ? "Edit job listing" : "Add a job listing"}</h3>
              <p className="pa-muted">Add private-sector or government opportunities. Published jobs appear on the public homepage until the application end date.</p>
              <label>Job category
                <select value={jobDraft.category} onChange={(e) => setJobDraft({ ...jobDraft, category: e.target.value })}>
                  <option value="private">Private Jobs</option>
                  <option value="government">Government Jobs</option>
                </select>
              </label>
              <label>Job name
                <input value={jobDraft.jobName} onChange={(e) => setJobDraft({ ...jobDraft, jobName: e.target.value })} required maxLength={200} />
              </label>
              <label>Role
                <input value={jobDraft.role} onChange={(e) => setJobDraft({ ...jobDraft, role: e.target.value })} required maxLength={200} />
              </label>
              <label>{jobDraft.category === "government" ? "Company / Department name" : "Company name"}
                <input value={jobDraft.companyName} onChange={(e) => setJobDraft({ ...jobDraft, companyName: e.target.value })} required maxLength={200} />
              </label>
              <label>Application start date
                <input type="date" value={jobDraft.applicationStartDate} onChange={(e) => setJobDraft({ ...jobDraft, applicationStartDate: e.target.value })} required />
              </label>
              <label>Application end date
                <input type="date" value={jobDraft.applicationEndDate} onChange={(e) => setJobDraft({ ...jobDraft, applicationEndDate: e.target.value })} required />
              </label>
              <label>Application link
                <input type="url" value={jobDraft.applicationUrl} onChange={(e) => setJobDraft({ ...jobDraft, applicationUrl: e.target.value })} placeholder="https://..." required />
              </label>
              <label className="pa-checkbox-label">
                <input type="checkbox" checked={jobDraft.isPublished} onChange={(e) => setJobDraft({ ...jobDraft, isPublished: e.target.checked })} />
                Publish on public website
              </label>
              <div className="pa-customer-actions">
                <button disabled={busy}>{busy ? "Saving…" : jobDraft.id ? "Update job" : "Add job"}</button>
                {jobDraft.id && <button type="button" className="pa-secondary" onClick={() => setJobDraft(blankJob)}>Cancel edit</button>}
              </div>
            </form>
            <div className="pa-panel">
              <div className="pa-panel-title"><div><h3>Current job listings</h3><p>Private and government opportunities managed here.</p></div>
                <button type="button" className="pa-secondary" onClick={() => apiRequest("/api/admin/jobs/").then((r) => setJobs(r.jobs || [])).catch((e) => setStatus(e.message))}>Refresh</button>
              </div>
              {jobs.length === 0 ? <p className="pa-muted">No jobs have been added yet.</p> : (
                <div className="pa-project-list">
                  {jobs.map((job) => (
                    <article className="pa-project-row" key={job.id}>
                      <div className="pa-project-copy">
                        <strong>{job.jobName}</strong>
                        <span>{job.category === "government" ? "GOVERNMENT" : "PRIVATE"} · {job.isPublished ? "PUBLISHED" : "DRAFT"}</span>
                        <p>{job.role} · {job.companyName}</p>
                        <p>Applications: {job.applicationStartDate} to {job.applicationEndDate}</p>
                        <p><a href={job.applicationUrl} target="_blank" rel="noreferrer">Application link ↗</a></p>
                        <div className="pa-customer-actions">
                          <button type="button" className="pa-customer-action pa-customer-action-edit" onClick={() => { setJobDraft({ ...job }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                          <button type="button" className="pa-customer-action pa-customer-action-delete" onClick={() => deleteJob(job)}>Delete</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
\n        {section === "changes" && (
          <div className="pa-panel">
            <h3>Recent changes</h3>
            <p className="pa-muted">
              Admin uploads and project edits are recorded here.
            </p>
            {changes.length === 0 ? (
              <p>No changes recorded yet.</p>
            ) : (
              <div className="pa-change-list">
                {changes.map((c) => (
                  <div key={c.id}>
                    <span className="pa-change-dot" />
                    <div>
                      <strong>{c.action}</strong>
                      <p>{c.detail}</p>
                      <small>{new Date(c.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <footer className="pa-footer">
          Portfolio Admin · Owner-only controls ·{" "}
          <a href="/" target="_blank" rel="noreferrer">
            Open public site
          </a>
        </footer>
      </section>
    </main>
  );
}
export default AdminApp;
