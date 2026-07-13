import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Loader2, AlertCircle, Trash2, Pencil, Check, X as XIcon, MapPin } from "lucide-react";
import Header from "../components/header";

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

const BASE_URL = `${import.meta.env.VITE_API_ROUTE}/api/v1/inquiry`;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function InquiriesPage() {
  const { currentUser } = useSelector((state) => state.user);

  const [tab, setTab] = useState("received"); // "received" | "sent"
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchInquiries = async () => {
      setLoading(true);
      setError("");
      setActionError("");
      try {
        const endpoint = tab === "sent" ? "sentInquiries" : "recievedInquiries";
        const res = await axios.get(`${BASE_URL}/${endpoint}`, { withCredentials: true });
        console.log(res)
        if (!ignore) setInquiries(res.data?.myInquiries || []);
      } catch (err) {
        if (ignore) return;
        console.log("Fetch inquiries error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Couldn't load your inquiries right now.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInquiries();
    return () => { ignore = true; };
  }, [tab]);

  const startEdit = (inquiry) => {
    setEditingId(inquiry._id);
    setEditValue(inquiry.message);
    setActionError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id) => {
    setSavingId(id);
    setActionError("");
    try {
      const res = await axios.patch(
        `${BASE_URL}/${id}`,
        { message: editValue },
        { withCredentials: true }
      );
      const updated = res.data?.updatedInquiry;
      setInquiries((prev) => prev.map((inq) => (inq._id === id ? { ...inq, message: updated?.message ?? editValue } : inq)));
      setEditingId(null);
    } catch (err) {
      console.log("Update inquiry error:", err.response?.data || err.message);
      setActionError(err.response?.data?.message || "Couldn't save that change.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry? This can't be undone.")) return;
    setDeletingId(id);
    setActionError("");
    try {
      await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
    } catch (err) {
      console.log("Delete inquiry error:", err.response?.data || err.message);
      setActionError(err.response?.data?.message || "Couldn't delete that inquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-inquiries, .kk-inquiries button, .kk-inquiries textarea, .kk-inquiries p { font-family:'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="kk-inquiries max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <p className="uppercase mb-2" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brassDark }}>
          Messages
        </p>
        <h1 className="mb-8" style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
          Inquiries
        </h1>

        {/* tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-sm w-fit" style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}>
          {[
            { key: "received", label: "Received" },
            { key: "sent", label: "Sent" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="text-sm font-semibold px-5 py-2 rounded-sm transition-colors cursor-pointer hover:opacity-85"
              style={{
                backgroundColor: tab === key ? C.brassDark : "transparent",
                color: tab === key ? C.paper : C.charcoalSoft,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {actionError && (
          <p className="flex items-center gap-1.5 text-sm mb-4" style={{ color: C.error }}>
            <AlertCircle size={14} /> {actionError}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin" color={C.brassDark} />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }}>{error}</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">
              {tab === "sent" ? "You haven't sent any inquiries yet" : "No inquiries yet"}
            </p>
            <p className="text-sm" style={{ color: C.charcoalSoft }}>
              {tab === "sent"
                ? "Messages you send to listing owners will show up here."
                : "Messages people send about your listings will show up here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {inquiries.map((inquiry) => {
              const isMine = tab === "sent"; // only your own sent messages are editable
              const counterpart = tab === "sent" ? inquiry.reciever : inquiry.sender;

              return (
                <div
                  key={inquiry._id}
                  className="rounded-sm p-5"
                  style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: C.charcoal }}>
                        {tab === "sent" ? "To:  " : "From "}
                        {`${counterpart?.firstName} ${counterpart?.lastName}` ||  "Unknown user"}
                      </p>
                      {inquiry.listing && (
                        <Link
                          to={`/listing/${inquiry.listing._id}`}
                          className="flex items-center gap-1 text-xs mt-1 cursor-pointer hover:underline"
                          style={{ color: C.brassDark }}
                        >
                          <MapPin size={11} /> {inquiry.listing.name} — {inquiry.listing.address}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ ...fontMono, color: C.charcoalSoft }}>
                      {timeAgo(inquiry.createdAt)}
                    </span>
                  </div>

                  {editingId === inquiry._id ? (
                    <div>
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        className="w-full text-sm rounded-sm px-3 py-2.5 outline-none resize-none mb-2"
                        style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(inquiry._id)}
                          disabled={savingId === inquiry._id}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: C.brassDark, color: C.paper }}
                        >
                          {savingId === inquiry._id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm cursor-pointer transition-colors hover:bg-black/5"
                          style={{ border: `1px solid ${C.hair}`, color: C.charcoal }}
                        >
                          <XIcon size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: C.charcoal }}>{inquiry.message}</p>
                      {isMine && (
                        <div className="flex items-center gap-4 pt-3" style={{ borderTop: `1px solid ${C.hair}` }}>
                          <button
                            onClick={() => startEdit(inquiry)}
                            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
                            style={{ color: C.charcoalSoft }}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(inquiry._id)}
                            disabled={deletingId === inquiry._id}
                            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: C.error }}
                          >
                            {deletingId === inquiry._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}