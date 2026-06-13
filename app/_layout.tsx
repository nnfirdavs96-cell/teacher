import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { RoleProvider, useRole } from '@/lib/role';
import { Welcome } from '@/components/Welcome';

function Gate() {
  const { role, ready, setRole } = useRole();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!role) {
    return <Welcome onSelect={setRole} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RoleProvider>
        <Gate />
      </RoleProvider>
    </SafeAreaProvider>
  );
}
