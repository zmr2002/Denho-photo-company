import { AdminArticleForm, type AdminArticleFormValues } from "@/components/admin/AdminArticleForm";
import type { AdminRevision } from "@/lib/api/admin";

type ArticleEditorWorkspaceProps = {
  articleId: string;
  canManagePublication: boolean;
  contentVersion: number;
  defaultValues: AdminArticleFormValues;
  isTutorial: boolean;
  revisions: AdminRevision[];
};

export function ArticleEditorWorkspace(props: ArticleEditorWorkspaceProps) {
  return (
    <AdminArticleForm
      articleId={props.articleId}
      canManagePublication={props.canManagePublication}
      contentVersion={props.contentVersion}
      defaultValues={props.defaultValues}
      isTutorial={props.isTutorial}
      revisions={props.revisions}
    />
  );
}
