import { useEffect, useRef, useState, type PointerEvent, type ReactElement } from "react";
import { Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ArtworkImage } from "@/data/catalog";

type Point = { x: number; y: number };
type View = Point & { scale: number };

const maxScale = 4;
const zoomStep = 1.5;
const initialView: View = { x: 0, y: 0, scale: 1 };

const limit = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function constrain(view: View, width: number, height: number): View {
  if (view.scale === 1) return initialView;
  const maxX = width * (view.scale - 1) / 2;
  const maxY = height * (view.scale - 1) / 2;
  const x = limit(view.x, -maxX, maxX);
  const y = limit(view.y, -maxY, maxY);
  return x === view.x && y === view.y ? view : { ...view, x, y };
}

export function ArtworkLightbox({ image, title, children }: { image: ArtworkImage; title: string; children: ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="w-max max-w-none gap-0 rounded-md border-primary/50 bg-card p-[var(--frame-padding)] shadow-2xl
          [--frame-padding:8px] [--frame-margin:8px] sm:[--frame-padding:12px] sm:[--frame-margin:16px]
          [--image-inset:calc((var(--frame-margin)_+_var(--frame-padding)_+_1px)_*_2)]
          [&>button]:right-[calc(var(--frame-padding)_+_6px)] [&>button]:top-[calc(var(--frame-padding)_+_6px)]
          [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-full [&>button]:opacity-100
          [&>button[data-state=open]]:bg-black/75 [&>button[data-state=open]]:text-white"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <ArtworkImagePreview src={image.src} alt={image.alt} />
      </DialogContent>
    </Dialog>
  );
}

function ArtworkImagePreview({ src, alt }: { src: string; alt: string }) {
  const [view, setView] = useState(initialView);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<(Point & { id: number }) | null>(null);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = element;
      setView((current) => constrain(current, clientWidth, clientHeight));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function changeZoom(factor: number) {
    const element = viewport.current;
    if (!element) return;
    const { clientWidth, clientHeight } = element;
    setView((current) => {
      const scale = limit(current.scale * factor, 1, maxScale);
      const ratio = scale / current.scale;
      return constrain({ scale, x: current.x * ratio, y: current.y * ratio }, clientWidth, clientHeight);
    });
  }

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (view.scale === 1 || !event.isPrimary || event.button !== 0 || drag.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    const before = drag.current;
    if (before?.id !== event.pointerId) return;
    const after = { x: event.clientX, y: event.clientY };
    drag.current = { id: event.pointerId, ...after };
    const { clientWidth, clientHeight } = event.currentTarget;
    setView((current) => constrain({
      scale: current.scale,
      x: current.x + after.x - before.x,
      y: current.y + after.y - before.y,
    }, clientWidth, clientHeight));
  }

  function stopPointer(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  return (
    <div className="relative">
      <div
        ref={viewport}
        data-zoomed={view.scale > 1}
        className="overflow-hidden select-none data-[zoomed=true]:touch-none data-[zoomed=true]:cursor-grab data-[zoomed=true]:active:cursor-grabbing"
        onPointerDown={startPointer}
        onPointerMove={movePointer}
        onPointerUp={stopPointer}
        onPointerCancel={stopPointer}
        onLostPointerCapture={stopPointer}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="block h-auto w-auto max-h-[calc(100dvh_-_var(--image-inset))] max-w-[min(76rem,calc(100dvw_-_var(--image-inset)))]"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        />
      </div>
      <div className="absolute right-2 bottom-2 flex divide-x divide-white/25 rounded-full bg-black/75 text-white" role="group" aria-label="Image zoom">
        <button type="button" aria-label="Zoom out" disabled={view.scale === 1} onClick={() => changeZoom(1 / zoomStep)} className="grid size-11 place-items-center rounded-l-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-40">
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Zoom in" disabled={view.scale === maxScale} onClick={() => changeZoom(zoomStep)} className="grid size-11 place-items-center rounded-r-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-40">
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
