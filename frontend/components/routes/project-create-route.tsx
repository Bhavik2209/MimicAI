"use client"

import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { CreateProjectFlow } from "@/components/project/create-project-flow"
import { authClient } from "@/lib/auth/client"
import { cacheProject, cacheResearch, mapProjectResponse } from "@/lib/dashboard"
import { toast } from "@/hooks/use-toast"

export function ProjectCreateRoute() {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  return (
    <AppShell activeTab="" onTabChange={() => {}} hideSidebar onLogoClick={() => router.push("/")}>
      <CreateProjectFlow
        onComplete={(_, __, result) => {
          try {
            const project = {
              ...mapProjectResponse(result.projectRecord),
              researchData: result.research,
            }
            if (session?.user.id) {
              cacheProject(session.user.id, project)
            }
            if (project.wikidataId) cacheResearch(project.wikidataId, result.research)
            toast({
              title: "Project ready",
              description: `${project.targetName} has been added to your workspace.`,
            })
            router.push(`/projects/${result.projectRecord.id}?tab=overview`)
          } catch (error) {
            console.error("Project post-create handling failed", error)
            toast({
              title: "Project created, but setup failed",
              description: "Please open the project from your dashboard.",
              variant: "destructive",
            })
            router.push("/projects")
          }
        }}
        onClose={() => router.push("/projects")}
      />
    </AppShell>
  )
}
