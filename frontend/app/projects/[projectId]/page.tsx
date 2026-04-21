import { ProjectDashboardRoute } from "@/components/routes/project-dashboard-route"

export default async function ProjectPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ tab?: string }>
}>) {
  const { projectId } = await params
  const { tab } = await searchParams
  return <ProjectDashboardRoute projectId={projectId} tab={tab ?? "overview"} />
}
