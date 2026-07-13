import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, SlidersHorizontal, Loader2, X, Heart } from "lucide-react";
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
const WISHLIST_BASE_URL = `${import.meta.env.VITE_API_ROUTE}/api/v1/wishlist`;

function buildQueryParams(searchParams) {
  const params = {};
  const keyword = searchParams.get("keyword");
  const type = searchParams.get("type");
  const bedrooms = searchParams.get("bedrooms");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const furnished = searchParams.get("furnished");
  const parking = searchParams.get("parking");

  if (keyword) params.keyword = keyword;
  if (type) params.type = type;
  if (bedrooms) params.bedrooms = Number(bedrooms);
  if (furnished === "true") params.furnished = true;
  if (parking === "true") params.parking = true;

  
  if (minPrice && !isNaN(Number(minPrice))) params["discountedPrice[gte]"] = Number(minPrice);
  if (maxPrice && !isNaN(Number(maxPrice))) params["discountedPrice[lte]"] = Number(maxPrice);

  return params;
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [wishlistBusyId, setWishlistBusyId] = useState(null);

  const query = searchParams.get("keyword") || "";
  const type = searchParams.get("type") || "";
  const bedrooms = Number(searchParams.get("bedrooms")) || "";
  const minPrice = Number(searchParams.get("minPrice")) || "";
  const maxPrice = Number(searchParams.get("maxPrice")) || "";
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
        const res = await axios.get(`${import.meta.env.VITE_API_ROUTE}/api/v1/listing`, {
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

  // pull the signed-in user's wishlist once, so every card can show its saved state
  // without firing one request per card
  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }
    let ignore = false;
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`${WISHLIST_BASE_URL}/`, { withCredentials: true });
        if (!ignore) setWishlist(res.data?.favourites || []);
      } catch (err) {
        console.log("Fetch wishlist error:", err.response?.data || err.message);
      }
    };
    fetchWishlist();
    return () => { ignore = true; };
  }, [currentUser]);

  const wishlistMap = useMemo(() => {
    const map = {};
    wishlist.forEach((fav) => {
      const listingId = typeof fav.listing === "string" ? fav.listing : fav.listing?._id;
      if (listingId) map[listingId] = fav._id;
    });
    return map;
  }, [wishlist]);

  const handleToggleWishlist = async (listingId) => {
    if (!currentUser) return;
    const existingFavouriteId = wishlistMap[listingId];
    setWishlistBusyId(listingId);
    try {
      if (existingFavouriteId) {
        await axios.delete(`${WISHLIST_BASE_URL}/${existingFavouriteId}`, { withCredentials: true });
        setWishlist((prev) => prev.filter((fav) => fav._id !== existingFavouriteId));
      } else {
        const res = await axios.post(`${WISHLIST_BASE_URL}/mark`, { listingId }, { withCredentials: true });
        const created = res.data?.wishlist;
        if (created) setWishlist((prev) => [...prev, created]);
      }
    } catch (err) {
      console.log("Wishlist toggle error:", err.response?.data || err.message);
    } finally {
      setWishlistBusyId(null);
    }
  };

  const totalPages = Math.ceil(listings.length / PAGE_SIZE) || 1;
  const pageItems = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  const applyPriceRange = (e) => {
    e.preventDefault();
    const rawMin = e.target.minPrice.value.trim();
    const rawMax = e.target.maxPrice.value.trim();

    if (rawMin && rawMax && Number(rawMin) > Number(rawMax)) {
      setPriceError("Min price can't be greater than max price.");
      return;
    }
    setPriceError("");

    const next = new URLSearchParams(searchParams);
    if (rawMin) next.set("minPrice", rawMin); else next.delete("minPrice");
    if (rawMax) next.set("maxPrice", rawMax); else next.delete("maxPrice");
    next.set("page", "1");
    setSearchParams(next);
  };

  const clearPriceRange = () => {
    setPriceError("");
    const next = new URLSearchParams(searchParams);
    next.delete("minPrice");
    next.delete("maxPrice");
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
        .kk-listings input[type=number]::-webkit-inner-spin-button,
        .kk-listings input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      <Header />

      <div className="kk-listings max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="mb-8 flex justify-between">

          <h1 style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
            All listings
          </h1>

          <div className="flex items-center gap-3">
            {currentUser && (
              <Link
                to="/wishlist"
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm"
                style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
              >
                <Heart size={14} /> Wishlist
              </Link>
            )}
            <Link
              to="/myListings"
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm"
              style={{ backgroundColor: C.brassDark, color: C.paper }}
            >
              My listings
            </Link>
          </div>
        </div>

        {/* filter bar */}
        <div
          className="flex flex-wrap items-center gap-3 p-4 rounded-sm mb-2"
          style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); setParam("keyword", e.target.keyword.value); }}
            className="flex items-center gap-2 rounded-sm px-3 flex-1 min-w-[200px]"
            style={{ border: `1px solid ${C.hair}` }}
          >
            <Search size={15} color={C.charcoalSoft} />
            <input
              name="keyword"
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
            <option value="1">1 bed</option>
            <option value="2">2 beds</option>
            <option value="3">3 beds</option>
            <option value="4">4 beds</option>
          </select>

          {/* min / max price range */}
          <form
            onSubmit={applyPriceRange}
            className="flex items-center gap-2 rounded-sm px-3"
            style={{ border: `1px solid ${C.hair}` }}
          >
            <input
              name="minPrice"
              type="number"
              min="0"
              defaultValue={minPrice}
              key={`min-${minPrice}`}
              placeholder="Min PKR"
              className="w-24 py-2.5 text-sm outline-none bg-transparent"
              style={{ color: C.charcoal }}
            />
            <span style={{ color: C.charcoalSoft }}>–</span>
            <input
              name="maxPrice"
              type="number"
              defaultValue={maxPrice}
              key={`max-${maxPrice}`}
              placeholder="Max PKR"
              className="w-24 py-2.5 text-sm outline-none bg-transparent"
              style={{ color: C.charcoal }}
            />
            <button
              type="submit"
              className="text-sm font-medium px-2 py-1 rounded-sm"
              style={{ color: C.brassDark }}
            >
              Go
            </button>
            {(minPrice || maxPrice) && (
              <button
                type="button"
                onClick={clearPriceRange}
                aria-label="Clear price range"
                style={{ color: C.charcoalSoft }}
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {priceError && (
          <p className="text-sm mb-4" style={{ color: "#b0413e" }}>{priceError}</p>
        )}

        {/* secondary toggles */}
        <div className="flex items-center gap-4 mb-8 mt-4">
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
          {(query || type || bedrooms || minPrice || maxPrice || furnished || parking) && (
            <button
              onClick={() => { setPriceError(""); setSearchParams({}); }}
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
              <Link to={`/listings/${listing._id}`} key={listing._id} className="block">
                <PropertyCard
                  listing={listing}
                  isWishlisted={Boolean(wishlistMap[listing._id])}
                  wishlistBusy={wishlistBusyId === listing._id}
                  onToggleWishlist={currentUser ? () => handleToggleWishlist(listing._id) : undefined}
                />
              </Link>
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