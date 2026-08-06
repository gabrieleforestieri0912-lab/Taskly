"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { Node, Extension, mergeAttributes } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Suggestion from "@tiptap/suggestion";
import { apiFetch } from "../lib/api";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  ChevronDown,
  Lightbulb,
  ListChecks,
  Save,
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  Eye,
} from "lucide-react";

/* =========================================================================
 * Custom nodes
 * ====================================================================== */

// ── Toggle (Notion-style collapsible block) ──────────────────────────────
const ToggleTitle = Node.create({
  name: "toggleTitle",
  group: "block",
  content: "inline*",
  defining: true,
  parseHTML: () => [{ tag: 'div[data-type="toggle-title"]' }],
  renderHTML: () => ["div", { "data-type": "toggle-title", class: "toggle-title" }, 0],
});

const ToggleContent = Node.create({
  name: "toggleContent",
  group: "block",
  content: "block+",
  parseHTML: () => [{ tag: 'div[data-type="toggle-content"]' }],
  renderHTML: () => ["div", { "data-type": "toggle-content", class: "toggle-body" }, 0],
});

const Toggle = Node.create({
  name: "toggle",
  group: "block",
  content: "toggleTitle toggleContent",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (el) => el.getAttribute("data-open") === "true",
        renderHTML: (attrs) => ({ "data-open": attrs.open ? "true" : "false" }),
      },
    };
  },

  parseHTML: () => [{ tag: 'div[data-type="toggle"]' }],

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "toggle", class: "toggle-block" }),
      [
        "div",
        { class: "toggle-row" },
        [
          "button",
          { class: "toggle-handle", "data-type": "toggle-handle", contenteditable: "false", type: "button", "aria-label": "Espandi/comprimi" },
          "▸",
        ],
        ["div", { class: "toggle-title-wrap" }, 0],
      ],
      ["div", { class: "toggle-body-wrap" }, 1],
    ];
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: "toggle",
            attrs: { open: true },
            content: [
              { type: "toggleTitle" },
              { type: "toggleContent", content: [{ type: "paragraph" }] },
            ],
          }),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click(view, event) {
              const handle = event.target && event.target.closest
                ? event.target.closest('[data-type="toggle-handle"]')
                : null;
              if (!handle) return false;
              const toggleEl = handle.closest('[data-type="toggle"]');
              if (!toggleEl) return false;

              const pos = view.posAtDOM(toggleEl, 0);
              if (pos === null || pos === undefined) return false;
              const $pos = view.state.doc.resolve(pos);

              let found = null;
              let nodePos = null;
              for (let d = $pos.depth; d >= 0; d--) {
                const n = $pos.node(d);
                if (n && n.type.name === "toggle") {
                  found = n;
                  nodePos = $pos.before(d);
                  break;
                }
              }
              if (!found) return false;

              const tr = view.state.tr.setNodeMarkup(
                nodePos,
                undefined,
                { ...found.attrs, open: !found.attrs.open },
              );
              view.dispatch(tr);
              return true;
            },
          },
        },
      }),
    ];
  },
});

// ── Callout (Notion-style highlighted block with emoji) ──────────────────
const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      icon: {
        default: "💡",
        parseHTML: (el) => el.getAttribute("data-icon") || "💡",
        renderHTML: (attrs) => ({ "data-icon": attrs.icon || "💡" }),
      },
    };
  },

  parseHTML: () => [{ tag: 'div[data-type="callout"]' }],

  renderHTML({ HTMLAttributes, node }) {
    const icon = node.attrs.icon || "💡";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class: "callout-block",
        "data-icon": icon,
        style: `--callout-icon:'${icon}'`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: "callout", attrs: { icon: "💡" } }),
    };
  },
});

