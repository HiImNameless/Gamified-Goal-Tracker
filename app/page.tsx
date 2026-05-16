import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getFriendsData } from "@/lib/friends";
import { applyLifeCategoryDecay } from "@/lib/life-category-progress";
import { ensureProgressAndSkills } from "@/lib/profile-bootstrap";
import { getDashboardData } from "@/lib/supabase/queries";
import { getVerificationQueue } from "@/lib/verification";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await requireUser();
  await applyLifeCategoryDecay(user.id);
  let { profile, progress, quests, skills, lifeCategories } = await getDashboardData(user.id);
  let friends = await getFriendsData(user.id);
  let verificationQueue = await getVerificationQueue(user.id);

  if (!profile) {
    redirect("/profile/setup");
  }

  if (!progress || skills.length === 0) {
    await ensureProgressAndSkills(user.id);
    const refreshedData = await getDashboardData(user.id);
    friends = await getFriendsData(user.id);
    verificationQueue = await getVerificationQueue(user.id);
    progress = refreshedData.progress;
    quests = refreshedData.quests;
    skills = refreshedData.skills;
    lifeCategories = refreshedData.lifeCategories;
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
      lifeCategories={lifeCategories}
      acceptedFriends={friends.accepted.map((friend) => friend.profile)}
      verificationQueue={verificationQueue}
    />
  );
}
