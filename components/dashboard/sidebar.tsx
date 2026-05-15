import { Award, BookOpen, LayoutDashboard, Settings, Swords, Users } from "lucide-react";
import { mockProfile } from "@/lib/mock-data";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Quests / Journal", icon: BookOpen },
  { label: "Friends", icon: Users },
  { label: "Reward Pool", icon: Award },
  { label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-border bg-background/70 p-5 backdrop-blur lg:block">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
          <Swords className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{mockProfile.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{mockProfile.username}
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