// ── Inline toggle (spoiler) — hide/show text inside a paragraph ───────
// An inline node with no separate title: its own text is blurred when
// closed and revealed on click (or on the handle). Clicking the handle
// or the hidden text toggles the `open` attribute.
const InlineToggle = Node.create({
  name: "inlineToggle",
  group: "inline",
  inline: true,
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-open") === "true",
        renderHTML: (attrs) => ({ "data-open": attrs.open ? "true" : "false" }),
      },
    };
  },

  parseHTML: () => [{ tag: 'span[data-type="inline-toggle"]' }],

  renderHTML({ HTMLAttributes, node }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "inline-toggle",
        "data-open": node.attrs.open ? "true" : "false",
        class: "inline-toggle",
      }),
      // Handle is empty on purpose: the ▸/▾ glyph comes from CSS ::before,
      // so no stray text leaks into the ProseMirror content on parse.
      ["span", { class: "inline-toggle-handle", "data-type": "inline-toggle-handle", contenteditable: "false" }],
      ["span", { class: "inline-toggle-text" }, 0],
    ];
  },

  addCommands() {
    return {
      setInlineToggle:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: "inlineToggle",
            attrs: { open: false },
            content: [{ type: "text", text: "Testo nascosto" }],
          }),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click(view, event) {
              const target = event.target;
              const toggleEl =
                target && target.closest
                  ? target.closest('[data-type="inline-toggle"]')
                  : null;
              if (!toggleEl) return false;

              const isClosed = toggleEl.getAttribute("data-open") !== "true";
              const onHandle = !!(target.closest && target.closest('[data-type="inline-toggle-handle"]'));
              // Open state + clicking the text → let the user edit normally
              if (!onHandle && !isClosed) return false;

              const pos = view.posAtDOM(toggleEl, 0);
              if (pos === null || pos === undefined) return false;
              const $pos = view.state.doc.resolve(pos);

              let found = null;
              let nodePos = null;
              // Case 1: pos sits right before the inline node
              const after = $pos.nodeAfter;
              if (after && after.type.name === "inlineToggle") {
                found = after;
                nodePos = $pos.pos;
              } else {
                // Case 2: pos is inside the node's own text
                for (let d = $pos.depth; d >= 1; d--) {
                  const n = $pos.node(d);
                  if (n && n.type.name === "inlineToggle") {
                    found = n;
                    nodePos = $pos.before(d);
                    break;
                  }
                }
              }
              if (!found) return false;

              view.dispatch(
                view.state.tr.setNodeMarkup(nodePos, undefined, {
                  ...found.attrs,
                  open: !found.attrs.open,
                }),
              );
              return true;
            },
          },
        },
      }),
    ];
  },
});

// ── Task item (to-do list) — official extension + Backspace-to-lift ─────
// Pressing Backspace on an empty item exits the list (Notion-style), instead
// of the default ProseMirror behavior (select/delete the whole node).
const TaskItemWithBackspace = TaskItem.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from } = selection;
        if (!selection.empty || $from.parentOffset !== 0) return false;
        if ($from.parent.textContent.length > 0) return false;
        const parentNode = $from.node($from.depth - 1);
        if (parentNode && parentNode.type.name === "taskItem") {
          return this.editor.commands.liftListItem("taskItem");
        }
        return false;
      },
    };
  },
});

/* =========================================================================
 * Slash command menu (/)
 * ====================================================================== */
const SLASH_ITEMS = [
  { id: "paragraph", title: "Testo", description: "Paragrafo normale", icon: "📝", keywords: "paragrafo testo text normal" },
  { id: "h1", title: "Titolo 1", description: "Sezione principale", icon: "🔠", keywords: "heading titolo h1" },
  { id: "h2", title: "Titolo 2", description: "Sottosezione", icon: "🔡", keywords: "heading titolo h2" },
  { id: "h3", title: "Titolo 3", description: "Sottosottosezione", icon: "🔤", keywords: "heading titolo h3" },
  { id: "toggle", title: "Toggle", description: "Blocco comprimibile", icon: "🔽", keywords: "toggle details nascondi expand" },
  { id: "inlineToggle", title: "Spoiler", description: "Testo nascosto da mostrare al clic", icon: "👁", keywords: "spoiler nascondi mostra hide show inline toggle segreto testo nascosto" },
  { id: "callout", title: "Callout", description: "Nota evidenziata", icon: "💡", keywords: "callout nota highlight" },
  { id: "taskList", title: "To-do list", description: "Lista con checkbox", icon: "☑", keywords: "todo task checkbox to-do lista attività" },
  { id: "bulletList", title: "Elenco puntato", description: "Lista con pallini", icon: "•", keywords: "list elenco bullet ul" },
  { id: "orderedList", title: "Elenco numerato", description: "Lista con numeri", icon: "1.", keywords: "list elenco numerato ol" },
  { id: "blockquote", title: "Citazione", description: "Testo citato", icon: "❝", keywords: "quote citazione blockquote" },
  { id: "codeBlock", title: "Codice", description: "Blocco di codice", icon: "`", keywords: "code codice" },
  { id: "horizontalRule", title: "Divisore", description: "Separatore orizzontale", icon: "—", keywords: "divider divisore hr" },
];

