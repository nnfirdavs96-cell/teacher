import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Role } from '@/data/types';
import { colors, spacing, radius, font } from '@/constants/theme';

const ROLES: {
  id: Role;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bullets: string[];
}[] = [
  {
    id: 'tv',
    title: 'ТВ-мастер',
    subtitle: 'Установка и настройка телевидения',
    icon: 'planet',
    color: '#a78bfa',
    bullets: ['Спутник, АНТ/MMDS, эфир, кабель', 'Наводка тарелки, уровни, C/N · MER', 'Калькуляторы кабеля и азимута'],
  },
  {
    id: 'net',
    title: 'Сети / Сисадмин',
    subtitle: 'Интернет, локальные сети, видеонаблюдение',
    icon: 'hardware-chip',
    color: '#22d3ee',
    bullets: ['IP-адресация, подсети, VLAN, NAT', 'Роутеры, коммутаторы, Wi-Fi, оптика', 'СКС, IP-камеры, диагностика сети'],
  },
];

export function Welcome({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.lg,
              backgroundColor: colors.accentDim,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="construct" size={38} color={colors.accent} />
          </View>
          <Text style={{ color: colors.text, fontSize: font.h1, fontWeight: '800' }}>Мастер ТВ/Сети</Text>
          <Text style={{ color: colors.textDim, fontSize: font.body, marginTop: spacing.xs, textAlign: 'center' }}>
            Помощник для установки, настройки и ремонта.{'\n'}Выберите профиль — подстроим под вашу работу.
          </Text>
        </View>

        {ROLES.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => onSelect(r.id)}
            style={({ pressed }) => ({
              backgroundColor: colors.bgCard,
              borderWidth: 1,
              borderColor: pressed ? r.color : colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radius.md,
                  backgroundColor: r.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={r.icon as any} size={30} color={r.color} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: font.h2, fontWeight: '700' }}>{r.title}</Text>
                <Text style={{ color: colors.textDim, fontSize: font.small }}>{r.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={r.color} />
            </View>
            {r.bullets.map((b) => (
              <View key={b} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="checkmark-circle" size={16} color={r.color} />
                <Text style={{ color: colors.textDim, fontSize: font.small, marginLeft: spacing.sm, flex: 1 }}>{b}</Text>
              </View>
            ))}
          </Pressable>
        ))}

        <Text style={{ color: colors.textFaint, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.sm }}>
          Профиль можно сменить в любой момент в разделе «Справочник».
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
