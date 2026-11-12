import * as XLSX from 'xlsx';
import { formatDate } from './format';
import { doorArea, priceDoor, projectTotals } from './pricing';
import { shareFile } from './shareFile';
import { Project, Settings } from './types';

const round2 = (n: number) => Math.round(n * 100) / 100;

function safeSheetName(name: string, used: Set<string>) {
  const base = name.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'Пројекат';
  let candidate = base;
  let i = 2;
  while (used.has(candidate.toLowerCase())) candidate = `${base.slice(0, 25)} (${i++})`;
  used.add(candidate.toLowerCase());
  return candidate;
}

function projectSheet(p: Project, s: Settings) {
  const t = projectTotals(p, s);
  const rows: (string | number)[][] = [
    ['Пројекат', `${p.number} ${p.name}`.trim()],
    ['Датум', formatDate(p.createdAt)],
    ['Телефон', p.phone],
    ['Имејл', p.email],
    ['Адреса', p.address],
    ['Белешка', p.note],
    [],
    [
      'Рб',
      'Ознака',
      'Ширина (cm)',
      'Висина (cm)',
      'Ком',
      'Боја',
      'Линије',
      'm²',
      'Стандардна мера',
      'Основна цена',
      'Доплата боја',
      'Доплата линије',
      `Цена/ком (${s.currency})`,
      `Укупно (${s.currency})`,
      'Белешка',
    ],
  ];
  p.doors.forEach((d, i) => {
    const pr = priceDoor(d, s);
    const q = d.quantity > 0 ? d.quantity : 1;
    const basisText =
      pr.basis === 'standard'
        ? `${pr.size!.width}×${pr.size!.height}`
        : pr.basis === 'm2'
          ? 'по m²'
          : pr.basis === 'manual'
            ? 'ручно'
            : 'нема цене';
    rows.push([
      i + 1,
      d.label,
      d.width,
      d.height,
      q,
      s.colors.find((c) => c.id === d.colorId)?.name ?? '',
      s.lines.find((l) => l.id === d.lineId)?.name ?? '',
      round2(doorArea(d) * q),
      basisText,
      round2(pr.base),
      round2(pr.colorAdd),
      round2(pr.linesAdd),
      round2(pr.unit),
      round2(pr.total),
      d.note,
    ]);
  });
  rows.push([]);
  rows.push(['', 'УКУПНО', '', '', t.count, '', '', round2(t.area), '', '', '', '', '', round2(t.total), '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [6, 18, 11, 11, 6, 14, 16, 8, 16, 13, 12, 12, 14, 14, 30].map((wch) => ({ wch }));
  return ws;
}

function summarySheet(projects: Project[], s: Settings) {
  const rows: (string | number)[][] = [
    ['Број', 'Назив', 'Датум', 'Телефон', 'Имејл', 'Адреса', 'Ком врата', 'm²', `Укупно (${s.currency})`, 'Белешка'],
  ];
  let sum = 0;
  for (const p of projects) {
    const t = projectTotals(p, s);
    sum += t.total;
    rows.push([p.number, p.name, formatDate(p.createdAt), p.phone, p.email, p.address, t.count, round2(t.area), round2(t.total), p.note]);
  }
  rows.push([]);
  rows.push(['', 'УКУПНО', '', '', '', '', '', '', round2(sum), '']);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [10, 24, 12, 14, 24, 24, 10, 8, 14, 30].map((wch) => ({ wch }));
  return ws;
}

// Napomena: bez `await` prije shareFile – na webu deljenje mora ostati vezano za dodir korisnika.
function shareWorkbook(wb: XLSX.WorkBook, fileName: string) {
  const data: ArrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return shareFile(data, fileName);
}

const fileSafe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '').trim().replace(/\s+/g, '_') || 'извоз';

export function exportProject(p: Project, s: Settings) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, projectSheet(p, s), safeSheetName(p.number || 'Пројекат', new Set()));
  return shareWorkbook(wb, `${fileSafe(`${p.number} ${p.name}`)}.xlsx`);
}

export function exportAll(projects: Project[], s: Settings) {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>(['преглед']);
  XLSX.utils.book_append_sheet(wb, summarySheet(projects, s), 'Преглед');
  for (const p of projects) {
    XLSX.utils.book_append_sheet(wb, projectSheet(p, s), safeSheetName(`${p.number} ${p.name}`, used));
  }
  const d = new Date();
  return shareWorkbook(wb, `Пројекти_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.xlsx`);
}
