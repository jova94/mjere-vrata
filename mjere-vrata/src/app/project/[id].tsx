import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, colors, IconButton, SectionTitle } from '../../components/ui';
import { showInfo } from '../../lib/dialog';
import { exportProject } from '../../lib/excel';
import { formatDate, formatMoney, formatNumber } from '../../lib/format';
import { priceDoor, projectTotals } from '../../lib/pricing';
import { useStore } from '../../lib/store';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProject, settings } = useStore();
  const p = getProject(id);

  if (!p) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={{ color: colors.muted }}>Пројекат није пронађен.</Text>
      </View>
    );
  }

  const t = projectTotals(p, settings);
  const onExport = async () => {
    try {
      await exportProject(p, settings);
    } catch (e) {
      showInfo('Грешка при извозу', String(e));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${p.number} ${p.name}`.trim(),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <IconButton name="share-outline" onPress={onExport} />
              <IconButton
                name="create-outline"
                onPress={() => router.push({ pathname: '/project-form', params: { id: p.id } })}
              />
            </View>
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {/* Sažetak */}
        <Card style={s.summary}>
          <Text style={s.summaryLabel}>Укупно</Text>
          <Text style={s.summaryTotal}>{formatMoney(t.total, settings.currency)}</Text>
          <View style={s.stats}>
            <Stat label="Врата" value={String(t.count)} />
            <Stat label="Површина" value={`${formatNumber(t.area)} m²`} />
            <Stat label="Обим" value={`${formatNumber(t.perimeter)} m`} />
          </View>
        </Card>

        {/* Klijent */}
        <SectionTitle>Клијент</SectionTitle>
        <Card style={{ gap: 10 }}>
          <InfoRow icon="calendar-outline" text={formatDate(p.createdAt)} />
          {!!p.phone && (
            <InfoRow icon="call-outline" text={p.phone} link={`tel:${p.phone.replace(/\s/g, '')}`} />
          )}
          {!!p.email && <InfoRow icon="mail-outline" text={p.email} link={`mailto:${p.email}`} />}
          {!!p.address && <InfoRow icon="location-outline" text={p.address} />}
        </Card>

        {!!p.note && (
          <>
            <SectionTitle>Белешка</SectionTitle>
            <Card>
              <Text style={s.note}>{p.note}</Text>
            </Card>
          </>
        )}

        {/* Vrata */}
        <SectionTitle>Врата ({p.doors.length})</SectionTitle>
        <View style={{ gap: 10 }}>
          {p.doors.map((d, i) => {
            const pr = priceDoor(d, settings);
            const color = settings.colors.find((c) => c.id === d.colorId);
            const line = settings.lines.find((l) => l.id === d.lineId);
            return (
              <Pressable
                key={d.id}
                onPress={() => router.push({ pathname: '/door-form', params: { projectId: p.id, doorId: d.id } })}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Card>
                  <View style={s.rowBetween}>
                    <Text style={s.doorTitle}>
                      {i + 1}. {d.label || 'Врата'}
                    </Text>
                    <Text style={s.doorPrice}>
                      {pr.basis === 'none' ? '—' : formatMoney(pr.total, settings.currency)}
                    </Text>
                  </View>
                  <View style={[s.rowBetween, { marginTop: 6 }]}>
                    <Text style={s.dims}>
                      {formatNumber(d.width, 1)} × {formatNumber(d.height, 1)} cm
                      {d.quantity > 1 ? `  ·  ${d.quantity} ком` : ''}
                    </Text>
                    {d.quantity > 1 && pr.basis !== 'none' && (
                      <Text style={s.meta}>{formatMoney(pr.unit, settings.currency)}/ком</Text>
                    )}
                  </View>
                  <View style={s.tags}>
                    {color && (
                      <View style={s.tag}>
                        <View style={[s.swatch, { backgroundColor: color.hex }]} />
                        <Text style={s.tagText}>{color.name}</Text>
                      </View>
                    )}
                    {line && (
                      <View style={s.tag}>
                        <Ionicons name="reorder-three-outline" size={14} color={colors.muted} />
                        <Text style={s.tagText}>{line.name}</Text>
                      </View>
                    )}
                    <BasisTag basis={pr.basis} size={pr.size ? `${pr.size.width}×${pr.size.height}` : ''} />
                  </View>
                  {!!d.note && <Text style={s.doorNote}>{d.note}</Text>}
                </Card>
              </Pressable>
            );
          })}
        </View>

        <Button
          title="Додај врата"
          icon="add-circle-outline"
          style={{ marginTop: 14 }}
          onPress={() => router.push({ pathname: '/door-form', params: { projectId: p.id } })}
        />
        <Button title="Извоз у Excel" icon="document-text-outline" variant="soft" style={{ marginTop: 10 }} onPress={onExport} />
      </ScrollView>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, text, link }: { icon: keyof typeof Ionicons.glyphMap; text: string; link?: string }) {
  return (
    <Pressable disabled={!link} onPress={() => link && Linking.openURL(link)} style={s.infoRow}>
      <Ionicons name={icon} size={18} color={link ? colors.primary : colors.muted} />
      <Text style={[s.infoText, link && { color: colors.primary }]}>{text}</Text>
    </Pressable>
  );
}

function BasisTag({ basis, size }: { basis: string; size: string }) {
  const map: Record<string, { text: string; bg: string; fg: string }> = {
    standard: { text: `Стандард ${size}`, bg: '#ECFDF3', fg: '#067647' },
    m2: { text: 'По m²', bg: colors.primarySoft, fg: colors.primary },
    manual: { text: 'Ручна цена', bg: '#F4F3FF', fg: '#5925DC' },
    none: { text: 'Нема цене', bg: colors.warningSoft, fg: '#B54708' },
  };
  const m = map[basis];
  return (
    <View style={[s.tag, { backgroundColor: m.bg, borderColor: m.bg }]}>
      <Text style={[s.tagText, { color: m.fg }]}>{m.text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  summary: { backgroundColor: colors.primary },
  summaryLabel: { color: '#C7D7FE', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  summaryTotal: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
  stats: { flexDirection: 'row', marginTop: 14 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#C7D7FE', fontSize: 12, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 15, color: colors.text, flex: 1 },
  note: { fontSize: 15, color: colors.text, lineHeight: 21 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  doorTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  doorPrice: { fontSize: 16, fontWeight: '700', color: colors.text },
  dims: { fontSize: 15, color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#D0D5DD' },
  doorNote: { marginTop: 8, fontSize: 13, color: colors.muted, fontStyle: 'italic' },
});
