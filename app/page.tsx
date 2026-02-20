import Link from "next/link";

export default function Home() {
  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Welcome</h1>
      <p>This is your starter web app. Next steps: connect Supabase, run the SQL schema, then deploy to Vercel.</p>
      <div className="row">
        <Link className="btn primary" href="/login">Go to Login</Link>
        <Link className="btn" href="/dashboard">View Dashboard</Link>
      </div>
    </div>
  );
}
