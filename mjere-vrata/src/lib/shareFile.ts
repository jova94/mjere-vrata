import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function shareFile(data: ArrayBuffer, fileName: string) {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(new Uint8Array(data));
  await Sharing.shareAsync(file.uri, {
    mimeType: XLSX_MIME,
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: fileName,
  });
}
