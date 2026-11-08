import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import "./App.css";
import CustomerDashboard from "./customer/Dashboard";
import CustomerLogin from "./customer/Login";
import CustomerRegister from "./customer/Register";
import Hero from "./components/Hero";
import WebResumeCTA from "./components/WebResumeCTA";
import AcceptInvitation from "./customer/AcceptInvitation";
import Resume from "./components/Resume";
import PortfolioEditor from "./customer/PortfolioEditor";
import ResumeBuilder from "./customer/ResumeBuilder";
import PublicCustomerPortfolio from "./customer/PublicCustomerPortfolio";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Certifications from "./components/Certifications";
import AdminApp from "./admin/AdminApp";
import { apiRequest, assetUrl } from "./admin/adminApi";
function App() {
   const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const [admin, setAdmin] = useState(
    window.location.pathname.replace(/\/$/, "") === "/admin",
  );
  const [config, setConfig] = useState(null);
  useEffect(() => {
    const f = () =>
      setAdmin(window.location.pathname.replace(/\/$/, "") === "/admin");
    window.addEventListener("popstate", f);
    return () => window.removeEventListener("popstate", f);
  }, []);
  useEffect(() => {
    if (admin || pathname.startsWith("/customer/")) return;
    apiRequest("/api/public")
      .then((d) => {
        setConfig(d);
        if (d.siteTitle) document.title = d.siteTitle;
        
if (d.faviconUrl) {
  const faviconUrl = `${assetUrl(d.faviconUrl)}?v=${Date.now()}`;

  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
    .forEach((link) => {
      link.href = faviconUrl;
    });

  let iconLink = document.querySelector('link[rel="icon"]');

  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "icon";
    document.head.appendChild(iconLink);
    iconLink.href = faviconUrl;
  }
}

      })
      .catch(() => {});
  }, [admin, pathname]);
if (pathname === "/customer/login") {
  return <CustomerLogin />;
}

if (pathname === "/customer/register") {
  return <CustomerRegister />;
}

  if (pathname === "/customer/accept-invitation") {
  return <AcceptInvitation />;
}

if (pathname === "/customer/dashboard") {
  return <CustomerDashboard />;
}
if (pathname === "/customer/editor") {
  return <PortfolioEditor />;
}
if (pathname === "/customer/resume") {
  return <ResumeBuilder />;
}

if (pathname.startsWith("/portfolio/")) {
  const publicSlug = decodeURIComponent(pathname.slice("/portfolio/".length));
  return <PublicCustomerPortfolio slug={publicSlug} />;
}

if (admin) {
  return <AdminApp />;
}
  return (
    <div className="App">
      <Navbar />
      <Hero siteConfig={config} />
      <WebResumeCTA />
      <About />
      <Experience />
      <Skills />
      <Projects siteConfig={config} />
      <Education />
      <Certifications />
      <Resume siteConfig={config} />
      <Contact />
      <Footer />
    </div>
  );
}
export default App;
