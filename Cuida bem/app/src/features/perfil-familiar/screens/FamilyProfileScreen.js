import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, TextInput as RNTextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ROUTES } from '@/navigation/routes';

// COMPONENTES REUTILIZÁVEIS
import Header from '../../../components/Header';
import InputItem from '../../../components/InputItem';

export default function FamilyProfileScreen({ navigation }) {
  const { colors } = useTheme();

  // FamilyMembers - estado principal carregado do AsyncStorage (local)
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('medications');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ name: '', relation: '' });

  // usado só pra “resetar” os InputItem sem mudar funcionalidade
  const [formVersion, setFormVersion] = useState(0);

  // Estados do modal de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');

  // Carrega dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadFamilyData();
    }, [])
  );

  // carrega familyMembers do AsyncStorage
  const loadFamilyData = async () => {
    try {
      const stored = await AsyncStorage.getItem('familyMembers');

      let members = [];

      if (stored) {
        members = JSON.parse(stored);
      } else {
        const response = await fetch("https://cuida-bem-json-server-api.vercel.app/perfil_familiar");
        const apiData = await response.json();

        members = apiData.map((item) => ({
          id: String(item.id),
          name: item.nome,
          relation: item.parentesco,
        }));

        await AsyncStorage.setItem('familyMembers', JSON.stringify(members));
      }

      setFamilyMembers(members);

      if (members.length > 0) {
        const first = members[0];

        // 🔥 AQUI ESTÁ A CORREÇÃO: CARREGAR CONTAGENS DO PRIMEIRO PERFIL
        const counts = await loadRelatedCounts(first.id);

        setSelectedMember({
          ...first,
          medications: counts.medications,
          appointments: counts.appointments,
        });
      } else {
        setSelectedMember(null);
      }

    } catch (error) {
      console.warn("Erro ao carregar perfis:", error);
    }
  };

  // Da refresh no ASYNCSTORAGE e na API (BOTÃO INVISIVEL NO FIM DA PAGINA)
  const forceRefreshFromAPI = async () => {
    try {
      const response = await fetch("https://cuida-bem-json-server-api.vercel.app/perfil_familiar");
      const apiData = await response.json();

      const members = apiData.map(item => ({
        id: String(item.id),
        name: item.nome,
        relation: item.parentesco,
      }));

      // Salva no storage
      await AsyncStorage.setItem('familyMembers', JSON.stringify(members));

      setFamilyMembers(members);

      if (members.length > 0) {
        const first = members[0];

        const counts = await loadRelatedCounts(first.id);

        setSelectedMember({
          ...first,
          medications: counts.medications,
          appointments: counts.appointments,
        });
      } else {
        setSelectedMember(null);
      }

      console.log("🔄 Refresh forçado completado!");

    } catch (error) {
      console.log("Erro ao forçar refresh:", error);
    }
  };


  // ---- CARREGA medicamentos, agendamentos e lembretes E RETORNA QUANTIDADES ----
  const loadRelatedCounts = async (perfilId) => {
    try {
      // REQUISIÇÕES
      const [medRes, appRes] = await Promise.all([
        fetch("https://cuida-bem-json-server-api.vercel.app/medicamentos"),
        fetch("https://cuida-bem-json-server-api.vercel.app/compromissos"),
      ]);

      const [medicamentos, agendamentos] = await Promise.all([
        medRes.json(),
        appRes.json(),
      ]);

      // FILTRAR POR perfil_familiar_id
      const meds = medicamentos.filter((m) => m.perfil_familiar_id == perfilId);
      const apps = agendamentos.filter((a) => a.perfil_familiar_id == perfilId);

      return {
        medications: meds.length,
        appointments: apps.length,
      };
    } catch (err) {
      console.warn("Erro ao carregar registros relacionados:", err);
      return {
        medications: 0,
        appointments: 0,
      };
    }
  };


  const handleHaptic = async () => {
    try {
      await Haptics.selectionAsync();
    } catch (e) { }
  };

  // Funções da tela principal
  const selectMember = async (member) => {
    handleHaptic();
    setSelectedMember(member);
    setActiveTab('medications');

    // Carregar contagens relacionadas
    const counts = await loadRelatedCounts(member.id);

    // Injecta as contagens no selectedMember
    setSelectedMember({
      ...member,
      medications: counts.medications,
      appointments: counts.appointments,
    });
  };


  const addFamilyMember = async () => {
    const { name, relation } = newMemberForm;

    if (!name.trim() || !relation.trim()) {
      console.log('alert de adição');
      if (Platform.OS === 'web') {
        window.alert('Nome e parentesco são obrigatórios');
      } else {
        Alert.alert('Erro', 'Nome e parentesco são obrigatórios');
      }
      return;
    }

    handleHaptic();

    const newMember = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      relation: relation.trim(),
      contacts: [],
    };

    const updated = [...familyMembers, newMember];
    await AsyncStorage.setItem('familyMembers', JSON.stringify(updated));
    setFamilyMembers(updated);
    setSelectedMember(newMember);
    setNewMemberForm({ name: '', relation: '' });
    setShowAddModal(false);
    setActiveTab('medications');
    setFormVersion((v) => v + 1);
  };

  // Lista
  const handleSelect = (id) => {
    const member = familyMembers.find((m) => m.id === id);
    if (member) {
      setSelectedMember(member);
      setActiveTab('medications');
    }
  };

  const handleEditar = (id) => {
    const perfil = familyMembers.find((p) => p.id === id);
    if (!perfil) return;

    setEditName(perfil.name);
    setEditRelation(perfil.relation);
    setEditId(id);
    setEditModalVisible(true);
  };

  const handleExcluir = async (id) => {
    const updated = familyMembers.filter((p) => p.id !== id);

    await AsyncStorage.setItem('familyMembers', JSON.stringify(updated));

    setFamilyMembers(updated);

    // Caso o perfil excluído seja o selecionado
    if (selectedMember?.id === id) {
      const newSelected = updated[0] || null;

      if (newSelected) {
        // 🔥 Carregar contagens para o novo selecionado
        const counts = await loadRelatedCounts(newSelected.id);

        setSelectedMember({
          ...newSelected,
          medications: counts.medications,
          appointments: counts.appointments,
        });

      } else {
        // nenhum membro restante
        setSelectedMember(null);
      }
    }
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedMember?.id === item.id && styles.itemSelecionado,
      ]}
      onPress={() => {
        handleSelect(item.id);
        selectMember(item);
      }}
    >
      <Text style={styles.nomePerfil}>{item.name}</Text>

      <View style={styles.botoesContainer}>
        <TouchableOpacity onPress={() => handleEditar(item.id)}>
          <Text style={styles.botaoEditar}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleExcluir(item.id)}>
          <Text style={styles.botaoExcluir}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Salvar edição
  const salvarEdicao = async () => {
    if (!editName.trim() || !editRelation.trim()) {
      console.log('alert de edição');
      if (Platform.OS === 'web') {
        window.alert('Nome e parentesco são obrigatórios');
      } else {
        Alert.alert('Erro', 'Nome e parentesco são obrigatórios');
      }
      return;
    }

    const updatedPerfis = familyMembers.map((p) =>
      p.id === editId
        ? {
          ...p,
          name: editName.trim(),
          relation: editRelation.trim(),
        }
        : p
    );

    try {
      await AsyncStorage.setItem('familyMembers', JSON.stringify(updatedPerfis));
    } catch (e) {
      console.warn('Erro salvando edição no AsyncStorage', e);
    }

    setFamilyMembers(updatedPerfis);

    if (selectedMember?.id === editId) {
      const updatedSelected = updatedPerfis.find((p) => p.id === editId);
      setSelectedMember(updatedSelected || null);
    }

    setEditModalVisible(false);
    setEditId(null);
    setEditName('');
    setEditRelation('');
  };

  // Render
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F7F7F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* HEADER USANDO COMPONENTE */}
        <Header title="👨‍👩‍👧‍👦 Perfil Familiar" onBack={() => navigation.goBack()} />

        <View style={styles.container}>
          {/* Botão Adicionar Membro */}
          <TouchableOpacity
            style={[styles.addMemberButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              handleHaptic();
              setShowAddModal(true);
            }}
          >
            <Text style={styles.addMemberButtonText}>+ Adicionar Membro</Text>
          </TouchableOpacity>

          {/* LISTA DE PERFIS */}
          <FlatList
            data={familyMembers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              familyMembers.length === 0 ? styles.emptyListContent : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhum membro cadastrado. Adicione um perfil para começar.
                </Text>
              </View>
            }
            style={{ marginBottom: 16 }}
          />

          {/* Card do membro selecionado */}
          {selectedMember && (
            <View
              style={[
                styles.profileCard,
                { borderColor: colors.primary, borderWidth: 1 },
              ]}
            >
              <View style={styles.profileHeader}>
                <Text style={styles.profileAvatar}>
                  {selectedMember.avatar || '👤'}
                </Text>
                <View style={styles.profileInfo}>
                  <Text
                    variant="titleMedium"
                    style={[styles.profileName, { color: colors.primary }]}
                  >
                    {selectedMember.name}
                  </Text>
                  <Text style={styles.profileRelation}>
                    {selectedMember.age
                      ? `${selectedMember.age} anos • ${selectedMember.relation}`
                      : selectedMember.relation}
                  </Text>
                </View>
              </View>

              <View style={[styles.stats, { borderTopColor: colors.primary }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {selectedMember.medications ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Medicamentos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {selectedMember.appointments ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Agendamentos</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Modal de adicionar membro */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.primary }]}>
              <Text
                variant="headlineSmall"
                style={[styles.modalTitle, { color: '#fff' }]}
              >
                Adicionar Perfil
              </Text>

              <Text
                style={{
                  color: '#fff',
                  marginBottom: 6,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Nome
              </Text>

              <InputItem
                key={`nome-${formVersion}`}
                pNome
                onChange={(texto) =>
                  setNewMemberForm((prev) => ({ ...prev, name: texto }))
                }
              />

              <Text
                style={{
                  color: '#fff',
                  marginBottom: 6,
                  marginTop: 4,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Parentesco
              </Text>

              <InputItem
                key={`relacao-${formVersion}`}
                pRelation
                onChange={(texto) =>
                  setNewMemberForm((prev) => ({ ...prev, relation: texto }))
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#FFF' }]}
                  onPress={addFamilyMember}
                >
                  <Text style={styles.modalButtonText}>Adicionar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: 'rgba(46, 46, 46, 1)' },
                  ]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewMemberForm({ name: '', relation: '' });
                    setFormVersion((v) => v + 1);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de edição */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.primary }]}>
              <Text
                variant="headlineSmall"
                style={[styles.modalTitle, { color: '#fff' }]}
              >
                Editar Perfil
              </Text>

              <Text
                style={{
                  color: '#fff',
                  marginBottom: 6,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Nome
              </Text>

              <RNTextInput
                style={[
                  styles.editInput,
                  { fontSize: 16, textAlign: 'left', fontWeight: 'bold' },
                ]}
                mode="outlined"
                placeholder="Digite o nome..."
                value={editName}
                onChangeText={setEditName}
              />

              <Text
                style={{
                  color: '#fff',
                  marginBottom: 6,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Parentesco
              </Text>

              <RNTextInput
                style={[
                  styles.editInput,
                  { fontSize: 16, textAlign: 'left', fontWeight: 'bold' },
                ]}
                mode="outlined"
                placeholder="Digite o parentesco..."
                value={editRelation}
                onChangeText={setEditRelation}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#FFF' }]}
                  onPress={salvarEdicao}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: 'rgba(46, 46, 46, 1)' },
                  ]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditId(null);
                    setEditName('');
                    setEditRelation('');
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* BOTÃO INVISÍVEL DE REFRESH */}
        <TouchableOpacity
          onLongPress={forceRefreshFromAPI}
          style={{
            position: 'absolute',
            width: 24,
            height: 4,
            top: 12,
            right: 12,
            borderRadius: 2,
            backgroundColor: 'rgba(124, 58, 237, 0.25)',
          }}
        />


      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  container: {
    flex: 1,
    padding: 20,
  },

  scrollContent: {
    flexGrow: 1,
  },

  addMemberButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },

  addMemberButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  profileCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  profileAvatar: {
    fontSize: 48,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontWeight: '600',
    marginBottom: 4,
  },

  profileRelation: {
    fontSize: 12,
    opacity: 0.6,
  },

  stats: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    opacity: 0.6,
  },

  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 20,
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },

  modalTitle: {
    fontWeight: '600',
    marginBottom: 20,
    fontSize: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  modalButtonText: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
  },

  // estilos da lista
  itemContainer: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSelecionado: {
    backgroundColor: '#dcd6ff',
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  nomePerfil: {
    fontSize: 16,
    fontWeight: '500',
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  botaoEditar: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  botaoExcluir: {
    color: 'red',
    fontWeight: '600',
  },

  // estilos do modal de edição
  editInput: {
    backgroundColor: '#fff',
    paddingBottom: 5,
    marginBottom: 10,
  },
});
