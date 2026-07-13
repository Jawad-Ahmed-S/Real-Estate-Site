import { BedDouble, Bath, Sofa, Car, MapPin, Tag, Dice1 } from "lucide-react";

const C = {
  charcoal: "#1C2333",
  charcoalSoft: "#5B6472",
  brassDark: "#9A6F3C",
  hair: "#E4DFD1",
  paper: "#FBF9F4",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

const formatPKR = (n) =>
  typeof n === "number" ? `PKR ${n.toLocaleString("en-PK")}` : "—";



export default function PropertyCard({ listing, className = "" }) {
  let {
    imageUrls, name, address, regularPrice, discountedPrice,
    bedrooms, bathrooms, furnished, parking, type, offer,
  } = listing;

  console.log("Listing in card:",listing)
  const hasOffer = Number(offer) > 0;
  
  const displayPrice = discountedPrice;
  
  return (
    <div
      className={`group rounded-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${className}`}
      style={{ backgroundColor: "#fff", border: `1px solid ${C.hair}` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrls?.[0]?.url || "https://placehold.co/600x450/16273D/9FB3C4?text=No+Photo"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase px-2 py-1 rounded-sm"
          style={{ ...fontMono, letterSpacing: "0.06em", backgroundColor: C.brassDark, color: C.paper }}
        >
          For {type === "rent" ? "Rent" : "Sale"}
        </span>
        {hasOffer && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-sm"
            style={{ backgroundColor: "rgba(15,26,43,0.85)", color: C.paper }}
          >
            <Tag size={12} />
            Offer
          </span>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-baseline gap-2"
          style={{ background: "linear-gradient(to top, rgba(15,26,43,0.75), transparent)" }}
        >
          <p style={{ ...fontDisplay, fontWeight: 600, fontSize: 18, color: C.paper }}>
            {formatPKR(displayPrice)}
            {type === "rent" && <span style={{ fontSize: 12, fontWeight: 400 }}>/mo</span>}
          </p>
          {hasOffer && (
            <p className="text-xs line-through" style={{ color: "#9FB3C4" }}>
              {formatPKR(regularPrice)}
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: C.charcoal }}>
          {name}
        </h3>
        <p className="flex items-center gap-1 text-xs mb-3 truncate" style={{ color: C.charcoalSoft }}>
          <MapPin size={12} />
          {address}
        </p>

        <div
          className="flex items-center gap-4 pt-3 uppercase"
          style={{ ...fontMono, fontSize: 10.5, letterSpacing: "0.04em", color: C.charcoalSoft, borderTop: `1px solid ${C.hair}` }}
        >
          <span className="flex items-center gap-1.5"><BedDouble size={13} /> {bedrooms}</span>
          <span className="flex items-center gap-1.5"><Bath size={13} /> {bathrooms}</span>
          {furnished && <span className="flex items-center gap-1.5"><Sofa size={13} /> Furnished</span>}
          {parking && <span className="flex items-center gap-1.5"><Car size={13} /> Parking</span>}
        </div>
      </div>
    </div>
  );
}