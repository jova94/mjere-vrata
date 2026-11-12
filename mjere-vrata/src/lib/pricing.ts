import { Door, Project, Settings, StandardSize, SurchargeType } from './types';

export interface DoorPrice {
  /** Pronađena standardna mjera (ako je u toleranciji). */
  size: StandardSize | null;
  /** Odstupanje od najbliže standardne mjere u cm (najveće od širine/visine). */
  deviation: number | null;
  basis: 'standard' | 'm2' | 'manual' | 'none';
  base: number;
  colorAdd: number;
  linesAdd: number;
  unit: number;
  total: number;
}

const surchargeOf = (type: SurchargeType, value: number, base: number) =>
  type === 'percent' ? (base * value) / 100 : value;

export function nearestSize(width: number, height: number, sizes: StandardSize[]) {
  let best: StandardSize | null = null;
  let bestDev = Infinity;
  for (const s of sizes) {
    const dev = Math.max(Math.abs(s.width - width), Math.abs(s.height - height));
    if (dev < bestDev) {
      best = s;
      bestDev = dev;
    }
  }
  return best ? { size: best, deviation: bestDev } : null;
}

export function doorArea(d: Pick<Door, 'width' | 'height'>) {
  return (d.width * d.height) / 10000;
}

export function doorPerimeter(d: Pick<Door, 'width' | 'height'>) {
  return (2 * (d.width + d.height)) / 100;
}

export function priceDoor(door: Door, settings: Settings): DoorPrice {
  const qty = door.quantity > 0 ? door.quantity : 1;
  const near = nearestSize(door.width, door.height, settings.sizes);
  const inTolerance = near !== null && near.deviation <= settings.tolerance;

  if (door.priceOverride != null) {
    const unit = door.priceOverride;
    return {
      size: inTolerance ? near!.size : null,
      deviation: near?.deviation ?? null,
      basis: 'manual',
      base: unit,
      colorAdd: 0,
      linesAdd: 0,
      unit,
      total: unit * qty,
    };
  }

  let base = 0;
  let basis: DoorPrice['basis'] = 'none';
  if (inTolerance) {
    base = near!.size.price;
    basis = 'standard';
  } else if (settings.pricePerM2 > 0 && door.width > 0 && door.height > 0) {
    base = doorArea(door) * settings.pricePerM2;
    basis = 'm2';
  }

  const color = settings.colors.find((c) => c.id === door.colorId);
  const line = settings.lines.find((l) => l.id === door.lineId);
  const colorAdd = basis !== 'none' && color ? surchargeOf(color.surchargeType, color.surcharge, base) : 0;
  const linesAdd = basis !== 'none' && line ? surchargeOf(line.surchargeType, line.surcharge, base) : 0;
  const unit = base + colorAdd + linesAdd;

  return {
    size: inTolerance ? near!.size : null,
    deviation: near?.deviation ?? null,
    basis,
    base,
    colorAdd,
    linesAdd,
    unit,
    total: unit * qty,
  };
}

export function projectTotals(p: Project, settings: Settings) {
  let total = 0;
  let count = 0;
  let area = 0;
  let perimeter = 0;
  let unpriced = 0;
  for (const d of p.doors) {
    const q = d.quantity > 0 ? d.quantity : 1;
    const pr = priceDoor(d, settings);
    total += pr.total;
    if (pr.basis === 'none') unpriced += q;
    count += q;
    area += doorArea(d) * q;
    perimeter += doorPerimeter(d) * q;
  }
  return { total, count, area, perimeter, unpriced };
}
