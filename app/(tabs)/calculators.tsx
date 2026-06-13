import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  H1,
  H3,
  Body,
  Small,
  Field,
  Segmented,
  NoteBox,
} from '@/components/ui';
import { colors, spacing, font } from '@/constants/theme';
import { Text } from 'react-native';
import {
  cableLoss,
  signalBudget,
  dbmToDbuv,
  dbuvToDbm,
  dbmToMw,
  lookAngles,
  transponderToIf,
  CableType,
} from '@/lib/calc';

type Calc = 'Кабель' | 'Бюджет' | 'Единицы' | 'Спутник' | 'LNB';

const CABLE_TYPES: CableType[] = ['RG-6', 'RG-59', 'RG-11', 'RG-58'];

function num(s: string, def = 0): number {
  const v = parseFloat(s.replace(',', '.'));
  return isNaN(v) ? def : v;
}

function ResultLine({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 }}>
      <Small>{label}</Small>
      <Text style={{ color: color ?? colors.text, fontSize: font.body, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

export default function CalculatorsScreen() {
  const [calc, setCalc] = useState<Calc>('Кабель');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <H1>Калькуляторы</H1>
        <Segmented
          options={['Кабель', 'Бюджет', 'Единицы', 'Спутник', 'LNB'] as Calc[]}
          value={calc}
          onChange={setCalc}
        />

        {calc === 'Кабель' && <CableCalc />}
        {calc === 'Бюджет' && <BudgetCalc />}
        {calc === 'Единицы' && <UnitsCalc />}
        {calc === 'Спутник' && <SatCalc />}
        {calc === 'LNB' && <LnbCalc />}

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

  const zoneColor =
    r.zone === 'good' ? colors.good : r.zone === 'warn' ? colors.warn : colors.bad;

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
        dBµV = dBm + 108.75. Спутник/АНТ меряют в dBm, эфир/кабель — в dBµV. Чтобы перевести dBµV в
        dBm: вычти 108.75 (например 60 dBµV ≈ {dbuvToDbm(60).toFixed(1)} dBm).
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
          <ResultLine
            label="Поворот LNB (skew)"
            value={`${a.skew > 0 ? '+' : ''}${a.skew.toFixed(1)}°`}
            color={colors.info}
          />
        </>
      ) : (
        <Text style={{ color: colors.bad, fontWeight: '700' }}>
          Спутник ниже горизонта — отсюда не виден.
        </Text>
      )}
      <NoteBox>
        Азимут отсчитывается по компасу от севера по часовой. По умолчанию координаты Ташкента.
        Для офсетной тарелки учитывай её офсетный угол при выставлении элевации.
      </NoteBox>
    </Card>
  );
}

function LnbCalc() {
  const [tp, setTp] = useState('11766');
  const r = transponderToIf(num(tp, 11766));
  return (
    <Card>
      <H3>Пересчёт транспондера в IF (Universal LNB)</H3>
      <Field label="Частота транспондера, МГц" value={tp} onChange={setTp} suffix="МГц" />
      <ResultLine label="Гетеродин (LO)" value={`${r.lo} МГц`} />
      <ResultLine label="Поддиапазон" value={r.lo === 9750 ? 'Low (22 кГц выкл)' : 'High (22 кГц вкл)'} />
      <ResultLine label="IF на кабель" value={`${r.if} МГц`} color={colors.info} />
      <NoteBox>
        Universal LNB: ниже 11700 МГц → гетеродин 9750 (Low), выше → 10600 (High). IF = частота − гетеродин.
      </NoteBox>
    </Card>
  );
}
