import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { satellites, freqBands, dvbt2Channels, wifiChannels } from '@/data/reference';
import { useRole } from '@/lib/role';
import { Card, H1, H3, Small, Segmented, DataTable, Pill, NoteBox } from '@/components/ui';
import { colors, spacing, font } from '@/constants/theme';

const TV_TABS = ['Спутники', 'Диапазоны', 'DVB-T2', 'Wi-Fi'];
const NET_TABS = ['Wi-Fi', 'Порты', 'CIDR'];

export default function ReferenceFreqScreen() {
  const { role } = useRole();
  const tabs = role === 'net' ? NET_TABS : TV_TABS;
  const [tab, setTab] = useState<string>(tabs[0]);
  const active = tabs.includes(tab) ? tab : tabs[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>{role === 'net' ? 'Сетевые таблицы' : 'Частоты и спутники'}</H1>
        <Segmented options={tabs} value={active} onChange={setTab} />

        {active === 'Спутники' && <SatList />}
        {active === 'Диапазоны' && <Bands />}
        {active === 'DVB-T2' && <Dvbt2 />}
        {active === 'Wi-Fi' && <Wifi />}
        {active === 'Порты' && <Ports />}
        {active === 'CIDR' && <Cidr />}

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
            rows={s.transponders.map((t) => [`${t.freq}`, t.pol, `${t.sr}`, t.system])}
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
      <DataTable headers={['Диапазон', 'Частоты', 'Применение']} rows={freqBands.map((b) => [b.name, b.range, b.use])} />
    </Card>
  );
}

function Dvbt2() {
  return (
    <Card>
      <H3>Каналы DVB-T2 (УВЧ)</H3>
      <Small>f = 306 + 8 × N (МГц)</Small>
      <View style={{ height: spacing.sm }} />
      <DataTable headers={['ТВК', 'Частота, МГц']} rows={dvbt2Channels.map((c) => [`${c.ch}`, `${c.freq}`])} />
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

function Ports() {
  return (
    <Card>
      <H3>Частые порты</H3>
      <View style={{ height: spacing.sm }} />
      <DataTable
        headers={['Порт', 'Прот.', 'Назначение']}
        rows={[
          ['22', 'TCP', 'SSH'],
          ['53', 'TCP/UDP', 'DNS'],
          ['67/68', 'UDP', 'DHCP'],
          ['80', 'TCP', 'HTTP'],
          ['443', 'TCP', 'HTTPS'],
          ['554', 'TCP', 'RTSP (камеры)'],
          ['3389', 'TCP', 'RDP'],
          ['123', 'UDP', 'NTP (время)'],
          ['25/587', 'TCP', 'SMTP'],
          ['993/995', 'TCP', 'IMAP/POP3 SSL'],
        ]}
      />
    </Card>
  );
}

function Cidr() {
  return (
    <Card>
      <H3>Маски подсетей (CIDR)</H3>
      <View style={{ height: spacing.sm }} />
      <DataTable
        headers={['CIDR', 'Маска', 'Хостов']}
        rows={[
          ['/30', '255.255.255.252', '2'],
          ['/29', '255.255.255.248', '6'],
          ['/28', '255.255.255.240', '14'],
          ['/27', '255.255.255.224', '30'],
          ['/26', '255.255.255.192', '62'],
          ['/25', '255.255.255.128', '126'],
          ['/24', '255.255.255.0', '254'],
          ['/23', '255.255.254.0', '510'],
          ['/22', '255.255.252.0', '1022'],
          ['/16', '255.255.0.0', '65534'],
        ]}
      />
      <NoteBox>Точный расчёт сети/broadcast/хостов — в калькуляторе «Подсеть».</NoteBox>
    </Card>
  );
}
