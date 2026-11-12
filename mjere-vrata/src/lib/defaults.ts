import { Settings } from './types';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const defaultSettings: Settings = {
  currency: '€',
  tolerance: 5,
  pricePerM2: 0,
  numberPrefix: '',
  nextNumber: 1,
  sizes: [
    { id: 's60', width: 60, height: 200, price: 180 },
    { id: 's70', width: 70, height: 200, price: 190 },
    { id: 's80', width: 80, height: 200, price: 200 },
    { id: 's90', width: 90, height: 200, price: 215 },
    { id: 's100', width: 100, height: 210, price: 240 },
  ],
  colors: [
    { id: 'c-white', name: 'Бела', hex: '#FFFFFF', surchargeType: 'fixed', surcharge: 0 },
    { id: 'c-oak', name: 'Храст', hex: '#C49A6C', surchargeType: 'fixed', surcharge: 30 },
    { id: 'c-walnut', name: 'Орах', hex: '#6B4A34', surchargeType: 'fixed', surcharge: 40 },
    { id: 'c-anth', name: 'Антрацит', hex: '#3B3F45', surchargeType: 'percent', surcharge: 10 },
  ],
  lines: [
    { id: 'l-none', name: 'Без линија', surchargeType: 'fixed', surcharge: 0 },
    { id: 'l-h1', name: '1 хоризонтална', surchargeType: 'fixed', surcharge: 15 },
    { id: 'l-h3', name: '3 хоризонталне', surchargeType: 'fixed', surcharge: 35 },
    { id: 'l-v', name: 'Вертикалне', surchargeType: 'fixed', surcharge: 40 },
  ],
};
