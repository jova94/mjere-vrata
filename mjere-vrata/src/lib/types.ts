export type SurchargeType = 'fixed' | 'percent';

/** Standardna dimenzija vrata (cm) sa osnovnom cijenom. */
export interface StandardSize {
  id: string;
  width: number;
  height: number;
  price: number;
}

/** Boja / dekor vrata sa doplatom. */
export interface DoorColor {
  id: string;
  name: string;
  hex: string;
  surchargeType: SurchargeType;
  surcharge: number;
}

/** Dizajn linija na vratima sa doplatom. */
export interface LinePattern {
  id: string;
  name: string;
  surchargeType: SurchargeType;
  surcharge: number;
}

export interface Settings {
  currency: string;
  /** Maksimalno odstupanje (cm) od standardne mjere da bi se primijenila njena cijena. */
  tolerance: number;
  /** Rezervna cijena po m² kada nijedna standardna mjera nije dovoljno blizu (0 = isključeno). */
  pricePerM2: number;
  numberPrefix: string;
  nextNumber: number;
  sizes: StandardSize[];
  colors: DoorColor[];
  lines: LinePattern[];
}

export interface Door {
  id: string;
  label: string;
  width: number;
  height: number;
  quantity: number;
  colorId: string | null;
  lineId: string | null;
  note: string;
  /** Ručno unesena cijena po komadu (zamjenjuje izračun). */
  priceOverride: number | null;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  createdAt: string;
  doors: Door[];
}
