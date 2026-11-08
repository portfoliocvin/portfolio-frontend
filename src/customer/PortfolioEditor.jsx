import React, { useEffect, useState } from "react";
import "../css/customer-dashboard.css";

const IS_LOCAL_FRONTEND =
  window.location.hostname === "localhost" &&
  window.location.port === "3000";

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  (IS_LOCAL_FRONTEND ? "http://localhost:8080" : "")
).replace(/\/+$/, "");
const API = `${API_BASE}/api/builder/`;

const EMPTY_PROFILE = {
  fullName: "",
  headline: "",
  about: "",
  email: "",
  mobileNumber: "",
  location: "",
  socialLinks: { github: "", linkedin: "", website: "" },
};

const TEMPLATES = [
  ["minimal", "Minimal"],
  ["dark_developer", "Dark Developer"],
  ["creative", "Creative"],
  ["professional", "Professional"],
  ["modern_profile", "Modern Profile"],
  ["career_timeline", "Career Timeline"],
];

export default function PortfolioEditor() {
  const [portfolio, setPortfolio] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState(TEMPLATES);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaveMessage, setTemplateSaveMessage] = useState("");
  const [templateSaveError, setTemplateSaveError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const EMPTY_PROJECT = {
    title: "",
    description: "",
    technologies: "",
    projectUrl: "",
    githubUrl: "",
  };

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectMessage, setProjectMessage] = useState("");
  const [projectError, setProjectError] = useState("");
  const [savingProject, setSavingProject] = useState(false);

  const EMPTY_SKILL = { name: "", category: "" };
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillMessage, setSkillMessage] = useState("");
  const [skillError, setSkillError] = useState("");
  const [savingSkill, setSavingSkill] = useState(false);

  const EMPTY_CERTIFICATION = {
    name: "",
    issuer: "",
    issueDate: "",
    credentialId: "",
    certificateUrl: "",
    description: "",
  };
  const [certifications, setCertifications] = useState([]);
  const [certificationForm, setCertificationForm] = useState(EMPTY_CERTIFICATION);
  const [certificateFile, setCertificateFile] = useState(null);
  const [editingCertificationId, setEditingCertificationId] = useState(null);
  const [certificationMessage, setCertificationMessage] = useState("");
  const [certificationError, setCertificationError] = useState("");
  const [savingCertification, setSavingCertification] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${API}customer/me/`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load your portfolio.");
        }

        if (cancelled) return;

        // Keep an existing customer selection; use the main template only
        // when this portfolio has no template saved yet.
        const loadedPortfolio = {
          ...data.portfolio,
          selectedTemplate: data.portfolio.selectedTemplate || "minimal",
        };
        setPortfolio(loadedPortfolio);
        if (Array.isArray(data.portfolio.templates) && data.portfolio.templates.length) {
          setAvailableTemplates(data.portfolio.templates.map((template) => [template.key, template.name]));
        }
        setProfile({
          ...EMPTY_PROFILE,
          ...(data.portfolio.profile || {}),
          socialLinks: {
            ...EMPTY_PROFILE.socialLinks,
            ...(data.portfolio.profile?.socialLinks || {}),
          },
        });
        const projectsResponse = await fetch(`${API}customer/projects/`, {
          credentials: "include",
        });

        const projectsData = await projectsResponse.json();

        if (!projectsResponse.ok) {
          throw new Error(projectsData.error || "Unable to load projects.");
        }

        if (!cancelled) {
          setProjects(projectsData.projects || []);
        }

        const skillsResponse = await fetch(`${API}customer/skills/`, {
          credentials: "include",
        });
        const skillsData = await skillsResponse.json();

        if (!skillsResponse.ok) {
          throw new Error(skillsData.error || "Unable to load skills.");
        }

        if (!cancelled) {
          setSkills(skillsData.skills || []);
        }

        const certificationsResponse = await fetch(
          `${API}customer/certifications/`,
          { credentials: "include" }
        );
        const certificationsData = await certificationsResponse.json();

        if (!certificationsResponse.ok) {
          throw new Error(
            certificationsData.error || "Unable to load certifications."
          );
        }

        if (!cancelled) {
          setCertifications(certificationsData.certifications || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profileImageFile]);

  function updateProfile(field, value) {
    setProfile((previous) => ({ ...previous, [field]: value }));
  }

  function updateSocial(field, value) {
    setProfile((previous) => ({
      ...previous,
      socialLinks: { ...previous.socialLinks, [field]: value },
    }));
  }

  async function saveSelectedTemplate() {
    setSavingTemplate(true);
    setTemplateSaveMessage("");
    setTemplateSaveError("");
    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });
      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure save request.");
      }
      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));
      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }
      const csrfToken = decodeURIComponent(csrfCookie.split("=").slice(1).join("="));
      const response = await fetch(`${API}customer/portfolio/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          title: portfolio?.title || "My Portfolio",
          selectedTemplate: portfolio?.selectedTemplate || "minimal",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to save your template selection.");
      }
      setPortfolio((previous) => ({ ...previous, ...data.portfolio }));
      setTemplateSaveMessage("Your design selection has been saved.");
    } catch (err) {
      setTemplateSaveError(err.message || "Unable to save your template selection.");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure save request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("="),
      );

      const formData = new FormData();
      formData.append("fullName", profile.fullName || "");
      formData.append("headline", profile.headline || "");
      formData.append("about", profile.about || "");
      formData.append("email", profile.email || "");
      formData.append("mobileNumber", profile.mobileNumber || "");
      formData.append("location", profile.location || "");
      formData.append("socialLinks", JSON.stringify(profile.socialLinks || {}));
      if (profileImageFile) formData.append("profileImage", profileImageFile);
      if (resumeFile) formData.append("resumeFile", resumeFile);

      const response = await fetch(`${API}customer/profile/save/`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save your profile.");
      }

      setProfile((previous) => ({ ...previous, ...data.profile }));
      setProfileImageFile(null);
      setResumeFile(null);
      const imageInput = document.getElementById("profile-image-input");
      if (imageInput) imageInput.value = "";
      const resumeInput = document.getElementById("resume-file-input");
      if (resumeInput) resumeInput.value = "";
      setMessage("Profile saved successfully.");
      const settingsResponse = await fetch(`${API}customer/portfolio/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          title: portfolio.title || "My Portfolio",
          selectedTemplate: portfolio?.selectedTemplate || "minimal",
        }),
      });

      const settingsData = await settingsResponse.json();

      if (!settingsResponse.ok) {
        throw new Error(
          settingsData.error || "Profile saved, but template settings failed.",
        );
      }

      setPortfolio((previous) => ({
        ...previous,
        ...settingsData.portfolio,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }
  async function saveProject(event) {
    event.preventDefault();
    setSavingProject(true);
    setProjectMessage("");
    setProjectError("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure save request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("="),
      );

      const payload = {
        ...projectForm,
        id: editingProjectId,
        technologies: projectForm.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch(`${API}customer/projects/save/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (_parseError) {
        data = {};
      }

      if (!response.ok) {
        const detail = typeof data.error === "string"
          ? data.error
          : data.error && typeof data.error === "object"
            ? Object.entries(data.error).map(([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(", ") : String(messages)}`
              ).join("; ")
            : `Unable to save project (server returned ${response.status}). Please check the backend terminal for details.`;
        throw new Error(detail);
      }
      if (!data.project) {
        throw new Error("The server response did not include the saved project. Please refresh and check whether it was saved.");
      }

      setProjects((previous) => {
        const alreadyExists = previous.some(
          (project) => project.id === data.project.id,
        );

        if (alreadyExists) {
          return previous.map((project) =>
            project.id === data.project.id ? data.project : project,
          );
        }

        return [...previous, data.project];
      });
      setProjectForm(EMPTY_PROJECT);
      setEditingProjectId(null);
      setProjectMessage(data.message || "Project saved successfully.");
    } catch (err) {
      setProjectError(err.message || "Unable to save project.");
    } finally {
      setSavingProject(false);
    }
  }

  async function deleteProject(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone.",
    );

    if (!confirmed) return;

    setProjectError("");
    setProjectMessage("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure delete request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("="),
      );

      const response = await fetch(`${API}customer/projects/delete/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ id: projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to delete project.",
        );
      }

      setProjects((current) =>
        current.filter((project) => project.id !== projectId),
      );

      if (editingProjectId === projectId) {
        setEditingProjectId(null);
        setProjectForm(EMPTY_PROJECT);
      }

      setProjectMessage("Project deleted successfully.");
    } catch (err) {
      setProjectError(err.message || "Unable to delete project.");
    }
  }

  async function saveSkill(event) {
    event.preventDefault();
    setSavingSkill(true);
    setSkillMessage("");
    setSkillError("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure save request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("=")
      );

      const response = await fetch(`${API}customer/skills/save/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          ...skillForm,
          id: editingSkillId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : data.error?.name?.[0] || "Unable to save skill."
        );
      }

      setSkills((current) => {
        const exists = current.some((skill) => skill.id === data.skill.id);
        if (exists) {
          return current.map((skill) =>
            skill.id === data.skill.id ? data.skill : skill
          );
        }
        return [...current, data.skill];
      });

      setSkillForm(EMPTY_SKILL);
      setEditingSkillId(null);
      setSkillMessage(data.message || "Skill saved successfully.");
    } catch (err) {
      setSkillError(err.message || "Unable to save skill.");
    } finally {
      setSavingSkill(false);
    }
  }

  async function deleteSkill(skillId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );
    if (!confirmed) return;

    setSkillError("");
    setSkillMessage("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure delete request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("=")
      );

      const response = await fetch(`${API}customer/skills/delete/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ id: skillId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Unable to delete skill."
        );
      }

      setSkills((current) => current.filter((skill) => skill.id !== skillId));

      if (editingSkillId === skillId) {
        setEditingSkillId(null);
        setSkillForm(EMPTY_SKILL);
      }

      setSkillMessage(data.message || "Skill deleted successfully.");
    } catch (err) {
      setSkillError(err.message || "Unable to delete skill.");
    }
  }

  async function saveCertification(event) {
    event.preventDefault();
    setSavingCertification(true);
    setCertificationMessage("");
    setCertificationError("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure save request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("=")
      );

      const formData = new FormData();
      formData.append("name", certificationForm.name);
      formData.append("issuer", certificationForm.issuer);
      formData.append("issueDate", certificationForm.issueDate);
      formData.append("credentialId", certificationForm.credentialId);
      formData.append("certificateUrl", certificationForm.certificateUrl);
      formData.append("description", certificationForm.description);
      if (editingCertificationId) {
        formData.append("id", String(editingCertificationId));
      }
      if (certificateFile) {
        formData.append("certificateFile", certificateFile);
      }

      const response = await fetch(`${API}customer/certifications/save/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = typeof data.error === "string"
          ? data.error
          : data.error?.name?.[0] ||
            data.error?.certificate_url?.[0] ||
            "Unable to save certification.";
        throw new Error(detail);
      }

      setCertifications((current) => {
        const exists = current.some(
          (item) => item.id === data.certification.id
        );
        if (exists) {
          return current.map((item) =>
            item.id === data.certification.id ? data.certification : item
          );
        }
        return [...current, data.certification];
      });

      setCertificationForm(EMPTY_CERTIFICATION);
      setCertificateFile(null);
      setEditingCertificationId(null);
      setCertificationMessage(data.message || "Certification saved successfully.");
      const fileInput = document.getElementById("certificate-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setCertificationError(err.message || "Unable to save certification.");
    } finally {
      setSavingCertification(false);
    }
  }

  async function deleteCertification(certificationId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certification?"
    );
    if (!confirmed) return;

    setCertificationError("");
    setCertificationMessage("");

    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Unable to prepare secure delete request.");
      }

      const csrfCookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrftoken="));

      if (!csrfCookie) {
        throw new Error("CSRF cookie missing. Please refresh and try again.");
      }

      const csrfToken = decodeURIComponent(
        csrfCookie.split("=").slice(1).join("=")
      );

      const response = await fetch(`${API}customer/certifications/delete/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ id: certificationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to delete certification."
        );
      }

      setCertifications((current) =>
        current.filter((item) => item.id !== certificationId)
      );

      if (editingCertificationId === certificationId) {
        setEditingCertificationId(null);
        setCertificationForm(EMPTY_CERTIFICATION);
      }

      setCertificationMessage(data.message || "Certification deleted successfully.");
    } catch (err) {
      setCertificationError(err.message || "Unable to delete certification.");
    }
  }

  async function submitForApproval() {
    const confirmed = window.confirm(
      "Submit your portfolio to the owner for review? Your current live website will remain unchanged until approval."
    );
    if (!confirmed) return;

    setSubmittingApproval(true);
    setApprovalError("");
    setApprovalMessage("");
    try {
      const csrfResponse = await fetch(`${API}customer/csrf/`, {
        credentials: "include",
      });
      if (!csrfResponse.ok) throw new Error("Unable to prepare a secure request.");
      const csrfCookie = document.cookie.split("; ").find((item) => item.startsWith("csrftoken="));
      if (!csrfCookie) throw new Error("Security token missing. Refresh and try again.");
      const csrfToken = decodeURIComponent(csrfCookie.split("=").slice(1).join("="));

      const response = await fetch(`${API}customer/submit-for-approval/`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit your portfolio.");
      setPortfolio((current) => ({
        ...current,
        status: data.portfolioStatus || "in_review",
        review: data.review || current.review,
      }));
      setApprovalMessage(data.message || "Submitted successfully. The owner will review your portfolio.");
    } catch (err) {
      setApprovalError(err.message || "Submission failed.");
    } finally {
      setSubmittingApproval(false);
    }
  }

  // Handle accordion toggles ourselves. A new click interrupts/reverses an in-progress
  // animation instead of being ignored, so one click always responds.
  const handleAccordionClick = (event) => {
    const summary = event.target.closest("summary");
    if (!summary) return;

    const accordion = summary.closest("details.editor-accordion");
    if (!accordion) return;

    event.preventDefault();
    event.stopPropagation();

    const body = accordion.querySelector(":scope > .editor-accordion-body");
    if (!body) return;

    const currentlyTargetedOpen =
      body.dataset.targetOpen === "true" ||
      (body.dataset.targetOpen !== "false" && accordion.open);
    const shouldOpen = !currentlyTargetedOpen;
    body.dataset.targetOpen = String(shouldOpen);

    if (body._accordionAnimation) {
      body._accordionAnimation.cancel();
      body._accordionAnimation = null;
    }

    const currentHeight = body.getBoundingClientRect().height;
    const computed = window.getComputedStyle(body);
    const currentOpacity = Number.parseFloat(computed.opacity) || 0;
    const currentPaddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const currentPaddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const currentBorderTop = Number.parseFloat(computed.borderTopWidth) || 0;

    if (shouldOpen) {
      accordion.open = true;
      body.style.display = "block";
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "hidden";
    }

    // Lock the current rendered state before starting a new animation.
    body.style.height = `${currentHeight}px`;
    body.style.opacity = String(currentOpacity);
    body.style.paddingTop = `${currentPaddingTop}px`;
    body.style.paddingBottom = `${currentPaddingBottom}px`;
    body.style.borderTopWidth = `${currentBorderTop}px`;
    void body.offsetHeight;

    const targetHeight = shouldOpen ? body.scrollHeight : 0;
    const animation = body.animate(
      [
        {
          height: `${currentHeight}px`,
          opacity: currentOpacity,
          paddingTop: `${currentPaddingTop}px`,
          paddingBottom: `${currentPaddingBottom}px`,
          borderTopWidth: `${currentBorderTop}px`,
        },
        {
          height: `${targetHeight}px`,
          opacity: shouldOpen ? 1 : 0,
          paddingTop: shouldOpen ? "16px" : "0px",
          paddingBottom: shouldOpen ? "20px" : "0px",
          borderTopWidth: shouldOpen ? "1px" : "0px",
        },
      ],
      {
        duration: 1500,
        easing: "cubic-bezier(.22,.61,.36,1)",
        fill: "forwards",
      }
    );

    body._accordionAnimation = animation;
    animation.onfinish = () => {
      // Ignore stale completion events from animations that were replaced by another click.
      if (body._accordionAnimation !== animation) return;

      body._accordionAnimation = null;
      if (body.dataset.targetOpen === "true") {
        accordion.open = true;
        body.style.height = "auto";
        body.style.opacity = "1";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.style.borderTopWidth = "";
        body.style.overflow = "";
      } else {
        accordion.open = false;
        body.style.height = "";
        body.style.opacity = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.style.borderTopWidth = "";
        body.style.overflow = "";
      }
    };
    animation.oncancel = () => {
      if (body._accordionAnimation === animation) {
        body._accordionAnimation = null;
      }
    };
  };

  if (loading) {
    return <main className="customer-dashboard">Loading editor...</main>;
  }

  if (error && !portfolio) {
    return (
      <main className="customer-dashboard">
        <h1>Unable to open editor</h1>
        <p>{error}</p>
        <button onClick={() => (window.location.href = "/customer/dashboard")}>
          Back to dashboard
        </button>
      </main>
    );
  }

  const profileComplete = Boolean(
    profile.fullName?.trim() && profile.headline?.trim() && profile.about?.trim() &&
    profile.email?.trim() && profile.mobileNumber?.trim() && profile.location?.trim() &&
    (profile.profileImageUrl || profileImageFile) && (profile.resumeUrl || resumeFile)
  );
  const templateComplete = Boolean(portfolio?.selectedTemplate);
  const templateDescriptions = {
  minimal: "Clean, light and editorial. Perfect for a simple, elegant professional portfolio.",
  dark_developer: "A premium dark interface with modern developer-inspired details.",
  creative: "Expressive gradients, bold typography and a creative visual identity.",
  professional: "An executive navy design for a polished professional presentation.",
  modern_profile: "Warm colours, elegant typography and a personal presentation.",
  career_timeline: "A structured layout highlighting career progress and milestones.",
};

const selectedTemplateIndex = Math.max(
  0,
  availableTemplates.findIndex(([value]) => value === portfolio?.selectedTemplate)
);

const selectedTemplateName =
  availableTemplates[selectedTemplateIndex]?.[1] || "Minimal";
  const certificationsComplete = certifications.length > 0;
  const skillsComplete = skills.length > 0;
  const projectsComplete = projects.length > 0;
  const completedSections = [
    templateComplete,
    profileComplete,
    certificationsComplete,
    skillsComplete,
    projectsComplete,
  ].filter(Boolean).length;

  return (
    <main className="customer-dashboard editor-accordion-page" onClickCapture={handleAccordionClick}>
      <style>{`
        .editor-submit-panel{display:flex;align-items:center;justify-content:space-between;gap:24px;margin:22px 0 36px;padding:26px;border:1px solid #dbe3ee;border-radius:18px;background:linear-gradient(135deg,#fff,#f5f7ff);box-shadow:0 8px 26px rgba(31,45,80,.06)}
        .editor-submit-panel h2{margin:5px 0 8px;color:#17213b}
        .editor-submit-panel p{color:#64748b;line-height:1.6}
        .editor-submit-button{min-width:220px;min-height:50px;font-weight:750}
        .editor-submit-button:disabled{opacity:.55;cursor:not-allowed}
        .editor-approval-state{font-weight:700;color:#0369a1!important}
        .editor-approval-warning{color:#b45309!important}
        @media(max-width:680px){.editor-submit-panel{align-items:stretch;flex-direction:column}.editor-submit-button{width:100%}}
        .editor-progress{margin:0 0 20px;padding:14px 18px;border-radius:14px;background:#f3f4f6;color:#374151}
        .editor-progress-track{height:8px;margin-top:9px;border-radius:99px;background:#d1d5db;overflow:hidden}
        .editor-progress-fill{height:100%;background:#16a34a;transition:width .25s ease}
        details.editor-accordion{padding:0!important;overflow:hidden;border:1px solid #d1d5db;border-radius:16px;margin:0 0 16px;transition:background .2s ease,border-color .2s ease,box-shadow .2s ease}
        details.editor-accordion>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;font-size:1.05rem;font-weight:700}
        details.editor-accordion>summary::-webkit-details-marker{display:none}
        details.editor-accordion>summary:after{content:'⌄';font-size:1.5rem;line-height:1;transition:transform .2s ease}
        details.editor-accordion[open]>summary:after{transform:rotate(180deg)}
        .editor-accordion-title{display:flex;align-items:center;flex-wrap:wrap;gap:10px}
        .editor-status{font-size:.8rem;border-radius:99px;padding:5px 10px;background:#e5e7eb;color:#4b5563;font-weight:600}
        .editor-status.complete{color:#166534;background:#bbf7d0}
        .editor-accordion-body{padding:4px 22px 22px;color:#f9fafb}
        details.editor-accordion.is-complete{border-color:#22c55e;background:#f0fdf4;box-shadow:0 0 0 1px rgba(34,197,94,.12)}
        details.editor-accordion.is-complete>summary{background:#dcfce7;color:#166534}
        details.editor-accordion.is-complete .editor-accordion-body{background:#f0fdf4;color:#14532d}
        /* The shared dashboard stylesheet uses light text. Override it inside completed green panels for readable contrast. */
        details.editor-accordion.is-complete .editor-accordion-body,
        details.editor-accordion.is-complete .editor-accordion-body h2,
        details.editor-accordion.is-complete .editor-accordion-body h3,
        details.editor-accordion.is-complete .editor-accordion-body h4,
        details.editor-accordion.is-complete .editor-accordion-body p,
        details.editor-accordion.is-complete .editor-accordion-body label,
        details.editor-accordion.is-complete .editor-accordion-body strong,
        details.editor-accordion.is-complete .editor-accordion-body span{color:#14532d!important}
        .editor-accordion-body label{display:block;margin-top:14px;color:#f9fafb}
        .editor-accordion-body input,.editor-accordion-body textarea,.editor-accordion-body select{max-width:100%;box-sizing:border-box}
        .editor-accordion-body input:not([type=file]),.editor-accordion-body textarea,.editor-accordion-body select{color:#f9fafb;background:#0c0c16;border:1px solid #45455b;border-radius:9px;padding:12px 14px;width:100%}
        .editor-accordion-body input[type=file]{color:#f9fafb;background:#0c0c16;border:1px solid #45455b;border-radius:9px;padding:10px;width:100%}
        .editor-accordion-body a{color:#2563eb!important;text-decoration:underline}
        .editor-accordion-body button{border:1px solid #475569;border-radius:8px;padding:9px 13px;margin:5px 6px 5px 0;background:#1f2937;color:#fff;font-weight:600;cursor:pointer}
        .editor-accordion-body button.customer-primary-button{background:#2563eb;color:#fff;border-color:#2563eb}
        details.editor-accordion.is-complete .editor-accordion-body button{color:#fff!important}

        /* Professional styling for every saved item and add/edit form */
        .editor-accordion-body h2{font-size:1.35rem;line-height:1.3;margin:18px 0 8px;font-weight:750}
        .editor-accordion-body>p{line-height:1.6}
        .editor-accordion-body .customer-project-item{
          display:block;background:#fff!important;color:#172033!important;
          border:1px solid #dbe3ee;border-radius:14px;padding:18px 20px;margin:14px 0;
          box-shadow:0 4px 14px rgba(15,23,42,.06)
        }
        .editor-accordion-body .customer-project-item h3,
        .editor-accordion-body .customer-project-item h4,
        .editor-accordion-body .customer-project-item p,
        .editor-accordion-body .customer-project-item strong{
          color:#172033!important;line-height:1.55
        }
        .editor-accordion-body .customer-project-item h3{font-size:1.08rem;font-weight:750;margin:0 0 8px}
        .editor-accordion-body .customer-project-item p{margin:6px 0;overflow-wrap:anywhere}
        .editor-accordion-body .customer-project-item a{color:#1d4ed8!important;font-weight:600}
        .editor-accordion-body .customer-project-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
        .editor-accordion-body .customer-project-actions button{margin:0}
        .editor-accordion-body form{
          background:rgba(255,255,255,.72);border:1px solid #dbe3ee;border-radius:14px;
          padding:20px;margin:18px 0 4px
        }
        .editor-accordion-body form label{display:block;color:#243247!important;font-size:.94rem;font-weight:650;margin:0 0 14px}
        .editor-accordion-body form input:not([type=file]),
        .editor-accordion-body form textarea,
        .editor-accordion-body form select{
          display:block;margin-top:7px;min-height:46px;color:#f9fafb!important;
          background:#111827!important;border:1px solid #cbd5e1;border-radius:9px;
          padding:12px 14px;width:100%;font:inherit;box-sizing:border-box
        }
        .editor-accordion-body form textarea{min-height:110px;resize:vertical}
        .editor-accordion-body form input[type=file]{
          display:block;margin-top:8px;min-height:46px;width:100%;box-sizing:border-box;
          background:#111827;color:#fff;border:1px solid #cbd5e1;border-radius:9px;padding:10px
        }
        .editor-accordion-body form button{
          min-height:42px;padding:10px 16px;border-radius:9px;font-size:.92rem;
          transition:transform .15s ease,filter .15s ease
        }
        .editor-accordion-body form button:hover,
        .editor-accordion-body .customer-project-actions button:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .editor-accordion-body form button.customer-primary-button{background:#2563eb!important;border-color:#2563eb!important;color:#fff!important}
        .editor-accordion-body form button[type=button]{background:#334155;border-color:#475569;color:#fff}
        .editor-accordion-body form [role=alert]{color:#b91c1c!important;font-weight:600}
        .editor-accordion-body form [role=status]{color:#166534!important;font-weight:650}
        .editor-accordion-body .editor-status{white-space:nowrap}
        details.editor-accordion.is-complete .editor-accordion-body .customer-project-item{background:#fff!important}
        /* Higher contrast: neutral editor surface, crisp cards, dark readable text */
        details.editor-accordion.is-complete .editor-accordion-body{
          background:#f1f5f9!important;color:#172033!important
        }
        .editor-accordion-body,
        .editor-accordion-body h2,
        .editor-accordion-body h3,
        .editor-accordion-body h4,
        .editor-accordion-body p,
        .editor-accordion-body label,
        .editor-accordion-body strong,
        .editor-accordion-body span{
          color:#172033!important
        }
        .editor-accordion-body .customer-project-item{
          background:#ffffff!important;border:1px solid #cbd5e1;
          border-left:5px solid #16a34a;box-shadow:0 6px 18px rgba(15,23,42,.09)
        }
        .editor-accordion-body .customer-project-item h3{color:#0f172a!important}
        .editor-accordion-body .customer-project-item p,
        .editor-accordion-body .customer-project-item strong{color:#334155!important}
        .editor-accordion-body form{
          background:#ffffff!important;border:1px solid #cbd5e1;
          box-shadow:0 6px 18px rgba(15,23,42,.06)
        }
        .editor-accordion-body form label{color:#1e293b!important}
        .editor-accordion-body form input:not([type=file]),
        .editor-accordion-body form textarea,
        .editor-accordion-body form select{
          color:#f8fafc!important;background:#0f172a!important;border:1px solid #64748b
        }
        .editor-accordion-body form input::placeholder,
        .editor-accordion-body form textarea::placeholder{color:#94a3b8!important;opacity:1}
        .editor-accordion-body form button.customer-primary-button{color:#fff!important}
        .editor-accordion-body form button[type=button],
        .editor-accordion-body .customer-project-actions button{
          background:#1e293b!important;color:#fff!important;border:1px solid #334155
        }
        .editor-accordion-body form [role=status]{color:#166534!important}
        .editor-accordion-body form [role=alert]{color:#b91c1c!important}
        @media(max-width:600px){
          details.editor-accordion>summary{padding:16px}
          .editor-accordion-body{padding:4px 16px 18px}
          .editor-accordion-body .customer-project-item,.editor-accordion-body form{padding:15px}
          .editor-accordion-body .customer-project-actions button{flex:1 1 auto}
        }
        /* Final contrast fix: keep accordion headers state-colored, but make ALL bodies readable */
        .editor-accordion-body{
          background:#f1f5f9!important;
          color:#172033!important;
          border-top:1px solid #cbd5e1!important;
        }
        .editor-accordion-body h1,
        .editor-accordion-body h2,
        .editor-accordion-body h3,
        .editor-accordion-body h4,
        .editor-accordion-body p,
        .editor-accordion-body label,
        .editor-accordion-body strong,
        .editor-accordion-body span{
          color:#172033!important;
        }
        .editor-accordion-body .customer-project-item{
          background:#ffffff!important;
          color:#172033!important;
          border:1px solid #cbd5e1!important;
          border-left:5px solid #16a34a!important;
        }
        .editor-accordion-body .customer-project-item h3,
        .editor-accordion-body .customer-project-item h4,
        .editor-accordion-body .customer-project-item p,
        .editor-accordion-body .customer-project-item strong{
          color:#172033!important;
        }
        .editor-accordion-body form{
          background:#ffffff!important;
          color:#172033!important;
          border:1px solid #cbd5e1!important;
        }
        .editor-accordion-body form label{
          color:#1e293b!important;
        }
        .editor-accordion-body form input:not([type=file]),
        .editor-accordion-body form textarea,
        .editor-accordion-body form select{
          color:#f8fafc!important;
          background:#0f172a!important;
          border:1px solid #64748b!important;
        }
        .editor-accordion-body form input::placeholder,
        .editor-accordion-body form textarea::placeholder{
          color:#94a3b8!important;
          opacity:1!important;
        }
        .editor-accordion-body form button,
        .editor-accordion-body .customer-project-actions button{
          color:#ffffff!important;
        }


              /* Repeatable measured-height animation for opening AND closing */
        details.editor-accordion>.editor-accordion-body{
          display:block!important;
          box-sizing:border-box;
          height:auto;
          overflow:hidden;
          transition:height 1.5s cubic-bezier(.22,.61,.36,1),
                     opacity .35s ease,
                     padding-top .35s ease,
                     padding-bottom .35s ease,
                     border-top-width .35s ease;
        }
        details.editor-accordion>summary{
          transition:background-color .25s ease, color .25s ease, border-color .25s ease;
        }
        details.editor-accordion>summary:after{
          transition:transform .35s ease;
        }
        @media (prefers-reduced-motion: reduce){
          details.editor-accordion>.editor-accordion-body,
          details.editor-accordion>summary,
          details.editor-accordion>summary:after{
            transition:none!important;
          }
        }
`}
</style>
      <div className="editor-progress" aria-live="polite">
        <strong>Portfolio completion: {completedSections} of 5 sections</strong>
        <p>You can submit your portfolio even when some sections are incomplete. Missing sections will display a professional “Coming soon” or “In progress” message after owner approval.</p>
        <div className="editor-progress-track"><div className="editor-progress-fill" style={{width:`${completedSections / 5 * 100}%`}} /></div>
      </div>
      <header className="customer-dashboard-header">
        <div>
          <p className="customer-eyebrow">PORTFOLIO BUILDER</p>
          <h1>Edit my portfolio</h1>
          <p>Update your information and save your changes.</p>
        </div>
        <button
          className="customer-logout"
          onClick={() => (window.location.href = "/customer/dashboard")}
        >
          Back to dashboard
        </button>
      </header>

      <details className={`editor-accordion customer-dashboard-card ${portfolio?.selectedTemplate ? "is-complete" : ""}`}>
        <summary><span className="editor-accordion-title">Choose a template <span className={`editor-status ${portfolio?.selectedTemplate ? "complete" : ""}`}>{portfolio?.selectedTemplate ? "✓ Selected" : "Not selected"}</span></span></summary>
        <div className="editor-accordion-body">
        
<h2>Choose your portfolio design</h2>

<p className="template-gallery-intro">
  Explore all six professional designs. Select a template to see how your
  public portfolio will look. Your profile and portfolio information will
  remain unchanged.
</p>

{/* TEMPLATE CAROUSEL */}
<div className="template-carousel-wrapper">
  <button
    type="button"
    className="template-carousel-arrow"
    aria-label="Previous template"
    onClick={() => {
      const index =
        (selectedTemplateIndex - 1 + availableTemplates.length) %
        availableTemplates.length;
      setPortfolio((previous) => ({
        ...previous,
        selectedTemplate: availableTemplates[index][0],
      }));
    }}
  >
    &#10094;
  </button>

  <div className="template-carousel">
    {availableTemplates.map(([value, label]) => {
      const selected = portfolio?.selectedTemplate === value;

      return (
        <button
          type="button"
          key={value}
          className={`template-carousel-item ${selected ? "active" : ""}`}
          aria-pressed={selected}
          onClick={() =>
            setPortfolio((previous) => ({
              ...previous,
              selectedTemplate: value,
            }))
          }
        >
          <span className={`template-preview-mini template-preview-${value}`}>
            <span className="preview-mini-top">
              <i /><i /><i />
            </span>
            <span className="preview-mini-body">
              <i /><i /><i />
            </span>
            <span className="preview-mini-photo" />
          </span>

          <span className="template-carousel-label">{label}</span>

          {value === "minimal" && (
            <span className="template-main-label">MAIN TEMPLATE</span>
          )}

          {selected && (
            <span className="template-carousel-selected">
              ✓ Selected
            </span>
          )}
        </button>
      );
    })}
  </div>

  <button
    type="button"
    className="template-carousel-arrow"
    aria-label="Next template"
    onClick={() => {
      const index =
        (selectedTemplateIndex + 1) % availableTemplates.length;
      setPortfolio((previous) => ({
        ...previous,
        selectedTemplate: availableTemplates[index][0],
      }));
    }}
  >
    &#10095;
  </button>
</div>

{/* LARGE TEMPLATE PREVIEW */}
<div className={`template-large-preview template-preview-${portfolio?.selectedTemplate || "minimal"}`}>
  <div className="template-large-browser">
    <div className="template-large-browser-bar">
      <span /><span /><span />
      <small>Portfolio preview</small>
    </div>

    <div className="template-large-page">
      <nav className="template-large-nav">
        <strong>{profile.fullName || "YOUR NAME"}</strong>
        <span>ABOUT &nbsp; EXPERIENCE &nbsp; SKILLS &nbsp; PROJECTS</span>
      </nav>

      <div className="template-large-hero">
        <div className="template-large-copy">
          <small>HELLO, I'M</small>
          <h1>{profile.fullName || "Your Name"}</h1>
          <h2>
            {profile.headline || "Your professional headline goes here"}
          </h2>
          <p>
            {profile.about ||
              "Your professional introduction will appear here. Add your profile information to personalise this preview."}
          </p>
          <span className="template-large-contact">GET IN TOUCH ↗</span>
        </div>

        <div className="template-large-photo">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt="Profile preview"
            />
          ) : profileImagePreview ? (
            <img src={profileImagePreview} alt="Profile preview" />
          ) : (
            <span>
              {(profile.fullName || "YN")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="template-large-sections">
        <div><strong>01</strong><span>About Me</span></div>
        <div><strong>02</strong><span>Experience</span></div>
        <div><strong>03</strong><span>Skills & Expertise</span></div>
        <div><strong>04</strong><span>Selected Projects</span></div>
        <div><strong>05</strong><span>Education</span></div>
        <div><strong>06</strong><span>Certifications</span></div>
      </div>
    </div>
  </div>
</div>

{/* SELECTED TEMPLATE DETAILS */}
<div className="template-selected-details">
  <div>
    <span className="template-selected-eyebrow">
      {portfolio?.selectedTemplate === "minimal"
        ? "MAIN TEMPLATE · YOUR SELECTED DESIGN"
        : "YOUR SELECTED DESIGN"}
    </span>
    <h2>{selectedTemplateName}</h2>
    <p>
      {templateDescriptions[portfolio?.selectedTemplate] ||
        "A distinctive professional portfolio design."}
    </p>
  </div>

  <button
    type="button"
    className="template-gallery-save"
    onClick={saveSelectedTemplate}
    disabled={savingTemplate || !portfolio?.selectedTemplate}
  >
    {savingTemplate ? "Saving design..." : "Save selected design"}
  </button>
</div>

{templateSaveMessage && (
  <p className="template-gallery-success" role="status">
    {templateSaveMessage}
  </p>
)}

{templateSaveError && (
  <p className="template-gallery-error" role="alert">
    {templateSaveError}
  </p>
)}

<p className="template-save-note">
  You can change your design anytime. Changing the template will not delete
  your profile, projects, skills or other information.
</p>

        </div>
      </details>

      <details className={`editor-accordion customer-dashboard-card ${profileComplete ? "is-complete" : ""}`} open>
        <summary><span className="editor-accordion-title">Profile, photo &amp; resume <span className={`editor-status ${profileComplete ? "complete" : ""}`}>{profileComplete ? "✓ Complete" : "In progress"}</span></span></summary>
        <div className="editor-accordion-body">
      <form onSubmit={saveProfile}>
        <h2>Profile details</h2>

        <section aria-label="Profile photo and resume">
          <h3>Profile photo</h3>
          {(profileImagePreview || profile.profileImageUrl) ? (
            <img
              src={profileImagePreview || profile.profileImageUrl}
              alt="Profile preview"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
                marginBottom: "12px",
              }}
            />
          ) : (
            <p>No profile photo uploaded yet.</p>
          )}
          <label>
            Upload or replace profile photo (JPG, PNG, or WEBP; max 5 MB)
            <input
              id="profile-image-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setProfileImageFile(event.target.files?.[0] || null)
              }
            />
          </label>
          {profileImageFile && <p>Selected photo: {profileImageFile.name}</p>}

          <h3>Resume (PDF)</h3>
          {profile.resumeUrl ? (
            <p>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                View current resume
              </a>
            </p>
          ) : (
            <p>No resume uploaded yet.</p>
          )}
          <label>
            Upload or replace resume (PDF only; max 10 MB)
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                setResumeFile(event.target.files?.[0] || null)
              }
            />
          </label>
          {resumeFile && <p>Selected resume: {resumeFile.name}</p>}
          <p>Choose a file and click “Save profile” to upload or replace it.</p>
        </section>

        <label>
          Full name
          <input
            value={profile.fullName}
            onChange={(e) => updateProfile("fullName", e.target.value)}
          />
        </label>

        <label>
          Professional headline
          <input
            value={profile.headline}
            onChange={(e) => updateProfile("headline", e.target.value)}
          />
        </label>

        <label>
          About
          <textarea
            rows={5}
            value={profile.about}
            onChange={(e) => updateProfile("about", e.target.value)}
          />
        </label>

        <label>
          Contact email
          <input
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile("email", e.target.value)}
          />
        </label>

        <label>
          Mobile number
          <input
            value={profile.mobileNumber}
            onChange={(e) => updateProfile("mobileNumber", e.target.value)}
          />
        </label>

        <label>
          Location
          <input
            value={profile.location}
            onChange={(e) => updateProfile("location", e.target.value)}
          />
        </label>

        <h2>Social links</h2>

        <label>
          GitHub URL
          <input
            type="url"
            value={profile.socialLinks.github}
            onChange={(e) => updateSocial("github", e.target.value)}
          />
        </label>

        <label>
          LinkedIn URL
          <input
            type="url"
            value={profile.socialLinks.linkedin}
            onChange={(e) => updateSocial("linkedin", e.target.value)}
          />
        </label>

        <label>
          Personal website URL
          <input
            type="url"
            value={profile.socialLinks.website}
            onChange={(e) => updateSocial("website", e.target.value)}
          />
        </label>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <button
          className="customer-primary-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
        </div>
      </details>

      <details className={`editor-accordion customer-dashboard-card ${certificationsComplete ? "is-complete" : ""}`}>
        <summary><span className="editor-accordion-title">Certifications <span className={`editor-status ${certificationsComplete ? "complete" : ""}`}>{certificationsComplete ? "✓ Complete" : "Add at least one"}</span></span></summary>
        <div className="editor-accordion-body">
        <h2>Certifications</h2>
        <p>Add professional certifications, courses, and credentials.</p>

        {certifications.length === 0 ? (
          <p>No certifications added yet.</p>
        ) : (
          certifications.map((item) => (
            <article key={item.id} className="customer-project-item">
              <h3>{item.name}</h3>
              {item.issuer && <p><strong>Issuer:</strong> {item.issuer}</p>}
              {item.issueDate && <p><strong>Issue date:</strong> {item.issueDate}</p>}
              {item.credentialId && (
                <p><strong>Credential ID:</strong> {item.credentialId}</p>
              )}
              {item.description && <p>{item.description}</p>}
              {item.certificateUrl && (
                <p>
                  <a href={item.certificateUrl} target="_blank" rel="noreferrer">
                    View certificate website
                  </a>
                </p>
              )}
              {item.certificateFileUrl && (
                <p>
                  <a href={item.certificateFileUrl} target="_blank" rel="noreferrer">
                    View uploaded certificate
                  </a>
                </p>
              )}
              <div className="customer-project-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCertificationId(item.id);
                    setCertificationForm({
                      name: item.name || "",
                      issuer: item.issuer || "",
                      issueDate: item.issueDate || "",
                      credentialId: item.credentialId || "",
                      certificateUrl: item.certificateUrl || "",
                      description: item.description || "",
                    });
                    setCertificateFile(null);
                    const fileInput = document.getElementById("certificate-file-input");
                    if (fileInput) fileInput.value = "";
                    setCertificationMessage("");
                    setCertificationError("");
                  }}
                >
                  Edit certification
                </button>
                <button
                  type="button"
                  onClick={() => deleteCertification(item.id)}
                >
                  Delete certification
                </button>
              </div>
            </article>
          ))
        )}

        <form onSubmit={saveCertification}>
          <label>
            Certification name
            <input
              required
              maxLength={200}
              value={certificationForm.name}
              placeholder="e.g. AWS Certified Cloud Practitioner"
              onChange={(event) =>
                setCertificationForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Issuing organization
            <input
              maxLength={200}
              value={certificationForm.issuer}
              placeholder="e.g. Amazon Web Services"
              onChange={(event) =>
                setCertificationForm((current) => ({
                  ...current,
                  issuer: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Issue date
            <input
              type="date"
              value={certificationForm.issueDate}
              onChange={(event) =>
                setCertificationForm((current) => ({
                  ...current,
                  issueDate: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Credential ID
            <input
              maxLength={200}
              value={certificationForm.credentialId}
              onChange={(event) =>
                setCertificationForm((current) => ({
                  ...current,
                  credentialId: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Certificate URL
            <input
              type="url"
              maxLength={200}
              value={certificationForm.certificateUrl}
              placeholder="https://..."
              onChange={(event) =>
                setCertificationForm((current) => ({
                  ...current,
                  certificateUrl: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Upload certificate file (PDF, PNG, JPG, or JPEG; max 5 MB)
            <input
              id="certificate-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={(event) =>
                setCertificateFile(event.target.files?.[0] || null)
              }
            />
          </label>
          {certificateFile && (
            <p>Selected file: {certificateFile.name}</p>
          )}

          <label>
            Description
            <textarea
              rows={3}
              value={certificationForm.description}
              onChange={(event) =>
                setCertificationForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>

          {certificationError && <p role="alert">{certificationError}</p>}
          {certificationMessage && <p role="status">{certificationMessage}</p>}

          <button
            className="customer-primary-button"
            type="submit"
            disabled={savingCertification}
          >
            {savingCertification
              ? "Saving certification..."
              : editingCertificationId
                ? "Update certification"
                : "Add certification"}
          </button>

          {editingCertificationId && (
            <button
              type="button"
              onClick={() => {
                setEditingCertificationId(null);
                setCertificationForm(EMPTY_CERTIFICATION);
                setCertificateFile(null);
                const fileInput = document.getElementById("certificate-file-input");
                if (fileInput) fileInput.value = "";
                setCertificationMessage("");
                setCertificationError("");
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
        </div>
      </details>

      <details className={`editor-accordion customer-dashboard-card ${skillsComplete ? "is-complete" : ""}`}>
        <summary><span className="editor-accordion-title">Skills <span className={`editor-status ${skillsComplete ? "complete" : ""}`}>{skillsComplete ? "✓ Complete" : "Add at least one"}</span></span></summary>
        <div className="editor-accordion-body">
        <h2>Skills</h2>
        <p>Add technical and professional skills and group them by category.</p>

        {skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          skills.map((skill) => (
            <article key={skill.id} className="customer-project-item">
              <h3>{skill.name}</h3>
              {skill.category && <p><strong>Category:</strong> {skill.category}</p>}
              <div className="customer-project-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSkillId(skill.id);
                    setSkillForm({
                      name: skill.name || "",
                      category: skill.category || "",
                    });
                    setSkillMessage("");
                    setSkillError("");
                  }}
                >
                  Edit skill
                </button>
                <button type="button" onClick={() => deleteSkill(skill.id)}>
                  Delete skill
                </button>
              </div>
            </article>
          ))
        )}

        <form onSubmit={saveSkill}>
          <label>
            Skill name
            <input
              required
              maxLength={100}
              value={skillForm.name}
              placeholder="e.g. React"
              onChange={(event) =>
                setSkillForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>

          <label>
            Category
            <input
              maxLength={100}
              value={skillForm.category}
              placeholder="e.g. Frontend"
              onChange={(event) =>
                setSkillForm((current) => ({ ...current, category: event.target.value }))
              }
            />
          </label>

          {skillError && <p role="alert">{skillError}</p>}
          {skillMessage && <p role="status">{skillMessage}</p>}

          <button
            className="customer-primary-button"
            type="submit"
            disabled={savingSkill}
          >
            {savingSkill
              ? "Saving skill..."
              : editingSkillId
                ? "Update skill"
                : "Add skill"}
          </button>

          {editingSkillId && (
            <button
              type="button"
              onClick={() => {
                setEditingSkillId(null);
                setSkillForm(EMPTY_SKILL);
                setSkillMessage("");
                setSkillError("");
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
        </div>
      </details>

      <details className={`editor-accordion customer-dashboard-card ${projectsComplete ? "is-complete" : ""}`}>
        <summary><span className="editor-accordion-title">Projects <span className={`editor-status ${projectsComplete ? "complete" : ""}`}>{projectsComplete ? "✓ Complete" : "Add at least one"}</span></span></summary>
        <div className="editor-accordion-body">
        <h2>Projects</h2>
        <p>Add your projects to showcase your work.</p>

        {projects.map((project) => (
          <article key={project.id} className="customer-project-item">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            {project.technologies?.length > 0 && (
              <p>
                <strong>Technologies:</strong> {project.technologies.join(", ")}
              </p>
            )}
            {project.projectUrl && (
              <p>
                <a href={project.projectUrl} target="_blank" rel="noreferrer">
                  View project
                </a>
              </p>
            )}
            {project.githubUrl && (
              <p>
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  GitHub repository
                </a>
              </p>
            )}

            <div className="customer-project-actions">
              <button
                type="button"
                onClick={() => {
                  setEditingProjectId(project.id);
                  setProjectForm({
                    title: project.title || "",
                    description: project.description || "",
                    technologies: (project.technologies || []).join(", "),
                    projectUrl: project.projectUrl || "",
                    githubUrl: project.githubUrl || "",
                  });
                  setProjectMessage("");
                  setProjectError("");
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }}
              >
                Edit project
              </button>

              <button type="button" onClick={() => deleteProject(project.id)}>
                Delete project
              </button>
            </div>
          </article>
        ))}

        <form onSubmit={saveProject}>
          <label>
            Project title
            <input
              required
              value={projectForm.title}
              onChange={(e) =>
                setProjectForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </label>

          <label>
            Description
            <textarea
              rows={4}
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </label>

          <label>
            Technologies (comma-separated)
            <input
              placeholder="React, Django, PostgreSQL"
              value={projectForm.technologies}
              onChange={(e) =>
                setProjectForm((p) => ({ ...p, technologies: e.target.value }))
              }
            />
          </label>

          <label>
            Project URL
            <input
              type="url"
              value={projectForm.projectUrl}
              onChange={(e) =>
                setProjectForm((p) => ({ ...p, projectUrl: e.target.value }))
              }
            />
          </label>

          <label>
            GitHub URL
            <input
              type="url"
              value={projectForm.githubUrl}
              onChange={(e) =>
                setProjectForm((p) => ({ ...p, githubUrl: e.target.value }))
              }
            />
          </label>

          {projectError && <p role="alert">{projectError}</p>}
          {projectMessage && <p role="status">{projectMessage}</p>}

          <button
            className="customer-primary-button"
            type="submit"
            disabled={savingProject}
          >
            {savingProject
              ? "Saving project..."
              : editingProjectId
                ? "Update project"
                : "Add project"}
          </button>

          {editingProjectId && (
            <button
              type="button"
              onClick={() => {
                setEditingProjectId(null);
                setProjectForm(EMPTY_PROJECT);
                setProjectMessage("");
                setProjectError("");
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
        </div>
      </details>

      <section className="customer-dashboard-card editor-submit-panel">
        <div>
          <p className="customer-eyebrow">FINAL STEP</p>
          <h2>Submit your portfolio for approval</h2>
          <p>
            Submit whenever you're ready, even if some sections are unfinished.
            We'll show professional “Coming soon” or “In progress” messages for
            anything you haven't added yet. Your public website changes only
            after the owner approves your submission.
          </p>
          {portfolio?.status === "in_review" && (
            <p className="editor-approval-state" role="status">
              Your portfolio is waiting for owner approval.
            </p>
          )}
          {portfolio?.status === "changes_requested" && (
            <p className="editor-approval-state editor-approval-warning" role="status">
              The owner requested changes. Update your portfolio and submit it again.
            </p>
          )}
          {approvalMessage && <p role="status">{approvalMessage}</p>}
          {approvalError && <p role="alert">{approvalError}</p>}
        </div>
        <button
          type="button"
          className="customer-primary-button editor-submit-button"
          onClick={submitForApproval}
          disabled={submittingApproval || portfolio?.status === "in_review"}
        >
          {submittingApproval
            ? "Submitting..."
            : portfolio?.status === "in_review"
              ? "Waiting for owner approval"
              : "Submit for approval"}
        </button>
      </section>
    </main>
  );
}

