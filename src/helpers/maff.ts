export function clamp(val: number, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

export function bandpass(steps: [number, number, number, number], x: number) {
  if (!isFinite(x)) return 0;
  const ss1 = smoothstep(steps[0], steps[1], x);
  const ss2 = smoothstep(steps[3], steps[2], x);
  return Math.min(ss1, ss2);
}

export function strHash(str: string) {
  let hash = 0;
  let i: number;
  let chr: number;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0).toString(36);
}
