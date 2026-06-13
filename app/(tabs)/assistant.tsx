import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { H1, H3, Small, Body, Button, Segmented, NoteBox } from '@/components/ui';
import { colors, spacing, radius, font } from '@/constants/theme';
import {
  askAssistant,
  loadApiKey,
  saveApiKey,
  loadModel,
  saveModel,
  AVAILABLE_MODELS,
  ChatMessage,
} from '@/lib/ai';

const SUGGESTIONS = [
  'Уровень −20 dBm, картинки нет. Что делать?',
  'Как навести офсетную тарелку на АНТ?',
  'GPON: горит LOS, интернета нет',
  'Какой канал Wi-Fi выбрать на 2.4 ГГц?',
];

export default function AssistantScreen() {
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [model, setModel] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadApiKey().then((k) => {
      if (k) setApiKey(k);
      else setShowSettings(true);
    });
    loadModel().then(setModel);
  }, []);

  const persistKey = async () => {
    await saveApiKey(keyInput.trim());
    setApiKey(keyInput.trim());
    setKeyInput('');
    setShowSettings(false);
    setError('');
  };

  const changeModel = async (m: string) => {
    setModel(m);
    await saveModel(m);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    setError('');
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const reply = await askAssistant(apiKey, model, next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message ?? 'Ошибка запроса');
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <H1>ИИ-помощник</H1>
          </View>
          <Pressable onPress={() => setShowSettings((s) => !s)}>
            <Ionicons name="settings-outline" size={24} color={colors.textDim} />
          </Pressable>
        </View>

        {showSettings && (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <View style={settingsCard}>
              <H3>Настройки</H3>
              <Small>
                Помощнику нужен API-ключ Anthropic (console.anthropic.com). Ключ хранится только на
                этом устройстве.
              </Small>
              <View style={{ height: spacing.sm }} />
              <TextInput
                style={inputStyle}
                placeholder="sk-ant-..."
                placeholderTextColor={colors.textFaint}
                value={keyInput}
                onChangeText={setKeyInput}
                autoCapitalize="none"
                secureTextEntry
              />
              <Button title={apiKey ? 'Обновить ключ' : 'Сохранить ключ'} onPress={persistKey} />
              {!!model && (
                <>
                  <View style={{ height: spacing.md }} />
                  <Small>Модель</Small>
                  <View style={{ height: spacing.xs }} />
                  <Segmented
                    options={AVAILABLE_MODELS.map((m) => m.id)}
                    value={model}
                    onChange={changeModel}
                    labelOf={(id) => AVAILABLE_MODELS.find((m) => m.id === id)?.label ?? id}
                  />
                </>
              )}
            </View>
          </View>
        )}

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        >
          {messages.length === 0 && !showSettings && (
            <View>
              <Body dim>Спроси что угодно по настройке ТВ и сетей. Например:</Body>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => send(s)}
                  style={{
                    backgroundColor: colors.bgCard,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{ color: colors.accent, fontSize: font.body }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {messages.map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? colors.accentDim : colors.bgCard,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
                maxWidth: '90%',
              }}
            >
              <Text style={{ color: colors.text, fontSize: font.body, lineHeight: 22 }}>{m.content}</Text>
            </View>
          ))}

          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator color={colors.accent} />
              <Small>Думаю...</Small>
            </View>
          )}

          {!!error && <NoteBox>{error}</NoteBox>}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.bgCard,
            gap: spacing.sm,
          }}
        >
          <TextInput
            style={[inputStyle, { flex: 1, marginBottom: 0 }]}
            placeholder="Вопрос мастеру..."
            placeholderTextColor={colors.textFaint}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send(input)}
            multiline
          />
          <Pressable
            onPress={() => send(input)}
            style={{
              backgroundColor: colors.accent,
              borderRadius: radius.pill,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const settingsCard = {
  backgroundColor: colors.bgCard,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.lg,
  marginBottom: spacing.md,
} as const;

const inputStyle = {
  backgroundColor: colors.bgCardAlt,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  color: colors.text,
  fontSize: font.body,
  marginBottom: spacing.sm,
} as const;
