"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function Notifications({ workspace, user }){
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ if(!workspace && !user) return; apiFetch(`/notifications?workspace=${workspace||''}`).then(r=>r.json()).then(setItems).catch(()=>{}); },[workspace,user]);
  return (
    <div aria-live="polite">
      {items.slice(0,10).map(it=> (
        <div key={it._id} style={{padding:8,borderBottom:'1px solid #eee'}}>
          <div style={{fontWeight:600}}>{it.title}</div>
          <div style={{fontSize:12,color:'#666'}}>{it.body}</div>
        </div>
      ))}
    </div>
  );
}
