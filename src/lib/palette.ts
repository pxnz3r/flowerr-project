export interface Color {
  h: number;
  s: number;
  l: number;
}

export const STAMEN_COLOR: Color = { h: 30, s: 10, l: 10 };
export const FLOWER_TYPE_COUNT = 6;

export const PALETTE = {
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

export function pickFlowerType(): number {
  const r = Math.random();
  if (r < 0.22) return 0;
  if (r < 0.36) return 1;
  if (r < 0.56) return 2;
  if (r < 0.74) return 3;
  if (r < 0.90) return 4;
  return FLOWER_TYPE_COUNT - 1;
}
