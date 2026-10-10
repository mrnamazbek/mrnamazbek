import { ImageResponse } from "next/og";

export const alt = "Namazbek Bekzhanov — Data Engineer & Builder, Almaty, Kazakhstan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#111611", color: "#f2f4eb", padding: "64px 72px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#d0ec93" }}><span>N / B</span><span>ALMATY, KAZAKHSTAN</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><span style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.06 }}>Namazbek Bekzhanov</span><span style={{ fontSize: 42, color: "#d0ec93" }}>Data engineer. Backend builder.</span></div>
      <div style={{ display: "flex", fontSize: 24, color: "#aeb7a7", borderTop: "1px solid #34402e", paddingTop: 26 }}>Work, writing & experiments.</div>
    </div>,
    size,
  );
}
