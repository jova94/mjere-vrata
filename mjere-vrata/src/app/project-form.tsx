import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, Field, IconButton } from '../components/ui';
import { confirmDestructive, showInfo } from '../lib/dialog';
import { useStore } from '../lib/store';

export default function ProjectForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getProject, createProject, updateProject, deleteProject, suggestNumber } = useStore();
  const existing = id ? getProject(id) : undefined;

  const [form, setForm] = useState({
    number: existing?.number ?? suggestNumber(),
    name: existing?.name ?? '',
    phone: existing?.phone ?? '',
    email: existing?.email ?? '',
    address: existing?.address ?? '',
    note: existing?.note ?? '',
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim() && !form.number.trim()) {
      return showInfo('Недостаје назив', 'Унеси број или назив пројекта.');
    }
    const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as typeof form;
    if (existing) {
      updateProject(existing.id, data);
      router.back();
    } else {
      const p = createProject(data);
      router.replace({ pathname: '/project/[id]', params: { id: p.id } });
    }
  };

  const remove = () => {
    if (!existing) return;
    confirmDestructive('Обрисати пројекат?', `${existing.number} ${existing.name} и сва врата у њему биће обрисани.`, 'Обриши', () => {
      deleteProject(existing.id);
      router.dismissAll();
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Уреди пројекат' : 'Нови пројекат',
          headerLeft: () => <IconButton name="close" onPress={() => router.back()} />,
        }}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Card>
          <Field label="Број пројекта" value={form.number} onChangeText={set('number')} />
          <Field label="Назив / клијент" value={form.name} onChangeText={set('name')} placeholder="нпр. Марко Марковић" />
          <Field label="Телефон" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <Field
            label="Имејл"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field label="Адреса" value={form.address} onChangeText={set('address')} />
          <Field
            label="Белешка"
            value={form.note}
            onChangeText={set('note')}
            multiline
            style={{ minHeight: 90, textAlignVertical: 'top' }}
            placeholder="Додатне информације, договори, рок..."
          />
        </Card>
        <Button title="Сачувај" icon="checkmark" onPress={save} style={{ marginTop: 16 }} />
        {existing && (
          <Button title="Обриши пројекат" icon="trash-outline" variant="danger" onPress={remove} style={{ marginTop: 10 }} />
        )}
      </ScrollView>
    </>
  );
}
