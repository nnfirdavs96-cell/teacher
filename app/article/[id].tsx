import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { findArticle } from '@/data/knowledge';
import { Card, H1, H3, Body, Bullet, NoteBox, DataTable, Small, Pill } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = id ? findArticle(id) : null;

  if (!found) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.lg }}>
        <Body>Статья не найдена.</Body>
      </View>
    );
  }

  const { category, article } = found;

  return (
    <>
      <Stack.Screen options={{ title: category.title }} />
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        <H1>{article.title}</H1>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
          {article.tags.slice(0, 5).map((t) => (
            <Pill key={t} text={t} color={category.color} />
          ))}
        </View>

        {article.sections.map((s, i) => (
          <Card key={i}>
            <H3>{s.heading}</H3>
            {s.body?.map((p, pi) => (
              <Body key={pi}>{p}</Body>
            ))}
            {s.bullets?.map((b, bi) => (
              <Bullet key={bi}>{b}</Bullet>
            ))}
            {s.table ? (
              <View style={{ marginTop: spacing.sm }}>
                <DataTable headers={s.table.headers} rows={s.table.rows} />
              </View>
            ) : null}
            {s.note ? <NoteBox>{s.note}</NoteBox> : null}
          </Card>
        ))}

        <Small>
          Данные приведены как типовые ориентиры для монтажа. Конкретный оператор может задавать
          свои нормы и частоты.
        </Small>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}
