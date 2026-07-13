import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
const C = {
  ink: "#0F1A2B",
  paper: "#FBF9F4",
  brass: "#B8894F",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignout =async ()=>{
      const res = await axios.post(`http://localhost:8000/api/v1/user/logout`,{withCredentials:true})
      .then(res =>{
            const data = res.data;
            if(data.success === true){
              
              console.log(res);
              navigate('/login')
            }else{console.log(data.error)
            }
          })
          
            .catch(err => {
        console.log("status:", err.response?.status);
        console.log("server message:", err.response?.data);
      });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600&family=Inter:wght@400;500;600&display=swap');
        .kk-header, .kk-header a, .kk-header button { font-family:'Inter', sans-serif; }
      `}</style>

      <header
        className="kk-header sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(15,26,43,0.92)" : C.ink,
          borderBottom: scrolled ? "1px solid rgba(92,134,160,0.25)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5" style={{ ...fontDisplay, fontWeight: 600, fontSize: 19, color: C.paper }}>
            <span className="w-2.5 h-2.5 rotate-45 inline-block" style={{ backgroundColor: C.brass }} />
            KEYSTONE
          </div>

          <nav className="hidden md:flex items-center">
            <ul className="flex items-center gap-8">
              <li>
                <Link to="/" className="text-sm transition-colors" style={{ color: "#B7C6D3" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-sm transition-colors" style={{ color: "#B7C6D3" }}>
                  Listings
                </Link>
              </li>
              <li>
                <button onClick={handleSignout} className="text-sm bg-green-800 p-2 rounded transition-colors" style={{ color: "#B7C6D3" }}>
                  Signout
                </button>
              </li>
            </ul>
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/profile">
              {currentUser ? (
                <img
                  src={currentUser.avatar.url}
                  alt={currentUser.username}
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ border: `1px solid ${C.brass}` }}
                />
              ) : (
                <span className="text-sm font-medium" style={{ color: C.paper }}>Sign in</span>
              )}
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: C.paper }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ backgroundColor: "rgba(15,26,43,0.97)" }}>
            <ul className="flex flex-col gap-4">
              <li>
                <Link to="/" className="text-sm" style={{ color: "#B7C6D3" }}>Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm" style={{ color: "#B7C6D3" }}>About</Link>
              </li>
              <li>
                <button onClick={handleSignout} className="text-sm cursor-pointer hover:opacity-85 bg-green-800 p-2 rounded transition-colors" style={{ color: "#B7C6D3" }}>
                  Signout
                </button>
              </li>
            </ul>
            <div className="h-px" style={{ backgroundColor: "rgba(92,134,160,0.25)" }} />
            <Link to="/profile" className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatar.url}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: `1px solid ${C.brass}` }}
                  />
                  <span className="text-sm font-medium" style={{ color: C.paper }}>{currentUser.username}</span>
                </>
              ) : (
                <span className="text-sm font-medium" style={{ color: C.paper }}>Sign in</span>
              )}
            </Link>
          </div>
        )}
      </header>
    </>
  );
}