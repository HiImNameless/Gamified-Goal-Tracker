import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

interface LoginPageProps {
  searchParams: {
    error?: string;
    message?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthCard
      title="Enter the Guild"
      description="Log in to continue your campaign."
    >
      <LoginForm error={searchParams.error} message={searchParams.message} />
    </AuthCard>
  );
}
