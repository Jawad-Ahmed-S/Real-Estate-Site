import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown } from "lucide-react";
import type {FormEvent} from "react"
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

function Skyline() {
  const buildings = [
    { d: "M40 320V180h60v140", delay: "0s" },
    { d: "M100 320V120h50v200", delay: "0.15s" },
    { d: "M150 320V200h20v-30h30v30h20v120", delay: "0.3s" },
    { d: "M220 320V90h55v230", delay: "0.45s" },
    { d: "M275 320V160h45v160", delay: "0.6s" },
    { d: "M320 320V230h35v90", delay: "0.75s" },
  ];
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      {buildings.map((b, i) => (
        <path
          key={i}
          d={b.d}
          className="kkdraw2"
          style={{ animationDelay: b.delay }}
          fill="none"
          stroke={C.line}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <line x1="20" y1="320" x2="380" y2="320" className="kkfade2" style={{ animationDelay: "1s" }} stroke={C.lineDim} strokeWidth="1" />
    </svg>
  );
}

export default function Hero() {
  const [tab, setTab] = useState("buy");
  const [keyword, setKeyword] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (keyword.trim()) params.set("keyword", keyword.trim());
    params.set("type", tab === "buy" ? "sell" : "rent");
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", "1");

    setShowPrice(false);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-hero, .kk-hero input, .kk-hero button, .kk-hero p, .kk-hero span { font-family:'Inter', sans-serif; }

        .kkdraw2{ stroke-dasharray:900; stroke-dashoffset:900; animation: kkline2 1.4s cubic-bezier(.65,0,.35,1) forwards; }
        .kkfade2{ opacity:0; animation: kkfadein2 0.6s ease forwards; }
        @keyframes kkline2{ to{ stroke-dashoffset:0; } }
        @keyframes kkfadein2{ to{ opacity:0.6; } }

        @media (prefers-reduced-motion: reduce){
          .kkdraw2, .kkfade2{ animation:none; stroke-dashoffset:0; opacity:0.6; }
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${C.lineDim} 1px, transparent 1px), linear-gradient(90deg, ${C.lineDim} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.12,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(1400px 900px at 20% 0%, ${C.ink2} 0%, ${C.ink} 55%)` }}
      />

      <div className="kk-hero relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-20 pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* copy + search */}
          <div>
            <p className="uppercase mb-5" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.14em", color: C.brass }}>
              Verified listings · Direct from owners &amp; agents
            </p>
            <h1
              className="mb-5"
              style={{ ...fontDisplay, fontWeight: 500, fontStyle: "italic", fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.15, color: C.paper }}
            >
              Find the address you'll call home.
            </h1>
            <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "#9FB3C4" }}>
              Search thousands of verified properties, message agents directly, and track every step — from first
              viewing to signed keys.
            </p>

            {/* search card */}
            <form onSubmit={handleSearch} className="rounded-sm p-5" style={{ backgroundColor: C.paper, border: `1px solid ${C.hair}` }}>
              <div className="flex gap-1 mb-4">
                {["buy", "rent"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className="text-xs font-semibold px-4 py-2 rounded-sm capitalize transition-colors"
                    style={{
                      backgroundColor: tab === t ? C.brassDark : "transparent",
                      color: tab === t ? C.paper : C.charcoalSoft,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-sm px-3 mb-3" style={{ border: `1px solid ${C.hair}` }}>
                <MapPin size={16} color={C.charcoalSoft} />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="City, neighbourhood, or address"
                  className="w-full py-2.5 text-sm outline-none bg-transparent"
                  style={{ color: C.charcoal }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full appearance-none text-sm px-3 py-2.5 rounded-sm outline-none"
                    style={{ border: `1px solid ${C.hair}`, color: C.charcoal, backgroundColor: "#fff" }}
                  >
                    <option value="">Any bedrooms</option>
                    <option value="1">1 bed</option>
                    <option value="2">2 beds</option>
                    <option value="3">3 beds</option>
                    <option value="4">4 beds</option>
                  </select>
                  <ChevronDown
                    size={15}
                    color={C.charcoalSoft}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPrice((s) => !s)}
                    className="w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-sm"
                    style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                  >
                    {minPrice || maxPrice ? `PKR ${minPrice || "0"}–${maxPrice || "∞"}` : "Price range"}
                    <ChevronDown size={15} color={C.charcoalSoft} />
                  </button>

                  {showPrice && (
                    <div
                      className="absolute z-20 top-full mt-2 left-0 right-0 p-3 rounded-sm flex items-center gap-2"
                      style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}
                    >
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full text-sm px-2 py-2 rounded-sm outline-none"
                        style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                      />
                      <span style={{ color: C.charcoalSoft }}>–</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full text-sm px-2 py-2 rounded-sm outline-none"
                        style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-sm py-3 text-sm font-semibold"
                style={{ backgroundColor: C.brassDark, color: C.paper }}
              >
                <Search size={16} />
                Search listings
              </button>
            </form>
          </div>

          {/* skyline scene */}
          <div className="hidden md:flex items-center justify-center h-95">
            <Skyline />
          </div>
        </div>
      </div>
    </div>
  );
}