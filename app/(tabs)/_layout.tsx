import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Справочник',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculators"
        options={{
          title: 'Калькуляторы',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="diagnostics"
        options={{
          title: 'Помощь',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-buoy" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reference"
        options={{
          title: 'Таблицы',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: 'Чеклисты',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'ИИ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
