import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Loader2, AlertCircle, MapPin, Check, X as XIcon, Ban, CalendarCheck2,
} from "lucide-react";
import Header from "../components/header";
import axiosInstance from "../api/axiosInstance";

const C = {
  paper: "#FBF9F4",
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brass: "#B8894F",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
  error: "#B4553F",
  success: "#5E7A63",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };


const BASE_URL = `/api/v1/appointment`;

const STATUS_STYLES = {
  pending: { bg: "#FCF6EC", text: "#9A6F3C", label: "Pending" },
  confirmed: { bg: "#EAF2EC", text: "#3F6B47", label: "Confirmed" },
  rejected: { bg: "#F7E8E5", text: "#B4553F", label: "Rejected" },
  completed: { bg: "#EAEEF2", text: "#5B6472", label: "Completed" },
};

const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString("en-PK", {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });

export default function AppointmentsPage() {
  const [tab, setTab] = useState("received"); // "received" (owner) | "sent" (buyer)
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      setActionError("");
      try {
        const endpoint = tab === "sent" ? "sentAppointments" : "recievedAppointments";
        const res = await axiosInstance.get(`${BASE_URL}/${endpoint}`);
        console.log("Response recived on frontnend: ",res)
        console.log("Response recived on frontnend: ",res.appointments)
        if (!ignore) setAppointments(res.data?.myAppointments || []);
      } catch (err) {
        if (ignore) return;
        console.log("Fetch appointments error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Couldn't load appointments right now.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchAppointments();
    return () => { ignore = true; };
  }, [tab]);

  const runAction = async (id, requestFn, { removeOnSuccess = false } = {}) => {
                          
    setActingId(id);
    setActionError("");
    try {
      const res = await requestFn();
      const updated = res.data?.updatedAppointment || res.data?.data;
      if (removeOnSuccess) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
      } else if (updated) {
        setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, ...updated } : a)));
      }
    } catch (err) {
      console.log("Appointment action error:", err.response?.data || err.message);
      setActionError(err.response?.data?.message || "That action couldn't be completed.");
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = (id) => {
    if (!window.confirm("Cancel this appointment request?")) return;
    runAction(id, () => axiosInstance.delete(`${BASE_URL}/${id}`), { removeOnSuccess: true });
  };

  const handleStatusUpdate = (id, newStatus) => {
    runAction(id, () => axiosInstance.patch(`${BASE_URL}/statusUpdate/${id}`, { newStatus }));
  };

  const handleComplete = (id) => {
    runAction(id, () => axiosInstance.patch(`${BASE_URL}/complete/${id}`, {}));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .kk-appts, .kk-appts button, .kk-appts p { font-family:'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="kk-appts max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <p className="uppercase mb-2" style={{ ...fontMono, fontSize: 11, letterSpacing: "0.12em", color: C.brassDark }}>
          Viewings
        </p>
        <h1 className="mb-8" style={{ ...fontDisplay, fontWeight: 500, fontSize: 30, color: C.charcoal }}>
          Appointments
        </h1>

        <div className="flex gap-1 mb-8 p-1 rounded-sm w-fit" style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}>
          {[
            { key: "received", label: "Requests to review" },
            { key: "sent", label: "Requested by me" },
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
        ) : appointments.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ ...fontDisplay, fontSize: 20, color: C.charcoal }} className="mb-2">
              {tab === "sent" ? "No viewing requests sent yet" : "No requests to review yet"}
            </p>
            <p className="text-sm" style={{ color: C.charcoalSoft }}>
              {tab === "sent"
                ? "Request a viewing from any listing page to see it here."
                : "Viewing requests on your listings will show up here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => {
              const counterpart = tab === "sent" ? appt.owner : appt.buyer;
              const statusStyle = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
              const isPast = new Date(appt.proposedDateTime) <= new Date();
              const busy = actingId === appt._id;

              return (
                <div key={appt._id} className="rounded-sm p-5" style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: C.charcoal }}>
                        {tab === "sent" ? "With " : "From "}
                        {counterpart?.firstName ? `${counterpart.firstName} ${counterpart.lastName || ""}`.trim() : "Unknown user"}
                      </p>
                      {appt.listing && (
                        <Link
                          to={`/listing/${appt.listing._id}`}
                          className="flex items-center gap-1 text-xs mt-1 cursor-pointer hover:underline"
                          style={{ color: C.brassDark }}
                        >
                          <MapPin size={11} /> {appt.listing.name} — {appt.listing.address}
                        </Link>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-sm flex-shrink-0"
                      style={{ ...fontMono, letterSpacing: "0.04em", backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  <p className="text-sm mb-4" style={{ color: C.charcoal }}>
                    Proposed for <span style={{ fontWeight: 600 }}>{formatDateTime(appt.proposedDateTime)}</span>
                  </p>

                  <div className="flex items-center gap-4 pt-3" style={{ borderTop: `1px solid ${C.hair}` }}>
                    {tab === "received" && appt.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "confirmed")}
                          disabled={busy}
                          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ color: C.success }}
                        >
                          {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "rejected")}
                          disabled={busy}
                          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ color: C.error }}
                        >
                          {busy ? <Loader2 size={12} className="animate-spin" /> : <XIcon size={12} />} Reject
                        </button>
                      </>
                    )}

                    {tab === "received" && appt.status === "confirmed" && (
                      <button
                        onClick={() => handleComplete(appt._id)}
                        disabled={busy || !isPast}
                        title={!isPast ? "Available once the proposed time has passed" : undefined}
                        className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: C.brassDark }}
                      >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <CalendarCheck2 size={12} />} Mark complete
                      </button>
                    )}

                    {tab === "sent" && ["pending", "confirmed"].includes(appt.status) && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={busy}
                        className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: C.error }}
                      >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />} Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}