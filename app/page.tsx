import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await requireUser();
  const { profile, progress, quests, skills } = await getDashboardData(user.id);

  if (!profile || !progress) {
    redirect("/profile/setup");
  }

  return (
    <DashboardShell
      profile={profile}
      progress={progress}
      quests={quests}
      skills={skills}
    />
  );
}
