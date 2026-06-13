import { useState, useMemo } from 'react';
import { ScrollView, View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoriesForRole, searchArticles } from '@/data/knowledge';
import { useRole, ROLE_LABEL } from '@/lib/role';
import { Card, H1, H3, Small, Body } from '@/components/ui';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function ReferenceScreen() {
  const router = useRouter();
  const { role, setRole } = useRole();
  const [query, setQuery] = useState('');
  const cats = useMemo(() => (role ? categoriesForRole(role) : []), [role]);
  const results = useMemo(() => searchArticles(query, role ?? undefined), [query, role]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <H1>Справочник</H1>
          <Pressable onPress={() => setRole(null)} style={styles.roleChip}>
            <Ionicons name="person-circle" size={16} color={colors.accent} />
            <Text style={styles.roleChipText}>{role ? ROLE_LABEL[role] : 'Профиль'}</Text>
            <Ionicons name="swap-horizontal" size={14} color={colors.textFaint} />
          </Pressable>
        </View>
        <Body dim>
          {role === 'net'
            ? 'Сети · IP/подсети · роутеры · VLAN · Wi-Fi · оптика · видеонаблюдение'
            : 'ТВ · спутник · АНТ · эфир · кабель · уровни сигнала'}
        </Body>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            style={styles.search}
            placeholder="Поиск: dBm, поляризация, gpon..."
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>

        {query ? (
          <View>
            <Small>Найдено: {results.length}</Small>
            {results.map(({ category, article }) => (
              <Card key={article.id} onPress={() => router.push(`/article/${article.id}`)}>
                <View style={styles.resultRow}>
                  <Ionicons name={category.icon as any} size={20} color={category.color} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <H3>{article.title}</H3>
                    <Small>{article.summary}</Small>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          cats.map((cat) => (
            <View key={cat.id} style={{ marginTop: spacing.md }}>
              <View style={styles.catHeader}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                <H3>{cat.title}</H3>
              </View>
              {cat.articles.map((a) => (
                <Card key={a.id} onPress={() => router.push(`/article/${a.id}`)}>
                  <View style={styles.resultRow}>
                    <View style={[styles.dot, { backgroundColor: cat.color }]} />
                    <View style={{ flex: 1 }}>
                      <H3>{a.title}</H3>
                      <Small>{a.summary}</Small>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                  </View>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  search: { flex: 1, color: colors.text, fontSize: font.body, paddingVertical: spacing.md },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
  },
  roleChipText: { color: colors.accent, fontSize: font.tiny, fontWeight: '700' },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
});
