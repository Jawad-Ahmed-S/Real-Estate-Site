import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import axios from "axios";
import Header from "../components/header";
import PropertyCard from "../components/propertyCArd";

const C = {
  ink: "#0F1A2B",
  paper: "#FBF9F4",
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brass: "#B8894F",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

const PAGE_SIZE = 9;

// Turns the current URL search params into the query object sent to the API.
// NOTE: the backend key names here (searchTerm, minBedrooms, minPrice, maxPrice,
// furnished, parking) are a best guess — swap them for whatever your listing
// controller actually reads off req.query.
function buildQueryParams(searchParams) {
  const params = {};
  const q = searchParams.get("q");
  const type = searchParams.get("type");
  const bedrooms = searchParams.get("bedrooms");
  const price = searchParams.get("price");
  const furnished = searchParams.get("furnished");
  const parking = searchParams.get("parking");

  if (q) params.searchTerm = q;
  if (type) params.type = type; // "sell" | "rent" — matches the schema enum directly
  if (bedrooms) params.minBedrooms = bedrooms;
  if (furnished === "true") params.furnished = true;
  if (parking === "true") params.parking = true;

  if (price === "low") params.maxPrice = 5000000;
  if (price === "mid") { params.minPrice = 5000000; params.maxPrice = 20000000; }
  if (price === "high") params.minPrice = 20000000;

  return params;
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // read every filter straight from the URL — the URL is the single source of truth
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const bedrooms = searchParams.get("bedrooms") || "";
  const price = searchParams.get("price") || "";
  const furnished = searchParams.get("furnished") === "true";
  const parking = searchParams.get("parking") === "true";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    const fetchListings = async () => {
      setLoading(true);
      setError("");
      try {
        console.log(searchParams)
        const res = await axios.get("http://localhost:8000/api/v1/listing", {
          params: buildQueryParams(searchParams),
          withCredentials: true,
          signal: controller.signal,
        });
        if (!ignore) setListings(res.data?.AllListings || []);
      } catch (err) {
        if (ignore || err.name === "CanceledError") return;
        console.log("Failed to fetch listings:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Couldn't load listings right now.");
        setListings([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchListings();
    return () => { ignore = true; controller.abort(); };
    
  }, [searchParams.toString()]);

  const totalPages = Math.ceil(listings.length / PAGE_SIZE) || 1;
  const pageItems = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  const goToPage = (n) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(n));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-listings, .kk-listings input, .kk-listings button, .kk-listings select { font-family:'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="kk-listings max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="mb-8">
          <p className="uppercase mb-2" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brassDark }}>
            Browse
          </p>
          <h1 style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
            All listings
          </h1>
        </div>

        {/* filter bar */}
        <div
          className="flex flex-wrap items-center gap-3 p-4 rounded-sm mb-4"
          style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); setParam("q", e.target.q.value); }}
            className="flex items-center gap-2 rounded-sm px-3 flex-1 min-w-[200px]"
            style={{ border: `1px solid ${C.hair}` }}
          >
            <Search size={15} color={C.charcoalSoft} />
            <input
              name="q"
              defaultValue={query}
              key={query}
              placeholder="City, neighbourhood, or address"
              className="w-full py-2.5 text-sm outline-none bg-transparent"
              style={{ color: C.charcoal }}
            />
          </form>

          <select
            value={type}
            onChange={(e) => setParam("type", e.target.value)}
            className="text-sm px-3 py-2.5 rounded-sm outline-none"
            style={{ border: `1px solid ${C.hair}`, color: C.charcoal, backgroundColor: "#fff" }}
          >
            <option value="">Any type</option>
            <option value="sell">For sale</option>
            <option value="rent">For rent</option>
          </select>

          <select
            value={bedrooms}
            onChange={(e) => setParam("bedrooms", e.target.value)}
            className="text-sm px-3 py-2.5 rounded-sm outline-none"
            style={{ border: `1px solid ${C.hair}`, color: C.charcoal, backgroundColor: "#fff" }}
          >
            <option value="">Any beds</option>
            <option value="1">1+ bed</option>
            <option value="2">2+ beds</option>
            <option value="3">3+ beds</option>
            <option value="4">4+ beds</option>
          </select>

          <select
            value={price}
            onChange={(e) => setParam("price", e.target.value)}
            className="text-sm px-3 py-2.5 rounded-sm outline-none"
            style={{ border: `1px solid ${C.hair}`, color: C.charcoal, backgroundColor: "#fff" }}
          >
            <option value="">Any price</option>
            <option value="low">Under PKR 50 lac</option>
            <option value="mid">PKR 50 lac – 2 Cr</option>
            <option value="high">Above PKR 2 Cr</option>
          </select>
        </div>

        {/* secondary toggles */}
        <div className="flex items-center gap-4 mb-8">
          <label className="flex items-center gap-2 text-sm" style={{ color: C.charcoal }}>
            <input
              type="checkbox"
              checked={furnished}
              onChange={(e) => setParam("furnished", e.target.checked ? "true" : "")}
            />
            Furnished
          </label>
          <label className="flex items-center gap-2 text-sm" style={{ color: C.charcoal }}>
            <input
              type="checkbox"
              checked={parking}
              onChange={(e) => setParam("parking", e.target.checked ? "true" : "")}
            />
            Parking
          </label>
          {(query || type || bedrooms || price || furnished || parking) && (
            <button
              onClick={() => setSearchParams({})}
              className="flex items-center gap-1.5 text-sm font-medium ml-auto"
              style={{ color: C.brassDark }}
            >
              <SlidersHorizontal size={13} />
              Clear all filters
            </button>
          )}
        </div>

        {/* results count */}
        <p className="text-sm mb-6" style={{ color: C.charcoalSoft }}>
          {loading ? "Searching..." : `${listings.length} properties found`}
        </p>

        {/* grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin" color={C.brassDark} />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">{error}</p>
            <p className="text-sm" style={{ color: C.charcoalSoft }}>Check that your API is running and reachable.</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">No properties match those filters</p>
            <p className="text-sm" style={{ color: C.charcoalSoft }}>Try widening your search — a different price range or property type.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((listing) => (
              <PropertyCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {/* pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-sm px-4 py-2 rounded-sm disabled:opacity-30"
              style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className="w-9 h-9 flex items-center justify-center text-sm rounded-sm"
                style={{
                  border: `1px solid ${page === i + 1 ? C.brassDark : C.hair}`,
                  backgroundColor: page === i + 1 ? C.brassDark : "transparent",
                  color: page === i + 1 ? C.paper : C.charcoal,
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-sm px-4 py-2 rounded-sm disabled:opacity-30"
              style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}