function runSlashCommand(editor, id) {
  if (!editor) return;
  const focus = () => editor.chain().focus();
  switch (id) {
    case "h1": return focus().toggleHeading({ level: 1 }).run();
    case "h2": return focus().toggleHeading({ level: 2 }).run();
    case "h3": return focus().toggleHeading({ level: 3 }).run();
    case "toggle": return editor.chain().focus().setToggle().run();
    case "inlineToggle": return editor.chain().focus().setInlineToggle().run();
    case "callout": return editor.chain().focus().setCallout().run();
    case "taskList": return editor.chain().focus().toggleTaskList().run();
    case "bulletList": return focus().toggleBulletList().run();
    case "orderedList": return focus().toggleOrderedList().run();
    case "blockquote": return focus().toggleBlockquote().run();
    case "codeBlock": return focus().toggleCodeBlock().run();
    case "horizontalRule": return focus().setHorizontalRule().run();
    default: return focus().setParagraph().run();
  }
}

const SlashCommand = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: true,
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          runSlashCommand(editor, props.id);
        },
        items: ({ query }) => {
          const q = (query || "").toLowerCase();
          return SLASH_ITEMS.filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.keywords.includes(q),
          );
        },
        render: () => {
          let popup = null;
          let listEl = null;
          return {
            onStart: (props) => {
              popup = document.createElement("div");
              popup.className = "tl-suggestion-popup";
              listEl = document.createElement("div");
              popup.appendChild(listEl);
              document.body.appendChild(popup);
              renderItems(props);
            },
            onUpdate: (props) => renderItems(props),
            onKeyDown: () => false,
            onExit: () => {
              if (popup) {
                popup.remove();
                popup = null;
              }
            },
          };
          function renderItems(props) {
            if (!listEl) return;
            const items = props.items || [];
            const selected = props.selectedIndex != null ? props.selectedIndex : -1;
            listEl.innerHTML = "";
            if (items.length === 0) {
              const empty = document.createElement("div");
              empty.className = "tl-suggestion-empty";
              empty.textContent = "Nessun risultato";
              listEl.appendChild(empty);
              return;
            }
            items.slice(0, 12).forEach((item, idx) => {
              const row = document.createElement("button");
              row.type = "button";
              row.className = "tl-suggestion-item" + (idx === selected ? " active" : "");
              row.innerHTML =
                `<span class="tl-suggestion-icon">${item.icon}</span>` +
                `<span class="tl-suggestion-meta"><span class="tl-suggestion-title">${item.title}</span>` +
                `<span class="tl-suggestion-desc">${item.description}</span></span>`;
              row.onmousedown = (e) => {
                e.preventDefault();
                props.command(item);
              };
              row.onmouseenter = () => {
                // keep highlight in sync when hovering
              };
              listEl.appendChild(row);
            });
            position(props);
          }
          function position(props) {
            if (!popup) return;
            const rect =
              typeof props.clientRect === "function" ? props.clientRect() : null;
            if (!rect) return;
            const space = 10;
            let left = rect.left + window.scrollX;
            let top = rect.bottom + window.scrollY + space;
            if (left + 280 > window.innerWidth) left = window.innerWidth - 280;
            popup.style.left = left + "px";
            popup.style.top = top + "px";
          }
        },
      }),
    ];
  },
});

