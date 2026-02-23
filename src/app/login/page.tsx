"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-900">
      <main className="mx-auto w-full max-w-md px-4 sm:px-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-950">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Login</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Access your dashboard.</p>

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-[#23a936] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-[#23a936] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#23a936] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f962f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No account?{" "}
            <Link href="/register" className="font-semibold text-[#23a936] underline">
              Create one
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
