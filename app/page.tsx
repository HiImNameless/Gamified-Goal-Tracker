import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { ensureProgressAndSkills } from "@/lib/profile-bootstrap";
import { getDashboardData } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await requireUser();
  let { profile, progress, quests, skills } = await getDashboardData(user.id);

  if (!profile) {
    redirect("/profile/setup");
  }

  if (!progress || skills.length === 0) {
    await ensureProgressAndSkills(user.id);
    const refreshedData = await getDashboardData(user.id);
    progress = refreshedData.progress;
    quests = refreshedData.quests;
    skills = refreshedData.skills;
  }

  if (!progress) {
    throw new Error("Unable to initialize user progress.");
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
