"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function TaskBoard({ workspace }){
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(()=>{ if(!workspace) return; apiFetch(`/tasks?workspace=${workspace}`).then(r=>r.json()).then(setTasks).catch(()=>{}); },[workspace]);
  return (
    <div>
      <h3>Tasks</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {['todo','inprogress','done'].map(status=> (
          <div key={status} style={{border:'1px solid #eee',padding:8}}>
            <h4>{status}</h4>
            {tasks.filter(t=>t.status===status).map(t=> (
              <div key={t._id} style={{padding:6,borderBottom:'1px dashed #eee'}}>{t.title}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
