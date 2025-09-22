import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/lib/supabase/types_db";
import { SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItpTemplateList, ItpTemplateFromDb as ItpTemplate } from "@/components/features/itp/ItpTemplateList";
import { submitItpTemplateForClientApprovalAction } from "@/lib/actions/itp-template-actions"; // Assuming this action exists
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ItpTemplateListClient from "@/components/features/project/ItpTemplateListClient";

type ItpTemplatePageProps = {
  params: { projectId: string };
};

// Define a type for the expected structure of the 'project' JSONB field
// and the overall project data we expect after the query.
type ProjectJsonData = {
  name?: string;
  project_identifier?: string;
  status?: string;
  // Add other fields from the 'project' jsonb as needed
};

type FetchedProjectData = {
  id: string;
  created_by_user_id: string | null; // Can be null based on your schema/data
  project: ProjectJsonData | null; // The JSONB field itself
};

type ItpTemplateBasic = {
  id: string;
  name: string | null;
  version: string | null;
  status: string | null;
  document_number?: string | null;
};

async function getItpTemplatesForProject(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<ItpTemplateBasic[]> {
  // Fetch ITP templates stored in assets as plan_type itp_template under asset_type 'plan'
  const { data: assets, error: assetError } = await supabase
    .from('assets')
    .select('id, name, status, document_number, content')
    .eq('project_id', projectId)
    .eq('asset_type', 'plan')
    .contains('metadata', { plan_type: 'itp_template' })
    .order('updated_at', { ascending: false });

  if (!assetError && assets && assets.length > 0) {
    return assets.map((a: any) => ({
      id: a.id,
      name: a.name,
      version: (a.content && (a.content as any).version) || null,
      status: a.status,
      document_number: a.document_number ?? null,
    }));
  }

  return [];
}

export default async function ItpTemplatesPage({ params }: ItpTemplatePageProps) {
  const supabase = createClient();
  const { projectId } = params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?message=Could not authenticate user");
  }

  // Optional: Check if user has access to this project
  // This might involve a separate query or be handled by RLS if project_id is directly on itp_templates
  // For now, assuming RLS handles visibility or direct project access checks are done elsewhere.

  const itpTemplates = await getItpTemplatesForProject(supabase, projectId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Inspection and Test Plan Templates</h1>
      <ItpTemplateListClient templates={itpTemplates as any} projectId={projectId} />
    </div>
  );
}
