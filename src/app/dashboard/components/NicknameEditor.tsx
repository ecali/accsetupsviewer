"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NicknameEditorProps = {
  userId: string;
  initialNickname: string;
};

export default function NicknameEditor({ userId, initialNickname }: NicknameEditorProps) {
  const isLocked = Boolean(initialNickname.trim());
  const [nickname, setNickname] = useState(initialNickname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSave() {
    if (isLocked) {
      return;
    }

    const cleanNickname = nickname.trim();
    if (!cleanNickname) {
      setError("Nickname is required.");
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("user_profiles").insert({
      user_id: userId,
      nickname: cleanNickname,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-3 grid gap-2 sm:max-w-md">
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400" htmlFor="nickname">
        Nickname (required for setup/lap inserts)
      </label>
      <div className="flex gap-2">
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Your nickname"
          disabled={isLocked}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={loading || isLocked}
          className="rounded-lg bg-[#23a936] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLocked ? "Saved" : loading ? "Saving..." : "Save"}
        </button>
      </div>
      {isLocked ? <p className="text-xs text-zinc-500 dark:text-zinc-400">Nickname can be set only once.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
