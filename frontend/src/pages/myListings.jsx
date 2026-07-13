import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, BedDouble, Bath, MapPin, Tag,
} from "lucide-react";
import Header from "../components/header";

const C = {
  ink: "#0F1A2B",
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

const BASE_URL = `${import.meta.env.VITE_API_ROUTE}/api/v1/listing/my-listings`;
const BASE_DELETE_URL = `${import.meta.env.VITE_API_ROUTE}/api/v1/listing`;

const formatPKR = (n) => (typeof n === "number" ? `PKR ${n.toLocaleString("en-PK")}` : "—");

export default function MyListings() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  
  const RESULTS_PER_PAGE = 10;

  useEffect(() => {
    if (!currentUser?._id) return;
    let ignore = false;

    const fetchMine = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(BASE_URL, {
          params: { owner: currentUser._id, page: 1 },
          withCredentials: true,
        });
        console.log(res)
        if (ignore) return;
        const results = res.data?.listings || [];
        setListings(results);
        setHasMore(results.length === RESULTS_PER_PAGE);
        setPage(1);
      } catch (err) {
        if (ignore) return;
        console.log("Fetch my listings error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Couldn't load your listings right now.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMine();
    return () => { ignore = true; };
  }, [currentUser?._id]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await axios.get(BASE_URL, {
        params: { owner: currentUser._id, page: nextPage },
        withCredentials: true,
      });
      const results = res.data?.listings || [];
      setListings((prev) => [...prev, ...results]);
      setHasMore(results.length === RESULTS_PER_PAGE);
      setPage(nextPage);
    } catch (err) {
      console.log("Load more error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Couldn't load more listings.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;

    setDeletingId(id);
    setDeleteError("");
    try {
      await axios.delete(`${BASE_DELETE_URL}/${id}`, { withCredentials: true });
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.log("Delete listing error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        setDeleteError("You don't have permission to delete this listing.");
      } else {
        setDeleteError(err.response?.data?.message || "Couldn't delete that listing right now.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-mine, .kk-mine button, .kk-mine a, .kk-mine p { font-family:'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="kk-mine max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="uppercase mb-2" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brassDark }}>
              Dashboard
            </p>
            <h1 style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
              My listings
            </h1>
          </div>
          <Link
            to="/listings/create"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm"
            style={{ backgroundColor: C.brassDark, color: C.paper }}
          >
            <Plus size={16} /> New listing
          </Link>
        </div>

        {deleteError && (
          <p className="flex items-center gap-1.5 text-sm mb-6" style={{ color: C.error }}>
            <AlertCircle size={14} /> {deleteError}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin" color={C.brassDark} />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">
              You haven't listed anything yet
            </p>
            <p className="text-sm mb-6" style={{ color: C.charcoalSoft }}>
              Publish your first property to see it here.
            </p>
            <Link
              to="/listings/create"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm"
              style={{ backgroundColor: C.brassDark, color: C.paper }}
            >
              <Plus size={16} /> Create a listing
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => {
                const {
                  _id, name, address, regularPrice, discountedPrice,
                  bedrooms, bathrooms, type, offer, imageUrls,
                } = listing;
                const displayPrice = offer ? discountedPrice : regularPrice;
                const thumb = imageUrls?.[0]?.url || "https://placehold.co/600x450/16273D/9FB3C4?text=No+Photo";

                return (
                  <div
                    key={_id}
                    className="rounded-sm overflow-hidden"
                    style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}
                  >
                    <Link to={`/listings/${_id}`} className="block relative aspect-[4/3] overflow-hidden">
                      <img src={thumb} alt={name} className="w-full h-full object-cover" />
                      <span
                        className="absolute top-3 left-3 text-[10px] font-semibold uppercase px-2 py-1 rounded-sm"
                        style={{ ...fontMono, letterSpacing: "0.06em", backgroundColor: C.brassDark, color: C.paper }}
                      >
                        For {type === "rent" ? "Rent" : "Sale"}
                      </span>
                      {offer && (
                        <span
                          className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-sm"
                          style={{ backgroundColor: "rgba(15,26,43,0.85)", color: C.paper }}
                        >
                          <Tag size={12} /> Offer
                        </span>
                      )}
                      <div
                        className="absolute bottom-0 left-0 right-0 px-3 py-2"
                        style={{ background: "linear-gradient(to top, rgba(15,26,43,0.75), transparent)" }}
                      >
                        <p style={{ ...fontDisplay, fontWeight: 600, fontSize: 17, color: C.paper }}>
                          {formatPKR(displayPrice)}
                          {type === "rent" && <span style={{ fontSize: 12, fontWeight: 400 }}>/mo</span>}
                        </p>
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/listings/${_id}`}>
                        <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: C.charcoal }}>{name}</h3>
                      </Link>
                      <p className="flex items-center gap-1 text-xs mb-3 truncate" style={{ color: C.charcoalSoft }}>
                        <MapPin size={12} /> {address}
                      </p>

                      <div
                        className="flex items-center gap-4 pb-3 mb-3 uppercase"
                        style={{ ...fontMono, fontSize: 10.5, letterSpacing: "0.04em", color: C.charcoalSoft, borderBottom: `1px solid ${C.hair}` }}
                      >
                        <span className="flex items-center gap-1.5"><BedDouble size={13} /> {bedrooms}</span>
                        <span className="flex items-center gap-1.5"><Bath size={13} /> {bathrooms}</span>
                      </div>

                      {/* owner-only quick actions — this page only ever shows your own listings, so no ownership check needed here */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/listings/update/${_id}`)}
                          className="flex-1 cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-sm"
                          style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(_id)}
                          disabled={deletingId === _id}
                          className="flex-1 flex cursor-pointer hover:opacity-85 items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-sm disabled:opacity-50"
                          style={{ border: `1px solid ${C.error}`, color: C.error }}
                        >
                          {deletingId === _id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          {deletingId === _id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-sm disabled:opacity-60"
                  style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                >
                  {loadingMore && <Loader2 size={15} className="animate-spin" />}
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}