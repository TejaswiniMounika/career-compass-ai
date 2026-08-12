import React from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, FileText, Target, Briefcase, Award, Bot, LogOut, Menu, X, Shield } from "lucide-react";
import api from "./api";

function useAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("cc_user") || "null"));
  const login = (data) => {
    localStorage.setItem("cc_token", data.token);
    localStorage.setItem("cc_user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };
  return { user, login, logout };
}

const navItems = [
  ["Dashboard", "/", LayoutDashboard],
  ["Profile", "/profile", User],
  ["Resume AI", "/resume", FileText],
  ["Skill Gap", "/skills", Target],
  ["Roadmap", "/roadmap", Target],
  ["Applications", "/applications", Briefcase],
  ["Portfolio", "/portfolio", Award],
  ["Mock Interview", "/interview", Bot],
  ["AI Chat", "/chat", Bot]
];

function Protected({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ user, logout, children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">Career<span>Compass</span> AI</div>
        <div className="nav">
          {navItems.map(([label, path, Icon]) => (
            <Link key={path} to={path} className={location.pathname === path ? "active" : ""} onClick={() => setOpen(false)}>
              <Icon size={18} /> {label}
            </Link>
          ))}
          {user?.role === "admin" && <Link to="/admin"><Shield size={18}/> Admin</Link>}
        </div>
        <button className="logout" onClick={logout}><LogOut size={18}/> Logout</button>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
          <div><b>Welcome, {user?.name}</b><small>{user?.role === "admin" ? "Administrator" : "Student"}</small></div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

function AuthPage({ mode, login }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      login(data);
      nav("/");
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Career<span>Compass</span> AI</h1>
        <p>{mode === "login" ? "Continue your placement journey." : "Create your student account."}</p>
        {mode === "register" && <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required/>}
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required minLength="6"/>
        {error && <div className="error">{error}</div>}
        <button className="primary">{mode === "login" ? "Login" : "Create account"}</button>
        <p className="center">
          {mode === "login" ? <>New student? <Link to="/register">Register</Link></> : <>Already registered? <Link to="/login">Login</Link></>}
        </p>
      </form>
    </div>
  );
}

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState([]);
  useEffect(() => {
    Promise.all([api.get("/profile"), api.get("/applications")]).then(([p,a]) => {
      setProfile(p.data); setApps(a.data);
    });
  }, []);
  const score = profile?.readinessScore ?? 0;
  return <div>
    <h2>Placement Dashboard</h2>
    <p className="muted">Your career preparation at a glance.</p>
    <div className="cards">
      <div className="stat"><span>Readiness</span><strong>{score}%</strong></div>
      <div className="stat"><span>Applications</span><strong>{apps.length}</strong></div>
      <div className="stat"><span>Target Career</span><strong className="small">{profile?.profile?.targetCareer || "Not set"}</strong></div>
      <div className="stat"><span>Skills</span><strong>{profile?.profile?.skills?.length || 0}</strong></div>
    </div>
    <div className="grid-2">
      <section className="panel">
        <h3>Placement readiness</h3>
        <div className="progress"><span style={{width:`${score}%`}}/></div>
        <p>{score < 50 ? "Build your skills, resume and interview practice." : score < 80 ? "Good progress. Keep practicing." : "Excellent preparation. Focus on applications."}</p>
      </section>
      <section className="panel">
        <h3>Next actions</h3>
        <ul className="clean">
          <li>Complete your profile</li>
          <li>Upload and analyze your resume</li>
          <li>Generate your skill-gap report</li>
          <li>Practice a mock interview</li>
        </ul>
      </section>
    </div>
  </div>;
}

function Profile() {
  const [form, setForm] = useState({targetCareer:"", college:"", degree:"", branch:"", graduationYear:"", skills:"", bio:"", github:"", linkedin:""});
  const [msg, setMsg] = useState("");
  useEffect(() => { api.get("/profile").then(({data}) => setForm({...data.profile, skills:(data.profile?.skills || []).join(", ")})); }, []);
  async function save(e) {
    e.preventDefault();
    await api.put("/profile", {...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean)});
    setMsg("Profile saved");
  }
  return <FormPanel title="Student Profile" onSubmit={save}>
    {["college","degree","branch","graduationYear","targetCareer","github","linkedin"].map(k => <input key={k} placeholder={k.replace(/([A-Z])/g," $1")} value={form[k] || ""} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}
    <input placeholder="Skills (comma separated)" value={form.skills || ""} onChange={e=>setForm({...form,skills:e.target.value})}/>
    <textarea placeholder="Short bio" value={form.bio || ""} onChange={e=>setForm({...form,bio:e.target.value})}/>
    <button className="primary">Save profile</button>{msg && <span className="success">{msg}</span>}
  </FormPanel>;
}

function Resume() {
  const [file, setFile] = useState(null), [analysis, setAnalysis] = useState(null), [msg,setMsg]=useState("");
  async function upload() {
    const fd = new FormData(); fd.append("resume", file);
    await api.post("/resume/upload", fd);
    setMsg("Resume uploaded. Now click Analyze.");
  }
  async function analyze() {
    const {data} = await api.post("/resume/analyze"); setAnalysis(data);
  }
  return <div><h2>AI Resume Analyzer</h2><section className="panel">
    <input type="file" accept=".pdf" onChange={e=>setFile(e.target.files[0])}/>
    <div className="actions"><button className="primary" disabled={!file} onClick={upload}>Upload PDF</button><button onClick={analyze}>Analyze with AI</button></div>
    {msg && <p className="success">{msg}</p>}
  </section>
  {analysis && <section className="panel"><h3>Analysis</h3><div className="score">{analysis.atsScore || 0}% ATS</div><p>{analysis.summary}</p><h4>Strengths</h4><List items={analysis.strengths}/><h4>Missing skills</h4><List items={analysis.missingSkills}/><h4>Suggestions</h4><List items={analysis.suggestions}/></section>}</div>;
}

function Skills() {
  const [data,setData]=useState(null), [career,setCareer]=useState("");
  async function run(){ const {data}=await api.post("/ai/skill-gap",{career}); setData(data); }
  return <div><h2>AI Skill Gap Analyzer</h2><section className="panel row"><input placeholder="Target career, e.g. Java Developer" value={career} onChange={e=>setCareer(e.target.value)}/><button className="primary" onClick={run}>Analyze</button></section>{data && <section className="panel"><h3>{data.career}</h3><h4>Skill gaps</h4><List items={data.skillGaps}/><h4>Priority order</h4><List items={data.priorityOrder}/><h4>Matched skills</h4><List items={data.matchedSkills}/></section>}</div>;
}

function Roadmap() {
  const [data,setData]=useState(null), [career,setCareer]=useState("");
  async function run(){const {data}=await api.post("/ai/roadmap",{career});setData(data)}
  return <div><h2>Personalized 12-Week Roadmap</h2><section className="panel row"><input placeholder="Target career" value={career} onChange={e=>setCareer(e.target.value)}/><button className="primary" onClick={run}>Generate</button></section>{data?.weeks?.map(w=><section className="panel" key={w.week}><b>Week {w.week}: {w.focus}</b><List items={w.tasks}/><p><b>Outcome:</b> {w.outcome}</p></section>)}</div>;
}

function Applications() {
  const [items,setItems]=useState([]), [form,setForm]=useState({company:"",role:"",applyUrl:"",status:"Saved",notes:""});
  async function load(){setItems((await api.get("/applications")).data)} useEffect(()=>{load()},[]);
  async function add(e){e.preventDefault();await api.post("/applications",form);setForm({company:"",role:"",applyUrl:"",status:"Saved",notes:""});load()}
  async function update(id,status){await api.put("/applications/"+id,{status});load()}
  return <div><h2>Application Tracker</h2><form className="panel row" onSubmit={add}><input placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} required/><input placeholder="Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} required/><button className="primary">Add</button></form><div className="list">{items.map(x=><div className="panel item" key={x._id}><div><b>{x.role}</b><span>{x.company}</span></div><select value={x.status} onChange={e=>update(x._id,e.target.value)}>{["Saved","Applied","Interview","Selected","Rejected"].map(s=><option key={s}>{s}</option>)}</select></div>)}</div></div>;
}

