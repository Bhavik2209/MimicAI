import { redirect } from "next/navigation"

export default async function ProjectTabPage({
  params,
}: {
  params: Promise<{ projectId: string; tab: string }>
}) {
  const { projectId, tab } = await params
  redirect(`/projects/${projectId}?tab=${encodeURIComponent(tab)}`)
}
