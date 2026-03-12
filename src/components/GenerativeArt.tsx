import React, { useEffect, useRef, useState } from "react";

// --- Types & Constants ---

interface Color {
  h: number;
  s: number;
  l: number;
}

const COMPOSITE_FILTER = "url(#watercolor) saturate(0.2) contrast(1.15) brightness(1.05)";
const STAMEN_COLOR: Color = { h: 30, s: 10, l: 10 };
const FLOWER_TYPE_COUNT = 6;

const PALETTE = {
  stems: [
    { h: 30, s: 5, l: 15 },
    { h: 30, s: 5, l: 10 },
    { h: 30, s: 5, l: 20 },
  ],
  flowers: [
    { h: 40, s: 15, l: 90 },
    { h: 30, s: 20, l: 85 },
    { h: 210, s: 5, l: 88 },
    { h: 40, s: 10, l: 95 },
    { h: 30, s: 15, l: 80 },
    { h: 0, s: 0, l: 10 },
  ],
  calyx: { h: 30, s: 5, l: 15 },
  hearts: { h: 30, s: 5, l: 15 },
};

function pickFlowerType() {
  const r = Math.random();
  if (r < 0.22) return 0;
  if (r < 0.36) return 1;
  if (r < 0.56) return 2;
  if (r < 0.74) return 3;
  if (r < 0.90) return 4;
  return FLOWER_TYPE_COUNT - 1;
}

// --- Classes ---

