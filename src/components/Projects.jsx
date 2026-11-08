import { useEffect, useState } from "react";
import "../css/Projects.css";
import {
  SiReact,
  SiSpringboot,
  SiPostgresql,
  SiPython,
  SiDjango,
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiMysql,
  SiMongodb,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiBootstrap,
  SiVite,
} from "react-icons/si";
import { FaCss3Alt } from "react-icons/fa";
import { apiRequest } from "../admin/adminApi";
const icons = {
  react: SiReact,
  "react.js": SiReact,
  "spring boot": SiSpringboot,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  python: SiPython,
  django: SiDjango,
  html: SiHtml5,
  html5: SiHtml5,
  css: FaCss3Alt,
  css3: FaCss3Alt,
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  mysql: SiMysql,
  mongodb: SiMongodb,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  git: SiGit,
  github: SiGithub,
  bootstrap: SiBootstrap,
  vite: SiVite,
};
const fallback = [
  {
    id: "owntag",
    title: "owntag.in",
    type: "FULL STACK WEB APPLICATION",
    description:
      "A real-world web application developed as part of my full-stack development journey.",
    technologies: ["React.js", "Spring Boot", "PostgreSQL"],
    projectUrl: "https://www.owntag.in",
    githubUrl: "",
  },
  {
    id: "portfolio",
    title: "Portfolio Website",
    type: "PERSONAL PROJECT",
    description:
      "A responsive developer portfolio built to showcase my skills, projects, education and development journey.",
    technologies: ["Python", "Django", "PostgreSQL"],
    projectUrl: "https://portfoliocv.in",
    githubUrl: "https://github.com/vajrabilash-Degapogu/portfolio-frontend",
  },
  {
    id: "crud",
    title: "Python CRUD Application",
    type: "PYTHON PROJECT",
    description:
      "A practical CRUD application built while developing Python programming and backend development fundamentals.",
    technologies: ["Python", "Django", "PostgreSQL"],
    projectUrl: "",
    githubUrl: "",
  },
];
function Projects({ siteConfig }) {
  const [projects, setProjects] = useState(siteConfig?.projects || fallback);
  useEffect(() => {
    if (siteConfig?.projects) {
      setProjects(siteConfig.projects);
      return;
    }
    let active = true;
    apiRequest("/api/public")
      .then((d) => {
        if (active && Array.isArray(d.projects)) setProjects(d.projects);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [siteConfig]);
  return (
    <section className="projects-section" id="projects">
      <div className="projects-container">
        <div className="projects-heading">
          <p className="projects-label">MY PROJECTS</p>
          <h2>
            Things I've <span>built</span>
          </h2>
          <p>
            A selection of projects that represent my learning, development
            skills and practical experience.
          </p>
        </div>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <div className="project-card" key={p.id || i}>
              <div className="project-top">
                <span className="project-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="project-type">{p.type}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="project-description">{p.description}</p>
              <div className="project-technologies">
                {(p.technologies || []).map((t, j) => {
                  const n = typeof t === "string" ? t : t.name;
                  const Icon = icons[String(n).trim().toLowerCase()];
                  return (
                    <span key={j}>
                      {Icon && <Icon />}
                      {n}
                    </span>
                  );
                })}
              </div>
              <div className="project-links">
                {p.projectUrl && (
                  <a
                    href={p.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-button project-button-primary"
                  >
                    View Project
                  </a>
                )}
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-button"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Projects;
