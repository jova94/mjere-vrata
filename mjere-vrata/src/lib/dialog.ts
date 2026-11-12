import { Alert, Platform } from 'react-native';

// Alert.alert ne radi na webu (react-native-web), pa koristimo window.alert/confirm.

export function showInfo(title: string, message?: string) {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
}

export function confirmDestructive(title: string, message: string | undefined, okText: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Откажи', style: 'cancel' },
    { text: okText, style: 'destructive', onPress: onOk },
  ]);
}
