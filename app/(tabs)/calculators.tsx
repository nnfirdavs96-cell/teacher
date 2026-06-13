import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, H1, H3, Small, Field, Segmented, NoteBox } from '@/components/ui';
import { colors, spacing, font } from '@/constants/theme';
import { useRole } from '@/lib/role';
import {
  cableLoss,
  signalBudget,
  dbmToDbuv,
  dbuvToDbm,
  dbmToMw,
  lookAngles,
  transponderToIf,
  subnetInfo,
  cctvStorageGB,
  transferSeconds,
  formatDuration,
  raidCapacity,
  poeBudget,
  CableType,
  RaidLevel,
} from '@/lib/calc';

const CABLE_TYPES: CableType[] = ['RG-6', 'RG-59', 'RG-11', 'RG-58'];
const RAID_LEVELS: RaidLevel[] = ['0', '1', '5', '6', '10'];
const TV_CALCS = ['Кабель', 'Бюджет', 'Единицы', 'Спутник', 'LNB'];
const NET_CALCS = ['Подсеть', 'Скорость', 'RAID', 'PoE', 'CCTV диск'];

function num(s: string, def = 0): number {
  const v = parseFloat(s.replace(',', '.'));
  return isNaN(v) ? def : v;
}

function ResultLine({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 }}>
      <Small>{label}</Small>
      <Text style={{ color: color ?? colors.text, fontSize: font.body, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export default function CalculatorsScreen() {
  const { role } = useRole();
  const calcs = role === 'net' ? NET_CALCS : TV_CALCS;
  const [calc, setCalc] = useState<string>(calcs[0]);
  const active = calcs.includes(calc) ? calc : calcs[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>Калькуляторы</H1>
        <Segmented options={calcs} value={active} onChange={setCalc} />

        {active === 'Кабель' && <CableCalc />}
        {active === 'Бюджет' && <BudgetCalc />}
        {active === 'Единицы' && <UnitsCalc />}
        {active === 'Спутник' && <SatCalc />}
        {active === 'LNB' && <LnbCalc />}
        {active === 'Подсеть' && <SubnetCalc />}
        {active === 'Скорость' && <TransferCalc />}
        {active === 'RAID' && <RaidCalc />}
        {active === 'PoE' && <PoeCalc />}
        {active === 'CCTV диск' && <CctvCalc />}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CableCalc() {
  const [type, setType] = useState<CableType>('RG-6');
  const [len, setLen] = useState('20');
  const [freq, setFreq] = useState('2150');
  const loss = cableLoss(type, num(len), num(freq, 2150));
  return (
    <Card>
      <H3>Затухание кабеля</H3>
      <Small>Тип кабеля</Small>
      <View style={{ height: spacing.xs }} />
      <Segmented options={CABLE_TYPES} value={type} onChange={setType} />
      <Field label="Длина, м" value={len} onChange={setLen} suffix="м" />
      <Field label="Частота, МГц" value={freq} onChange={setFreq} suffix="МГц" />
      <NoteBox>Для спутника/АНТ считай по верхней частоте L-band — 2150 МГц.</NoteBox>
      <ResultLine label="Затухание" value={`−${loss.toFixed(1)} дБ`} color={colors.warn} />
    </Card>
  );
}

function BudgetCalc() {
  const [start, setStart] = useState('-40');
  const [type, setType] = useState<CableType>('RG-6');
  const [len, setLen] = useState('20');
  const [freq, setFreq] = useState('2150');
  const [conn, setConn] = useState('2');
  const [split, setSplit] = useState<0 | 2 | 3 | 4 | 8>(0);

  const r = signalBudget({
    startLevel: num(start, -40),
    cableType: type,
    lengthM: num(len),
    freqMHz: num(freq, 2150),
    connectors: Math.round(num(conn)),
    splitterWayCount: split,
  });
  const zoneColor = r.zone === 'good' ? colors.good : r.zone === 'warn' ? colors.warn : colors.bad;

  return (
    <Card>
      <H3>Бюджет сигнала: крыша → квартира</H3>
      <Field label="Уровень на источнике (после LNB), dBm" value={start} onChange={setStart} suffix="dBm" />
      <Small>Тип кабеля</Small>
      <View style={{ height: spacing.xs }} />
      <Segmented options={CABLE_TYPES} value={type} onChange={setType} />
      <Field label="Длина, м" value={len} onChange={setLen} suffix="м" />
      <Field label="Частота, МГц" value={freq} onChange={setFreq} suffix="МГц" />
      <Field label="Кол-во F-разъёмов (×0.5 дБ)" value={conn} onChange={setConn} />
      <Small>Делитель (сплиттер)</Small>
      <View style={{ height: spacing.xs }} />
      <Segmented
        options={[0, 2, 3, 4, 8] as (0 | 2 | 3 | 4 | 8)[]}
        value={split}
        onChange={setSplit}
        labelOf={(v) => (v === 0 ? 'нет' : `${v} вых`)}
      />
      <View style={{ height: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, marginVertical: spacing.sm }} />
      <ResultLine label="Кабель" value={`−${r.cableDb.toFixed(1)} дБ`} />
      <ResultLine label="Разъёмы" value={`−${r.connectorDb.toFixed(1)} дБ`} />
      <ResultLine label="Делитель" value={`−${r.splitterDb.toFixed(1)} дБ`} />
      <ResultLine label="Итого потерь" value={`−${r.totalLossDb.toFixed(1)} дБ`} color={colors.warn} />
      <ResultLine label="Уровень в квартире" value={`${r.endLevel.toFixed(1)} dBm`} color={zoneColor} />
      <View style={{ marginTop: spacing.sm }}>
        <Text style={{ color: zoneColor, fontWeight: '700' }}>{r.zoneText}</Text>
      </View>
    </Card>
  );
}

function UnitsCalc() {
  const [dbm, setDbm] = useState('-50');
  const d = num(dbm, -50);
  return (
    <Card>
      <H3>Конвертер единиц (75 Ом)</H3>
      <Field label="Значение, dBm (dBmW)" value={dbm} onChange={setDbm} suffix="dBm" />
      <ResultLine label="в dBµV" value={`${dbmToDbuv(d).toFixed(2)} dBµV`} color={colors.info} />
      <ResultLine label="в мВт" value={`${dbmToMw(d).toExponential(2)} мВт`} color={colors.info} />
      <NoteBox>
        dBµV = dBm + 108.75. Чтобы перевести dBµV в dBm: вычти 108.75 (например 60 dBµV ≈ {dbuvToDbm(60).toFixed(1)} dBm).
      </NoteBox>
    </Card>
  );
}

function SatCalc() {
  const [lat, setLat] = useState('41.31');
  const [lon, setLon] = useState('69.24');
  const [sat, setSat] = useState('75');
  const a = lookAngles(num(lat, 41.31), num(lon, 69.24), num(sat, 75));
  return (
    <Card>
      <H3>Азимут / элевация на спутник</H3>
      <Field label="Широта точки, °N (юг — минус)" value={lat} onChange={setLat} />
      <Field label="Долгота точки, °E (запад — минус)" value={lon} onChange={setLon} />
      <Field label="Долгота спутника, °E" value={sat} onChange={setSat} />
      <View style={{ height: spacing.sm }} />
      {a.visible ? (
        <>
          <ResultLine label="Азимут (от севера)" value={`${a.azimuth.toFixed(1)}°`} color={colors.good} />
          <ResultLine label="Угол места (элевация)" value={`${a.elevation.toFixed(1)}°`} color={colors.good} />
          <ResultLine label="Поворот LNB (skew)" value={`${a.skew > 0 ? '+' : ''}${a.skew.toFixed(1)}°`} color={colors.info} />
        </>
      ) : (
        <Text style={{ color: colors.bad, fontWeight: '700' }}>Спутник ниже горизонта — отсюда не виден.</Text>
      )}
      <NoteBox>Азимут — по компасу от севера по часовой. По умолчанию координаты Ташкента.</NoteBox>
    </Card>
  );
}

function LnbCalc() {
  const [tp, setTp] = useState('11766');
  const r = transponderToIf(num(tp, 11766));
  return (
    <Card>
      <H3>Транспондер → IF (Universal LNB)</H3>
      <Field label="Частота транспондера, МГц" value={tp} onChange={setTp} suffix="МГц" />
      <ResultLine label="Гетеродин (LO)" value={`${r.lo} МГц`} />
      <ResultLine label="Поддиапазон" value={r.lo === 9750 ? 'Low (22 кГц выкл)' : 'High (22 кГц вкл)'} />
      <ResultLine label="IF на кабель" value={`${r.if} МГц`} color={colors.info} />
      <NoteBox>Ниже 11700 МГц → гетеродин 9750 (Low), выше → 10600 (High). IF = частота − гетеродин.</NoteBox>
    </Card>
  );
}

function SubnetCalc() {
  const [ip, setIp] = useState('192.168.1.10');
  const [cidr, setCidr] = useState('24');
  const r = subnetInfo(ip, Math.round(num(cidr, 24)));
  return (
    <Card>
      <H3>Калькулятор подсети (IPv4)</H3>
      <Field label="IP-адрес" value={ip} onChange={setIp} keyboardType="default" placeholder="192.168.1.10" />
      <Field label="Префикс CIDR (0–32)" value={cidr} onChange={setCidr} suffix={`/${Math.round(num(cidr, 24))}`} />
      <View style={{ height: spacing.sm }} />
      {r.valid ? (
        <>
          <ResultLine label="Маска" value={r.mask} color={colors.info} />
          <ResultLine label="Адрес сети" value={r.network} />
          <ResultLine label="Broadcast" value={r.broadcast} />
          <ResultLine label="Первый хост" value={r.firstHost} color={colors.good} />
          <ResultLine label="Последний хост" value={r.lastHost} color={colors.good} />
          <ResultLine label="Хостов" value={`${r.hosts}`} color={colors.accent} />
        </>
      ) : (
        <Text style={{ color: colors.bad, fontWeight: '700' }}>Проверьте IP и префикс.</Text>
      )}
      <NoteBox>Хосты = 2^(32−CIDR) − 2 (минус адрес сети и broadcast). /31 — точка-точка, /32 — один адрес.</NoteBox>
    </Card>
  );
}

function TransferCalc() {
  const [size, setSize] = useState('10');
  const [speed, setSpeed] = useState('100');
  const sec = transferSeconds(num(size, 10), num(speed, 100));
  return (
    <Card>
      <H3>Время передачи файла</H3>
      <Field label="Размер, ГБ" value={size} onChange={setSize} suffix="ГБ" />
      <Field label="Скорость канала, Мбит/с" value={speed} onChange={setSpeed} suffix="Мбит/с" />
      <View style={{ height: spacing.sm }} />
      <ResultLine label="Примерное время" value={formatDuration(sec)} color={colors.accent} />
      <NoteBox>1 ГБ ≈ 8000 Мбит. Реальная скорость обычно ниже паспортной (накладные расходы, диск).</NoteBox>
    </Card>
  );
}

function RaidCalc() {
  const [level, setLevel] = useState<RaidLevel>('5');
  const [disks, setDisks] = useState('4');
  const [size, setSize] = useState('4');
  const r = raidCapacity(level, Math.round(num(disks, 4)), num(size, 4));
  return (
    <Card>
      <H3>RAID: ёмкость и отказоустойчивость</H3>
      <Small>Уровень RAID</Small>
      <View style={{ height: spacing.xs }} />
      <Segmented options={RAID_LEVELS} value={level} onChange={setLevel} labelOf={(v) => `RAID ${v}`} />
      <Field label="Количество дисков" value={disks} onChange={setDisks} />
      <Field label="Размер одного диска, ТБ" value={size} onChange={setSize} suffix="ТБ" />
      <View style={{ height: spacing.sm }} />
      {r.valid ? (
        <>
          <ResultLine label="Полезная ёмкость" value={`${r.usableTB.toFixed(1)} ТБ`} color={colors.good} />
          <ResultLine label="Переживёт отказ" value={r.faultTolerance} color={colors.info} />
          <NoteBox>{r.note} RAID не заменяет бэкап!</NoteBox>
        </>
      ) : (
        <Text style={{ color: colors.bad, fontWeight: '700' }}>{r.note}</Text>
      )}
    </Card>
  );
}

function PoeCalc() {
  const [count, setCount] = useState('8');
  const [watt, setWatt] = useState('12');
  const [budget, setBudget] = useState('120');
  const r = poeBudget(Math.round(num(count, 8)), num(watt, 12), num(budget, 120));
  return (
    <Card>
      <H3>Бюджет PoE коммутатора</H3>
      <Field label="Количество устройств" value={count} onChange={setCount} />
      <Field label="Мощность одного, Вт" value={watt} onChange={setWatt} suffix="Вт" />
      <Field label="PoE-бюджет коммутатора, Вт" value={budget} onChange={setBudget} suffix="Вт" />
      <View style={{ height: spacing.sm }} />
      <ResultLine label="Суммарно нужно" value={`${r.total.toFixed(0)} Вт`} color={r.ok ? colors.good : colors.bad} />
      <ResultLine label="Запас бюджета" value={`${r.headroom.toFixed(0)} Вт`} color={r.headroom >= 0 ? colors.good : colors.bad} />
      <View style={{ marginTop: spacing.sm }}>
        <Text style={{ color: r.ok ? colors.good : colors.bad, fontWeight: '700' }}>
          {r.ok ? 'Бюджета хватает ✓' : 'Не хватает бюджета — нужен мощнее коммутатор'}
        </Text>
      </View>
      <NoteBox>PoE ~15 Вт (af), PoE+ ~30 Вт (at), PoE++ до 60–90 Вт (bt). Закладывай запас 10–20%.</NoteBox>
    </Card>
  );
}

function CctvCalc() {
  const [br, setBr] = useState('4');
  const [cams, setCams] = useState('4');
  const [hours, setHours] = useState('24');
  const [days, setDays] = useState('30');
  const gb = cctvStorageGB(num(br, 4), Math.round(num(cams, 4)), num(hours, 24), num(days, 30));
  return (
    <Card>
      <H3>Объём архива видеонаблюдения</H3>
      <Field label="Битрейт одной камеры, Мбит/с" value={br} onChange={setBr} suffix="Мбит/с" />
      <Field label="Количество камер" value={cams} onChange={setCams} />
      <Field label="Часов записи в сутки" value={hours} onChange={setHours} suffix="ч" />
      <Field label="Глубина архива, дней" value={days} onChange={setDays} suffix="дн" />
      <View style={{ height: spacing.sm }} />
      <ResultLine label="Нужно места" value={`${gb.toFixed(0)} ГБ`} color={colors.accent} />
      <ResultLine label="≈ в терабайтах" value={`${(gb / 1024).toFixed(2)} ТБ`} color={colors.info} />
      <NoteBox>Запись по движению и кодек H.265 уменьшают объём примерно вдвое.</NoteBox>
    </Card>
  );
}
