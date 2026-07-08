import type { Color } from './palette';

export class Brush {
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

    for (let i = 0; i < 1; i++) {
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
