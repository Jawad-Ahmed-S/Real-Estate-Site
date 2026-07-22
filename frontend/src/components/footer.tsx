const C = {
  ink: "#0F1A2B",
  ink2: "#16273D",
  line: "#5C86A0",
  lineDim: "#33526B",
  paper: "#FBF9F4",
};
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function Footer() {
  return (
    <footer
      className="py-6"
      style={{ backgroundColor: C.ink, borderTop: `1px solid ${C.lineDim}` }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex justify-center">
        <p
          className="text-xs text-center"
          style={{ ...fontMono, color: C.line }}
        >
          © {new Date().getFullYear()} Keystone. All rights reserved.
        </p>
      </div>
    </footer>
  );
}