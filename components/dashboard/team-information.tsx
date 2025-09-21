import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Target, Award, Shield, Mail, Phone } from "lucide-react"
import { teamMembers } from "@/lib/team-data"

const organizationStructure = [
  {
    level: "Leadership",
    positions: [
      { title: "Head IT Prefect", description: "Overall team leadership and strategic planning" },
      { title: "Deputy Head", description: "Assists head prefect and manages training programs" },
    ],
  },
  {
    level: "Senior Level",
    positions: [
      { title: "Senior Prefects", description: "Lead specific technical areas and mentor junior members" },
      { title: "Specialist Roles", description: "Focus on specialized technical domains" },
    ],
  },
  {
    level: "Junior Level",
    positions: [
      { title: "Junior Prefects", description: "Provide frontline support and learn from senior members" },
      { title: "Trainee Prefects", description: "New members undergoing initial training" },
    ],
  },
]

export function TeamInformation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Team Information</h2>
        <p className="text-muted-foreground">Learn about our mission, structure, and team members</p>
      </div>

      {/* Mission & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              To provide exceptional technical support and maintain robust IT infrastructure that enables seamless
              learning and administrative operations throughout our school community.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Core Values:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Excellence in technical service delivery</li>
                <li>• Proactive problem-solving and innovation</li>
                <li>• Collaborative teamwork and knowledge sharing</li>
                <li>• Continuous learning and professional development</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Our Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Maintain 99% System Uptime</p>
                  <p className="text-xs text-muted-foreground">Ensure reliable access to all school systems</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Reduce Response Time</p>
                  <p className="text-xs text-muted-foreground">Respond to support requests within 15 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Enhance Security</p>
                  <p className="text-xs text-muted-foreground">Implement advanced security protocols</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Expand Training</p>
                  <p className="text-xs text-muted-foreground">Develop comprehensive training programs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizational Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Organizational Structure
          </CardTitle>
          <CardDescription>Understanding our team hierarchy and responsibilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {organizationStructure.map((level) => (
              <div key={level.level} className="space-y-3">
                <h3 className="font-semibold text-primary">{level.level}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {level.positions.map((position) => (
                    <div key={position.title} className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm">{position.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{position.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>Meet our dedicated IT Prefect team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{member.name}</h4>
                      <Badge variant={member.status === "admin" ? "default" : "secondary"} className="text-xs">
                        {member.status === "admin" ? "Admin" : "Prefect"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
