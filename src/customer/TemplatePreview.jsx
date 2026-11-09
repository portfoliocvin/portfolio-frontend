import React from "react";
import "./TemplatePreview.css";

const portfolioTemplates = {
  minimal: { name:"Minimal", role:"Product Designer", person:"Alex Morgan", accent:"#83b9ff", about:"I turn complex ideas into clear, thoughtful digital experiences.", projects:["Product dashboard","Mobile banking","Design system"] },
  dark_developer: { name:"Dark Developer", role:"Full-stack Developer", person:"Jordan Lee", accent:"#8de4df", about:"Building reliable products with modern web technologies and a focus on performance.", projects:["Cloud workspace","API platform","Analytics app"] },
  creative: { name:"Creative", role:"Visual Designer", person:"Taylor Reed", accent:"#9de7c6", about:"Exploring the space between visual storytelling, interaction and identity.", projects:["Brand identity","Campaign studio","Editorial site"] },
  professional: { name:"Professional", role:"Business Consultant", person:"Morgan Blake", accent:"#e5a8d7", about:"Helping teams turn strategy into measurable outcomes through research and collaboration.", projects:["Growth strategy","Market research","Operations plan"] },
  modern_profile: { name:"Modern Profile", role:"Software Engineer", person:"Casey Rivera", accent:"#e8bd83", about:"Curious engineer creating accessible, scalable software for people and businesses.", projects:["E-commerce platform","Smart scheduler","Open-source tools"] },
  career_timeline: { name:"Career Timeline", role:"Engineering Professional", person:"Sam Wilson", accent:"#a6b4ff", about:"A journey of continuous learning, practical problem-solving and meaningful engineering work.", projects:["Automation system","Process redesign","Technical research"] }
};
const resumeTemplates = {
 classic:["Classic Professional","Alex Morgan","Software Developer","#315b91"],
 modern:["Modern","Jordan Lee","Product Analyst","#426fae"],
 ats:["ATS Optimized","Taylor Reed","Electrical Engineer","#4d8b83"],
 executive:["Executive","Morgan Blake","Operations Manager","#8b6aa5"],
 creative:["Creative","Casey Rivera","UX Designer","#b98552"],
 compact:["Compact One-Page","Jamie Patel","Graduate Engineer","#4c79a6"],
 academic:["Academic CV","Riley Chen","Research Associate","#527d73"],
 technical:["Technical Specialist","Avery Brooks","Cloud Engineer","#4c6ca1"],
 elegant:["Elegant Minimal","Drew Parker","Finance Professional","#887b9d"],
 bold:["Bold Contemporary","Quinn Taylor","Marketing Strategist","#b16e58"],
 timeline:["Professional Timeline","Sam Wilson","Project Engineer","#527d9b"]
};

function PortfolioDemo({item}) {
 return <main className={"tp-portfolio-demo tp-"+item.key} style={{"--tp-accent":item.accent}}>
  <nav><b>{item.person.split(" ").map(x=>x[0]).join("")}</b><span>{item.person}</span><small>ABOUT　 WORK　 CONTACT</small></nav>
  <section className="tp-portfolio-hero"><small>PERSONAL PORTFOLIO / 2026</small><h1>Hello, I'm<br/><em>{item.person}.</em></h1><h2>{item.role}</h2><p>{item.about}</p><span className="tp-demo-cta">Explore my work ↗</span></section>
  <section className="tp-project-section"><small>SELECTED WORK</small><h2>Ideas made real.</h2><div>{item.projects.map((p,i)=><article key={p}><i>{String(i+1).padStart(2,"0")}</i><b>{p}</b><span>Explore project ↗</span></article>)}</div></section>
  <footer>Let's create something meaningful.　{item.person.toLowerCase().replace(" ",".")+"@example.com"}</footer>
 </main>;
}
function ResumeDemo({item}) {
 const [key,person,role,accent]=item;
 return <div className={"tp-resume-paper tp-resume-"+key} style={{"--tp-resume-accent":accent}}>
  <header><h1>{person}</h1><h2>{role}</h2><p>Hyderabad, India　·　hello@example.com　·　+91 98765 43210</p></header>
  <section><h3>PROFESSIONAL SUMMARY</h3><p>Motivated professional with a strong foundation in problem-solving, collaboration and delivering practical outcomes. Passionate about continuous learning and creating meaningful work.</p></section>
  <section><h3>EDUCATION</h3><b>Bachelor's Degree — ABC Institute of Technology</b><p>2020 – 2024　·　CGPA: 8.4 / 10</p><b>Intermediate — City Junior College</b><p>2018 – 2020　·　Percentage: 87%</p></section>
  <section><h3>EXPERIENCE & PROJECTS</h3><b>Graduate Project Associate</b><p>Collaborated on projects, documented requirements and delivered tested solutions.</p><b>Portfolio & Task Management Platform</b><p>Designed a responsive application using React, Python and modern development practices.</p></section>
  <section><h3>SKILLS</h3><p>Problem Solving　·　Communication　·　Python　·　React　·　SQL　·　Project Planning</p></section>
  <section><h3>CERTIFICATIONS</h3><p>Professional Skills Certificate　·　Web Development Fundamentals</p></section>
 </div>;
}
export default function TemplatePreview() {
 const [, , type, key] = window.location.pathname.split("/");
 const portfolio=type==="portfolio";
 const item=portfolio?portfolioTemplates[key]:resumeTemplates[key];
 if(!item) return <main className="tp-not-found"><h1>Template not found</h1><a href="/">Back to Portfolio.cv</a></main>;
 return <main className="tp-page">
  <header className="tp-header"><a href="/">← Portfolio.cv</a><span>{portfolio?"PORTFOLIO TEMPLATE PREVIEW":"RESUME TEMPLATE PREVIEW"}</span><a href={portfolio?"/customer/register?portfolioTemplate="+key:"/customer/register?resumeTemplate="+key}>Use this template ↗</a></header>
  <div className="tp-heading"><p>LIVE SAMPLE PREVIEW</p><h1>{portfolio?item.name:item[0]}</h1><span>This is example content so you can see the layout before creating your own.</span></div>
  <div className="tp-canvas">{portfolio?<PortfolioDemo item={{...item,key}}/>:<ResumeDemo item={[key,...item]}/>}</div>
  <div className="tp-bottom"><a href="/">← Back to all templates</a><a className="tp-use" href={portfolio?"/customer/register?portfolioTemplate="+key:"/customer/register?resumeTemplate="+key}>Use this template →</a></div>
 </main>;
}
