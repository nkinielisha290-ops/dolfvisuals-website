export default function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-black.svg" alt="DOLF VISUALS" className="h-10" />
      <h1 className="mt-10 font-heading text-2xl font-bold">Connect the database to use the admin dashboard</h1>
      <p className="mt-3 text-ink/70">The website is running on built-in demo content. To manage content, bookings and uploads:</p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-ink/80">
        <li>Create a free project at <b>supabase.com</b>.</li>
        <li>In <b>SQL Editor</b>, run <code className="rounded bg-white px-1">supabase/schema.sql</code>, then <code className="rounded bg-white px-1">supabase/seed.sql</code>.</li>
        <li>Copy <b>Project URL</b> and <b>anon key</b> (Project Settings → API) into <code className="rounded bg-white px-1">.env.local</code> (see <code>.env.example</code>).</li>
        <li>Create the admin user in <b>Authentication → Users</b>, then run: <code className="rounded bg-white px-1">insert into admin_users (email) values (&apos;you@email.com&apos;);</code></li>
        <li>Restart the site and sign in at <b>/admin/login</b>.</li>
      </ol>
    </div>
  );
}
