import { useEffect, useRef, useState } from "react";
import { Brush } from "../lib/brush";
import { Stem } from "../lib/stem";
import { Flower } from "../lib/flower";

const COMPOSITE_FILTER = "url(#watercolor) saturate(0.2) contrast(1.15) brightness(1.05)";

interface GenerativeArtProps {
  onComplete?: () => void;
}

const GenerativeArt: React.FC<GenerativeArtProps> = ({ onComplete }) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const stemsRef = useRef<Stem[]>([]);
  const flowersRef = useRef<Flower[]>([]);
  const brushRef = useRef<Brush | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [, setPoemShown] = useState(false);

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    sizeRef.current = { width, height };

    if (displayCanvasRef.current) {
      displayCanvasRef.current.width = width;
      displayCanvasRef.current.height = height;
    }
    if (paintCanvasRef.current) {
      paintCanvasRef.current.width = width;
      paintCanvasRef.current.height = height;
      const ctx = paintCanvasRef.current.getContext("2d", { alpha: true, desynchronized: true });
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        brushRef.current = new Brush(ctx);
      }
    }
  };

  const renderFrame = () => {
    const displayCanvas = displayCanvasRef.current;
    const paintCanvas = paintCanvasRef.current;
    if (!displayCanvas || !paintCanvas) return;

    const displayCtx = displayCanvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!displayCtx) return;

    displayCtx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
    displayCtx.filter = COMPOSITE_FILTER;
    displayCtx.drawImage(paintCanvas, 0, 0);
    displayCtx.filter = "none";
  };

  const init = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setPoemShown(false);

    resize();
    const paintCanvas = paintCanvasRef.current;
    if (paintCanvas) {
      const ctx = paintCanvas.getContext("2d");
      ctx?.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
    }
    renderFrame();

    const { width, height } = sizeRef.current;
    const startXBase = width * 0.85;
    const startY = height + 40;
    const count = width < 600 ? 15 : 25;

    const stems: Stem[] = [];
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * (width * 0.4);
      const startX = startXBase + offsetX;
      const angle = -Math.PI / 2 - 0.4 + (Math.random() - 0.5) * 0.5;
      const h = height * 0.4 + Math.random() * (height * 0.5);
      stems.push(new Stem(startX, startY, h, angle));
    }
    stemsRef.current = stems;
    flowersRef.current = [];
    loop();
  };

  const loop = () => {
    let allStemsDone = true;
    const brush = brushRef.current;
    if (!brush) return;

    for (const stem of stemsRef.current) {
      const done = stem.update();
      stem.draw(brush);
      if (!done) allStemsDone = false;
      else {
        if (!stem.hasFlower) {
          const anchorIdx = Math.max(1, stem.segments.length - 2);
          const anchor = stem.segments[anchorIdx];
          flowersRef.current.push(new Flower(anchor.x, anchor.y, stem.flowerTypeHint, 0.5 + Math.random() * 0.4));

          if (stem.segments.length > 20 && Math.random() > 0.5) {
            const budIdx = Math.floor(stem.segments.length * 0.7);
            const budNode = stem.segments[budIdx];
            flowersRef.current.push(new Flower(budNode.x + (Math.random() - 0.5) * 20, budNode.y, undefined, 0.3 + Math.random() * 0.2));
          }
          stem.hasFlower = true;
        }
      }
    }

    let allFlowersDone = true;
    for (const flower of flowersRef.current) {
      flower.draw(brush);
      if (flower.age < flower.maxAge) allFlowersDone = false;
    }

    renderFrame();

    if (!allStemsDone || !allFlowersDone) {
      animationRef.current = requestAnimationFrame(loop);
    } else {
      animationRef.current = null;
      setPoemShown(true);
      onComplete?.();
    }
  };

  const shiftScene = (dx: number, dy: number) => {
    if (!dx && !dy) return;
    for (const stem of stemsRef.current) {
      stem.x += dx;
      stem.y += dy;
      stem.tip.x += dx;
      stem.tip.y += dy;
      for (const seg of stem.segments) {
        seg.x += dx;
        seg.y += dy;
      }
    }
    for (const flower of flowersRef.current) {
      flower.x += dx;
      flower.y += dy;
    }
  };

  const preserveOnResize = () => {
    const prevW = sizeRef.current.width;
    const prevH = sizeRef.current.height;
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas) return;

    const snapshot = document.createElement("canvas");
    snapshot.width = prevW;
    snapshot.height = prevH;
    const snapCtx = snapshot.getContext("2d");
    snapCtx?.drawImage(paintCanvas, 0, 0);

    resize();
    const { width, height } = sizeRef.current;
    const dx = (width - prevW) * 0.5;
    const dy = (height - prevH) * 0.5;

    const ctx = paintCanvas.getContext("2d");
    ctx?.clearRect(0, 0, width, height);
    ctx?.drawImage(snapshot, dx, dy);

    shiftScene(dx, dy);
    renderFrame();
  };

  useEffect(() => {
    paintCanvasRef.current = document.createElement("canvas");
    setTimeout(init, 500);

    const handleResize = () => {
      preserveOnResize();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={displayCanvasRef} id="artCanvas" />
    </div>
  );
};

export default GenerativeArt;
