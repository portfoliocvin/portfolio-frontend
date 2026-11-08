import { useState } from "react";
import "../css/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: personal brand */}
        <a href="#home" className="logo" onClick={closeMenu}>
          VAJRABILASH DEGAPOGU<span>.</span>
        </a>

        {/* Center: page navigation */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#experience" onClick={closeMenu}>Experience</a>
          <a href="#skills" onClick={closeMenu}>Skills</a>
          <a href="#projects" onClick={closeMenu}>Projects</a>
          <a href="#education" onClick={closeMenu}>Education</a>
          <a href="#certifications" onClick={closeMenu}>Certifications</a>
          <a href="#resume" onClick={closeMenu}>Resume</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </div>

        {/* Right: WebResume action */}
        <a
          href="/customer/register"
          className="nav-build-cta"
          onClick={closeMenu}
        >
          Build Your Portfolio
        </a>

        {/* Mobile menu toggle */}
        <button
          className={`menu-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
