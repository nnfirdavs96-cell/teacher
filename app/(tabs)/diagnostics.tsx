import { useState } from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { wizards, getWizard, Wizard, WizardNode, WizardLink } from '@/data/wizards';
import { Card, H1, H3, Small, Body } from '@/components/ui';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function SolverScreen() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const router = useRouter();

  const wiz = activeId ? getWizard(activeId) : null;

  const open = (w: Wizard) => {
    setActiveId(w.id);
    setStack([w.start]);
  };
  const goNext = (nodeId: string) => setStack((s) => [...s, nodeId]);
  const goBack = () => {
    if (stack.length <= 1) {
      setActiveId(null);
      setStack([]);
    } else {
      setStack((s) => s.slice(0, -1));
    }
  };
  const restart = () => wiz && setStack([wiz.start]);
  const exit = () => {
    setActiveId(null);
    setStack([]);
  };

  const handleLink = (link: WizardLink) => {
    if (link.href.startsWith('wizard:')) {
      const id = link.href.slice('wizard:'.length);
      const w = getWizard(id);
      if (w) open(w);
      return;
    }
    router.push(link.href as any);
  };

  // ── Список мастеров ──
  if (!wiz) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <H1>Помощь: что случилось?</H1>
          <Body dim>Выберите проблему — проведём по шагам простыми словами и подскажем решение.</Body>
          {wizards.map((w) => (
            <Card key={w.id} onPress={() => open(w)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[bigIcon, { backgroundColor: w.color + '22' }]}>
                  <Ionicons name={w.icon as any} size={26} color={w.color} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <H3>{w.title}</H3>
                  <Small>{w.subtitle}</Small>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
              </View>
            </Card>
          ))}

          <Card onPress={() => router.push('/assistant')} style={{ borderColor: colors.accent }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[bigIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name="sparkles" size={26} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <H3>Спросить ИИ-помощника</H3>
                <Small>Не нашли свою ситуацию? Опишите словами — ИИ подскажет.</Small>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
            </View>
          </Card>
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const node: WizardNode = wiz.nodes[stack[stack.length - 1]];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* шапка навигации */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Pressable onPress={goBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back" size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, fontSize: font.body }}>Назад</Text>
          </Pressable>
          <Pressable onPress={exit}>
            <Text style={{ color: colors.textFaint, fontSize: font.small }}>Все темы</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
          <Ionicons name={wiz.icon as any} size={18} color={wiz.color} />
          <Small color={wiz.color}>{wiz.title}</Small>
        </View>

        {node.type === 'question' ? (
          <QuestionView node={node} onPick={goNext} />
        ) : (
          <ResultView node={node} onLink={handleLink} onRestart={restart} />
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuestionView({ node, onPick }: { node: WizardNode; onPick: (id: string) => void }) {
  return (
    <View>
      <H1>{node.title}</H1>
      {node.text ? <Body dim>{node.text}</Body> : null}
      <View style={{ height: spacing.sm }} />
      {node.options?.map((o) => (
        <Pressable
          key={o.next + o.label}
          onPress={() => onPick(o.next)}
          style={({ pressed }) => [optionBtn, pressed && { opacity: 0.7, borderColor: colors.accent }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: font.h3, fontWeight: '600' }}>{o.label}</Text>
            {o.hint ? <Small>{o.hint}</Small> : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.accent} />
        </Pressable>
      ))}
    </View>
  );
}

function ResultView({
  node,
  onLink,
  onRestart,
}: {
  node: WizardNode;
  onLink: (l: WizardLink) => void;
  onRestart: () => void;
}) {
  const sev = node.severity ?? 'info';
  const sevColor =
    sev === 'good' ? colors.good : sev === 'warn' ? colors.warn : sev === 'bad' ? colors.bad : colors.info;
  const sevIcon =
    sev === 'good' ? 'checkmark-circle' : sev === 'bad' ? 'alert-circle' : sev === 'warn' ? 'warning' : 'information-circle';

  return (
    <View>
      <View style={[banner, { backgroundColor: sevColor + '1f', borderColor: sevColor + '66' }]}>
        <Ionicons name={sevIcon as any} size={24} color={sevColor} />
        <Text style={{ color: colors.text, fontSize: font.h2, fontWeight: '700', flex: 1, marginLeft: spacing.sm }}>
          {node.title}
        </Text>
      </View>

      {node.text ? <Body>{node.text}</Body> : null}

      <Card>
        <H3>Что делать</H3>
        {node.steps?.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
            <View style={stepNum}>
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: font.small }}>{i + 1}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: font.body, lineHeight: 22, flex: 1 }}>{s}</Text>
          </View>
        ))}
      </Card>

      {node.links?.length ? (
        <View style={{ marginTop: spacing.sm }}>
          {node.links.map((l) => (
            <Pressable
              key={l.href + l.label}
              onPress={() => onLink(l)}
              style={({ pressed }) => [linkBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="arrow-forward-circle" size={20} color={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: font.body, marginLeft: spacing.sm, fontWeight: '600' }}>
                {l.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable onPress={onRestart} style={{ alignSelf: 'center', marginTop: spacing.lg }}>
        <Text style={{ color: colors.textDim, fontSize: font.small }}>↺ Начать заново</Text>
      </Pressable>
    </View>
  );
}

const bigIcon = {
  width: 48,
  height: 48,
  borderRadius: radius.md,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const optionBtn = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.bgCard,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  padding: spacing.lg,
  marginBottom: spacing.md,
} as const;

const banner = {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderRadius: radius.md,
  padding: spacing.md,
  marginBottom: spacing.md,
} as const;

const stepNum = {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: colors.accentDim,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: spacing.sm,
} as const;

const linkBtn = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.bgCard,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.sm,
  padding: spacing.md,
  marginBottom: spacing.sm,
} as const;
