import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 text-center text-white">
      <div>
        <p className="font-display text-[8rem] leading-none text-gold">404</p>
        <p className="mt-2 text-white/60">This page could not be found.</p>
        <Link href="/" className="btn-gold mt-8">Back home</Link>
      </div>
    </div>
  );
}
