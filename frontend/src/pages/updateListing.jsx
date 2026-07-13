import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ImagePlus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  success: "#5E7A63",
  error: "#B4553F",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

const BASE_URL = `${import.meta.env.VITE_API_ROUTE}/api/v1/listing`;
const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024;

export default function UpdateListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(null); // null until the listing loads
  const [existingImages, setExistingImages] = useState([]); // [{ url, public_id }]
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const [fileError, setFileError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // fetch the listing to edit and pre-fill the form
  useEffect(() => {
    let ignore = false;

    const fetchListing = async () => {
      setPageLoading(true);
      setPageError("");
      try {
        const res = await axios.get(`${BASE_URL}/${id}`, { withCredentials: true });
        if (ignore) return;
        console.log(res)
        const listing = res.data?.listingData || res.data;

        // owner check — a signed-in non-owner shouldn't get a working form
        const ownerId = typeof listing.owner === "string" ? listing.owner : listing.owner?._id;
        if (!currentUser?._id || currentUser._id !== ownerId) {
          setForbidden(true);
          setPageLoading(false);
          return;
        }

        setFormData({
          name: listing.name || "",
          description: listing.description || "",
          address: listing.address || "",
          regularPrice: listing.regularPrice ?? "",
          discountedPrice: listing.discountedPrice ?? "",
          bedrooms: listing.bedrooms ?? 1,
          bathrooms: listing.bathrooms ?? 1,
          furnished: Boolean(listing.furnished),
          parking: Boolean(listing.parking),
          type: listing.type || "sale",
          offer: Boolean(listing.offer),
        });
        setExistingImages(listing.imageUrls || []);
      } catch (err) {
        if (ignore) return;
        console.log("Fetch listing for edit error:", err.response?.data || err.message);
        if (err.response?.status === 403) {
          setForbidden(true);
        } else {
          setPageError(err.response?.data?.message || "Couldn't load this listing.");
        }
      } finally {
        if (!ignore) setPageLoading(false);
      }
    };

    fetchListing();
    return () => { ignore = true; };
  }, [id, currentUser?._id]);

  // revoke every blob URL on unmount
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setSuccess(false);
    if (name === "offer" || name === "discountedPrice" || name === "regularPrice") setPriceError("");
  };

  const totalImageCount = existingImages.length + newFiles.length;

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    if (totalImageCount + picked.length > MAX_IMAGES) {
      setFileError(`You can have up to ${MAX_IMAGES} images total (you currently have ${totalImageCount}).`);
      e.target.value = "";
      return;
    }

    const validFiles = [];
    const rejected = [];

    picked.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} — not an image file.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        rejected.push(`${file.name} — over 5MB.`);
        return;
      }
      validFiles.push(file);
    });

    setFileError(rejected.length ? rejected.join(" ") : "");

    if (validFiles.length) {
      setNewFiles((prev) => [...prev, ...validFiles]);
      setNewPreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
    }

    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setPriceError("");

    if (totalImageCount === 0) {
      setFileError("At least 1 image is required.");
      return;
    }

    if (formData.offer) {
      if (!formData.discountedPrice) {
        setPriceError("Discounted price is required when an offer is active.");
        return;
      }
      if (Number(formData.discountedPrice) >= Number(formData.regularPrice)) {
        setPriceError("Discounted price must be lower than the regular price.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("address", formData.address);
      payload.append("regularPrice", formData.regularPrice);
      payload.append("discountedPrice", formData.offer ? formData.discountedPrice : 0);
      payload.append("bedrooms", formData.bedrooms);
      payload.append("bathrooms", formData.bathrooms);
      payload.append("furnished", formData.furnished);
      payload.append("parking", formData.parking);
      payload.append("type", formData.type);
      payload.append("offer", formData.offer);
      payload.append("existingImages", JSON.stringify(existingImages));
      newFiles.forEach((file) => payload.append("images", file));

      const res = await axios.patch(`${BASE_URL}/${id}`, payload, { withCredentials: true });

      newPreviews.forEach((url) => URL.revokeObjectURL(url));
      setSuccess(true);
      setLoading(false);
      navigate(`/listings/${res.data?.updatedListing?._id || id}`);
    } catch (err) {
      console.log("Update listing error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        setError("You don't have permission to edit this listing.");
      } else {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong updating this listing.";
        setError(backendMessage);
      }
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ backgroundColor: C.ink }} className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={22} className="animate-spin" color={C.brass} />
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div style={{ backgroundColor: C.ink }} className="min-h-screen">
        <Header />
        <div className="text-center py-32 px-6">
          <p style={{ ...fontDisplay, fontSize: 22, color: C.paper }} className="mb-2">
            You don't have permission to edit this listing.
          </p>
          <Link to="/my-listings" className="text-sm font-medium" style={{ color: C.brass }}>
            Back to my listings
          </Link>
        </div>
      </div>
    );
  }

  if (pageError || !formData) {
    return (
      <div style={{ backgroundColor: C.ink }} className="min-h-screen">
        <Header />
        <div className="text-center py-32 px-6">
          <p style={{ ...fontDisplay, fontSize: 22, color: C.paper }}>{pageError || "Listing not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-update, .kk-update input, .kk-update button, .kk-update textarea, .kk-update select, .kk-update label { font-family:'Inter', sans-serif; }
        .kk-update input::placeholder, .kk-update textarea::placeholder { color:#5B7186; }
      `}</style>

      <Header />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#33526B 1px, transparent 1px), linear-gradient(90deg, #33526B 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.12,
        }}
      />

      <div className="kk-update relative z-10 max-w-2xl mx-auto px-6 py-14 md:py-16">
        <p className="uppercase mb-2.5" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brass }}>
          Editing
        </p>
        <h1 className="mb-8" style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.paper }}>
          {formData.name || "Update listing"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="rounded-sm p-7"
          style={{ backgroundColor: C.ink2, border: "1px solid rgba(92,134,160,0.25)" }}
        >
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Listing name</label>
            <input
              name="name" value={formData.name} onChange={handleChange} required
              className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Description</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} required rows={4}
              className="w-full text-sm rounded-sm px-3 py-2.5 outline-none resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Address</label>
            <input
              name="address" value={formData.address} onChange={handleChange} required
              className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Listing type</label>
              <select
                name="type" value={formData.type} onChange={handleChange}
                className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
              >
                <option value="sale" style={{ color: C.charcoal }}>For sale</option>
                <option value="rent" style={{ color: C.charcoal }}>For rent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Bedrooms</label>
              <input
                type="number" name="bedrooms" min={0} value={formData.bedrooms} onChange={handleChange} required
                className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Bathrooms</label>
              <input
                type="number" name="bathrooms" min={0} value={formData.bathrooms} onChange={handleChange} required
                className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Regular price (PKR)</label>
              <input
                type="number" name="regularPrice" min={0} value={formData.regularPrice} onChange={handleChange} required
                className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                style={{ ...fontMono, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: formData.offer ? C.paper : C.charcoalSoft }}>
                Discounted price (PKR)
              </label>
              <input
                type="number" name="discountedPrice" min={0} value={formData.discountedPrice} onChange={handleChange}
                disabled={!formData.offer}
                className="w-full text-sm rounded-sm px-3 py-2.5 outline-none disabled:opacity-40"
                style={{ ...fontMono, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,134,160,0.3)", color: C.paper }}
              />
            </div>
          </div>

          {priceError && (
            <p className="flex items-center gap-1.5 text-xs mb-4" style={{ color: C.error }}>
              <AlertCircle size={13} /> {priceError}
            </p>
          )}

          <div className="flex flex-wrap gap-5 mb-6 mt-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: C.paper }}>
              <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} />
              Furnished
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: C.paper }}>
              <input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} />
              Parking available
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: C.paper }}>
              <input type="checkbox" name="offer" checked={formData.offer} onChange={handleChange} />
              Has an active offer
            </label>
          </div>

          {/* images: existing (kept from original) + new uploads, shown together */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium" style={{ color: C.paper }}>
                Photos ({totalImageCount}/{MAX_IMAGES})
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={totalImageCount >= MAX_IMAGES}
                className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-40"
                style={{ color: C.brass }}
              >
                <ImagePlus size={14} /> Add photos
              </button>
              <input
                ref={fileInputRef} type="file" accept="image/*" multiple
                onChange={handleFileChange} className="hidden"
              />
            </div>

            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {existingImages.map((img, i) => (
                  <div key={img.public_id || img.url} className="relative aspect-square rounded-sm overflow-hidden group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <span
                      className="absolute top-1 left-1 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm"
                      style={{ ...fontMono, backgroundColor: "rgba(15,26,43,0.85)", color: C.paper }}
                    >
                      Kept
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(15,26,43,0.8)", color: C.paper }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {newPreviews.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-sm overflow-hidden group">
                    <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <span
                      className="absolute top-1 left-1 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm"
                      style={{ ...fontMono, backgroundColor: C.brassDark, color: C.paper }}
                    >
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(15,26,43,0.8)", color: C.paper }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fileError && (
              <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: C.error }}>
                <AlertCircle size={13} /> {fileError}
              </p>
            )}
          </div>

          {success && (
            <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: C.success }}>
              <CheckCircle2 size={16} /> Listing updated.
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: C.error }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || totalImageCount === 0}
            className="w-full flex items-center justify-center gap-2 rounded-sm py-3 mt-6 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: C.brassDark, color: C.paper }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}