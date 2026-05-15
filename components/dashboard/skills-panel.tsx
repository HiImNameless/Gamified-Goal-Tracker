import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { skillLabels } from "@/lib/quest-utils";
import type { SkillProgress } from "@/lib/types";

interface SkillsPanelProps {
  skills: SkillProgress[];
}

export function SkillsPanel({ skills }: SkillsPanelProps) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{skillLabels[skill.skillCategory]}</span>
              <span className="text-xs text-muted-foreground">Lv. {skill.level}</span>
            </div>
            <Progress value={skill.xp % 100} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
