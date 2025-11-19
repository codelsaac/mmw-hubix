import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GOALS = [
  {
    title: "Train confident student tech helpers",
    description:
      "Help students learn how to power on/off classroom systems, switch inputs, and handle simple technical issues.",
  },
  {
    title: "Support school events",
    description: "Provide AV support for assemblies, open days, competitions, and performances.",
  },
  {
    title: "Create IT promotional content",
    description: "Design slides, graphics, and simple media to promote school IT activities.",
  },
  {
    title: "Build teamwork and responsibility",
    description:
      "Develop problem-solving skills, communication, and a responsible attitude when working with equipment.",
  },
]

export function ItPerfectGoals() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold text-foreground">Our Goals</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          IT Perfect helps students grow as confident, responsible tech helpers who support lessons and school events
          across campus. These are the key goals that guide our work as a team.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GOALS.map((goal) => (
          <Card key={goal.title} className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">{goal.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
