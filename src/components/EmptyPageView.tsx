import React from "react";
import { EditableTitle } from "./UIComponents";
import NotesView from "./NotesView";

export default function EmptyPageView({
  title,
  data,
  setData,
  onRename,
  onAddPage,
  activePageId,
  allPages = [] as any[],
  loading = false,
  page,
  onIconChange,
  onCoverChange = undefined as ((cover: string | null) => void) | undefined,
  userName,
}) {
  // If the page already uses the block format, pass through. Otherwise normalize.
  const normalized =
    data && typeof data === "object" && Array.isArray(data.blocks)
      ? data
      : {
          blocks: [
            {
              id: "b1",
              type: "text",
              content: typeof data?.text === "string" ? data.text : "",
            },
          ],
          tags: data?.tags || [],
          ...(Array.isArray(data?.comments) ? { comments: data.comments } : {}),
        };

  return (
    <div className="w-full flex flex-col flex-1">
      {/* Empty placeholder removed as requested */}

      <NotesView
        title={title}
        data={normalized}
        setData={(next) => {
          if (next && Array.isArray(next.blocks)) {
            if (next.blocks.length === 1 && next.blocks[0].type === "text") {
              setData({
                text: next.blocks[0].content,
                tags: next.tags || [],
                ...(Array.isArray(next.comments) ? { comments: next.comments } : {}),
              });
            } else {
              setData(next);
            }
          } else {
            setData(next);
          }
        }}
        onRename={onRename}
        onAddPage={onAddPage}
        activePageId={activePageId}
        allPages={allPages}
        loading={loading}
        page={page}
        onIconChange={onIconChange}
        onCoverChange={onCoverChange}
        userName={userName}
        minimalChrome
      />
    </div>
  );
}