function Portfolio() {
  const [items,setItems]=useState([]), [form,setForm]=useState({type:"project",title:"",issuer:"",url:"",description:"",skills:""});
  async function load(){setItems((await api.get("/portfolio")).data)} useEffect(()=>{load()},[]);
  async function add(e){e.preventDefault();await api.post("/portfolio",{...form,skills:form.skills.split(",").map(x=>x.trim()).filter(Boolean)});load()}
  return <div><h2>Certificates & Projects</h2><form className="panel" onSubmit={add}><div className="row"><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="project">Project</option><option value="certificate">Certificate</option></select><input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input placeholder="Issuer" value={form.issuer} onChange={e=>setForm({...form,issuer:e.target.value})}/><button className="primary">Add</button></div><input placeholder="URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/><input placeholder="Skills" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/><textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></form><div className="cards">{items.map(x=><div className="panel" key={x._id}><small>{x.type}</small><h3>{x.title}</h3><p>{x.issuer}</p><p>{x.description}</p>{x.url && <a href={x.url} target="_blank">Open link</a>}</div>)}</div></div>;
}

function Interview() {
  const [questions,setQuestions]=useState([]), [answers,setAnswers]=useState([]), [id,setId]=useState(null), [result,setResult]=useState(null);
  async function start(){const {data}=await api.post("/ai/mock-interview",{});setId(data.interviewId);setQuestions(data.questions);setAnswers(data.questions.map(()=>''));setResult(null)}
  async function evaluate(){const {data}=await api.post("/ai/mock-interview/"+id+"/evaluate",{answers});setResult(data)}
  return <div><h2>AI Mock Interview</h2><button className="primary" onClick={start}>Start interview</button>{questions.map((q,i)=><section className="panel" key={i}><b>{i+1}. {q}</b><textarea placeholder="Type your answer..." value={answers[i] || ""} onChange={e=>{const a=[...answers];a[i]=e.target.value;setAnswers(a)}}/></section>)}{questions.length>0 && <button className="primary" onClick={evaluate}>Get AI Evaluation</button>}{result && <section className="panel"><h3>Score: {result.score}%</h3><p>{result.feedback}</p><h4>Improvements</h4><List items={result.improvements}/></section>}</div>;
}

