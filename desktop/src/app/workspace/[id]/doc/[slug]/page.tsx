
"use client";
import MiniChat from '../../../../../components/MiniChat';
import TiptapEditor from '../../../../../components/TiptapEditor';

export default function DocPage({ params }: { params: { id: string; slug: string } }): React.JSX.Element {
  const { id, slug } = params;
  return (<>
      <TiptapEditor workspaceId={id} slug={slug} />
      <MiniChat workspaceId={id} enabled />
    </>);
}



