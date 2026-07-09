import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
// adjust this path to wherever your userSlice actually lives
import { signinStart, signinSucess, signinFailure, clearError } from "../redux/user/userSlice";

const C = {
  ink: "#0F1A2B",
  ink2: "#16273D",
  line: "#5C86A0",
  lineDim: "#33526B",
  paper: "#FBF9F4",
  brass: "#B8894F",
  brassDark: "#9A6F3C",
  success: "#8FB99B",
  error: "#E08A76",
  softText: "#9FB3C4",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function ProfilePage() {
  const { currentUser, token, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || "");
  const [avatarError, setAvatarError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
    if (error) dispatch(clearError());
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // basic client-side guardrails — adjust to taste
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");

    // TODO: kick off your own upload flow here if avatars upload
    // separately from the rest of the form (e.g. straight to Firebase/S3),
    // then setFormData(prev => ({ ...prev, avatar: uploadedUrl })) on success.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    dispatch(signinStart()); 
    try {
      // TODO: build your payload and fire your own request, e.g.:
      //
      // const payload = new FormData();
      // payload.append("firstName", formData.firstName);
      // payload.append("lastName", formData.lastName);
      // payload.append("email", formData.email);
      // if (avatarFile) payload.append("avatar", avatarFile);
      //
      // const res = await axios.put(`/api/user/update/${currentUser._id}`, payload, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      //
      // dispatch(signinSucess({ user: res.data.user, token })); // keep existing token, just refresh user

      dispatch(signinSucess({ user: { ...currentUser, ...formData }, token }));
      setSuccess(true);
    } catch (err) {
      // TODO: swap in the real error from your API response, e.g. err.response?.data?.message
      dispatch(signinFailure("Something went wrong updating your profile."));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-profile, .kk-profile input, .kk-profile button, .kk-profile label, .kk-profile p { font-family:'Inter', sans-serif; }
        .kk-profile input::placeholder { color: #5B7186; }
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

      <div className="kk-profile relative z-10 max-w-lg mx-auto px-6 py-16 md:py-20">
        <h1 className="mb-8" style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.paper }}>
          Your profile
        </h1>

        <div
          className="rounded-sm p-7"
          style={{ backgroundColor: C.ink2, border: `1px solid rgba(92,134,160,0.25)` }}
        >
          {/* avatar */}
          <div className="flex flex-col items-center mb-8">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="relative w-28 h-28 rounded-full overflow-hidden group"
              style={{ border: `2px solid ${C.brass}` }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Your avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "rgba(92,134,160,0.15)" }}>
                  <span style={{ ...fontDisplay, fontSize: 32, color: C.line }}>
                    {formData.firstName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(15,26,43,0.65)" }}
              >
                <Camera size={22} color={C.paper} />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs mt-3" style={{ color: C.softText }}>Click the photo to change it</p>
            {avatarError && (
              <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: C.error }}>
                <AlertCircle size={13} />
                {avatarError}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Amara"
                  className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid rgba(92,134,160,0.3)`, color: C.paper }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Khan"
                  className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid rgba(92,134,160,0.3)`, color: C.paper }}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.paper }}>Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="amara@email.com"
                className="w-full text-sm rounded-sm px-3 py-2.5 outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid rgba(92,134,160,0.3)`, color: C.paper }}
              />
            </div>

            {success && (
              <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: C.success }}>
                <CheckCircle2 size={16} />
                Profile updated.
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: C.error }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-sm py-3 text-sm font-semibold disabled:opacity-70"
              style={{ backgroundColor: C.brassDark, color: C.paper }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Updating..." : "Update profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}