class Brush {
  ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  stroke(x1: number, y1: number, x2: number, y2: number, color: Color, width: number, opacity: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    const { h, s, l } = color;
    this.ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${Math.min(1, opacity * 1.5)})`;
    this.ctx.lineWidth = width * (0.8 + Math.random() * 0.4);
    this.ctx.stroke();
  }
  wash(x: number, y: number, radius: number, color: Color, opacity: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${Math.min(1, opacity * 1.5)})`;
    this.ctx.fill();
  }
  blob(x: number, y: number, radius: number, color: Color, opacity: number, angle?: number, stretch?: number) {
    const baseAngle = angle == null ? Math.random() * Math.PI : angle;
    const baseStretch = stretch == null ? 1.1 + Math.random() * 0.35 : stretch;

    const iterations = 1;
    for (let i = 0; i < iterations; i++) {
      const jx = (Math.random() - 0.5) * radius * 0.15;
      const jy = (Math.random() - 0.5) * radius * 0.15;
      const r = Math.max(0.8, radius * (0.85 + Math.random() * 0.3));
      const rx = r * baseStretch;
      const ry = r * (0.7 + Math.random() * 0.3);
      const h = color.h + (Math.random() * 6 - 3);
      const l = color.l + (Math.random() * 4 - 2);
      const a = baseAngle + (Math.random() - 0.5) * 0.15;
      this.ctx.beginPath();
      this.ctx.ellipse(x + jx, y + jy, rx, ry, a, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${h}, ${color.s}%, ${l}%, ${Math.min(1, opacity * 1.2)})`;
      this.ctx.fill();
    }
  }
}

class Stem {
  x: number;
  y: number;
  targetHeight: number;
  angle: number;
  currentHeight: number = 0;
  segments: { x: number; y: number; angle: number; cos: number; sin: number }[] = [];
  growSpeed: number;
  done: boolean = false;
  leavesBySegment: { angle: number; cos: number; sin: number; length: number; radius: number; drawn: boolean }[][] = [];
  leafDensity: number;
  tip: { x: number; y: number };
  hasFlower: boolean = false;
  flowerTypeHint: number;

  constructor(x: number, y: number, height: number, angle: number) {
    this.x = x;
    this.y = y;
    this.targetHeight = height;
    this.angle = angle;
    this.growSpeed = 1.5 + Math.random() * 2;
    this.leafDensity = 0.18 + Math.random() * 0.1;
    this.flowerTypeHint = pickFlowerType();

    let cx = x;
    let cy = y;
    let ca = angle;
    const stepSize = 5;
    const totalSteps = Math.floor(height / stepSize);

    for (let i = 0; i < totalSteps; i++) {
      const targetAngle = -Math.PI / 2 - 0.2;
      const drift = (Math.random() - 0.5) * 0.15;
      ca += (targetAngle - ca) * 0.01 + drift;

      const nx = cx + Math.cos(ca) * stepSize;
      const ny = cy + Math.sin(ca) * stepSize;
      this.segments.push({
        x: nx,
        y: ny,
        angle: ca,
        cos: Math.cos(ca),
        sin: Math.sin(ca),
      });

      if (i > totalSteps * 0.1 && i < totalSteps * 0.95 && Math.random() < this.leafDensity) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const leafAngle = ca + side * (0.5 + Math.random() * 0.6);
        const leaf = {
          angle: leafAngle,
          cos: Math.cos(leafAngle),
          sin: Math.sin(leafAngle),
          length: 20 + Math.random() * 25,
          radius: 5 + Math.random() * 5,
          drawn: false,
        };
        if (!this.leavesBySegment[i]) this.leavesBySegment[i] = [];
        this.leavesBySegment[i].push(leaf);
      }
      cx = nx;
      cy = ny;
    }
    this.tip = { x: cx, y: cy };
  }

  update() {
    if (this.currentHeight < this.segments.length) {
      this.currentHeight += this.growSpeed;
      if (this.currentHeight >= this.segments.length) {
        this.currentHeight = this.segments.length;
        this.done = true;
      }
    }
    return this.done;
  }

  draw(brush: Brush) {
    const maxIndex = Math.floor(this.currentHeight);
    if (maxIndex < 1) return;
    const drawEnd = this.hasFlower ? Math.max(1, maxIndex - 1) : maxIndex;
    const startIdx = Math.max(1, drawEnd - Math.ceil(this.growSpeed) - 1);
    const segmentCount = this.segments.length;

    for (let i = startIdx; i < drawEnd; i++) {
      const prev = this.segments[i - 1];
      const curr = this.segments[i];
      const width = 3.5 * (1 - i / segmentCount) + 0.5;

      brush.stroke(prev.x, prev.y, curr.x, curr.y, PALETTE.stems[0], width, 0.9);

      const leaves = this.leavesBySegment[i];
      if (leaves) {
        for (let j = 0; j < leaves.length; j++) {
          const leaf = leaves[j];
          if (!leaf.drawn) {
            this.drawLeaf(brush, curr.x, curr.y, leaf, width);
            leaf.drawn = true;
          }
        }
      }
    }
  }

  drawLeaf(brush: Brush, x: number, y: number, leaf: any, stemWidth: number) {
    const tipX = x + leaf.cos * leaf.length;
    const tipY = y + leaf.sin * leaf.length;
    const midScale = leaf.length * 0.55;
    const midX = x + leaf.cos * midScale;
    const midY = y + leaf.sin * midScale;
    const nx = -leaf.sin;
    const ny = leaf.cos;
    const lobeOffset = leaf.radius * 0.55;
    const rootX = x - leaf.cos * (leaf.radius * 0.35);
    const rootY = y - leaf.sin * (leaf.radius * 0.35);

    brush.blob(midX, midY, leaf.radius * 1.2, PALETTE.stems[0], 0.7, leaf.angle, 2.2);
    brush.blob(midX + nx * lobeOffset, midY + ny * lobeOffset, leaf.radius * 0.9, PALETTE.stems[1], 0.7, leaf.angle + 0.15, 2.0);
    brush.blob(midX - nx * lobeOffset, midY - ny * lobeOffset, leaf.radius * 0.85, PALETTE.stems[2], 0.7, leaf.angle - 0.15, 1.9);

    brush.stroke(rootX, rootY, tipX, tipY, PALETTE.stems[2], Math.max(0.4, stemWidth * 0.3), 0.8);
  }
}

class Flower {
  x: number;
  y: number;
  scale: number;
  type: number;
  age: number = 0;
  maxAge: number;
  petals: any[] = [];
  centerDots: any[] = [];
  colorBias: number;
  baseColor: Color;
  altColor: Color;
  darkColor: Color;
  lightColor: Color;
  petalDrawChance: number = 0.7;
  headTilt: number;
  headLift: number;
  capMode: string = "fan";

  constructor(x: number, y: number, type?: number, scale?: number) {
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    this.type = type == null ? pickFlowerType() : type;
    this.maxAge = 100 + Math.random() * 50;
    this.colorBias = Math.floor(Math.random() * PALETTE.flowers.length);
    const palette = PALETTE.flowers;
    this.baseColor = palette[this.colorBias];
    this.altColor = palette[(this.colorBias + 2) % palette.length];
    this.darkColor = {
      h: this.baseColor.h,
      s: Math.min(100, this.baseColor.s + 10),
      l: Math.max(15, this.baseColor.l - 20),
    };
    this.lightColor = {
      h: this.baseColor.h,
      s: Math.max(20, this.baseColor.s - 10),
      l: Math.min(95, this.baseColor.l + 25),
    };
    this.headTilt = (Math.random() - 0.5) * 0.8;
    this.headLift = 12 * this.scale;
    this.initShape();
  }

  addPetal(angle: number, distance: number, radius: number, layer?: number, stretch?: number) {
    this.petals.push({
      angle: angle,
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      distance: distance * this.scale,
      radius: radius * this.scale,
      layer: layer || 0,
      stretch: (stretch == null ? 1.45 : stretch) + (Math.random() - 0.5) * 0.24,
      jitter: (Math.random() - 0.5) * 0.35,
    });
  }

  addCenterDots(count: number, minDist: number, maxDist: number, minSize: number, maxSize: number, color?: Color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      this.centerDots.push({
        cos: Math.cos(a),
        sin: Math.sin(a),
        distance: (minDist + Math.random() * (maxDist - minDist)) * this.scale,
        size: (minSize + Math.random() * (maxSize - minSize)) * this.scale,
        color: color || STAMEN_COLOR,
      });
    }
  }

  initShape() {
    if (this.type === 0) {
      this.petalDrawChance = 0.65;
      this.capMode = "cup";
      for (let layer = 0; layer < 3; layer++) {
        const count = 4 + layer * 2;
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
          this.addPetal(a, 5 + layer * 4, 9 + layer * 3, layer, 1.2);
        }
      }
      this.addCenterDots(15, 1, 3, 1.5, 2.5, { h: 0, s: 0, l: 10 });
    } else if (this.type === 1) {
      this.capMode = "cup";
      const base = -Math.PI / 2;
      this.addPetal(base - 0.4, 12, 12, 1, 1.4);
      this.addPetal(base + 0.4, 12, 12, 1, 1.4);
      this.addPetal(base, 14, 14, 0, 1.2);
      this.addCenterDots(6, 1, 4, 1, 2, STAMEN_COLOR);
    } else if (this.type === 2) {
      this.capMode = "star";
      const count = 12;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / count) * i;
        this.addPetal(a, 16, 6, 0, 2.5);
      }
      this.addCenterDots(10, 0, 4, 1.5, 2.5, STAMEN_COLOR);
    } else if (this.type === 3) {
      this.capMode = "cluster";
      for (let layer = 0; layer < 5; layer++) {
        const count = 5 + layer * 3;
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 / count) * i + layer;
          this.addPetal(a, 2 + layer * 3, 5 + layer, layer, 1.1);
        }
      }
    } else {
      this.capMode = "fan";
      const count = 7;
      const off = -Math.PI / 2;
      for (let i = 0; i < count; i++) {
        const a = off + (Math.PI / count) * (i - count / 2) * 0.8 + (Math.random() - 0.5) * 0.3;
        this.addPetal(a, 15, 8, 0, 1.8);
      }
      this.addCenterDots(5, 1, 3, 1, 2, STAMEN_COLOR);
    }
  }

  draw(brush: Brush) {
    if (this.age > this.maxAge) return;
    this.age += 1;

    const growth = this.age < 60 ? this.age / 60 : 1;
    const bloom = 0.2 + growth * 0.8;
    const headX = this.x + this.headTilt * this.headLift * 0.5 * bloom;
    const headY = this.y - this.headLift * bloom;

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      if (Math.random() > this.petalDrawChance) continue;
      const dist = p.distance * bloom;
      const radius = p.radius * bloom;
      const px = headX + p.cos * dist;
      const py = headY + p.sin * dist;
      let color = this.baseColor;
      if (p.layer === 0) color = this.darkColor;
      else if (p.layer > 2) color = this.lightColor;
      brush.blob(px, py, radius, color, 0.4, p.angle, p.stretch);
    }

    if (this.age > 15) {
      const dotGrowth = Math.min(1, (this.age - 15) / 30);
      for (const d of this.centerDots) {
        if (Math.random() > 0.4) {
          const dx = headX + d.cos * d.distance * dotGrowth;
          const dy = headY + d.sin * d.distance * dotGrowth;
          brush.wash(dx, dy, d.size * dotGrowth, d.color, 0.9);
        }
      }
    }
  }
}

// --- Component ---

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
            flowersRef.current.push(new Flower(budNode.x + (Math.random() - 0.5) * 20, budNode.y, pickFlowerType(), 0.3 + Math.random() * 0.2));
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
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={displayCanvasRef} id="artCanvas" />
    </div>
  );
};

export default GenerativeArt;
