import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  error?: string;
  message?: string;
}

export function LoginForm({ error, message }: LoginFormProps) {
  return (
    <form className="space-y-4" action={loginAction}>
      {message ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button className="w-full" type="submit">
        Log In
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link className="font-semibold text-primary" href="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}
