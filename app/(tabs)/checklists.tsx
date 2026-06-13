import { useState } from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { checklists, Checklist } from '@/data/checklists';
import { Card, H1, H3, Small, Body, Pill } from '@/components/ui';
import { colors, spacing, font } from '@/constants/theme';

export default function ChecklistsScreen() {
  const [active, setActive] = useState<string | null>(null);
  const current = checklists.find((c) => c.id === active);

  if (current) {
    return <ChecklistDetail list={current} onBack={() => setActive(null)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>Чеклисты монтажа</H1>
        <Body dim>Пошаговые алгоритмы. Открой и отмечай выполненное.</Body>
        {checklists.map((c) => (
          <Card key={c.id} onPress={() => setActive(c.id)}>
            <Pill text={c.domain} color={colors.good} />
            <View style={{ height: spacing.xs }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <H3>{c.title}</H3>
                <Small>{c.items.length} шагов</Small>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </View>
          </Card>
        ))}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ChecklistDetail({ list, onBack }: { list: Checklist; onBack: () => void }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(done);
    next.has(i) ? next.delete(i) : next.add(i);
    setDone(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Pressable onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={{ color: colors.accent, fontSize: font.body }}>Все чеклисты</Text>
        </Pressable>

        <H1>{list.title}</H1>
        <Small>
          Выполнено {done.size} из {list.items.length}
        </Small>
        <View style={{ height: spacing.md }} />

        {list.items.map((item, i) => {
          const isDone = done.has(i);
          return (
            <Card key={i} onPress={() => toggle(i)}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons
                  name={isDone ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isDone ? colors.good : colors.textFaint}
                  style={{ marginRight: spacing.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: isDone ? colors.textFaint : colors.text,
                      fontSize: font.body,
                      fontWeight: '600',
                      textDecorationLine: isDone ? 'line-through' : 'none',
                      lineHeight: 21,
                    }}
                  >
                    {i + 1}. {item.text}
                  </Text>
                  {item.detail ? <Small>{item.detail}</Small> : null}
                </View>
              </View>
            </Card>
          );
        })}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
