import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { numToText, parseNum } from '../lib/format';

export const colors = {
  bg: '#F2F4F8',
  card: '#FFFFFF',
  text: '#101828',
  muted: '#667085',
  border: '#E4E7EC',
  primary: '#2563EB',
  primarySoft: '#E8F0FE',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  success: '#12B76A',
  warning: '#F79009',
  warningSoft: '#FEF4E6',
};

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#98A2B3" style={[styles.input, style]} {...props} />
    </View>
  );
}

/** Numeričko polje koje dozvoljava decimalni zarez i drži lokalni tekst dok korisnik kuca. */
export function NumberInput({
  value,
  onChange,
  label,
  placeholder,
  style,
  suffix,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  label?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  suffix?: string;
}) {
  const [text, setText] = useState(numToText(value));
  useEffect(() => {
    if (parseNum(text) !== value) setText(numToText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[label ? styles.field : null, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        <TextInput
          value={text}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          selectTextOnFocus
          onChangeText={(t) => {
            setText(t);
            onChange(parseNum(t));
          }}
          style={[styles.input, { flex: 1, minWidth: 0, width: '100%' }, suffix ? { paddingRight: 34 } : null]}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'soft' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.dangerSoft : colors.primarySoft;
  const fg = variant === 'primary' ? '#fff' : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: pressed ? 0.75 : 1 }, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  swatch,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  swatch?: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
      <Text style={[styles.chipText, selected && { color: colors.primary, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          style={[styles.segment, value === o.value && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, value === o.value && { color: colors.text, fontWeight: '600' }]}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  color = colors.primary,
  size = 22,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#101828',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: colors.muted, marginBottom: 6, fontWeight: '500' },
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: colors.text,
  },
  suffix: { position: 'absolute', right: 12, color: colors.muted, fontSize: 14 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: 14, color: colors.text },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#D0D5DD' },
  segmented: { flexDirection: 'row', backgroundColor: '#EEF0F4', borderRadius: 10, padding: 2 },
  segment: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  segmentActive: { backgroundColor: '#fff' },
  segmentText: { fontSize: 13, color: colors.muted },
});
