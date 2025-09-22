import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types_db";
import ItpTemplateDetailClient from "@/components/features/itp/ItpTemplateDetailClient";

// Types
type AssetItpTemplate = Database["public"]["Tables"]["assets"]["Row"];

type ItpTemplateDetailPageProps = {
  params: { 
    projectId: string;
    templateId: string; 
  };
};

// Helper function for project authorization
async function authorizeProjectAccess(
  supabase: any,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, created_by_user_id") // Add other fields if needed for more complex auth
    .eq("id", projectId)
    .single();

  if (error || !project) {
    console.warn(`Auth failed: Project ${projectId} not found or error fetching.`);
    return false;
  }
  // Simple auth: user must be the creator. 
  // TODO: Extend to check project membership if applicable.
  if (project.created_by_user_id !== userId) {
    console.warn(`Auth failed: User ${userId} not creator of project ${projectId}.`);
    return false;
  }
  return true;
}

// Helper to fetch ITP template details from assets (assets-only source of truth)
async function getItpTemplateAsset(
  supabase: any,
  assetId: string,
  projectId: string
) {
  const { data: template, error: templateError } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .eq('project_id', projectId)
    .single();

  if (templateError) {
    console.error('Error fetching ITP template asset details:', templateError.message);
    return { template: null, error: templateError.message };
  }
  if (!template) {
    return { template: null, error: 'ITP Template asset not found for this project.' };
  }
  return { template, error: null };
}

export default async function ItpTemplateDetailPage({ params }: ItpTemplateDetailPageProps) {
  const { projectId, templateId } = params;
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?message=Could not authenticate user");
  }

  // Authorize access to the project first
  const isAuthorizedForProject = await authorizeProjectAccess(supabase, projectId, user.id);
  if (!isAuthorizedForProject) {
    notFound();
  }

  // Fetch project details
  const { data: projectData, error: projectFetchError } = await supabase
    .from("projects")
    .select("id, created_by_user_id, project")
    .eq("id", projectId)
    .single();

  if (projectFetchError || !projectData) {
    console.error(`Error fetching project ${projectId} for ITP template detail view:`, projectFetchError);
    notFound();
  }

  // Get template asset details
  const { template, error: fetchError } = await getItpTemplateAsset(supabase, templateId, projectId);

  if (fetchError || !template) {
    console.error("Fetch error for ITP Template Detail Page:", fetchError);
    notFound();
  }

  // Extract project name from JSONB
  const projectName = projectData.project && typeof projectData.project === 'object' && 'name' in projectData.project 
    ? (projectData.project as any).name 
    : 'Project';

  return (
    <ItpTemplateDetailClient
      template={template}
      projectId={projectId}
      templateId={templateId}
      projectName={projectName}
    />
  );
}