/* =========================================================================
 * Block serialization (ProseMirror doc ⇄ { type, text, html }[] API format)
 * - `text`  : plain text (search, fallback, legacy editors)
 * - `html`  : rich HTML with inline marks/links/mentions (Tiptap round-trip)
 * ====================================================================== */
function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escAttr(str) {
  return esc(str).replace(/'/g, "&#39;");
}

const MARK_TAGS = { bold: "strong", italic: "em", strike: "s", code: "code" };

function wrapMarks(inner, marks) {
  let out = inner;
  (marks || []).forEach((mark) => {
    if (mark.type.name === "link") {
      const href = mark.attrs.href || "";
      const cls = href.includes("/doc/") ? ' class="internal-link"' : "";
      out = `<a href="${escAttr(href)}"${cls}>${out}</a>`;
    } else if (MARK_TAGS[mark.type.name]) {
      const tag = MARK_TAGS[mark.type.name];
      out = `<${tag}>${out}</${tag}>`;
    }
  });
  return out;
}

// Serialize inline content (text + marks + mentions + links) to HTML
function inlineToHtml(parentNode) {
  let html = "";
  parentNode.forEach((node) => {
    let inner;
    if (node.isText) {
      inner = esc(node.text || "");
    } else if (node.type.name === "mention") {
      const label = node.attrs.label || node.textContent || "";
      inner =
        `<span data-type="mention" data-id="${escAttr(node.attrs.id || "")}" data-label="${escAttr(label)}">` +
        `@${esc(label)}</span>`;
    } else if (node.type.name === "hardBreak") {
      inner = "<br/>";
    } else if (node.type.name === "inlineToggle") {
      // Same DOM as renderHTML so the round-trip preserves state + text
      const content = inlineToHtml(node);
      inner =
        `<span data-type="inline-toggle" data-open="${node.attrs.open ? "true" : "false"}" class="inline-toggle">` +
        `<span class="inline-toggle-handle" contenteditable="false"></span>` +
        `<span class="inline-toggle-text">${content}</span>` +
        `</span>`;
    } else if (node.isAtom) {
      inner = esc(node.textContent);
    } else {
      inner = inlineToHtml(node);
    }
    html += wrapMarks(inner, node.marks || []);
  });
  return html;
}

function collectBlocks(parentNode) {
  const out = [];
  parentNode.forEach((node) => {
    const b = nodeToBlock(node);
    if (b) out.push(b);
  });
  return out;
}

function listItems(listNode) {
  const items = [];
  listNode.forEach((item) => {
    const texts = [];
    const htmlParts = [];
    item.forEach((child) => {
      if (child.isTextblock) {
        texts.push(child.textContent);
        htmlParts.push(inlineToHtml(child));
      }
    });
    items.push({ text: texts.join(" "), html: htmlParts.join("<br/>") });
  });
  return items;
}

function nodeToBlock(node) {
  switch (node.type.name) {
    case "heading":
      return { type: "heading", level: node.attrs.level || 2, text: node.textContent, html: inlineToHtml(node) };
    case "toggle": {
      let title = "";
      let titleHtml = "";
      let children = [];
      node.forEach((child) => {
        if (child.type.name === "toggleTitle") {
          title = child.textContent;
          titleHtml = inlineToHtml(child);
        }
        if (child.type.name === "toggleContent") children = collectBlocks(child);
      });
      return { type: "toggle", open: !!node.attrs.open, title, titleHtml, children };
    }
    case "callout":
      return { type: "callout", icon: node.attrs.icon || "💡", text: node.textContent, html: inlineToHtml(node) };
    case "bulletList":
      return { type: "bulletList", items: listItems(node) };
    case "orderedList":
      return { type: "orderedList", items: listItems(node) };
    case "taskList": {
      const items = [];
      node.forEach((item) => {
        const texts = [];
        const htmlParts = [];
        item.forEach((child) => {
          if (child.isTextblock) {
            texts.push(child.textContent);
            htmlParts.push(inlineToHtml(child));
          }
        });
        items.push({
          text: texts.join(" "),
          html: htmlParts.join("<br/>"),
          checked: !!item.attrs.checked,
        });
      });
      return { type: "todoList", items };
    }
    case "blockquote": {
      const texts = [];
      const htmlParts = [];
      node.forEach((child) => {
        if (child.isTextblock) {
          texts.push(child.textContent);
          htmlParts.push(inlineToHtml(child));
        }
      });
      return { type: "blockquote", text: texts.join(" "), html: htmlParts.join("<br/>") };
    }
    case "codeBlock":
      // code is plain text: keep it raw and escape on load
      return { type: "codeBlock", text: node.textContent };
    case "horizontalRule":
      return { type: "divider" };
    default:
      return { type: "paragraph", text: node.textContent, html: inlineToHtml(node) };
  }
}

function serializeBlocks(doc) {
  return collectBlocks(doc);
}

// Prefer the rich HTML; fall back to escaped plain text (legacy blocks)
function blockText(b) {
  return b.html ? b.html : esc(b.text || "");
}

function listItemHtml(item) {
  return item && item.html ? item.html : esc((item && item.text) || "");
}

function blockToHtml(b) {
  const type = (b && b.type) || "paragraph";
  switch (type) {
    case "heading": {
      // Legacy blocks have no level: keep the old h3 rendering
      const level = b.level && [1, 2, 3].includes(b.level) ? b.level : 3;
      return `<h${level}>${blockText(b)}</h${level}>`;
    }
    case "toggle":
      return (
        `<div data-type="toggle" data-open="${b.open ? "true" : "false"}">` +
        `<div data-type="toggle-title">${b.titleHtml ? b.titleHtml : esc(b.title || "")}</div>` +
        `<div data-type="toggle-content">${blocksToHtml(b.children)}</div>` +
        `</div>`
      );
    case "callout":
      return `<div data-type="callout" data-icon="${escAttr(b.icon || "💡")}">${blockText(b)}</div>`;
    case "bulletList":
      return `<ul>${(b.items || []).map((i) => `<li>${listItemHtml(i)}</li>`).join("")}</ul>`;
    case "orderedList":
      return `<ol>${(b.items || []).map((i) => `<li>${listItemHtml(i)}</li>`).join("")}</ol>`;
    case "todoList":
      // Rendered to match @tiptap/extension-task-list DOM (ul/li + label + div),
      // so it round-trips back into taskList/taskItem nodes on load.
      return (
        `<ul data-type="taskList">` +
        (b.items || [])
          .map((i) => {
            const inner = i && (i.html || i.text) ? listItemHtml(i) : "<p></p>";
            return (
              `<li data-type="taskItem" data-checked="${i && i.checked ? "true" : "false"}">` +
              `<label><input type="checkbox"${i && i.checked ? ' checked="checked"' : ""}><span></span></label>` +
              `<div>${inner}</div></li>`
            );
          })
          .join("") +
        `</ul>`
      );
    case "blockquote":
      return `<blockquote><p>${blockText(b)}</p></blockquote>`;
    case "codeBlock":
      return `<pre><code>${esc(b.text || "")}</code></pre>`;
    case "divider":
      return "<hr/>";
    case "todo":
      return `<p>${esc(b.text || "")}</p>`;
    default:
      return `<p>${blockText(b)}</p>`;
  }
}

function blocksToHtml(blocks) {
  return (blocks || []).map(blockToHtml).join("");
}

/* =========================================================================
 * Component
 * ====================================================================== */
const ToolButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={active ? "is-active" : ""}
  >
    {children}
  </button>
);

