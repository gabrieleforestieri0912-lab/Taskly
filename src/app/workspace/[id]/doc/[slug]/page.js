"use client";
import TiptapEditor from '../../../../../components/TiptapEditor';

export default function DocPage({ params }) {
  const { id, slug } = params;
  return <TiptapEditor workspaceId={id} slug={slug} />;
}
