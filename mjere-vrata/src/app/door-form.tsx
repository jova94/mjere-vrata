import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Chip, colors, Field, IconButton, NumberInput, SectionTitle } from '../components/ui';
import { uid } from '../lib/defaults';
import { confirmDestructive, showInfo } from '../lib/dialog';
import { formatMoney, formatNumber } from '../lib/format';
import { doorArea, nearestSize, priceDoor } from '../lib/pricing';
import { useStore } from '../lib/store';
import { Door } from '../lib/types';

export default function DoorForm() {
  const { projectId, doorId } = useLocalSearchParams<{ projectId: string; doorId?: string }>();
  const { getProject, settings, saveDoor, deleteDoor } = useStore();
  const project = getProject(projectId);
  const existing = project?.doors.find((d) => d.id === doorId);
  const last = project?.doors[project.doors.length - 1];

  const [door, setDoor] = useState<Door>(
    () =>
      existing ?? {
        id: uid(),
        label: '',
        width: 0,
        height: 0,
        quantity: 1,
        colorId: last?.colorId ?? settings.colors[0]?.id ?? null,
        lineId: last?.lineId ?? settings.lines[0]?.id ?? null,
        note: '',
        priceOverride: null,
      },
  );
  const [manual, setManual] = useState(existing?.priceOverride != null);
  const upd = (patch: Partial<Door>) => setDoor((d) => ({ ...d, ...patch }));

  const effective: Door = { ...door, priceOverride: manual ? door.priceOverride ?? 0 : null };
  const price = priceDoor(effective, settings);
  const near = nearestSize(door.width, door.height, settings.sizes);

  if (!project) return null;

  const save = () => {
    if (!(door.width > 0) || !(door.height > 0)) {
      return showInfo('Недостају мере', 'Унеси ширину и висину врата.');
    }
    saveDoor(project.id, { ...effective, label: door.label.trim(), note: door.note.trim() });
    router.back();
  };

  const remove = () =>
    confirmDestructive('Обрисати врата?', undefined, 'Обриши', () => {
      deleteDoor(project.id, door.id);
      router.back();
    });

  const cur = settings.currency;

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Уреди врата' : 'Нова врата',
          headerLeft: () => <IconButton name="close" onPress={() => router.back()} />,
          headerRight: () => <IconButton name="checkmark" onPress={save} />,
        }}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Card>
          <Field
            label="Ознака / просторија"
            value={door.label}
            onChangeText={(label) => upd({ label })}
            placeholder="нпр. Купатило, Спаваћа соба"
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <NumberInput label="Ширина" suffix="cm" value={door.width || null} onChange={(n) => upd({ width: n ?? 0 })} style={{ flex: 1 }} />
            <NumberInput label="Висина" suffix="cm" value={door.height || null} onChange={(n) => upd({ height: n ?? 0 })} style={{ flex: 1 }} />
            <NumberInput label="Ком" value={door.quantity || null} onChange={(n) => upd({ quantity: Math.max(1, Math.round(n ?? 1)) })} style={{ width: 70 }} />
          </View>
          {door.width > 0 && door.height > 0 && near && (
            <Text style={s.hint}>
              Најближа стандардна мера: {near.size.width}×{near.size.height} cm (одступање {formatNumber(near.deviation, 1)} cm
              {near.deviation <= settings.tolerance ? ' ✓' : `, толеранција ${settings.tolerance} cm`})
            </Text>
          )}
        </Card>

        <SectionTitle>Боја</SectionTitle>
        <View style={s.chips}>
          {settings.colors.map((c) => (
            <Chip key={c.id} label={c.name} swatch={c.hex} selected={door.colorId === c.id} onPress={() => upd({ colorId: c.id })} />
          ))}
        </View>

        <SectionTitle>Линије</SectionTitle>
        <View style={s.chips}>
          {settings.lines.map((l) => (
            <Chip key={l.id} label={l.name} selected={door.lineId === l.id} onPress={() => upd({ lineId: l.id })} />
          ))}
        </View>

        <SectionTitle>Цена</SectionTitle>
        <Card>
          {!manual && (
            <>
              <PriceRow
                label={
                  price.basis === 'standard'
                    ? `Основна (${price.size!.width}×${price.size!.height})`
                    : price.basis === 'm2'
                      ? `По m² (${formatNumber(doorArea(door))} m²)`
                      : 'Основна'
                }
                value={price.basis === 'none' ? '—' : formatMoney(price.base, cur)}
              />
              <PriceRow label="Доплата боја" value={formatMoney(price.colorAdd, cur)} />
              <PriceRow label="Доплата линије" value={formatMoney(price.linesAdd, cur)} />
              {price.basis === 'none' && door.width > 0 && door.height > 0 && (
                <Text style={s.warn}>
                  Мера није близу ниједне стандардне. Додај меру у Подешавањима, укључи цену по m² или унеси ручну цену.
                </Text>
              )}
            </>
          )}
          <View style={[s.row, { marginTop: manual ? 0 : 8 }]}>
            <Text style={s.label}>Ручна цена по комаду</Text>
            <Switch value={manual} onValueChange={setManual} />
          </View>
          {manual && (
            <NumberInput
              value={door.priceOverride}
              onChange={(n) => upd({ priceOverride: n })}
              suffix={cur}
              placeholder="0,00"
              style={{ marginTop: 8 }}
            />
          )}
          <View style={s.divider} />
          <PriceRow label="Цена по комаду" value={formatMoney(price.unit, cur)} />
          <View style={s.row}>
            <Text style={s.totalLabel}>Укупно ({door.quantity} ком)</Text>
            <Text style={s.total}>{formatMoney(price.total, cur)}</Text>
          </View>
        </Card>

        <SectionTitle>Белешка</SectionTitle>
        <Card>
          <Field
            label="Напомена за ова врата"
            value={door.note}
            onChangeText={(note) => upd({ note })}
            multiline
            style={{ minHeight: 80, textAlignVertical: 'top' }}
            placeholder="нпр. отварање лево, зид 12 cm, квака хром..."
          />
        </Card>

        <Button title="Сачувај" icon="checkmark" onPress={save} style={{ marginTop: 16 }} />
        {existing && <Button title="Обриши врата" icon="trash-outline" variant="danger" onPress={remove} style={{ marginTop: 10 }} />}
      </ScrollView>
    </>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={[s.row, { paddingVertical: 4 }]}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, color: colors.muted, flexShrink: 1 },
  value: { fontSize: 15, color: colors.text, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  total: { fontSize: 22, fontWeight: '800', color: colors.primary },
  hint: { fontSize: 13, color: colors.muted, marginTop: -2 },
  warn: { fontSize: 13, color: '#B54708', marginTop: 8, lineHeight: 18 },
});
