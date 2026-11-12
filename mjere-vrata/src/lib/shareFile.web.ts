export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Na iPhone-u (Safari/PWA) otvara iOS meni za deljenje; inače preuzima fajl. */
export async function shareFile(data: ArrayBuffer, fileName: string) {
  const blob = new Blob([data], { type: XLSX_MIME });
  const file = new File([blob], fileName, { type: XLSX_MIME });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: fileName });
      return;
    } catch (e) {
      // Korisnik je zatvorio meni – ništa ne radimo.
      if ((e as Error)?.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
