import { Sidebar } from "@/components/dashboard/sidebar";
import { VerificationCard } from "@/components/verification/verification-card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { ensureProgressAndSkills } from "@/lib/profile-bootstrap";
import { getDashboardData } from "@/lib/supabase/queries";
import { getVerificationQueue } from "@/lib/verification";

export default async function VerificationPage() {
  const user = await requireUser();
  await ensureProgressAndSkills(user.id);
  const [{ profile }, queue] = await Promise.all([
    getDashboardData(user.id),
    getVerificationQueue(user.id)
  ]);

  if (!profile) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      <main className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="rounded-lg border border-border bg-card/70 p-5 shadow-sm">
            <Badge tone="default">Verification Queue</Badge>
            <h1 className="mt-3 text-3xl font-bold">Proof Review</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Expand a proof card to inspect the evidence before approving or rejecting.
            </p>
          </header>

          <section className="space-y-4">
            {queue.length > 0 ? (
              queue.map((item) => (
                <VerificationCard key={item.proof.id} item={item} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card/45 p-8 text-sm text-muted-foreground">
                No proof is waiting for your review.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
