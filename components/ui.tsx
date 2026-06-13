import { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, font } from '@/constants/theme';

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}
export function H2({ children }: { children: ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}
export function H3({ children }: { children: ReactNode }) {
  return <Text style={styles.h3}>{children}</Text>;
}
export function Body({ children, dim }: { children: ReactNode; dim?: boolean }) {
  return <Text style={[styles.body, dim && { color: colors.textDim }]}>{children}</Text>;
}
export function Small({ children, color }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.small, color ? { color } : null]}>{children}</Text>;
}

export function Pill({ text, color = colors.accent }: { text: string; color?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '66' }]}>
      <Text style={[styles.pillText, { color }]}>{text}</Text>
    </View>
  );
}

export function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function NoteBox({ children }: { children: ReactNode }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={[styles.trow, styles.thead]}>
          {headers.map((h, i) => (
            <Text key={i} style={[styles.th, { minWidth: 90 }]}>
              {h}
            </Text>
          ))}
        </View>
        {rows.map((r, ri) => (
          <View key={ri} style={[styles.trow, ri % 2 === 1 && styles.trowAlt]}>
            {r.map((c, ci) => (
              <Text key={ci} style={[styles.td, { minWidth: 90 }]}>
                {c}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function Field({
  label,
  value,
  onChange,
  keyboardType = 'numeric',
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'numeric' | 'default' | 'decimal-pad';
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  labelOf,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labelOf?: (v: T) => string;
}) {
  return (
    <View style={styles.segWrap}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={String(o)}
            onPress={() => onChange(o)}
            style={[styles.segItem, active && styles.segItemActive]}
          >
            <Text style={[styles.segText, active && styles.segTextActive]}>
              {labelOf ? labelOf(o) : String(o)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Button({
  title,
  onPress,
  color = colors.accent,
}: {
  title: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: color, opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  h1: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing.sm },
  h2: { color: colors.text, fontSize: font.h2, fontWeight: '700', marginBottom: spacing.sm },
  h3: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginBottom: spacing.xs },
  body: { color: colors.text, fontSize: font.body, lineHeight: 22, marginBottom: spacing.sm },
  small: { color: colors.textDim, fontSize: font.small, lineHeight: 19 },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: font.tiny, fontWeight: '700' },
  bulletRow: { flexDirection: 'row', marginBottom: spacing.xs, paddingRight: spacing.sm },
  bulletDot: { color: colors.accent, fontSize: font.body, marginRight: spacing.sm, lineHeight: 22 },
  bulletText: { color: colors.text, fontSize: font.body, lineHeight: 22, flex: 1 },
  note: {
    backgroundColor: '#3a2e0a',
    borderLeftWidth: 3,
    borderLeftColor: colors.warn,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  noteText: { color: '#fde68a', fontSize: font.small, lineHeight: 20 },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, overflow: 'hidden' },
  trow: { flexDirection: 'row' },
  trowAlt: { backgroundColor: colors.bgCardAlt },
  thead: { backgroundColor: colors.accentDim },
  th: { color: colors.text, fontWeight: '700', fontSize: font.small, padding: spacing.sm },
  td: { color: colors.textDim, fontSize: font.small, padding: spacing.sm },
  fieldLabel: { color: colors.textDim, fontSize: font.small, marginBottom: spacing.xs },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: font.body,
  },
  suffix: { color: colors.textDim, fontSize: font.small, marginLeft: spacing.sm },
  segWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  segItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCardAlt,
  },
  segItemActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  segText: { color: colors.textDim, fontSize: font.small, fontWeight: '600' },
  segTextActive: { color: colors.text },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: font.body },
});
