"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

/**
 * Selezione ad area (marquee / rubber-band) stile Notion.
 *
 * - Il mousedown parte solo dallo spazio vuoto del contenitore: se avviene
 *   su un elemento `[data-selectable-id]` (o su controlli interattivi) non fa
 *   nulla, così click, drag and drop e menu esistenti restano intatti.
 * - Geometria in coordinate viewport (clientX/clientY): gli scroll (del
 *   contenitore, degli antenati e della finestra) sono inclusi implicitamente
 *   perché i rect vengono letti con `getBoundingClientRect()` al momento del
 *   confronto e ricalcolati a ogni scroll durante il drag.
 * - Cache dei bounding rect a inizio drag, invalidata solo dallo scroll.
 * - Listener `mousemove`/`mouseup` su `window`, rimossi nel cleanup.
 * - Disattivato sui touch device (matchMedia hover:none + pointer:coarse).
 */
export interface MarqueeRect {
  /** Coordinata viewport (client) del bordo sinistro. */
  x: number;
  /** Coordinata viewport (client) del bordo superiore. */
  y: number;
  width: number;
  height: number;
}

export interface UseMarqueeSelectionOptions {
  /** Default true. Con false l'handler di mousedown ignora tutto. */
  enabled?: boolean;
  /** Soglia di movimento (px) prima di avviare il rettangolo. Default 4. */
  threshold?: number;
  /** Fascia (px) dal bordo in cui parte l'auto-scroll. Default 28. */
  edgeSize?: number;
  /** Velocità massima di auto-scroll (px per frame). Default 18. */
  maxScrollSpeed?: number;
  /** Chiamata ogni volta che il set selezionato cambia davvero. */
  onSelectionChange?: (ids: string[]) => void;
}

/** Ref del contenitore osservato (va reso `position: relative`). */
export interface MarqueeContainerRef {
  current: HTMLElement | null;
}

export interface UseMarqueeSelectionResult {
  /** Rettangolo corrente in coordinate viewport, null quando inattivo. */
  rect: MarqueeRect | null;
  /** Id selezionati (nuovo Set solo quando il contenuto cambia davvero). */
  selectedIds: Set<string>;
  /** True mentre il rettangolo è visibile / il drag è attivo. */
  isSelecting: boolean;
  /** Da collegare a `onMouseDown` del contenitore. */
  handleMouseDown: (event: ReactMouseEvent) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setSelectedIds: (ids: Iterable<string>) => void;
}

/** Attributo che identifica gli elementi selezionabili nel contenitore. */
export const MARQUEE_SELECTABLE_ATTR = "data-selectable-id";

/** Selettore degli elementi interattivi: il marquee non parte mai da qui. */
const INTERACTIVE_SELECTOR =
  "input,textarea,select,button,a,[data-marquee-ignore]";

