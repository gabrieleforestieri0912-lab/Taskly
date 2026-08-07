"use client";
import TaskBoard from '../../components/TaskBoard';

export default function TasksPage(){
  const workspace = 'personal';
  return (
    <div style={{padding:16}}>
      <TaskBoard workspace={workspace} />
    </div>
  );
}
