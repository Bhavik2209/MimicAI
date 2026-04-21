import type { ProjectResponse, ResearchRunResponse } from "@/lib/api"

const projectListCache = new Map<string, DashboardProject[]>()
const projectCache = new Map<string, DashboardProject>()
const researchCache = new Map<string, ResearchRunResponse>()

export interface DashboardProject {
  id: string
  backendProjectId?: string
  name: string
  description?: string
  targetName: string
  wikidataId: string
  createdDate: string
  updatedDate?: string
  lastUpdated?: string
  imageUrl?: string
  profile: {
    name: string
    initials: string
    category: string
    era: string
  }
  researchData?: ResearchRunResponse
}

export const initialDashboardProfile = {
  name: "Featured Persona",
  category: "Research Subject",
  era: "",
  initials: "FP",
  imageUrl: "",
  tags: ["Biography", "Primary Sources", "Timeline", "Analysis"],
  subtitle:
    "Create a project to generate a grounded profile from research sources and structured analysis.",
  eyebrow: "",
}

export function mapProjectResponse(item: ProjectResponse): DashboardProject {
  const targetName = item.entity_name || "Unknown Entity"
  const initials =
    targetName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "NA"

  return {
    id: item.id,
    backendProjectId: item.id,
    name: item.title,
    description: item.description || undefined,
    targetName,
    wikidataId: item.entity_wikidata_id || item.entity_id || "",
    createdDate: item.created_at,
    updatedDate: item.updated_at,
    imageUrl: item.entity_image_url || undefined,
    lastUpdated: item.updated_at,
    profile: {
      name: targetName,
      initials,
      category: item.entity_wikidata_id || "Wikidata Entity",
      era: "",
    },
  }
}

export function cacheProjects(userId: string, projects: DashboardProject[]) {
  projectListCache.set(userId, projects)
  projects.forEach((project) => {
    projectCache.set(project.id, project)
    if (project.backendProjectId) projectCache.set(project.backendProjectId, project)
    if (project.researchData && project.wikidataId) researchCache.set(project.wikidataId, project.researchData)
  })
}

export function getCachedProjects(userId: string) {
  return projectListCache.get(userId) ?? null
}

export function cacheProject(userId: string, project: DashboardProject) {
  projectCache.set(project.id, project)
  if (project.backendProjectId) projectCache.set(project.backendProjectId, project)
  const existing = getCachedProjects(userId)
  if (existing) {
    const next = existing.some((item) => item.id === project.id)
      ? existing.map((item) => (item.id === project.id ? project : item))
      : [project, ...existing]
    projectListCache.set(userId, next)
  }
}

export function getCachedProject(projectId: string) {
  return projectCache.get(projectId) ?? null
}

export function removeCachedProject(userId: string, projectId: string) {
  const existing = projectCache.get(projectId)
  projectCache.delete(projectId)
  if (existing?.backendProjectId) projectCache.delete(existing.backendProjectId)

  const projects = getCachedProjects(userId)
  if (!projects) return

  const next = projects.filter((item) => item.id !== projectId && item.backendProjectId !== projectId)
  projectListCache.set(userId, next)
}

export function cacheResearch(entityId: string, research: ResearchRunResponse) {
  researchCache.set(entityId, research)
}

export function getCachedResearch(entityId?: string) {
  if (!entityId) return null
  return researchCache.get(entityId) ?? null
}

export function buildProjectContext(project: DashboardProject) {
  return {
    name: project.name,
    createdDate: project.createdDate,
    targetName: project.targetName,
  }
}

export function buildProfile(project: DashboardProject, research?: ResearchRunResponse | null) {
  const tags = [
    research?.basic_info?.description,
    research?.acquisition?.wiki?.wikipedia_title,
    research?.basic_info?.wikidata_id,
  ].filter(Boolean).slice(0, 5) as string[]

  return {
    ...initialDashboardProfile,
    name: project.profile.name,
    initials: project.profile.initials,
    imageUrl: research?.basic_info?.image_url || project.imageUrl || "",
    category: project.profile.category,
    era: project.profile.era,
    subtitle:
      research?.acquisition?.wiki?.intro_summary ||
      research?.basic_info?.description ||
      initialDashboardProfile.subtitle,
    tags: tags.length ? tags : initialDashboardProfile.tags,
    eyebrow: "",
  }
}
