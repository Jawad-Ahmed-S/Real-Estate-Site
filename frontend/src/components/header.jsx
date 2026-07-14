import { useState, useEffect } from "react";
import { Link ,useNavigate} from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import axios from 'axios'
import { useDispatch } from "react-redux";
const C = {
  ink: "#0F1A2B",
  paper: "#FBF9F4",
  brass: "#B8894F",
};

import {signOutUserFailure,signOutUserStart,signOutUserSuccess} from '../redux/user/userSlice'
import axiosInstance from "../api/axiosInstance";

const fontDisplay = { fontFamily: "'Fraunces', serif" };

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
   const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  

   const handleSignout = async () => {
    try {
      dispatch(signOutUserStart());

      const res = await axiosInstance.post(
        `/api/v1/user/logout`,
        {}
      );
      console.log(res)

      if (res.data?.success === true) {
        localStorage.removeItem("token");
        dispatch(signOutUserSuccess());
        navigate('/login');
      } else {
        console.log(res)
        dispatch(signOutUserFailure(res.data?.error || "Logout failed"));
      }
    } catch (err) {
      console.log(err.response)
      dispatch(signOutUserFailure(err.response?.data?.error || "Something went wrong"));
    }
  };
  
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
  
  {/* 🏙️ Logo */}
  <Link to='/' className="cursor-pointer">
    <div className="flex items-center gap-2.5" style={{ ...fontDisplay, fontWeight: 600, fontSize: 19, color: C.paper }}>
      <span className="w-2.5 h-2.5 rotate-45 inline-block" style={{ backgroundColor: C.brass }} />
      KEYSTONE
    </div>
  </Link>

  {/* 🧭 Desktop Navigation Links */}
  <nav className="hidden md:flex items-center">
    <ul className="flex items-center gap-8">
      <li>
        <Link to="/" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
          Home
        </Link>
      </li>
      <li>
        <Link to="/listings" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
          Listings
        </Link>
      </li>
      {currentUser && (
        <>
          <li>
            <Link to="/inquiries" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
              Inquiries
            </Link>
          </li>
          <li>
            <Link to="/appointments" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
              Appointments
            </Link>
          </li>
        </>
      )}
    </ul>
  </nav>

  {/* 👤 Desktop User Controls (Fixed & Separated) */}
  <div className="hidden md:flex items-center gap-5">
    {currentUser ? (
      <div className="flex items-center gap-4">
        {/* Profile Avatar - Safely links to profile alone */}
        <Link to="/profile" className="shrink-0 transition-transform hover:scale-105 active:scale-95">
          <img
            src={currentUser.avatar?.url || ""}
            alt={currentUser.username}
            className="w-9 h-9 rounded-full object-cover"
            style={{ border: `1px solid ${C.brass}` }}
          />
        </Link>
        
        {/* Clean, low-profile Signout button matching the UI palette */}
        <button 
          onClick={handleSignout} 
          className="text-xs font-medium cursor-pointer transition-colors px-3 py-1.5 rounded border hover:text-white bg-transparent hover:bg-white/5" 
          style={{ color: "#B7C6D3", borderColor: "rgba(183, 198, 211, 0.2)" }}
        >
          Sign out
        </button>
      </div>
    ) : (
      /* If logged out, points straight to login instead of profile layout */
      <Link to="/login" className="transition-colors hover:opacity-80">
        <span className="text-sm font-medium" style={{ color: C.paper }}>Sign in</span>
      </Link>
    )}
  </div>

  {/* 📱 Mobile Menu Toggle Button */}
  <button className="md:hidden cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: C.paper }}>
    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
  </button>

</div>

        {mobileOpen && (
  <div className="md:hidden px-6 pt-4 pb-6 flex flex-col gap-5" style={{ backgroundColor: "rgba(15,26,43,0.97)" }}>
    
    {/* 👤 User Profile Header Area */}
    {currentUser ? (
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "rgba(92,134,160,0.15)" }}>
        <Link to="/profile" className="flex flex-col gap-0.5">
          <span className="text-xs" style={{ color: "#8A9BA8" }}>Logged in as</span>
          <span className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: C.paper }}>
            {currentUser.firstName || currentUser.username}
          </span>
        </Link>
        <Link to="/profile" className="shrink-0">
          <img
            src={currentUser.avatar?.url || ""}
            alt={currentUser.username}
            className="w-9 h-9 rounded-full object-cover transition-transform active:scale-95"
            style={{ border: `1px solid ${C.brass}` }}
          />
        </Link>
      </div>
    ) : (
      <div className="flex justify-end border-b pb-3" style={{ borderColor: "rgba(92,134,160,0.15)" }}>
        <Link 
          to="/login" 
          className="text-sm font-medium px-4 py-1.5 rounded transition-colors" 
          style={{ color: C.paper, border: `1px solid ${C.brass}` }}
        >
          Sign in
        </Link>
      </div>
    )}

    {/* 🗺️ Menu Navigation Links */}
    <ul className="flex flex-col gap-4">
      <li>
        <Link to="/" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
          Home
        </Link>
      </li>
      <li>
        <Link to="/about" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
          About
        </Link>
      </li>
      
      {currentUser && (
        <>
          <li>
            <Link to="/inquiries" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
              Inquiries
            </Link>
          </li>
          <li>
            <Link to="/appointments" className="text-sm transition-colors hover:text-white" style={{ color: "#B7C6D3" }}>
              Appointments
            </Link>
          </li>
        </>
      )}
    </ul>

    {/* 🚪 Action Footer Section */}
    {currentUser && (
      <div className="mt-2 flex flex-col gap-4">
        <div className="h-px" style={{ backgroundColor: "rgba(92,134,160,0.25)" }} />
        <button 
          onClick={handleSignout} 
          className="text-sm font-medium cursor-pointer w-full text-center py-2.5 rounded transition-all bg-red-950/30 hover:bg-red-900/50 border border-red-900/40" 
          style={{ color: "#FCA5A5" }}
        >
          Sign out
        </button>
      </div>
    )}

  </div>
)}
      </header>
    </>
  );
}