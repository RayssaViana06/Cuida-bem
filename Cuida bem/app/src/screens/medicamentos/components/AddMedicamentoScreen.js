import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Switch,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import * as medicamentoService from '@/features/medicamentos/services/medicamentos.service';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

const LILAC_TEXT = '#3B0764';

const TIPO_OPCOES = [
  { id: 1, label: 'Comprimido' },
  { id: 2, label: 'Cápsula' },
  { id: 3, label: 'Gotas' },
  { id: 4, label: 'Xarope' },
  { id: 5, label: 'Pomada' },
];

const getTipoLabel = (id) => {
  const item = TIPO_OPCOES.find((o) => o.id === id);
  return item ? item.label : id;
};

const SHOW_PROFILES = false;

async function requestNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const result = await Notifications.requestPermissionsAsync();
    return result.status === 'granted';
  }
  return true;
}

function isValidHHMM(v) {
  return /^\d{2}:\d{2}$/.test(v);
}

export default function AddMedicamentoScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const styles = makeStyles(colors, settings);

  const id = route?.params?.id ?? null;
  const isEditing = useMemo(() => Boolean(id), [id]);

  const [nome, setNome] = useState('');
  const [tipoId, setTipo] = useState(1);
  const tipoLabel = useMemo(() => getTipoLabel(tipoId), [tipoId]);

  const [dosagem, setDosagem] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [duracaoDias, setDuracaoDias] = useState('');
  const [horario, setHorario] = useState('09:00');

  const [comentario, setComentario] = useState('');
  const [alarme_ativo, setAlarmeAtivo] = useState(false);
  const [notificationId, setNotificationId] = useState(null);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tipoModalVisible, setTipoModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;

      try {
        const med = await medicamentoService.getMedicine(id);

        setNome(med.nome || '');
        setDosagem(med.dosagem || '');
        setTipo(med.tipo || 1);
        setFrequencia(med.frequencia || '');
        setDuracaoDias(
          med.duracaoDias !== undefined && med.duracaoDias !== null
            ? String(med.duracaoDias)
            : ''
        );
        setComentario(med.comentario || '');

        if (med.horario) setHorario(med.horario);
        setAlarmeAtivo(Boolean(med.alarme));
        if (med.notificationId) setNotificationId(med.notificationId);
      } catch (e) {
        console.warn('Erro carregando medicamento para edição:', e);
      }
    })();
  }, [id]);

  function onChangeTime(event, selectedDate) {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hh = selectedDate.getHours().toString().padStart(2, '0');
      const mm = selectedDate.getMinutes().toString().padStart(2, '0');
      setHorario(`${hh}:${mm}`);
    }
  }

  async function scheduleDailyNotificationIfNeeded(nomeParaNotificacao) {
    if (!alarme_ativo) return null;
    if (!isValidHHMM(horario)) return null;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const [hh, mm] = horario.split(':').map((n) => parseInt(n, 10));

    const newId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de medicação',
        body: `Hora de tomar ${nomeParaNotificacao}`,
        data: { medicamento: nomeParaNotificacao },
      },
      trigger: {
        hour: hh,
        minute: mm,
        repeats: true,
      },
    });

    return newId;
  }

  async function onConcluir() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do medicamento');
      return;
    }
    if (alarme_ativo && !isValidHHMM(horario)) {
      Alert.alert('Horário inválido', 'Use o formato HH:MM (ex.: 09:30)');
      return;
    }

    try {
      let newNotificationId = notificationId;

      // Cancela notificação antiga, se existir
      if (notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (e) {
          console.warn('Erro cancelando notificação antiga:', e);
        }
        newNotificationId = null;
      }

      // Cria nova, se o alarme estiver ativo
      if (alarme_ativo) {
        newNotificationId = await scheduleDailyNotificationIfNeeded(nome);
      }

      const payload = {
        nome,
        tipo: tipoId,
        dosagem,
        frequencia,
        duracaoDias: duracaoDias ? Number(duracaoDias) : null,
        horario,
        comentario,
        alarme: alarme_ativo,
        notificationId: newNotificationId,
      };

      if (id) {
        await medicamentoService.updateMedicine(id, payload);
      } else {
        await medicamentoService.createMedicine(payload);
      }

      navigation.goBack();
    } catch (e) {
      console.warn('Erro ao salvar medicamento:', e);
      Alert.alert(
        'Erro',
        'Não foi possível salvar o medicamento. Tente novamente.'
      );
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar medicamento' : 'Adicionar medicamento'}
            </Text>
          </View>

          <Text style={styles.subtitle}>Informações:</Text>

          <Text style={styles.label}>Nome</Text>
          <View style={styles.pill}>
            <TextInput
              placeholder="Nome do medicamento"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              placeholderTextColor={colors.pillDark}
            />
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Tipo</Text>
          <TouchableOpacity onPress={() => setTipoModalVisible(true)}>
            <View style={styles.pill}>
              <Text style={styles.input}>{tipoLabel}</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.subtitle, { marginTop: 16 }]}>Posologia:</Text>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Dosagem</Text>
              <View style={styles.pillSmall}>
                <TextInput
                  value={dosagem}
                  onChangeText={setDosagem}
                  style={[styles.pillSmallText, { padding: 0 }]}
                  placeholder="ex.: 500mg"
                  placeholderTextColor={colors.pillDark}
                />
              </View>
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Frequência</Text>
              <View style={styles.pillSmall}>
                <TextInput
                  value={frequencia}
                  onChangeText={setFrequencia}
                  style={[styles.pillSmallText, { padding: 0 }]}
                  placeholder="ex.: 8/8h"
                  placeholderTextColor={colors.pillDark}
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Duração (Dias)</Text>
              <View style={styles.pillSmall}>
                <TextInput
                  value={duracaoDias}
                  onChangeText={setDuracaoDias}
                  keyboardType="numeric"
                  style={[styles.pillSmallText, { padding: 0 }]}
                  placeholder="ex.: 7"
                  placeholderTextColor={colors.pillDark}
                />
              </View>
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Horário</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <View style={styles.pillSmall}>
                  <Text style={styles.pillSmallText}>{horario}</Text>
                </View>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={(() => {
                    const [hh, mm] = (isValidHHMM(horario) ? horario : '09:00')
                      .split(':')
                      .map((n) => parseInt(n, 10));
                    const d = new Date();
                    d.setHours(isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm, 0, 0);
                    return d;
                  })()}
                  mode="time"
                  is24Hour
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </View>
          </View>

          {SHOW_PROFILES && (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>Perfil</Text>
              <TouchableOpacity>
                <View style={styles.pill}>
                  <Text style={styles.input} />
                </View>
              </TouchableOpacity>
            </>
          )}

          <Text style={[styles.label, { marginTop: 12 }]}>Comentários</Text>
          <View style={styles.commentBox}>
            <TextInput
              multiline
              numberOfLines={4}
              value={comentario}
              onChangeText={setComentario}
              style={styles.commentInput}
              placeholder="Adicione observações..."
              placeholderTextColor={colors.pillDark}
            />
          </View>

          <View style={styles.rowSwitch}>
            <Text style={styles.label}>Disparar alarme?</Text>
            <Switch
              value={alarme_ativo}
              onValueChange={setAlarmeAtivo}
              trackColor={{
                false: colors.pillLight,
                true: '#C084FC',
              }}
              thumbColor={alarme_ativo ? '#7C3AED' : '#E5D5FA'}
              ios_backgroundColor={colors.pillLight}
            />
          </View>

          <TouchableOpacity
            style={[styles.concluirBtn, !nome && { opacity: 0.6 }]}
            onPress={onConcluir}
            disabled={!nome}
          >
            <Text style={styles.concluirText}>
              {isEditing ? 'Salvar' : 'Concluir'}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={tipoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTipoModalVisible(false)}
        >
          <SafeAreaView style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Selecionar tipo</Text>
              {TIPO_OPCOES.map((op) => (
                <TouchableOpacity
                  key={op.id}
                  style={styles.sheetItem}
                  onPress={() => {
                    setTipo(op.id);
                    setTipoModalVisible(false);
                  }}
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.sheetItemText}>{op.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.sheetCancel}
                onPress={() => setTipoModalVisible(false)}
              >
                <Text style={styles.sheetCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors, settings) => {
  const fs = settings.fontScale || 1;

  return StyleSheet.create({
    safe: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: settings.largeButtons ? 24 : 20,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backBtn: {
      width: settings.largeButtons ? 48 : 44,
      height: settings.largeButtons ? 48 : 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20 * fs,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 14 * fs * 1.05,
      fontWeight: '700',
      marginBottom: 8,
      color: colors.textPrimary,
    },
    label: {
      fontSize: 13 * fs * 1.05,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    pill: {
      backgroundColor: '#F3E8FF',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: settings.largeButtons ? 12 : 10,
    },
    input: {
      fontSize: 16 * fs,
      padding: 0,
      color: LILAC_TEXT,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    rowItem: { width: '48%' },
    pillSmall: {
      backgroundColor: '#F3E8FF',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: settings.largeButtons ? 10 : 8,
      alignItems: 'center',
    },
    pillSmallText: {
      color: LILAC_TEXT,
      fontSize: 15 * fs,
    },
    commentBox: {
      backgroundColor: '#F3E8FF',
      borderRadius: 12,
      padding: settings.largeButtons ? 14 : 12,
      minHeight: settings.largeButtons ? 96 : 84,
    },
    commentInput: {
      textAlignVertical: 'top',
      color: LILAC_TEXT,
      fontSize: 15 * fs,
    },
    rowSwitch: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: settings.largeButtons ? 20 : 16,
    },
    concluirBtn: {
      marginTop: 18,
      backgroundColor: colors.primary,
      paddingVertical: settings.largeButtons ? 24 : 14,
      borderRadius: settings.largeButtons ? 24 : 20,
      alignItems: 'center',
    },
    concluirText: {
      color: colors.onPrimary,
      fontWeight: '600',
      fontSize: 16 * fs,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sheet: {
      backgroundColor: colors.surface,
      padding: 20,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    sheetTitle: {
      fontSize: 18 * fs,
      fontWeight: '700',
      marginBottom: 12,
      color: colors.textPrimary,
    },
    sheetItem: {
      paddingVertical: settings.largeButtons ? 14 : 12,
      borderBottomColor: colors.pillLight,
      borderBottomWidth: 1,
    },
    sheetItemText: {
      fontSize: 16 * fs,
      color: colors.textPrimary,
    },
    sheetCancel: {
      marginTop: 12,
      paddingVertical: settings.largeButtons ? 14 : 12,
      alignItems: 'center',
    },
    sheetCancelText: {
      color: colors.pillDark,
      fontSize: 14 * fs,
    },
  });
};
