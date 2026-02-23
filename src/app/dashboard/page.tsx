import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./components/LogoutButton";
import DashboardClient from "./components/DashboardClient";
import NicknameEditor from "./components/NicknameEditor";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("user_profiles")
    .select("nickname")
    .eq("user_id", user.id)
    .maybeSingle();
  const nickname = profileRow?.nickname ?? "";

  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-900">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8">
        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Logged in as {user.email}</p>
            </div>
            <LogoutButton />
          </div>
          <div>
            <NicknameEditor userId={user.id} initialNickname={nickname} />
          </div>
        </section>

        {nickname.trim() ? (
          <DashboardClient nickname={nickname} />
        ) : (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Set your nickname to unlock dashboard content.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
