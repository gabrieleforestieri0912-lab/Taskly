"use client";

import TaskBoard from "../../../../components/TaskBoard";

export default function BoardPage({ params }) {
  return <TaskBoard workspace={params.id} />;
}
