import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertCircle, Heart } from "lucide-react";
import Header from "../components/header";
import PropertyCard from "../components/propertyCArd";

const C = {
  paper: "#FBF9F4",
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brass: "#B8894F",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
  error: "#B4553F",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

const BASE_URL = "http://localhost:8000/api/v1/wishlist";

export default function WishlistPage() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchFavourites = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BASE_URL}/`, { withCredentials: true });
        if (!ignore) setFavourites(res.data?.favourites || []);
      } catch (err) {
        if (ignore) return;
        console.log("Fetch wishlist error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Couldn't load your wishlist right now.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchFavourites();
    return () => { ignore = true; };
  }, []);

  const handleRemove = async (favouriteId) => {
    setRemovingId(favouriteId);
    setError("");
    try {
      await axios.delete(`${BASE_URL}/${favouriteId}`, { withCredentials: true });
      setFavourites((prev) => prev.filter((fav) => fav._id !== favouriteId));
    } catch (err) {
      console.log("Remove favourite error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Couldn't remove that listing right now.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-wishlist, .kk-wishlist button, .kk-wishlist p { font-family:'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="kk-wishlist max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <p className="uppercase mb-2" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brassDark }}>
          Saved
        </p>
        <h1 className="mb-8" style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
          Wishlist
        </h1>

        {error && (
          <p className="flex items-center gap-1.5 text-sm mb-4" style={{ color: C.error }}>
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin" color={C.brassDark} />
          </div>
        ) : favourites.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">
              Your wishlist is empty
            </p>
            <p className="text-sm mb-6" style={{ color: C.charcoalSoft }}>
              Tap the heart on any listing to save it here.
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm"
              style={{ backgroundColor: C.brassDark, color: C.paper }}
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((fav) => {
              const listing = fav.listing;
              // if the backend hasn't populated the listing, skip rendering a broken card
              if (!listing || typeof listing === "string") return null;

              return (
                <Link to={`/listings/${listing._id}`} key={fav._id} className="block">
                  <PropertyCard
                    listing={listing}
                    isWishlisted={true}
                    wishlistBusy={removingId === fav._id}
                    onToggleWishlist={() => handleRemove(fav._id)}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}