function Chat() {
  const [messages,setMessages]=useState([]), [text,setText]=useState("");
  async function send(e){e.preventDefault();if(!text.trim())return;const q=text;setText("");setMessages(m=>[...m,{role:"user",text:q}]);const {data}=await api.post("/ai/chat",{message:q});setMessages(m=>[...m,{role:"ai",text:data.answer}]);}
  return <div><h2>Career AI Chatbot</h2><section className="chat panel">{messages.length===0 && <p className="muted">Ask about DSA, web development, resumes, placements, projects or career paths.</p>}{messages.map((m,i)=><div className={m.role==="user"?"bubble user":"bubble"} key={i}>{m.text}</div>)}</section><form className="row" onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Ask Career Compass AI..."/><button className="primary">Send</button></form></div>;
}

function Admin() {
  const [stats,setStats]=useState(null), [users,setUsers]=useState([]);
  useEffect(()=>{Promise.all([api.get("/admin/stats"),api.get("/admin/users")]).then(([a,b])=>{setStats(a.data);setUsers(b.data)})},[]);
  if(!stats)return <p>Loading...</p>;
  return <div><h2>Admin Dashboard</h2><div className="cards">{Object.entries(stats).map(([k,v])=><div className="stat" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><section className="panel"><h3>Users</h3>{users.map(u=><div className="user-row" key={u._id}><span>{u.name}</span><span>{u.email}</span><span>{u.role}</span></div>)}</section></div>;
}

function FormPanel({title,onSubmit,children}) { return <div><h2>{title}</h2><form className="panel form" onSubmit={onSubmit}>{children}</form></div> }
function List({items=[]}) { return <ul className="clean">{items.map((x,i)=><li key={i}>{x}</li>)}</ul> }

export default function App(){
  const auth=useAuth();
  return <Routes>
    <Route path="/login" element={auth.user ? <Navigate to="/" /> : <AuthPage mode="login" login={auth.login}/>}/>
    <Route path="/register" element={auth.user ? <Navigate to="/" /> : <AuthPage mode="register" login={auth.login}/>}/>
    <Route path="*" element={<Protected user={auth.user}><Layout user={auth.user} logout={auth.logout}><Routes>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/resume" element={<Resume/>}/>
      <Route path="/skills" element={<Skills/>}/>
      <Route path="/roadmap" element={<Roadmap/>}/>
      <Route path="/applications" element={<Applications/>}/>
      <Route path="/portfolio" element={<Portfolio/>}/>
      <Route path="/interview" element={<Interview/>}/>
      <Route path="/chat" element={<Chat/>}/>
      <Route path="/admin" element={auth.user?.role==="admin" ? <Admin/> : <Navigate to="/"/>}/>
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes></Layout></Protected>}/>
  </Routes>
}
