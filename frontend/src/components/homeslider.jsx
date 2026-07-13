import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import PropertyCard from "./PropertyCard";
import { Link } from "react-router-dom";

const C = {
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
  paper: "#FBF9F4",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

const API_BASE = "http://localhost:8000/api/v1";



export default function ListingsSlider() {
  const trackRef = useRef(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
useEffect(() => {
  let cancelled = false;

  async function fetchFeaturedListings() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/listing/featured`);
      const raw = res.data?.AllListings ?? [];
      if (!cancelled) {
        setListings(raw); // pass raw docs straight through, no remapping
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.message || "Failed to load listings");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  fetchFeaturedListings();
  return () => {
    cancelled = true;
  };
}, []);

  const updateScrollButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: C.paper }}>
      <style>{`
        .kk-slider-track::-webkit-scrollbar{ display:none; }
        .kk-slider-track{ scrollbar-width:none; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="uppercase mb-2" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brassDark }}>
              Handpicked
            </p>
            <h2 style={{ ...fontDisplay, fontWeight: 500, fontSize: 28, color: C.charcoal }}>
              Featured listings
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className="w-9 h-9 flex items-center justify-center rounded-sm disabled:opacity-30"
              style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className="w-9 h-9 flex items-center justify-center rounded-sm disabled:opacity-30"
              style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading && (
          <p style={{ ...fontMono, fontSize: 13, color: C.charcoalSoft }}>Loading listings…</p>
        )}

        {error && !loading && (
          <p style={{ ...fontMono, fontSize: 13, color: "#B3261E" }}>
            Couldn't load listings: {error}
          </p>
        )}

        {!loading && !error && (
          <div
            ref={trackRef}
            onScroll={updateScrollButtons}
            className="kk-slider-track flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
          >
            {console.log("Listings: ",listings)}
            {listings.map((listing) => (
              <Link 
                key={listing._id}
                to={`/listings/${listing._id}`}>
              <PropertyCard
                listing={listing}
                className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
              />
              </Link>
            ))}
          </div>
        )}

      
        <div className="flex justify-center mt-8">
          <a 
            href="/listings"
            className="text-sm font-semibold px-5 py-2.5 rounded-sm"
            style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
          >
            View all listings
            </a>
        </div>

      </div>
    </section>
  );
}