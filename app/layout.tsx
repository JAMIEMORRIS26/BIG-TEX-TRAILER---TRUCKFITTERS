import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BIG-TEX-TRAILER---TRUCKFITTERS",
  description: "Work Orders • Inspections • Quotes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontWeight:900, letterSpacing:0.5}}>BIG-TEX-TRAILER---TRUCKFITTERS</div>
              <div className="small">Work Orders • Inspections • Quotes</div>
            </div>
            <nav className="row">
              <a className="btn" href="/dashboard">Dashboard</a>
              <a className="btn" href="/work-orders">Work Orders</a>
              <a className="btn" href="/parts">Parts</a>
              <a className="btn" href="/login">Login</a>
            </nav>
          </header>
          <main style={{marginTop:16}}>{children}</main>
          <footer style={{marginTop:24}} className="small">© {new Date().getFullYear()} Big Tex Trailers / TruckFitters</footer>
        </div>
      </body>
    </html>
  );
}