export default function TiptapEditor({ workspaceId, slug }) {
  const router = useRouter();
  const [bracketItems, setBracketItems] = useState([]);
  const [bracketVisible, setBracketVisible] = useState(false);
  const [bracketPos, setBracketPos] = useState({ left: 0, top: 0 });
  const bracketStartRef = useRef(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const saveTimerRef = useRef(null);
  const lastSavedJsonRef = useRef(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkHref, setLinkHref] = useState("");
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      // Click on links: internal → Next.js navigation (flushing the pending
      // autosave first), external → new tab. Only safe schemes are opened
      // directly; anything else is treated as a path or ignored.
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            const $pos = view.state.doc.resolve(pos);
            const linkMark = $pos.marks().find((m) => m.type.name === "link");
            if (!linkMark) return false;
            const href = linkMark.attrs.href || "";
            if (href.startsWith("#")) return false; // in-page anchor
            event.preventDefault();
            const newTab = event.metaKey || event.ctrlKey;
            if (/^(https?:|mailto:|tel:)/i.test(href)) {
              window.open(href, "_blank", "noopener,noreferrer");
            } else if (href.startsWith("/")) {
              window.dispatchEvent(
                new CustomEvent("tl-open-link", { detail: { href, newTab } }),
              );
            } else if (/^[a-z]+:/i.test(href)) {
              return false; // unknown scheme: do not navigate
            } else {
              window.dispatchEvent(
                new CustomEvent("tl-open-link", { detail: { href: "/" + href, newTab } }),
              );
            }
            return true;
          },
        },
      }),
      ToggleTitle,
      ToggleContent,
      Toggle,
      Callout,
      InlineToggle,
      TaskList.configure({ HTMLAttributes: { class: "todo-list" } }),
      TaskItemWithBackspace,
      SlashCommand,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          char: "@",
          startOfLine: false,
          items: async ({ query }) => {
            if (!workspaceId) return [];
            const q = encodeURIComponent(query.replace(/^@/, ""));
            try {
              const res = await apiFetch(`/doc/search?workspace=${workspaceId}&q=${q}`);
              if (!res.ok) return [];
              const items = await res.json();
              return items.map((it) => ({ id: it.slug || it.id, label: it.title || it.slug, slug: it.slug }));
            } catch (e) {
              return [];
            }
          },
          render: () => {
            let popup = null;
            let listEl = null;
            return {
              onStart: (props) => {
                popup = document.createElement("div");
                popup.className = "tl-suggestion-popup tl-mention-popup";
                listEl = document.createElement("div");
                popup.appendChild(listEl);
                document.body.appendChild(popup);
                renderItems(props);
              },
              onUpdate: (props) => renderItems(props),
              onKeyDown: () => false,
              onExit: () => {
                if (popup) {
                  popup.remove();
                  popup = null;
                }
              },
            };
            function renderItems(props) {
              if (!listEl) return;
              const items = props.items || [];
              listEl.innerHTML = "";
              if (items.length === 0) {
                const empty = document.createElement("div");
                empty.className = "tl-suggestion-empty";
                empty.textContent = "Nessun documento trovato";
                listEl.appendChild(empty);
                return;
              }
              items.slice(0, 8).forEach((item) => {
                const row = document.createElement("button");
                row.type = "button";
                row.className = "tl-suggestion-item";
                row.innerHTML =
                  `<span class="tl-suggestion-icon">📄</span>` +
                  `<span class="tl-suggestion-meta"><span class="tl-suggestion-title">${esc(item.label)}</span></span>`;
                row.onmousedown = (e) => {
                  e.preventDefault();
                  props.command({ id: item.id, label: item.label, slug: item.slug });
                };
                listEl.appendChild(row);
              });
              const rect = typeof props.clientRect === "function" ? props.clientRect() : null;
              if (rect && popup) {
                popup.style.left = rect.left + window.scrollX + "px";
                popup.style.top = rect.bottom + window.scrollY + 10 + "px";
              }
            }
          },
        },
      }),
    ],
    content: `<p></p>`,
  });

  const save = useCallback(async () => {
    if (!editor) return;
    const blocks = serializeBlocks(editor.state.doc);
    const json = JSON.stringify(blocks);
    if (json === lastSavedJsonRef.current) return;
    setSaveState("saving");
    try {
      const res = await apiFetch("/doc/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, slug, title: slug, blocks, author: "web" }),
      });
      if (res.ok) {
        lastSavedJsonRef.current = json;
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2500);
      } else {
        setSaveState("error");
      }
    } catch (e) {
      console.error("save error", e);
      setSaveState("error");
    }
  }, [editor, workspaceId, slug]);

  // Load document content from API
  useEffect(() => {
    if (!workspaceId || !slug || !editor) return;
    apiFetch(`/doc/${workspaceId}/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const html = blocksToHtml(data.blocks || []);
        editor.commands.setContent(html || "<p></p>");
        lastSavedJsonRef.current = JSON.stringify(serializeBlocks(editor.state.doc));
      })
      .catch(() => {});
  }, [workspaceId, slug, editor]);

  // Debounced autosave
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        save();
      }, 2000);
    };
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      clearTimeout(saveTimerRef.current);
    };
  }, [editor, save]);

  // Cmd/Ctrl+S
  useEffect(() => {
    if (!editor) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor, save]);

  // Internal link navigation: flush the pending autosave, then navigate
  useEffect(() => {
    const onOpenLink = (e) => {
      const { href, newTab } = e.detail || {};
      if (!href) return;
      if (newTab) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }
      save().then(() => {
        router.push(href);
      });
    };
    window.addEventListener("tl-open-link", onOpenLink);
    return () => window.removeEventListener("tl-open-link", onOpenLink);
  }, [save, router]);

  // Leave link-edit mode when the selection collapses (menu hides)
  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = () => {
      if (editor.state.selection.empty) setLinkMode(false);
    };
    editor.on("selectionUpdate", onSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor]);

  // Bracket [[ trigger: link to another doc
  useEffect(() => {
    if (!editor) return;
    const check = async () => {
      const { state } = editor;
      const pos = state.selection.$from.pos;
      const startSearch = Math.max(0, pos - 300);
      const text = state.doc.textBetween(startSearch, pos, "\n", " ");
      const idx = text.lastIndexOf("[[");
      if (idx === -1) {
        if (bracketVisible) {
          setBracketVisible(false);
          setBracketItems([]);
        }
        return;
      }
      const q = text.slice(idx + 2);
      let left = 0;
      let top = 0;
      try {
        const sel = window.getSelection();
        if (sel.rangeCount) {
          const rect = sel.getRangeAt(0).getClientRects()[0];
          if (rect) {
            left = rect.left;
            top = rect.bottom;
          }
        }
      } catch (e) {}
      const query = encodeURIComponent(q);
      try {
        const res = await apiFetch(`/doc/search?workspace=${workspaceId}&q=${query}`);
        if (!res.ok) {
          setBracketItems([]);
          setBracketVisible(false);
          return;
        }
        const items = await res.json();
        const mapped = items.map((it) => ({ label: it.title || it.slug, slug: it.slug }));
        setBracketItems(mapped);
        setBracketPos({ left, top });
        bracketStartRef.current = startSearch + idx;
        setBracketVisible(true);
      } catch (e) {
        setBracketItems([]);
        setBracketVisible(false);
      }
    };

    const onUpdate = () => {
      check();
    };
    editor.on("update", onUpdate);
    check();
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, workspaceId, bracketVisible]);

  function selectBracket(item) {
    if (!editor) return;
    const start = bracketStartRef.current;
    const pos = editor.state.selection.$from.pos;
    const href = `/workspace/${workspaceId}/doc/${item.slug}`;
    const html = `<a href="${href}" class="internal-link">${esc(item.label)}</a>&nbsp;`;
    editor.commands.focus();
    editor.commands.insertContentAt({ from: start, to: pos }, html);
    setBracketVisible(false);
    setBracketItems([]);
  }

  function openLinkEditor() {
    const current = editor.getAttributes("link").href || "";
    setLinkHref(current);
    setLinkMode(true);
  }

  function applyLink() {
    const href = linkHref.trim();
    const chain = editor.chain().focus();
    if (href) {
      chain.extendMarkRange("link").setLink({ href }).run();
    } else {
      chain.extendMarkRange("link").unsetLink().run();
    }
    setLinkMode(false);
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkMode(false);
  }

  if (!editor) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center text-gray-400 text-sm font-medium">
        Caricamento editor…
      </div>
    );
  }

  const saveLabel = {
    idle: "Salva",
    saving: "Salvataggio…",
    saved: "Salvato ✓",
    error: "Errore",
  }[saveState];

  return (
    <div className="tl-editor-shell">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="tl-toolbar">
        <ToolButton title="Titolo 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </ToolButton>
        <ToolButton title="Titolo 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton title="Titolo 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolButton>
        <span className="tl-toolbar-sep" />
        <ToolButton title="Elenco puntato" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton title="Elenco numerato" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton title="Citazione" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolButton>
        <ToolButton title="Codice" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={16} />
        </ToolButton>
        <ToolButton title="Divisore" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={16} />
        </ToolButton>
        <span className="tl-toolbar-sep" />
        <ToolButton title="Toggle" active={editor.isActive("toggle")} onClick={() => editor.chain().focus().setToggle().run()}>
          <ChevronDown size={16} />
        </ToolButton>
        <ToolButton title="Spoiler (testo nascosto)" active={editor.isActive("inlineToggle")} onClick={() => editor.chain().focus().setInlineToggle().run()}>
          <Eye size={16} />
        </ToolButton>
        <ToolButton title="Callout" active={editor.isActive("callout")} onClick={() => editor.chain().focus().setCallout().run()}>
          <Lightbulb size={16} />
        </ToolButton>
        <ToolButton title="To-do list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks size={16} />
        </ToolButton>
        <span className="tl-toolbar-sep" />
        <button
          type="button"
          className="tl-save-btn"
          onClick={save}
          disabled={saveState === "saving"}
          title="Salva (Ctrl/Cmd+S)"
        >
          <Save size={14} />
          <span>{saveLabel}</span>
        </button>
      </div>

      <div className="tl-editor">
        {/* ── Bubble menu (bold/italic/strike/link) ────────────── */}
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 120, maxWidth: "auto", interactive: true }}
          shouldShow={({ editor: e }) => {
            if (!e || e.state.selection.empty) return false;
            const { $from } = e.state.selection;
            const node = $from.parent;
            return !node.isAtom && !e.isActive("codeBlock") && !e.isActive("toggle");
          }}
        >
          {linkMode ? (
            <div className="tl-link-editor">
              <input
                ref={linkInputRef}
                type="text"
                value={linkHref}
                onChange={(e) => setLinkHref(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === "Escape") setLinkMode(false);
                }}
                placeholder="https://… oppure /workspace/…"
                className="tl-link-input"
                autoFocus
              />
              <button type="button" onClick={applyLink} title="Applica link">
                <Check size={15} />
              </button>
              <button type="button" onClick={removeLink} title="Rimuovi link">
                <Unlink size={15} />
              </button>
              <button type="button" onClick={() => setLinkMode(false)} title="Chiudi">
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="tl-bubble">
              <button
                type="button"
                className={editor.isActive("bold") ? "is-active" : ""}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Grassetto"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                className={editor.isActive("italic") ? "is-active" : ""}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Corsivo"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                className={editor.isActive("strike") ? "is-active" : ""}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Barrato"
              >
                <Strikethrough size={15} />
              </button>
              <span className="tl-bubble-sep" />
              <button
                type="button"
                className={editor.isActive("link") ? "is-active" : ""}
                onClick={openLinkEditor}
                title="Link"
              >
                <LinkIcon size={15} />
              </button>
            </div>
          )}
        </BubbleMenu>

        <EditorContent editor={editor} />

        <p className="tl-hint">
          Premi <kbd>/</kbd> per i comandi · <kbd>[[</kbd> per collegare una pagina ·{" "}
          <kbd>@</kbd> per menzionare · <kbd>Ctrl/⌘+S</kbd> per salvare
        </p>
      </div>

      {/* ── Bracket [[ popup ───────────────────────────────────── */}
      {bracketVisible && (
        <div
          className="tl-suggestion-popup"
          style={{ position: "absolute", left: bracketPos.left, top: bracketPos.top, zIndex: 3000 }}
        >
          {bracketItems.length === 0 ? (
            <div className="tl-suggestion-empty">Nessun risultato</div>
          ) : (
            bracketItems.map((it, idx) => (
              <button
                key={idx}
                type="button"
                className="tl-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectBracket(it);
                }}
              >
                <span className="tl-suggestion-icon">🔗</span>
                <span className="tl-suggestion-meta">
                  <span className="tl-suggestion-title">{it.label}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
