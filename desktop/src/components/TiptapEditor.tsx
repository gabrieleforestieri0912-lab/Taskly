
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { apiFetch } from '../lib/api';

// Simple suggestion renderer adapted from TipTap examples
function createSuggestionFetcher(workspaceId){
  return {
    async items({ query }){
      if(!query) return [];
      try{
        const q = encodeURIComponent(query);
        const res = await apiFetch(`/doc/search?workspace=${workspaceId}&q=${q}`);
        if(!res.ok) return [];
        const items = await res.json();
        // return {id, title}
        return items.map(it=>({ id: it.slug || it.id, label: it.title || it.slug, slug: it.slug }));
      }catch(e){
        return [];
      }
    }
  };
}

export default function TiptapEditor({ workspaceId, slug }){
  const [bracketItems, setBracketItems] = useState([]);
  const [bracketVisible, setBracketVisible] = useState(false);
  const [bracketPos, setBracketPos] = useState({ left: 0, top: 0 });
  const bracketStartRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: {
          char: '@',
          startOfLine: false,
          items: async ({ query }) => {
            if(!workspaceId) return [];
            const q = encodeURIComponent(query.replace(/^@/, ''));
            try{
              const res = await apiFetch(`/doc/search?workspace=${workspaceId}&q=${q}`);
              if(!res.ok) return [];
              const items = await res.json();
              return items.map(it=>({ id: it.slug || it.id, label: it.title || it.slug, slug: it.slug }));
            }catch(e){ return []; }
          },
          render: () => {
            let component;
            let popup;

            return {
              onStart: props => {
                popup = document.createElement('div');
                popup.className = 'tiptap-suggestion';
                popup.style.position = 'absolute';
                popup.style.zIndex = '1000';
                popup.style.background = 'white';
                popup.style.border = '1px solid #ddd';
                popup.style.padding = '4px';
                component = document.createElement('div');
                popup.appendChild(component);
                document.body.appendChild(popup);
                update(props);
              },
              onUpdate: props => update(props),
              onKeyDown: props => {
                return false;
              },
              onExit: () => {
                if(popup){ popup.remove(); popup = null; }
              }
            };

            function update(props){
              component.innerHTML = '';
              const items = props.items;
              if(!items || items.length === 0){ component.textContent = 'No results'; return; }
              items.slice(0,8).forEach((item, idx) => {
                const el = document.createElement('div');
                el.style.padding = '6px 8px';
                el.style.cursor = 'pointer';
                el.textContent = item.label;
                el.onclick = () => props.command({ id: item.id, label: item.label, slug: item.slug });
                component.appendChild(el);
              });
              const el = props.clientRects[0];
              if(!el) return;
              popup.style.left = (el.left + window.scrollX) + 'px';
              popup.style.top = (el.bottom + window.scrollY) + 'px';
            }
          }
        }
      })
    ],
    content: `<p>${slug || ''}</p>`
  });

  // load document content from API and set content if needed
  useEffect(()=>{
    if(!workspaceId || !slug || !editor) return;
    apiFetch(`/doc/${workspaceId}/${slug}`).then(r=>r.ok? r.json(): null).then(data=>{
      if(!data) return;
      const html = (data.blocks || []).map(b => b.type === 'heading' ? `<h3>${escapeHtml(b.text||'')}</h3>` : `<p>${escapeHtml(b.text||'')}</p>`).join('');
      editor.commands.setContent(html);
    }).catch(()=>{});
  },[workspaceId, slug, editor]);

  // bracket trigger: detect [[query and show suggestion popup
  useEffect(()=>{
    if(!editor) return;
    const check = async ()=>{
      const { state } = editor;
      const pos = state.selection.$from.pos;
      const startSearch = Math.max(0, pos - 300);
      const text = state.doc.textBetween(startSearch, pos, '\n', ' ');
      const idx = text.lastIndexOf('[[');
      if(idx === -1){
        if(bracketVisible) { setBracketVisible(false); setBracketItems([]); }
        return;
      }
      const q = text.slice(idx + 2);
      // position
      let left = 0, top = 0;
      try{
        const sel = window.getSelection();
        if(sel.rangeCount){
          const rect = sel.getRangeAt(0).getClientRects()[0];
          if(rect){ left = rect.left; top = rect.bottom; }
        }
      }catch(e){}
      // fetch suggestions
      const query = encodeURIComponent(q);
      try{
        const res = await apiFetch(`/doc/search?workspace=${workspaceId}&q=${query}`);
        if(!res.ok) { setBracketItems([]); setBracketVisible(false); return; }
        const items = await res.json();
        const mapped = items.map(it=>({ label: it.title || it.slug, slug: it.slug }));
        setBracketItems(mapped);
        setBracketPos({ left, top });
        bracketStartRef.current = startSearch + idx; // absolute position where [[ starts
        setBracketVisible(true);
      }catch(e){
        setBracketItems([]);
        setBracketVisible(false);
      }
    };

    const onUpdate = ()=>{ check(); };
    editor.on('update', onUpdate);
    // initial check
    check();
    return ()=>{ editor.off('update', onUpdate); };
  },[editor, workspaceId, bracketVisible]);

  async function selectBracket(item){
    if(!editor) return;
    const start = bracketStartRef.current;
    const pos = editor.state.selection.$from.pos;
    // replace from start to pos with link
    const href = `/workspace/${workspaceId}/doc/${item.slug}`;
    const html = `<a href="${href}" class="internal-link">${escapeHtml(item.label)}</a>&nbsp;`;
    editor.commands.focus();
    editor.commands.insertContentAt({ from: start, to: pos }, html);
    setBracketVisible(false);
    setBracketItems([]);
  }

  return (
    <div style={{position:'relative'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0}}>{slug}</h2>
        <div>
          <button onClick={async ()=>{
            const html = editor.getHTML();
            const temp = document.createElement('div'); temp.innerHTML = html;
            const blocks = Array.from(temp.childNodes).map((n: any)=>({ type: n.tagName==='H3' ? 'heading' : 'paragraph', text: n.textContent }));
            await apiFetch('/doc/save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ workspaceId, slug, title: slug, blocks, author: 'web' }) });
            alert('Saved');
          }}>Save</button>
        </div>
      </div>

      <div style={{border:'1px solid #ddd',padding:12,marginTop:8}}>
        <EditorContent editor={editor} />
      </div>

      {bracketVisible && (
        <div style={{position:'absolute',left:bracketPos.left,top:bracketPos.top,background:'white',border:'1px solid #ddd',zIndex:2000}}>
          {bracketItems.length===0 ? <div style={{padding:8}}>No results</div> : bracketItems.map((it, idx)=> (
            <div key={idx} style={{padding:8,cursor:'pointer'}} onMouseDown={(e)=>{ e.preventDefault(); selectBracket(it); }}>{it.label}</div>
          ))}
        </div>
      )}

      <style>{`.mention{ background:#eef; padding:2px 4px; border-radius:4px;} .tiptap-suggestion div:hover{ background:#f0f0f0; } .internal-link{ color: #0b69ff; text-decoration: underline; }`}</style>
    </div>
  );
}

function escapeHtml(str){ return String(str).replace(/[&<>]/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s])); }


