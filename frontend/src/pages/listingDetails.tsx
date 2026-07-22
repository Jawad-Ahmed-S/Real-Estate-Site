import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BedDouble, Bath, Sofa, Car, MapPin, Tag, Loader2, AlertCircle, Pencil, Trash2,
  Send, CheckCircle2, CalendarClock, Heart,
} from "lucide-react";
import Header from "../components/header.js";
import axiosInstance from "../api/axiosInstance.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { RootState } from "../redux/store.js";
import { isAxiosError } from "axios";
import type { WishlistIterface } from "../types/wishlist.js";
import type { ListingInterface } from "../types/listing.js";
import type{ IImage } from '../types/Image.js';

dayjs.extend(utc);
dayjs.extend(timezone);

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

const WISHLIST_BASE_URL = `/api/v1/wishlist`;

const formatPKR = (n:number) => (typeof n === "number" ? `PKR ${n.toLocaleString("en-PK")}` : "—");

const emptyListing: ListingInterface = {
  _id: "",
  name: "",
  description: "",
  address: "",
  regularPrice: 0,
  discountedPrice: 0,
  bedrooms: 1,
  bathrooms: 1,
  furnished: false,
  parking: false,
  type: "sell",
  offer: false,
  owner:"",
  imageUrls: [],
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state:RootState) => state.user);

  const [listing, setListing] = useState<ListingInterface>(emptyListing);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const [proposedDateTime, setProposedDateTime] = useState("");
  const [appointmentSending, setAppointmentSending] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");
  const [appointmentSent, setAppointmentSent] = useState(false);

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<string|null>(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchListing = async () => {
      setLoading(true);
      setError("");
      try {
        
        const res = await axiosInstance.get(`/api/v1/listing/${id}`);
        
        if (!ignore) setListing(res.data.listingData || res.data);
      } catch (err) {
        if(isAxiosError(err)){

          if (ignore) return;
          console.log("Fetch listing error:", err.response?.data || err.message);
          setError(err.response?.data?.message || "Couldn't load this listing.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchListing();
    return () => { ignore = true; };
  }, [id]);

  // check whether this listing is already saved, so the button reflects the right state
  useEffect(() => {
    if (!currentUser) {
      setWishlisted(false);
      setWishlistId(null);
      return;
    }
    let ignore = false;
    const fetchWishlistStatus = async () => {
      try {
        const res = await axiosInstance.get(`${WISHLIST_BASE_URL}/`);
        const favourites:WishlistIterface[] = res.data?.favourites || [];
        const match = favourites.find((fav) => {
          const listingId = typeof fav.listing === "string" ? fav.listing : fav.listing?._id;
          return listingId === id;
        });
        if (!ignore) {
          setWishlisted(Boolean(match));
          setWishlistId(match?._id || null);
        }
      } catch (err) {
        if(isAxiosError(err)){
          console.log("Fetch wishlist status error:", err.response?.data || err.message);
        }
      }
    };
    fetchWishlistStatus();
    return () => { ignore = true; };
  }, [currentUser, id]);

  const ownerId =listing.owner;
  const isOwner = Boolean(currentUser?._id === ownerId);

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;

    setDeleting(true);
    setDeleteError("");
    try {
      await axiosInstance.delete(`/api/v1/listing/${id}`);
      navigate("/listings");
    } catch (err) {
      if(isAxiosError(err)){

        console.log("Delete listing error:", err.response?.data || err.message);
        if (err.response?.status === 403) {
          setDeleteError("You don't have permission to delete this listing.");
        } else {
          setDeleteError(err.response?.data?.message || "Couldn't delete this listing right now.");
        }
        setDeleting(false);
      }
    }
  };

  const handleSendInquiry = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInquiryError("");
    setInquirySending(true);
    try {
      await axiosInstance.post(
        `/api/v1/inquiry/create`,
        { listingId: id, message: inquiryMessage }
      );
      setInquirySent(true);
      setInquiryMessage("");
    } catch (err) {
      if(isAxiosError(err)){

        console.log("Send inquiry error:", err.response?.data || err.message);
        setInquiryError(err.response?.data?.message || "Couldn't send your message right now.");
      }
    } finally {
      setInquirySending(false);
    }
  };

    const handleRequestAppointment = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppointmentError("");
    setAppointmentSending(true);
    try {
      // convert the naive local datetime-local value into a proper UTC ISO string
      const utcDateTime = dayjs.tz(proposedDateTime, "Asia/Karachi").utc().format();

      await axiosInstance.post(
        `/api/v1/appointment/create`,
        { listingId: id, proposedDateTime: utcDateTime }
      );
      console.log("Proposed (sent as UTC): ", utcDateTime);
      setAppointmentSent(true);
      setProposedDateTime("");
    } catch (err) {
      if(isAxiosError(err)){
      console.log("Request appointment error:", err.response?.data || err.message);
      setAppointmentError(err.response?.data?.message || "Couldn't send that request right now.");
      }
    } finally {
      setAppointmentSending(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!currentUser) return;
    setWishlistBusy(true);
    setWishlistError("");
    try {
      if (wishlistId) {
        await axiosInstance.delete(`${WISHLIST_BASE_URL}/${wishlistId}`);
        setWishlisted(false);
        setWishlistId(null);
      } else {
        const res = await axiosInstance.post(
          `${WISHLIST_BASE_URL}/mark`,
          { listingId: id }
        );
        setWishlisted(true);
        setWishlistId(res.data?.wishlist?._id || null);
      }
    } catch (err) {
      if(isAxiosError(err)){
      console.log("Wishlist toggle error:", err.response?.data || err.message);
      setWishlistError(err.response?.data?.message || "Couldn't update your wishlist right now.");
      }
    } finally {
      setWishlistBusy(false);
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
  const images:IImage[] = imageUrls?.length ? imageUrls : [{ url: "https://placehold.co/900x600/16273D/9FB3C4?text=No+Photo",public_id:""}];

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

        {/* header row: title + owner actions / wishlist */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 style={{ ...fontDisplay, fontWeight: 500, fontSize: 28, color: C.charcoal }}>{name}</h1>
            <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: C.charcoalSoft }}>
              <MapPin size={14} /> {address}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* only the listing owner ever sees these */}
            {isOwner && (
              <>
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
              </>
            )}

            {/* saving to wishlist doesn't make sense for your own listing */}
            {!isOwner && currentUser && (
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistBusy}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 text-sm font-medium px-3 py-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: `1px solid ${wishlisted ? C.brassDark : C.hair}`,
                  color: wishlisted ? C.brassDark : C.charcoal,
                }}
              >
                {wishlistBusy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Heart size={14} fill={wishlisted ? C.brassDark : "none"} />
                )}
                {wishlisted ? "Saved" : "Save"}
              </button>
            )}
          </div>
        </div>

        {deleteError && (
          <p className="flex items-center gap-1.5 text-xs mb-4" style={{ color: C.error }}>
            <AlertCircle size={13} /> {deleteError}
          </p>
        )}
        {wishlistError && (
          <p className="flex items-center gap-1.5 text-xs mb-4" style={{ color: C.error }}>
            <AlertCircle size={13} /> {wishlistError}
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

        <p className="text-sm leading-relaxed mb-8" style={{ color: C.charcoal }}>{description}</p>

        {/* contact the owner — never shown to the owner themselves */}
        {!isOwner && (
          <div className="rounded-sm p-6" style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}>
            <h2 style={{ ...fontDisplay, fontWeight: 500, fontSize: 18, color: C.charcoal }} className="mb-4">
              Contact the owner
            </h2>

            {!currentUser ? (
              <p className="text-sm" style={{ color: C.charcoalSoft }}>
                <Link to="/login" className="font-medium" style={{ color: C.brassDark }}>Sign in</Link> to send an inquiry about this listing.
              </p>
            ) : inquirySent ? (
              <p className="flex items-center gap-2 text-sm" style={{ color: "#5E7A63" }}>
                <CheckCircle2 size={16} /> Your message has been sent to the owner.
              </p>
            ) : (
              <form onSubmit={handleSendInquiry}>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Hi, I'm interested in this property — is it still available?"
                  className="w-full text-sm rounded-sm px-3 py-2.5 outline-none resize-none mb-3"
                  style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                />
                {inquiryError && (
                  <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: C.error }}>
                    <AlertCircle size={13} /> {inquiryError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={inquirySending}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm disabled:opacity-60"
                  style={{ backgroundColor: C.brassDark, color: C.paper }}
                >
                  {inquirySending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {inquirySending ? "Sending..." : "Send inquiry"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* request a viewing — same visibility rule as the inquiry form */}
        {!isOwner && currentUser && (
          <div className="rounded-sm p-6 mt-4" style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}>
            <h2 style={{ ...fontDisplay, fontWeight: 500, fontSize: 18, color: C.charcoal }} className="mb-4 flex items-center gap-2">
              <CalendarClock size={18} color={C.brassDark} /> Request a viewing
            </h2>

            {appointmentSent ? (
              <p className="flex items-center gap-2 text-sm" style={{ color: "#5E7A63" }}>
                <CheckCircle2 size={16} /> Your request has been sent — the owner will confirm or decline it.
              </p>
            ) : (
              <form onSubmit={handleRequestAppointment}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.charcoal }}>Proposed date &amp; time</label>
                <input
                  type="datetime-local"
                  value={proposedDateTime}
                  onChange={(e) => setProposedDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="w-full text-sm rounded-sm px-3 py-2.5 outline-none mb-3"
                  style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                />
                {appointmentError && (
                  <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: C.error }}>
                    <AlertCircle size={13} /> {appointmentError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={appointmentSending}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: C.brassDark, color: C.paper }}
                >
                  {appointmentSending ? <Loader2 size={15} className="animate-spin" /> : <CalendarClock size={15} />}
                  {appointmentSending ? "Sending..." : "Request appointment"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}