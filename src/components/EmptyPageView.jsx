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
  allPages = [],
  loading = false,
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
        };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
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
      />
    </div>
  );
}
