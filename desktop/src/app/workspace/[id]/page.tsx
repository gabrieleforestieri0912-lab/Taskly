"use client";
import WorkspaceDashboard from "./WorkspaceDashboard";

export default function WorkspacePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black">Workspace</h1>
        <p className="text-sm text-gray-500">Dashboard customizzabile: trascina i widget. Minichat disattivata qui.</p>
      </div>
      <WorkspaceDashboard />
    </div>
  );
}
