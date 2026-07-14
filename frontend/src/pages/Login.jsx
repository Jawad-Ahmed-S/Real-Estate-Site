
import { useState } from "react";
import { Home, Building2, UserRound, Eye, EyeOff } from "lucide-react";
import axios from 'axios'
import { useNavigate,Link } from "react-router-dom";
import {useDispatch,useSelector} from 'react-redux'
import { signinFailure, signinStart, signinSucess } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import axiosInstance from "../api/axiosInstance";
const C = {
  ink: "#0F1A2B",
  ink2: "#16273D",
  line: "#5C86A0",
  lineDim: "#33526B",
  paper: "#FBF9F4",
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brass: "#B8894F",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
};

const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };


function FloorPlan() {
  
  const segs = [
    { d: "M60 40h340v300H60z", delay: "0s", type: "rect" },
    { d: "M230 40v160", delay: "0.3s" },
    { d: "M60 200h340", delay: "0.5s" },
    { d: "M300 200v140", delay: "0.7s" },
    { d: "M230 200A40 40 0 0 1 190 240", delay: "0.9s" },
    { d: "M300 260A30 30 0 0 1 270 290", delay: "1.0s" },
    { d: "M140 40A26 26 0 0 0 114 66", delay: "1.1s" },
    { d: "M90 40v-10", delay: "1.2s" },
    { d: "M105 40v-10", delay: "1.2s" },
    { d: "M330 40v-10", delay: "1.25s" },
    { d: "M345 40v-10", delay: "1.25s" },
    { d: "M400 120h10", delay: "1.3s" },
    { d: "M400 135h10", delay: "1.3s" },
  ];

  return (
    <svg viewBox="0 0 460 380" className="w-full max-w-md h-auto overflow-visible">
      {segs.map((s, i) => (
        <path
          key={i}
          d={s.d}
          className="kkdraw"
          style={{ animationDelay: s.delay }}
          fill="none"
          stroke={C.line}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <g className="kkfade" style={{ animationDelay: "1.7s" }}>
        <line x1="60" y1="352" x2="400" y2="352" stroke={C.lineDim} strokeWidth="1" />
        <line x1="60" y1="347" x2="60" y2="357" stroke={C.lineDim} strokeWidth="1" />
        <line x1="400" y1="347" x2="400" y2="357" stroke={C.lineDim} strokeWidth="1" />
        <text x="120" y="125" fontSize="9.5" letterSpacing="0.06em" fill={C.line} style={fontMono}>LIVING RM</text>
        <text x="120" y="140" fontSize="9.5" letterSpacing="0.06em" fill={C.line} style={fontMono}>18'-0" × 14'-6"</text>
        <text x="255" y="125" fontSize="9.5" letterSpacing="0.06em" fill={C.line} style={fontMono}>KITCHEN</text>
        <text x="90" y="270" fontSize="9.5" letterSpacing="0.06em" fill={C.line} style={fontMono}>BEDROOM 01</text>
        <text x="320" y="270" fontSize="9.5" letterSpacing="0.06em" fill={C.line} style={fontMono}>BEDROOM 02</text>
        <text x="205" y="367" fontSize="9.5" letterSpacing="0.06em" fill={C.line} style={fontMono}>36'-0"</text>
      </g>
    </svg>
  );
}

export default function Login() {
  
  const [form, setForm] = useState({
    email: "", password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {loading,error} = useSelector(state=>state.user)

  const strength = (() => {
    const v = form.password;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    return s;
  })();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signinStart())
    const {email,password} = form;
    const newData = {email,password};
    axiosInstance.post(`/api/v1/user/login`,newData)
    
    .then(res =>{
      const data = res.data;
      if (data && (data.success || data.user || data.token)) {
        localStorage.setItem("token",data.token)
        dispatch(signinSucess(data))
        navigate('/')
        console.log(res);
      }else{
        dispatch(signinFailure(data.error))
      }
    })
    
      .catch(err => {
  console.log("status:", err.response?.status);
  console.log("server message:", err.response?.data);
  dispatch(signinFailure(err.response?.data?.error || "Something went wrong"))
});
  };
  
const handleGoogleLogin = async()=>{
    console.log('handle login')
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .kkdraw{
          stroke-dasharray:1400;
          stroke-dashoffset:1400;
          animation: kkline 1.8s cubic-bezier(.65,0,.35,1) forwards;
        }
        .kkfade{ opacity:0; animation: kkfadein 0.6s ease forwards; }
        @keyframes kkline{ to{ stroke-dashoffset:0; } }
        @keyframes kkfadein{ to{ opacity:1; } }

        @media (prefers-reduced-motion: reduce){
          .kkdraw, .kkfade{ animation: none; stroke-dashoffset:0; opacity:1; }
        }

        .kk-body, .kk-body input, .kk-body button, .kk-body label, .kk-body p, .kk-body span {
          font-family:'Inter', sans-serif;
        }
      `}</style>

      <div className="kk-body grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* LEFT: BLUEPRINT PANEL */}
        <div
          className="relative overflow-hidden flex flex-col justify-between p-8 md:p-12"
          style={{
            background: `radial-gradient(1200px 800px at 15% 0%, ${C.ink2} 0%, ${C.ink} 60%)`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(${C.lineDim} 1px, transparent 1px), linear-gradient(90deg, ${C.lineDim} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
              opacity: 0.14,
            }}
          />

          <div className="relative z-10 flex items-center gap-2.5" style={{ ...fontDisplay, fontWeight: 600, fontSize: 20, color: C.paper }}>
            <span className="w-2.5 h-2.5 rotate-45 inline-block" style={{ backgroundColor: C.brass }} />
            KEYSTONE
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center my-3">
            <FloorPlan />
          </div>

          <div className="relative z-10 max-w-md">
            <h1 style={{ ...fontDisplay, fontWeight: 500, fontStyle: "italic", fontSize: "clamp(26px, 2.4vw, 32px)", lineHeight: 1.25, color: C.paper }} className="mb-3">
              Every floor plan starts as a set of lines.
            </h1>
            <p className="text-sm leading-relaxed hidden md:block" style={{ color: "#9FB3C4" }}>
              Create an account to browse verified listings, save searches, and talk to agents directly — no middlemen, no guesswork.
            </p>
          </div>

          <div
            className="relative z-10 flex justify-between items-center pt-4 mt-8 uppercase"
            style={{ ...fontMono, fontSize: 10.5, letterSpacing: "0.08em", color: C.lineDim, borderTop: `1px solid rgba(92,134,160,0.25)` }}
          >
            <span>Keystone Property Group</span>
          </div>
        </div>

        {/* RIGHT: FORM PANEL */}
        <div className="flex items-center justify-center p-8 md:p-12" style={{ backgroundColor: C.paper }}>
          <div className="w-full max-w-sm">
            <div className="mb-7">
              
              <h2 className="mb-2" style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
                Let's get you set up
              </h2>
              <p className="text-sm" style={{ color: C.charcoalSoft }}>
                New to Keystone?{" "}
                <Link to="/signup" className="font-medium" style={{ color: C.brassDark }}>Register</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.charcoal }}>Email address</label>
                <input
                  type="email" required placeholder="amara@email.com" value={form.email} onChange={update("email")}
                  className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                  style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.charcoal }}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} required placeholder="Create a password"
                    value={form.password} onChange={update("password")}
                    className="w-full text-sm rounded-sm px-3 py-2.5 pr-14 outline-none"
                    style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: C.charcoalSoft }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <i key={i} className="flex-1 h-0.75 rounded-sm block" style={{ backgroundColor: i < strength ? C.brass : C.hair }} />
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: C.charcoalSoft }}>Use 8+ characters with a number and a symbol.</p>
              </div>


              {error && (
                <p className="text-xs mt-2 mb-1" style={{ color: "#B4553F" }}>{error}</p>
              )}


              <button
                type="submit"
                className="w-full rounded-sm py-3 text-sm font-semibold transition-colors cursor-pointer"
                style={{ backgroundColor: C.brassDark, color: C.paper }}
                disabled={loading}
              >
                {loading? 'Loading....' : 'Login'}
              </button>

              <div className="flex items-center gap-3 my-5 text-xs" style={{ color: C.charcoalSoft }}>
                <span className="flex-1 h-px" style={{ backgroundColor: C.hair }} />
                or continue with
                <span className="flex-1 h-px" style={{ backgroundColor: C.hair }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 rounded-sm py-2.5 text-sm font-medium cursor-pointer"
                style={{ border: `1px solid ${C.hair}`, color: C.charcoal, backgroundColor: "#fff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.52 12.27c0-.84-.08-1.65-.22-2.43H12v4.6h6.48a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A11.99 11.99 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.6v-3.1H1.27a12 12 0 0 0 0 10.8l4-3.1z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
                </svg>
                Continue with Google
              </button>
              
              
             <div className="mt-6 text-center border-t border-slate-200/60 dark:border-slate-800 pt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Want to look around first? 
                  <Link to="/" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-4 transition-colors">
                    Browse as Guest
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
