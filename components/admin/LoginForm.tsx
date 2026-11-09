"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/app/admin/actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="a-input mt-1" /></label>
      <label className="block text-sm font-medium">Password<input name="password" type="password" required autoComplete="current-password" className="a-input mt-1" /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="a-btn w-full justify-center !py-2.5">{pending && <Loader2 className="size-4 animate-spin" />} Sign in</button>
    </form>
  );
}
