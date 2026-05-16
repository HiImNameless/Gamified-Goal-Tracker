import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { ProfileSetupForm } from "@/components/auth/profile-setup-form";
import { getProfile, requireUser } from "@/lib/auth";

export default async function ProfileSetupPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (profile) {
    redirect("/");
  }

  return (
    <AuthCard
      title="Name Your Character"
      description="Choose the profile your friend will see."
    >
      <ProfileSetupForm userId={user.id} email={user.email ?? ""} />
    </AuthCard>
  );
}
