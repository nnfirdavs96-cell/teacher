import { useState } from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { modulesForRole, Module, Lesson } from '@/data/courses';
import { useRole } from '@/lib/role';
import { useProgress } from '@/lib/progress';
import { Card, H1, H3, Body, Small, Bullet, DataTable, NoteBox, Pill } from '@/components/ui';
import { colors, spacing, radius, font } from '@/constants/theme';

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={{ height: 8, backgroundColor: colors.bgCardAlt, borderRadius: 4, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(value * 100)}%`, height: 8, backgroundColor: colors.good }} />
    </View>
  );
}

const LEVEL_COLOR: Record<Module['level'], string> = {
  'Новичок': colors.good,
  'Средний': colors.warn,
  'Профи': colors.bad,
};

export default function LearnScreen() {
  const { role } = useRole();
  const { isDone, toggle } = useProgress();
  const [modId, setModId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);

  const mods = role ? modulesForRole(role) : [];
  const mod = mods.find((m) => m.id === modId) ?? null;
  const lesson = mod?.lessons.find((l) => l.id === lessonId) ?? null;

  const doneCount = (m: Module) => m.lessons.filter((l) => isDone(l.id)).length;
  const allLessons = mods.flatMap((m) => m.lessons);
  const totalDone = allLessons.filter((l) => isDone(l.id)).length;

  // ── Урок ──
  if (mod && lesson) {
    const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
    const next = mod.lessons[idx + 1];
    const done = isDone(lesson.id);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <Pressable onPress={() => setLessonId(null)} style={navBack}>
            <Ionicons name="chevron-back" size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, fontSize: font.body }}>{mod.title}</Text>
          </Pressable>

          <Small color={mod.color}>Урок {idx + 1} из {mod.lessons.length} · {lesson.minutes} мин</Small>
          <H1>{lesson.title}</H1>

          <View style={[goalBox, { borderLeftColor: mod.color }]}>
            <Text style={{ color: colors.textDim, fontSize: font.small }}>🎯 Цель</Text>
            <Text style={{ color: colors.text, fontSize: font.body, lineHeight: 22 }}>{lesson.goal}</Text>
          </View>

          {lesson.sections.map((s, i) => (
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

          {lesson.practice?.length ? (
            <Card style={{ borderColor: colors.accent }}>
              <H3>🛠️ Практика</H3>
              {lesson.practice.map((p, i) => (
                <Bullet key={i}>{p}</Bullet>
              ))}
            </Card>
          ) : null}

          <Card style={{ backgroundColor: colors.bgCardAlt }}>
            <H3>📌 Главное</H3>
            {lesson.keyPoints.map((p, i) => (
              <Bullet key={i}>{p}</Bullet>
            ))}
          </Card>

          <Pressable
            onPress={() => toggle(lesson.id)}
            style={[doneBtn, { backgroundColor: done ? colors.good : colors.accent }]}
          >
            <Ionicons name={done ? 'checkmark-done' : 'checkmark'} size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: font.body, marginLeft: spacing.sm }}>
              {done ? 'Пройдено' : 'Отметить пройденным'}
            </Text>
          </Pressable>

          {next ? (
            <Pressable onPress={() => setLessonId(next.id)} style={nextBtn}>
              <Text style={{ color: colors.accent, fontSize: font.body }}>Следующий урок: {next.title}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.accent} />
            </Pressable>
          ) : (
            <Text style={{ color: colors.textFaint, textAlign: 'center', marginTop: spacing.lg }}>
              Это последний урок модуля 🎉
            </Text>
          )}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Модуль (список уроков) ──
  if (mod) {
    const dc = doneCount(mod);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <Pressable onPress={() => setModId(null)} style={navBack}>
            <Ionicons name="chevron-back" size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, fontSize: font.body }}>Все модули</Text>
          </Pressable>

          <Pill text={mod.level} color={LEVEL_COLOR[mod.level]} />
          <View style={{ height: spacing.xs }} />
          <H1>{mod.title}</H1>
          <Body dim>{mod.subtitle}</Body>
          <View style={{ marginVertical: spacing.md }}>
            <Small>Пройдено {dc} из {mod.lessons.length}</Small>
            <View style={{ height: spacing.xs }} />
            <ProgressBar value={mod.lessons.length ? dc / mod.lessons.length : 0} />
          </View>

          {mod.lessons.map((l, i) => {
            const done = isDone(l.id);
            return (
              <Card key={l.id} onPress={() => setLessonId(l.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={done ? colors.good : colors.textFaint}
                    style={{ marginRight: spacing.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <H3>{i + 1}. {l.title}</H3>
                    <Small>{l.minutes} мин · {l.goal}</Small>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </View>
              </Card>
            );
          })}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Обзор курса ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>Обучение</H1>
        <Body dim>
          {role === 'net'
            ? 'Путь сисадмина: с нуля до профи. Проходи модули по порядку.'
            : 'Курс ТВ-мастера: основы приёма и наводки.'}
        </Body>

        <Card>
          <H3>Общий прогресс</H3>
          <Small>Пройдено {totalDone} из {allLessons.length} уроков</Small>
          <View style={{ height: spacing.sm }} />
          <ProgressBar value={allLessons.length ? totalDone / allLessons.length : 0} />
        </Card>

        {mods.map((m) => {
          const dc = doneCount(m);
          const pct = m.lessons.length ? dc / m.lessons.length : 0;
          return (
            <Card key={m.id} onPress={() => setModId(m.id)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <View style={[iconBox, { backgroundColor: m.color + '22' }]}>
                  <Ionicons name={m.icon as any} size={24} color={m.color} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <H3>{m.title}</H3>
                    {dc === m.lessons.length && m.lessons.length > 0 ? (
                      <Ionicons name="checkmark-circle" size={16} color={colors.good} />
                    ) : null}
                  </View>
                  <Small>{m.subtitle}</Small>
                </View>
                <Pill text={m.level} color={LEVEL_COLOR[m.level]} />
              </View>
              <ProgressBar value={pct} />
              <Small>{dc}/{m.lessons.length} уроков</Small>
            </Card>
          );
        })}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const navBack = { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md } as const;
const goalBox = {
  backgroundColor: colors.bgCard,
  borderLeftWidth: 3,
  borderRadius: radius.sm,
  padding: spacing.md,
  marginVertical: spacing.md,
} as const;
const iconBox = { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' } as const;
const doneBtn = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: spacing.md,
  borderRadius: radius.sm,
  marginTop: spacing.lg,
} as const;
const nextBtn = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colors.bgCard,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.sm,
  padding: spacing.md,
  marginTop: spacing.md,
} as const;
