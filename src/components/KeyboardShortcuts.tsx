"use client";
import { useEffect } from 'react';

export default function KeyboardShortcuts(){
  useEffect(()=>{
    function onKey(e){
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){
        e.preventDefault();
        const el =
          (document.querySelector('input[role="search"]') ||
            document.querySelector('input')) as HTMLElement | null;
        if (el) {
          el.focus();
        }
      }
      if((e.ctrlKey||e.metaKey) && e.key === '?'){
        e.preventDefault();
        alert('Keyboard shortcuts:\nCmd/Ctrl+K — focus search');
      }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);
  return null;
}
