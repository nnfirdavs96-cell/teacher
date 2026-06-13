import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  satellites,
  freqBands,
  dvbt2Channels,
  wifiChannels,
} from '@/data/reference';
import { Card, H1, H3, Small, Segmented, DataTable, Pill, NoteBox } from '@/components/ui';
import { colors, spacing, font } from '@/constants/theme';

type Tab = 'Спутники' | 'Диапазоны' | 'DVB-T2' | 'Wi-Fi';

export default function ReferenceFreqScreen() {
  const [tab, setTab] = useState<Tab>('Спутники');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>Частоты и спутники</H1>
        <Segmented options={['Спутники', 'Диапазоны', 'DVB-T2', 'Wi-Fi'] as Tab[]} value={tab} onChange={setTab} />

        {tab === 'Спутники' && <SatList />}
        {tab === 'Диапазоны' && <Bands />}
        {tab === 'DVB-T2' && <Dvbt2 />}
        {tab === 'Wi-Fi' && <Wifi />}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SatList() {
  return (
    <>
      <NoteBox>Частоты транспондеров меняются операторами. Сверяйтесь с актуальными данными (lyngsat.com).</NoteBox>
      {satellites.map((s) => (
        <Card key={s.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <Pill text={s.position} color={colors.accent} />
            <Pill text={s.band} color={colors.info} />
          </View>
          <H3>{s.name}</H3>
          {s.beam ? <Small>Луч: {s.beam}</Small> : null}
          <View style={{ height: spacing.sm }} />
          <DataTable
            headers={['Частота', 'Пол.', 'SR', 'Система']}
            rows={s.transponders.map((t) => [
              `${t.freq}`,
              t.pol,
              `${t.sr}`,
              t.system,
            ])}
          />
        </Card>
      ))}
    </>
  );
}

function Bands() {
  return (
    <Card>
      <H3>Частотные диапазоны</H3>
      <View style={{ height: spacing.sm }} />
      <DataTable
        headers={['Диапазон', 'Частоты', 'Применение']}
        rows={freqBands.map((b) => [b.name, b.range, b.use])}
      />
    </Card>
  );
}

function Dvbt2() {
  return (
    <Card>
      <H3>Каналы DVB-T2 (УВЧ)</H3>
      <Small>f = 306 + 8 × N (МГц)</Small>
      <View style={{ height: spacing.sm }} />
      <DataTable
        headers={['ТВК', 'Частота, МГц']}
        rows={dvbt2Channels.map((c) => [`${c.ch}`, `${c.freq}`])}
      />
    </Card>
  );
}

function Wifi() {
  return (
    <Card>
      <H3>Каналы Wi-Fi</H3>
      <Small>На 2.4 ГГц используй только 1, 6 или 11 (не пересекаются).</Small>
      <View style={{ height: spacing.sm }} />
      {wifiChannels.map((c) => (
        <View
          key={`${c.band}-${c.ch}`}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontSize: font.body, fontWeight: '600' }}>
            Канал {c.ch}
            {c.recommended ? '  ⭐' : ''}
          </Text>
          <Text style={{ color: colors.textDim, fontSize: font.small }}>
            {c.freq} МГц · {c.band}
          </Text>
        </View>
      ))}
    </Card>
  );
}
