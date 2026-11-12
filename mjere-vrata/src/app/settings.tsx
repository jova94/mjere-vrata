import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, colors, Field, IconButton, NumberInput, SectionTitle, Segmented } from '../components/ui';
import { defaultSettings, uid } from '../lib/defaults';
import { confirmDestructive } from '../lib/dialog';
import { useStore } from '../lib/store';
import { DoorColor, LinePattern, StandardSize, SurchargeType } from '../lib/types';

const SWATCHES = ['#FFFFFF', '#F3EDE2', '#C49A6C', '#8B5E3C', '#6B4A34', '#9AA0A6', '#3B3F45', '#111111'];

export default function SettingsScreen() {
  const { settings, updateSettings } = useStore();
  const cur = settings.currency;

  const updList = <K extends 'sizes' | 'colors' | 'lines'>(key: K, id: string, patch: Partial<(typeof settings)[K][number]>) =>
    updateSettings((s) => ({
      ...s,
      [key]: (s[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  const removeFrom = (key: 'sizes' | 'colors' | 'lines', id: string) =>
    updateSettings((s) => ({ ...s, [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id) }));

  const addSize = () =>
    updateSettings((s) => ({ ...s, sizes: [...s.sizes, { id: uid(), width: 80, height: 200, price: 0 } as StandardSize] }));
  const addColor = () =>
    updateSettings((s) => ({
      ...s,
      colors: [...s.colors, { id: uid(), name: 'Нова боја', hex: '#9AA0A6', surchargeType: 'fixed', surcharge: 0 } as DoorColor],
    }));
  const addLine = () =>
    updateSettings((s) => ({
      ...s,
      lines: [...s.lines, { id: uid(), name: 'Нови дизајн', surchargeType: 'fixed', surcharge: 0 } as LinePattern],
    }));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {/* Opšte */}
      <SectionTitle>Опште</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field
            label="Валута"
            value={cur}
            onChangeText={(currency) => updateSettings((s) => ({ ...s, currency }))}
            style={{ width: 90 }}
          />
          <NumberInput
            label="Толеранција мере"
            suffix="cm"
            value={settings.tolerance}
            onChange={(n) => updateSettings((s) => ({ ...s, tolerance: n ?? 0 }))}
            style={{ flex: 1 }}
          />
        </View>
        <NumberInput
          label={`Цена по m² кад мера није стандардна (0 = искључено)`}
          suffix={cur}
          value={settings.pricePerM2}
          onChange={(n) => updateSettings((s) => ({ ...s, pricePerM2: n ?? 0 }))}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field
            label="Префикс броја"
            value={settings.numberPrefix}
            onChangeText={(numberPrefix) => updateSettings((s) => ({ ...s, numberPrefix }))}
            placeholder="нпр. П-"
            autoCapitalize="characters"
            style={{ width: 120 }}
          />
          <NumberInput
            label="Следећи број"
            value={settings.nextNumber}
            onChange={(n) => updateSettings((s) => ({ ...s, nextNumber: Math.max(1, Math.round(n ?? 1)) }))}
            style={{ flex: 1 }}
          />
        </View>
        <Text style={s.help}>
          Цена се узима од стандардне мере која је најближа унетој, ако се ширина и висина разликују највише за
          толеранцију. На њу се додају доплате за боју и линије.
        </Text>
      </Card>

      {/* Standardne mjere */}
      <SectionTitle right={<IconButton name="add-circle" onPress={addSize} />}>Стандардне мере и цене</SectionTitle>
      <Card style={{ paddingVertical: 8 }}>
        <View style={s.headRow}>
          <Text style={[s.head, { flex: 1 }]}>Ширина cm</Text>
          <Text style={[s.head, { flex: 1 }]}>Висина cm</Text>
          <Text style={[s.head, { flex: 1.3 }]}>Цена {cur}</Text>
          <View style={{ width: 30 }} />
        </View>
        {settings.sizes.map((z) => (
          <View key={z.id} style={s.row}>
            <NumberInput value={z.width} onChange={(n) => updList('sizes', z.id, { width: n ?? 0 })} style={{ flex: 1 }} />
            <NumberInput value={z.height} onChange={(n) => updList('sizes', z.id, { height: n ?? 0 })} style={{ flex: 1 }} />
            <NumberInput value={z.price} onChange={(n) => updList('sizes', z.id, { price: n ?? 0 })} style={{ flex: 1.3 }} />
            <IconButton name="trash-outline" color={colors.danger} size={20} onPress={() => removeFrom('sizes', z.id)} />
          </View>
        ))}
        {settings.sizes.length === 0 && <Text style={s.empty}>Нема мера. Додај са +.</Text>}
      </Card>

      {/* Boje */}
      <SectionTitle right={<IconButton name="add-circle" onPress={addColor} />}>Боје и доплате</SectionTitle>
      <View style={{ gap: 10 }}>
        {settings.colors.map((c) => (
          <Card key={c.id}>
            <View style={s.row}>
              <View style={[s.swatchBig, { backgroundColor: c.hex }]} />
              <TextInput
                value={c.name}
                onChangeText={(name) => updList('colors', c.id, { name })}
                style={s.nameInput}
              />
              <IconButton name="trash-outline" color={colors.danger} size={20} onPress={() => confirmRemove(() => removeFrom('colors', c.id))} />
            </View>
            <View style={s.swatches}>
              {SWATCHES.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => updList('colors', c.id, { hex: h })}
                  style={[s.swatch, { backgroundColor: h }, c.hex === h && s.swatchSelected]}
                />
              ))}
            </View>
            <SurchargeEditor
              type={c.surchargeType}
              value={c.surcharge}
              currency={cur}
              onChange={(p) => updList('colors', c.id, p)}
            />
          </Card>
        ))}
      </View>

      {/* Linije */}
      <SectionTitle right={<IconButton name="add-circle" onPress={addLine} />}>Линије на вратима</SectionTitle>
      <View style={{ gap: 10 }}>
        {settings.lines.map((l) => (
          <Card key={l.id}>
            <View style={s.row}>
              <TextInput value={l.name} onChangeText={(name) => updList('lines', l.id, { name })} style={s.nameInput} />
              <IconButton name="trash-outline" color={colors.danger} size={20} onPress={() => confirmRemove(() => removeFrom('lines', l.id))} />
            </View>
            <SurchargeEditor
              type={l.surchargeType}
              value={l.surcharge}
              currency={cur}
              onChange={(p) => updList('lines', l.id, p)}
            />
          </Card>
        ))}
      </View>

      <Button
        title="Врати подразумевани ценовник"
        icon="refresh"
        variant="danger"
        style={{ marginTop: 28 }}
        onPress={() =>
          confirmDestructive('Вратити подразумеване цене?', 'Мере, боје и линије биће замењене примером. Пројекти остају.', 'Врати', () =>
            updateSettings((s) => ({
              ...s,
              sizes: defaultSettings.sizes,
              colors: defaultSettings.colors,
              lines: defaultSettings.lines,
            })),
          )
        }
      />
    </ScrollView>
  );
}

function confirmRemove(onYes: () => void) {
  confirmDestructive('Обрисати ставку?', 'Врата која је користе остаће без ове доплате.', 'Обриши', onYes);
}

function SurchargeEditor({
  type,
  value,
  currency,
  onChange,
}: {
  type: SurchargeType;
  value: number;
  currency: string;
  onChange: (p: { surchargeType?: SurchargeType; surcharge?: number }) => void;
}) {
  return (
    <View style={[s.row, { marginTop: 10 }]}>
      <Text style={s.label}>Доплата</Text>
      <Segmented
        value={type}
        options={[
          { value: 'fixed', label: `+ ${currency}` },
          { value: 'percent', label: '+ %' },
        ]}
        onChange={(surchargeType) => onChange({ surchargeType })}
      />
      <NumberInput
        value={value}
        onChange={(n) => onChange({ surcharge: n ?? 0 })}
        suffix={type === 'percent' ? '%' : currency}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  help: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  headRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  head: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  empty: { color: colors.muted, paddingVertical: 10, textAlign: 'center' },
  nameInput: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text, paddingVertical: 4 },
  label: { fontSize: 14, color: colors.muted },
  swatchBig: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#D0D5DD' },
  swatches: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#D0D5DD' },
  swatchSelected: { borderWidth: 3, borderColor: colors.primary },
});
