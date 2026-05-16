import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/profile/setup");
  }

  return (
    <AuthCard
      title="Create Adventurer"
      description="Start with email and password."
    >
      <SignupForm />
    </AuthCard>
  );
}