interface CachedItem {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface DragSession {
  anchorX: number;
  anchorY: number;
  lastX: number;
  lastY: number;
  active: boolean;
  additive: boolean;
  base: Set<string>;
  cache: CachedItem[];
  cacheDirty: boolean;
  rafId: number;
  prevUserSelect: string;
  scrollChain: HTMLElement[];
  /** Rimozione dei listener registrati per questa sessione. */
  detach: () => void;
}

const DEFAULT_THRESHOLD = 4;
const DEFAULT_EDGE_SIZE = 28;
const DEFAULT_MAX_SPEED = 18;

function normalizeRect(x1: number, y1: number, x2: number, y2: number): MarqueeRect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

function rectsOverlap(rect: MarqueeRect, item: CachedItem): boolean {
  return (
    rect.x < item.right &&
    rect.x + rect.width > item.left &&
    rect.y < item.bottom &&
    rect.y + rect.height > item.top
  );
}

function sameStringSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function isEditableTarget(target: Element | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** Antenati scrollabili del contenitore, dal più interno al più esterno. */
function collectScrollChain(container: HTMLElement): HTMLElement[] {
  const chain: HTMLElement[] = [];
  let el: HTMLElement | null = container;
  while (el) {
    const style = window.getComputedStyle(el);
    const canY =
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1;
    const canX =
      (style.overflowX === "auto" || style.overflowX === "scroll") &&
      el.scrollWidth > el.clientWidth + 1;
    if (canX || canY) chain.push(el);
    el = el.parentElement;
  }
  return chain;
}

function collectSelectableIds(container: HTMLElement): Set<string> {
  const nodes = container.querySelectorAll(`[${MARQUEE_SELECTABLE_ATTR}]`);
  const next = new Set<string>();
  nodes.forEach((node) => {
    const id = node.getAttribute(MARQUEE_SELECTABLE_ATTR);
    if (id) next.add(id);
  });
  return next;
}

export function useMarqueeSelection(
  containerRef: MarqueeContainerRef,
  options: UseMarqueeSelectionOptions = {},
): UseMarqueeSelectionResult {
  const {
    enabled = true,
    threshold = DEFAULT_THRESHOLD,
    edgeSize = DEFAULT_EDGE_SIZE,
    maxScrollSpeed = DEFAULT_MAX_SPEED,
    onSelectionChange,
  } = options;

  const [rect, setRect] = useState<MarqueeRect | null>(null);
  const [selectedIds, setSelectedIdsState] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [isSelecting, setIsSelecting] = useState(false);

  // Specchio sincrono dello stato: unico scrittore è commitSelection
  // (chiamato solo da handler/effect, mai durante il render).
  const selectedRef = useRef<Set<string>>(new Set<string>());
  const sessionRef = useRef<DragSession | null>(null);

  const commitSelection = useCallback(
    (next: Set<string>): void => {
      if (sameStringSet(selectedRef.current, next)) return;
      selectedRef.current = next;
      setSelectedIdsState(next);
      onSelectionChange?.([...next]);
    },
    [onSelectionChange],
  );

  const refreshCache = useCallback(
    (session: DragSession, container: HTMLElement): void => {
      const nodes = container.querySelectorAll(`[${MARQUEE_SELECTABLE_ATTR}]`);
      const cache: CachedItem[] = [];
      nodes.forEach((node) => {
        const id = node.getAttribute(MARQUEE_SELECTABLE_ATTR);
        if (!id) return;
        const r = node.getBoundingClientRect();
        cache.push({ id, left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      });
      session.cache = cache;
      session.cacheDirty = false;
    },
    [],
  );

  const updateFromClient = useCallback(
    (
      session: DragSession,
      container: HTMLElement,
      clientX: number,
      clientY: number,
    ): void => {
      const nextRect = normalizeRect(session.anchorX, session.anchorY, clientX, clientY);
      setRect(nextRect);
      if (session.cacheDirty) refreshCache(session, container);
      const hits = new Set<string>();
      for (const item of session.cache) {
        if (rectsOverlap(nextRect, item)) hits.add(item.id);
      }
      if (session.additive) {
        for (const id of session.base) hits.add(id);
      }
      commitSelection(hits);
    },
    [commitSelection, refreshCache],
  );

  const markDirty = useCallback((): void => {
    const session = sessionRef.current;
    if (session) session.cacheDirty = true;
  }, []);

  const detachSession = useCallback(
    (session: DragSession, onMove: (e: MouseEvent) => void, onUp: () => void): void => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("scroll", markDirty, true);
      if (session.rafId !== 0) {
        cancelAnimationFrame(session.rafId);
        session.rafId = 0;
      }
      document.documentElement.classList.remove("marquee-selecting");
      document.body.style.userSelect = session.prevUserSelect;
    },
    [markDirty],
  );

  /** Auto-scroll con requestAnimationFrame finché il drag resta attivo. */
  const scheduleTick = useCallback((): void => {
    const session = sessionRef.current;
    if (!session || session.rafId !== 0) return;
    const step = (): void => {
      const current = sessionRef.current;
      const container = containerRef.current;
      if (!current || !container || current !== session) return;
      const speedFor = (closeness: number): number =>
        Math.max(2, Math.round((maxScrollSpeed * closeness) / edgeSize));
      let scrolled = false;
      const handled = { x: false, y: false };

      const tryElement = (el: HTMLElement, visible: MarqueeRect): void => {
        let dx = 0;
        let dy = 0;
        if (!handled.x) {
          if (current.lastX < visible.x + edgeSize && el.scrollLeft > 0) {
            dx = -speedFor(visible.x + edgeSize - current.lastX);
          } else if (
            current.lastX > visible.x + visible.width - edgeSize &&
            el.scrollLeft < el.scrollWidth - el.clientWidth
          ) {
            dx = speedFor(current.lastX - (visible.x + visible.width - edgeSize));
          }
        }
        if (!handled.y) {
          if (current.lastY < visible.y + edgeSize && el.scrollTop > 0) {
            dy = -speedFor(visible.y + edgeSize - current.lastY);
          } else if (
            current.lastY > visible.y + visible.height - edgeSize &&
            el.scrollTop < el.scrollHeight - el.clientHeight
          ) {
            dy = speedFor(current.lastY - (visible.y + visible.height - edgeSize));
          }
        }
        if (dx !== 0 || dy !== 0) {
          el.scrollLeft += dx;
          el.scrollTop += dy;
          scrolled = true;
          if (dx !== 0) handled.x = true;
          if (dy !== 0) handled.y = true;
        }
      };

      for (const el of current.scrollChain) {
        const r = el.getBoundingClientRect();
        tryElement(el, { x: r.left, y: r.top, width: r.width, height: r.height });
      }
      // Fallback: scroll della finestra quando nessun antenato scrolla.
      if (!handled.x || !handled.y) {
        const doc = document.documentElement;
        const canX = doc.scrollWidth > window.innerWidth + 1;
        const canY = doc.scrollHeight > window.innerHeight + 1;
        let dx = 0;
        let dy = 0;
        if (!handled.x && canX) {
          if (current.lastX < edgeSize) dx = -speedFor(edgeSize - current.lastX);
          else if (current.lastX > window.innerWidth - edgeSize) {
            dx = speedFor(current.lastX - (window.innerWidth - edgeSize));
          }
        }
        if (!handled.y && canY) {
          if (current.lastY < edgeSize) dy = -speedFor(edgeSize - current.lastY);
          else if (current.lastY > window.innerHeight - edgeSize) {
            dy = speedFor(current.lastY - (window.innerHeight - edgeSize));
          }
        }
        if (dx !== 0 || dy !== 0) {
          window.scrollBy(dx, dy);
          scrolled = true;
        }
      }

      if (scrolled) {
        current.cacheDirty = true;
        updateFromClient(current, container, current.lastX, current.lastY);
      }
      current.rafId = requestAnimationFrame(step);
    };
    session.rafId = requestAnimationFrame(step);
  }, [containerRef, edgeSize, maxScrollSpeed, updateFromClient]);

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent): void => {
      if (!enabled) return;
      if (event.button !== 0) return;
      if (isTouchDevice()) return;
      const container = containerRef.current;
      if (!container) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      // Su un elemento selezionabile non parte: restano click, DnD, menu.
      if (target.closest(`[${MARQUEE_SELECTABLE_ATTR}]`)) return;
      // Mai sopra controlli interattivi o testo editabile.
      if (target.closest(INTERACTIVE_SELECTOR)) return;
      if (target instanceof HTMLElement && target.isContentEditable) return;

      // Spazio vuoto: impedisce l'avvio della selezione nativa del testo.
      event.preventDefault();
      const session: DragSession = {
        anchorX: event.clientX,
        anchorY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        active: false,
        additive: event.shiftKey || event.metaKey || event.ctrlKey,
        base: new Set(selectedRef.current),
        cache: [],
        cacheDirty: true,
        rafId: 0,
        prevUserSelect: "",
        scrollChain: collectScrollChain(container),
        detach: () => {},
      };
      const onMove = (e: MouseEvent): void => {
        session.lastX = e.clientX;
        session.lastY = e.clientY;
        if (!session.active) {
          const moved = Math.hypot(e.clientX - session.anchorX, e.clientY - session.anchorY);
          if (moved < threshold) return;
          session.active = true;
          setIsSelecting(true);
          session.prevUserSelect = document.body.style.userSelect;
          document.body.style.userSelect = "none";
          document.documentElement.classList.add("marquee-selecting");
          refreshCache(session, container);
        }
        updateFromClient(session, container, e.clientX, e.clientY);
      };
      const onUp = (): void => {
        sessionRef.current = null;
        detachSession(session, onMove, onUp);
        setRect(null);
        setIsSelecting(false);
        if (!session.active && !session.additive) {
          // Click su spazio vuoto senza trascinare: deseleziona tutto.
          commitSelection(new Set<string>());
        }
      };
      session.detach = (): void => detachSession(session, onMove, onUp);
      sessionRef.current = session;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("scroll", markDirty, true);
      scheduleTick();
    },
    [
      commitSelection,
      containerRef,
      detachSession,
      enabled,
      markDirty,
      refreshCache,
      scheduleTick,
      threshold,
      updateFromClient,
    ],
  );

  const clearSelection = useCallback((): void => {
    commitSelection(new Set<string>());
  }, [commitSelection]);

  const selectAll = useCallback((): void => {
    const container = containerRef.current;
    if (!container) return;
    commitSelection(collectSelectableIds(container));
  }, [commitSelection, containerRef]);

  const setSelectedIds = useCallback(
    (ids: Iterable<string>): void => {
      commitSelection(new Set(ids));
    },
    [commitSelection],
  );

  // Tastiera: Esc deseleziona, Cmd/Ctrl+A seleziona tutto (mai negli input).
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        if (selectedRef.current.size > 0) commitSelection(new Set<string>());
        return;
      }
      const isSelectAll =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a";
      if (!isSelectAll) return;
      if (isEditableTarget(document.activeElement)) return;
      const container = containerRef.current;
      if (!container) return;
      const active = document.activeElement;
      const focusInside =
        !active || active === document.body || container.contains(active);
      if (!focusInside) return;
      event.preventDefault();
      commitSelection(collectSelectableIds(container));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commitSelection, containerRef, enabled]);

  // Cleanup: rimuove listener/loop e ripristina user-select se smontato in drag.
  useEffect(() => {
    return () => {
      const session = sessionRef.current;
      sessionRef.current = null;
      session?.detach();
    };
  }, []);

  return {
    rect,
    selectedIds,
    isSelecting,
    handleMouseDown,
    clearSelection,
    selectAll,
    setSelectedIds,
  };
}
