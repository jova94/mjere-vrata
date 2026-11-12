import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, colors, IconButton } from '../components/ui';
import { showInfo } from '../lib/dialog';
import { exportAll } from '../lib/excel';
import { formatDate, formatMoney, formatNumber } from '../lib/format';
import { projectTotals } from '../lib/pricing';
import { useStore } from '../lib/store';

export default function ProjectsScreen() {
  const { projects, settings } = useStore();
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!q) return sorted;
    return sorted.filter((p) =>
      [p.number, p.name, p.phone, p.email, p.address].some((f) => f.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  const onExportAll = async () => {
    if (projects.length === 0) return showInfo('Нема пројеката', 'Додај бар један пројекат за извоз.');
    try {
      await exportAll(filtered, settings);
    } catch (e) {
      showInfo('Грешка при извозу', String(e));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" accessibilityLabel="Махагони" />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <IconButton name="download-outline" onPress={onExportAll} />
              <IconButton name="settings-outline" onPress={() => router.push('/settings')} />
            </View>
          ),
          headerSearchBarOptions: {
            placeholder: 'Претрага',
            onChangeText: (e) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="albums-outline" size={48} color="#C0C6D0" />
            <Text style={s.emptyTitle}>{query ? 'Нема резултата' : 'Још нема пројеката'}</Text>
            {!query && <Text style={s.emptyText}>Додирни „Нови пројекат“ да додаш први пројекат и измериш врата.</Text>}
          </View>
        }
        renderItem={({ item: p }) => {
          const t = projectTotals(p, settings);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Card>
                <View style={s.rowBetween}>
                  <Text style={s.title} numberOfLines={1}>
                    <Text style={s.number}>{p.number} </Text>
                    {p.name || 'Без назива'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#C0C6D0" />
                </View>

                <View style={[s.rowBetween, { marginTop: 10 }]}>
                  <View style={{ flex: 1, gap: 6 }}>
                    {!!p.phone && (
                      <Pressable style={s.contact} onPress={() => Linking.openURL(`tel:${p.phone.replace(/\s/g, '')}`)}>
                        <Ionicons name="call" size={14} color={colors.primary} />
                        <Text style={s.link}>{p.phone}</Text>
                      </Pressable>
                    )}
                    {!!p.email && (
                      <Pressable style={s.contact} onPress={() => Linking.openURL(`mailto:${p.email}`)}>
                        <Ionicons name="mail" size={14} color={colors.primary} />
                        <Text style={s.link} numberOfLines={1}>
                          {p.email}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={s.price}>{formatMoney(t.total, settings.currency)}</Text>
                </View>

                <View style={s.footer}>
                  <Text style={s.meta}>{formatDate(p.createdAt)}</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Text style={s.meta}>🚪 {t.count}</Text>
                    <Text style={s.meta}>{formatNumber(t.area)} m²</Text>
                    <Text style={s.meta}>{formatNumber(t.perimeter)} m</Text>
                  </View>
                </View>
                {t.unpriced > 0 && (
                  <Text style={s.warn}>⚠︎ {t.unpriced} ком без цене (мера ван стандарда)</Text>
                )}
              </Card>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => router.push('/project-form')}
        style={({ pressed }) => [s.fab, { bottom: insets.bottom + 20, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={s.fabText}>Нови пројекат</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  logo: { width: 66, height: 36 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  number: { color: colors.muted, fontWeight: '600' },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { color: colors.primary, fontSize: 14 },
  price: { fontSize: 18, fontWeight: '700', color: colors.text },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  meta: { fontSize: 13, color: colors.muted },
  warn: { marginTop: 8, fontSize: 12, color: colors.warning },
  empty: { alignItems: 'center', marginTop: 80, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
