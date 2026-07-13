import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BedDouble, Bath, Sofa, Car, MapPin, Tag, Loader2, AlertCircle, Pencil, Trash2,
} from "lucide-react";
import Header from "../components/header";

const C = {
  ink: "#0F1A2B",
  ink2: "#16273D",
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

const formatPKR = (n) => (typeof n === "number" ? `PKR ${n.toLocaleString("en-PK")}` : "—");

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchListing = async () => {
      setLoading(true);
      setError("");
      try {
        
        const res = await axios.get(`http://localhost:8000/api/v1/listing/${id}`, {
          withCredentials: true,
        });
        
        if (!ignore) setListing(res.data.listingData || res.data);
      } catch (err) {
        if (ignore) return;
        console.log("Fetch listing error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Couldn't load this listing.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchListing();
    return () => { ignore = true; };
  }, [id]);

  const ownerId =
    typeof listing?.owner === "string" ? listing.owner : listing?.owner?._id;
  const isOwner = Boolean(currentUser?._id && ownerId && currentUser._id === ownerId);

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;

    setDeleting(true);
    setDeleteError("");
    try {
      await axios.delete(`http://localhost:8000/api/v1/listing/${id}`, {
        withCredentials: true,
      });
      navigate("/listings");
    } catch (err) {
      console.log("Delete listing error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        setDeleteError("You don't have permission to delete this listing.");
      } else {
        setDeleteError(err.response?.data?.message || "Couldn't delete this listing right now.");
      }
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: C.paper }} className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={22} className="animate-spin" color={C.brassDark} />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ backgroundColor: C.paper }} className="min-h-screen">
        <Header />
        <div className="text-center py-32 px-6">
          <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">
            {error || "Listing not found."}
          </p>
        </div>
      </div>
    );
  }

  const {
    name, description, address, regularPrice, discountedPrice,
    bedrooms, bathrooms, furnished, parking, type, offer, imageUrls,
  } = listing;

  const displayPrice = offer ? discountedPrice : regularPrice;
  const images = imageUrls?.length ? imageUrls : [{ url: "https://placehold.co/900x600/16273D/9FB3C4?text=No+Photo" }];

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-detail, .kk-detail button, .kk-detail p, .kk-detail h1 { font-family:'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="kk-detail max-w-4xl mx-auto px-6 py-10 md:py-14">
        {/* gallery */}
        <div className="mb-6">
          <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-2" style={{ border: `1px solid ${C.hair}` }}>
            <img src={images[activeImage]?.url} alt={name} className="w-full h-full object-cover" />
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
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.public_id || i}
                  onClick={() => setActiveImage(i)}
                  className="flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden"
                  style={{ border: `2px solid ${activeImage === i ? C.brass : C.hair}` }}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* header row: title + owner actions */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 style={{ ...fontDisplay, fontWeight: 500, fontSize: 28, color: C.charcoal }}>{name}</h1>
            <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: C.charcoalSoft }}>
              <MapPin size={14} /> {address}
            </p>
          </div>

          {/* only the listing owner ever sees these */}
          {isOwner && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to={`/listings/update/${id}`}
                className="flex items-center cursor-pointer hover:opacity-90 gap-1.5 text-sm font-medium px-3 py-2 rounded-sm"
                style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 text-sm font-medium px-3 py-2 rounded-sm disabled:opacity-50"
                style={{ border: `1px solid ${C.error}`, color: C.error }}
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        {deleteError && (
          <p className="flex items-center gap-1.5 text-xs mb-4" style={{ color: C.error }}>
            <AlertCircle size={13} /> {deleteError}
          </p>
        )}

        {/* price + meta */}
        <div className="flex items-baseline gap-3 my-5">
          <p style={{ ...fontDisplay, fontWeight: 600, fontSize: 26, color: C.brassDark }}>
            {formatPKR(displayPrice)}
            {type === "rent" && <span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span>}
          </p>
          {offer && (
            <p className="text-sm line-through" style={{ color: C.charcoalSoft }}>{formatPKR(regularPrice)}</p>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-5 pb-5 mb-5 uppercase"
          style={{ ...fontMono, fontSize: 11, letterSpacing: "0.04em", color: C.charcoalSoft, borderBottom: `1px solid ${C.hair}` }}
        >
          <span className="flex items-center gap-1.5"><BedDouble size={14} /> {bedrooms} beds</span>
          <span className="flex items-center gap-1.5"><Bath size={14} /> {bathrooms} baths</span>
          {furnished && <span className="flex items-center gap-1.5"><Sofa size={14} /> Furnished</span>}
          {parking && <span className="flex items-center gap-1.5"><Car size={14} /> Parking</span>}
        </div>

        <p className="text-sm leading-relaxed" style={{ color: C.charcoal }}>{description}</p>
      </div>
    </div>
  );
}