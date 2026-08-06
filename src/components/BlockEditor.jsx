"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function BlockEditor({ workspaceId, slug }){
  const [doc, setDoc] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [versions, setVersions] = useState([]);

  useEffect(()=>{
    if(!workspaceId || !slug) return;
    apiFetch(`/doc/${workspaceId}/${slug}`).then(r=>{
      if(r.ok) return r.json();
      throw new Error('not found');
    }).then(data=>{
      setDoc(data);
      setBlocks(data.blocks||[{ type: 'paragraph', text: '' }]);
      setTitle(data.title||slug);
    }).catch(()=>{
      setBlocks([{ type: 'paragraph', text: '' }]);
      setTitle(slug);
    });
  },[workspaceId, slug]);

  function updateBlock(i, value){
    const copy = [...blocks];
    copy[i] = { ...copy[i], text: value };
    setBlocks(copy);
  }
  function addBlock(type='paragraph'){
    setBlocks([...blocks, { type, text: '' }]);
  }
  function removeBlock(i){
    const copy = [...blocks]; copy.splice(i,1); setBlocks(copy);
  }

  function extractBacklinks(){
    const regex = /\[\[([^\]]+)\]\]/g;
    const set = new Set();
    blocks.forEach(b=>{
      const text = b.text||''; let m; while((m=regex.exec(text))){ set.add(m[1]); }
    });
    return Array.from(set);
  }

  async function save(){
    setStatus('saving');
    const res = await apiFetch('/doc/save', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ workspaceId, slug, title, blocks, author: 'web' })
    });
    if(res.ok){ const json = await res.json(); setStatus('saved v'+json.version); }
    else { setStatus('error'); }
  }

  async function loadVersions(){
    if(!doc?. _id) return;
    const res = await apiFetch(`/doc/${doc._id}/versions`);
    if(res.ok){ const v = await res.json(); setVersions(v); }
  }

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{fontSize:20,padding:8}} />
        <div>
          <button onClick={()=>addBlock('paragraph')}>+Paragraph</button>{' '}
          <button onClick={()=>addBlock('heading')}>+Heading</button>{' '}
          <button onClick={save}>Save</button>{' '}
          <button onClick={loadVersions}>Versions</button>
        </div>
      </div>

      <div>
        {blocks.map((b, i)=>(
          <div key={i} style={{border:'1px solid #eee',padding:8,marginTop:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <select value={b.type} onChange={e=>{ const copy=[...blocks]; copy[i].type=e.target.value; setBlocks(copy); }}>
                <option value="paragraph">Paragraph</option>
                <option value="heading">Heading</option>
                <option value="todo">Todo</option>
              </select>
              <button onClick={()=>removeBlock(i)}>Delete</button>
            </div>
            <div contentEditable suppressContentEditableWarning onInput={(e)=>updateBlock(i, e.currentTarget.textContent)} style={{minHeight:30}}>
              {b.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <strong>Backlinks:</strong>
        <div>{extractBacklinks().map((l,idx)=>(<div key={idx}>{l}</div>))}</div>
      </div>

      <div style={{marginTop:12}}>
        <strong>Status:</strong> {status}
      </div>

      {versions.length>0 && (
        <div style={{marginTop:12}}>
          <h4>Versions</h4>
          <ul>
            {versions.map(v=> (<li key={v._id}>v{v.version} — {new Date(v.createdAt).toLocaleString()}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
