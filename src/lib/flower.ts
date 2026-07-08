import { PALETTE, STAMEN_COLOR, pickFlowerType } from './palette';
import type { Color } from './palette';
import type { Brush } from './brush';

interface Petal {
  angle: number;
  cos: number;
  sin: number;
  distance: number;
  radius: number;
  layer: number;
  stretch: number;
  jitter: number;
}

interface CenterDot {
  cos: number;
  sin: number;
  distance: number;
  size: number;
  color: Color;
}

export class Flower {
  x: number;
  y: number;
  scale: number;
  type: number;
  age: number = 0;
  maxAge: number;
  petals: Petal[] = [];
  centerDots: CenterDot[] = [];
  colorBias: number;
  baseColor: Color;
  altColor: Color;
  darkColor: Color;
  lightColor: Color;
  petalDrawChance: number = 0.7;
  headTilt: number;
  headLift: number;

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

  private addPetal(angle: number, distance: number, radius: number, layer?: number, stretch?: number) {
    this.petals.push({
      angle,
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      distance: distance * this.scale,
      radius: radius * this.scale,
      layer: layer || 0,
      stretch: (stretch == null ? 1.45 : stretch) + (Math.random() - 0.5) * 0.24,
      jitter: (Math.random() - 0.5) * 0.35,
    });
  }

  private addCenterDots(count: number, minDist: number, maxDist: number, minSize: number, maxSize: number, color?: Color) {
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

  private initShape() {
    if (this.type === 0) {
      this.petalDrawChance = 0.65;
      for (let layer = 0; layer < 3; layer++) {
        const count = 4 + layer * 2;
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
          this.addPetal(a, 5 + layer * 4, 9 + layer * 3, layer, 1.2);
        }
      }
      this.addCenterDots(15, 1, 3, 1.5, 2.5, { h: 0, s: 0, l: 10 });
    } else if (this.type === 1) {
      const base = -Math.PI / 2;
      this.addPetal(base - 0.4, 12, 12, 1, 1.4);
      this.addPetal(base + 0.4, 12, 12, 1, 1.4);
      this.addPetal(base, 14, 14, 0, 1.2);
      this.addCenterDots(6, 1, 4, 1, 2, STAMEN_COLOR);
    } else if (this.type === 2) {
      const count = 12;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / count) * i;
        this.addPetal(a, 16, 6, 0, 2.5);
      }
      this.addCenterDots(10, 0, 4, 1.5, 2.5, STAMEN_COLOR);
    } else if (this.type === 3) {
      for (let layer = 0; layer < 5; layer++) {
        const count = 5 + layer * 3;
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 / count) * i + layer;
          this.addPetal(a, 2 + layer * 3, 5 + layer, layer, 1.1);
        }
      }
    } else {
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

    for (const p of this.petals) {
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
        if (Math.random() > 0.4) continue;
        const dx = headX + d.cos * d.distance * dotGrowth;
        const dy = headY + d.sin * d.distance * dotGrowth;
        brush.wash(dx, dy, d.size * dotGrowth, d.color, 0.9);
      }
    }
  }
}
