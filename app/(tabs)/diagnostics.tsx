import { useState } from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { symptoms, Symptom } from '@/data/diagnostics';
import { Card, H1, H3, Small, Body, Pill } from '@/components/ui';
import { colors, spacing, font } from '@/constants/theme';

export default function DiagnosticsScreen() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>Диагностика</H1>
        <Body dim>Выбери симптом — получишь пошаговый разбор причин и решений.</Body>

        {symptoms.map((s) => (
          <SymptomCard key={s.id} s={s} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />
        ))}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SymptomCard({ s, open, onToggle }: { s: Symptom; open: boolean; onToggle: () => void }) {
  return (
    <Card>
      <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Pill text={s.domain} color={colors.info} />
          <View style={{ height: spacing.xs }} />
          <H3>{s.title}</H3>
          <Small>{s.summary}</Small>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textFaint} />
      </Pressable>

      {open && (
        <View style={{ marginTop: spacing.md }}>
          {s.steps.map((st, i) => (
            <View key={i} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: colors.accentDim,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Text style={{ color: colors.accent, fontWeight: '700', fontSize: font.small }}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: font.body, flex: 1, fontWeight: '600', lineHeight: 21 }}>
                  {st.check}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: spacing.xs, paddingLeft: 30 }}>
                <Ionicons name="arrow-forward" size={14} color={colors.good} style={{ marginTop: 3, marginRight: 6 }} />
                <Text style={{ color: colors.textDim, fontSize: font.small, flex: 1, lineHeight: 20 }}>
                  {st.fix}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
