import { PALETTE, pickFlowerType } from './palette';
import type { Brush } from './brush';

interface Leaf {
  angle: number;
  cos: number;
  sin: number;
  length: number;
  radius: number;
  drawn: boolean;
}

interface Segment {
  x: number;
  y: number;
  angle: number;
  cos: number;
  sin: number;
}

export class Stem {
  x: number;
  y: number;
  targetHeight: number;
  angle: number;
  currentHeight: number = 0;
  segments: Segment[] = [];
  growSpeed: number;
  done: boolean = false;
  leavesBySegment: Leaf[][] = [];
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
        const leaf: Leaf = {
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
        for (const leaf of leaves) {
          if (!leaf.drawn) {
            this.drawLeaf(brush, curr.x, curr.y, leaf, width);
            leaf.drawn = true;
          }
        }
      }
    }
  }

  private drawLeaf(brush: Brush, x: number, y: number, leaf: Leaf, stemWidth: number) {
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
