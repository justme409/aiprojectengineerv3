import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/actions/project-actions";
import { getItpTemplateById } from "@/lib/actions/lot-actions";
import ItpTemplateDetailClient from "@/components/features/itp/ItpTemplateDetailClient";

type ItpTemplateDetailPageProps = {
  params: Promise<{
    projectId: string;
    templateId: string;
  }>;
};

export default async function ItpTemplateDetailPage({ params }: ItpTemplateDetailPageProps) {
  const { projectId, templateId } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/quality/itp-templates/${templateId}`);
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }
  if (project.created_by_user_id !== (session!.user as any).id) {
    notFound();
  }

  const templateResult = await getItpTemplateById(templateId);
  if (!templateResult.success || !templateResult.data || templateResult.data.project_id !== projectId) {
    notFound();
  }

  const template = templateResult.data as any;
  const projectName = project.name || 'Project';

  return (
    <ItpTemplateDetailClient
      template={template}
      projectId={projectId}
      templateId={templateId}
      projectName={projectName}
    />
  );
}

export const revalidate = 0
