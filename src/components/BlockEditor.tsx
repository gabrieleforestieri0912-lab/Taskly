"use client";
import { useLanguage } from "../lib/LanguageContext";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function BlockEditor({ workspaceId, slug }){
  const { t } = useLanguage();
  const [doc, setDoc] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [versions, setVersions] = useState<any[]>([]);

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
    const set = new Set<string>();
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
          <button onClick={()=>addBlock('paragraph')}>{t("views.blockAddParagraph")}</button>{' '}
          <button onClick={()=>addBlock('heading')}>{t("views.blockAddHeading")}</button>{' '}
          <button onClick={save}>{t("views.blockSave")}</button>{' '}
          <button onClick={loadVersions}>{t("views.blockVersions")}</button>
        </div>
      </div>

      <div>
        {blocks.map((b, i)=>(
          <div key={i} style={{border:'1px solid #eee',padding:8,marginTop:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <select value={b.type} onChange={e=>{ const copy=[...blocks]; copy[i].type=e.target.value; setBlocks(copy); }}>
                <option value="paragraph">{t("views.blockParagraph")}</option>
                <option value="heading">{t("views.blockHeading")}</option>
                <option value="todo">{t("views.blockTodo")}</option>
              </select>
              <button onClick={()=>removeBlock(i)}>{t("views.blockDelete")}</button>
            </div>
            <div contentEditable suppressContentEditableWarning onInput={(e)=>updateBlock(i, e.currentTarget.textContent)} style={{minHeight:30}}>
              {b.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <strong>{t("views.blockBacklinks")}</strong>
        <div>{extractBacklinks().map((l,idx)=>(<div key={idx}>{l}</div>))}</div>
      </div>

      <div style={{marginTop:12}}>
        <strong>{t("views.blockStatus")}</strong> {status}
      </div>

      {versions.length>0 && (
        <div style={{marginTop:12}}>
          <h4>{t("views.blockVersions")}</h4>
          <ul>
            {versions.map(v=> (<li key={v._id}>v{v.version} — {new Date(v.createdAt).toLocaleString()}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
