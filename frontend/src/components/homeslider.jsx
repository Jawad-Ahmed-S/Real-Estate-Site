import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "./PropertyCard";

const C = {
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
  paper: "#FBF9F4",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

// TODO: replace with a real GET request, e.g.:
// const res = await axios.get("http://localhost:8000/api/v1/listings/featured");
// setListings(res.data.listings);
const MOCK_LISTINGS = [
  { id: 1, image: "https://picsum.photos/seed/kk1/600/450", title: "Riverside Terrace House", address: "Clifton, Karachi", price: "PKR 4.2 Cr", type: "Sale", beds: 4, baths: 3, sqft: "2,800", verified: true },
  { id: 2, image: "https://picsum.photos/seed/kk2/600/450", title: "Garden View Apartment", address: "DHA Phase 6, Karachi", price: "PKR 85,000/mo", type: "Rent", beds: 2, baths: 2, sqft: "1,150", verified: true },
  { id: 3, image: "https://picsum.photos/seed/kk3/600/450", title: "Modern Corner Bungalow", address: "Bahria Town, Lahore", price: "PKR 3.6 Cr", type: "Sale", beds: 5, baths: 4, sqft: "3,400", verified: false },
  { id: 4, image: "https://picsum.photos/seed/kk4/600/450", title: "Loft Studio Downtown", address: "F-7, Islamabad", price: "PKR 60,000/mo", type: "Rent", beds: 1, baths: 1, sqft: "620", verified: true },
  { id: 5, image: "https://picsum.photos/seed/kk5/600/450", title: "Hilltop Family Villa", address: "Gulberg, Lahore", price: "PKR 5.1 Cr", type: "Sale", beds: 6, baths: 5, sqft: "4,100", verified: true },
  { id: 6, image: "https://picsum.photos/seed/kk6/600/450", title: "Compact City Flat", address: "North Nazimabad, Karachi", price: "PKR 45,000/mo", type: "Rent", beds: 2, baths: 1, sqft: "900", verified: false },
];

export default function ListingsSlider() {
  const trackRef = useRef(null);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // TODO: swap this for a real fetch on mount
  useEffect(() => {
    // fetchFeaturedListings().then(setListings);
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

        <div
          ref={trackRef}
          onScroll={updateScrollButtons}
          className="kk-slider-track flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
        >
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
            listing={listing}
              className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
            />
          ))}
        </div>

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