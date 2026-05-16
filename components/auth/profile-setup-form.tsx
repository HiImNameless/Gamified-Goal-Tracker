"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";

interface ProfileSetupFormProps {
  userId: string;
  email: string;
}

export function ProfileSetupForm({ userId, email }: ProfileSetupFormProps) {
  const router = useRouter();
  const suggestedUsername = useMemo(() => {
    const prefix = email.split("@")[0] ?? "";
    return prefix.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 32);
  }, [email]);
  const [username, setUsername] = useState(suggestedUsername);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const normalizedUsername = username.trim();
    const normalizedDisplayName = displayName.trim();

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(normalizedUsername)) {
      setError("Username must be 3-32 characters using letters, numbers, or underscores.");
      setIsLoading(false);
      return;
    }

    if (!normalizedDisplayName) {
      setError("Display name is required.");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      username: normalizedUsername,
      display_name: normalizedDisplayName
    });

    if (profileError) {
      setError(profileError.message);
      setIsLoading(false);
      return;
    }

    const { error: progressError } = await supabase.from("user_progress").upsert({
      user_id: userId
    });

    if (progressError) {
      setError(progressError.message);
      setIsLoading(false);
      return;
    }

    const starterSkills = [
      "health",
      "fitness",
      "programming",
      "editing",
      "study",
      "money",
      "creativity",
      "discipline"
    ] as const;

    const { error: skillsError } = await supabase.from("skill_progress").upsert(
      starterSkills.map((skillCategory) => ({
        user_id: userId,
        skill_category: skillCategory
      })),
      {
        onConflict: "user_id,skill_category",
        ignoreDuplicates: true
      }
    );

    setIsLoading(false);

    if (skillsError) {
      setError(skillsError.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <Input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="quest_master"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="display-name">
          Display Name
        </label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Brandon"
          required
        />
      </div>

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Start Campaign"}
      </Button>
    </form>
  );
}
