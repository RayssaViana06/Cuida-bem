import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { FAB, useTheme, Chip } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ROUTES } from '@/navigation/routes';
import { useContacts } from '../store/contacts.context';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

const CONTACT_TEXT_COLOR = '#3B0764';

export default function IndexContatos({ navigation }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const { contacts, remove } = useContacts();

  const applyFontScale = (baseSize) => {
    const fontScale = settings?.fontScale ?? 1;
    if (fontScale === 1) return baseSize;
    if (baseSize >= 24) {
      return baseSize * fontScale * 0.95;
    }
    if (baseSize >= 16) {
      return baseSize * fontScale;
    }
    return baseSize * fontScale * 1.05;
  };

  const isLargeButtons = !!settings?.largeButtons;
  const backIconSize = isLargeButtons ? 30 : 24;
  const actionIconSize = isLargeButtons ? 26 : 22;

  const [activeFilters, setActiveFilters] = React.useState({
    specialty: null,
    profile: null,
  });

  const specialties = React.useMemo(() => {
    return [...new Set(contacts.filter(c => c.specialty).map(c => c.specialty))];
  }, [contacts]);

  const profiles = React.useMemo(() => {
    const list = contacts.flatMap(c => c.profiles || []);
    return [...new Set(list)];
  }, [contacts]);

  const confirmDelete = id => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('Tem certeza que deseja excluir este contato?');
      if (ok) remove(id);
    } else {
      Alert.alert(
        'Excluir contato',
        'Tem certeza que deseja excluir este contato?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => remove(id) },
        ],
      );
    }
  };

  const filteredContacts = React.useMemo(() => {
    return contacts
      .filter(c => {
        if (activeFilters.specialty && c.specialty !== activeFilters.specialty)
          return false;
        if (
          activeFilters.profile &&
          !c.profiles?.includes(activeFilters.profile)
        )
          return false;
        return true;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [contacts, activeFilters]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            isLargeButtons && {
              width: 52,
              height: 52,
            },
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={backIconSize} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontSize: applyFontScale(22),
            },
          ]}
        >
          Contatos
        </Text>
      </View>

      {contacts.length > 0 && (
        <Text
          style={[
            styles.filterLabel,
            {
              color: colors.textPrimary,
              fontSize: applyFontScale(14),
            },
          ]}
        >
          Filtrar contatos por especialidade ou perfil:
        </Text>
      )}

      <View style={styles.chipsContainer}>
        {specialties.map(s => (
          <Chip
            key={s}
            mode={activeFilters.specialty === s ? 'flat' : 'outlined'}
            onPress={() =>
              setActiveFilters(prev => ({
                ...prev,
                specialty: prev.specialty === s ? null : s,
              }))
            }
            style={styles.chip}
            textStyle={{ fontSize: applyFontScale(13) }}
          >
            {s}
          </Chip>
        ))}

        {profiles.map(p => (
          <Chip
            key={p}
            mode={activeFilters.profile === p ? 'flat' : 'outlined'}
            onPress={() =>
              setActiveFilters(prev => ({
                ...prev,
                profile: prev.profile === p ? null : p,
              }))
            }
            style={styles.chip}
            textStyle={{ fontSize: applyFontScale(13) }}
          >
            {p}
          </Chip>
        ))}

        {(activeFilters.specialty || activeFilters.profile) && (
          <Chip
            mode="flat"
            onPress={() =>
              setActiveFilters({ specialty: null, profile: null })
            }
            style={[styles.chip, { backgroundColor: '#C4A9FF', marginBottom: 6 }]}
            textStyle={{
              color: '#3B1E73',
              fontWeight: 'bold',
              fontSize: applyFontScale(13),
            }}
          >
            Limpar filtros
          </Chip>
        )}
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListEmptyComponent={
          <Text
            style={[
              styles.empty,
              {
                color: colors.pillDark,
                fontSize: applyFontScale(14),
              },
            ]}
          >
            Nenhum contato cadastrado ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.contactBox,
              { backgroundColor: '#Ecd5ff' },
            ]}
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.name,
                    {
                      color: CONTACT_TEXT_COLOR,
                      fontSize: applyFontScale(16),
                    },
                  ]}
                >
                  {item.name}
                </Text>

                {!!item.specialty && (
                  <Text
                    style={[
                      styles.specialty,
                      {
                        color: CONTACT_TEXT_COLOR,
                        fontSize: applyFontScale(14),
                      },
                    ]}
                  >
                    {item.specialty}
                  </Text>
                )}
                {!!item.phone && (
                  <Text
                    style={[
                      styles.text,
                      {
                        color: CONTACT_TEXT_COLOR,
                        fontSize: applyFontScale(13),
                      },
                    ]}
                  >
                    {item.phone}
                  </Text>
                )}
                {!!item.location && (
                  <Text
                    style={[
                      styles.text,
                      {
                        color: CONTACT_TEXT_COLOR,
                        fontSize: applyFontScale(13),
                      },
                    ]}
                  >
                    {item.location}
                  </Text>
                )}
                {!!item.address && (
                  <Text
                    style={[
                      styles.text,
                      {
                        color: CONTACT_TEXT_COLOR,
                        fontSize: applyFontScale(13),
                      },
                    ]}
                  >
                    {item.address}
                  </Text>
                )}

                {!!item.profiles?.length && (
                  <View style={styles.profilesRow}>
                    {item.profiles.map((p, idx) => (
                      <View
                        key={`${item.id}-p-${idx}`}
                        style={[
                          styles.profileTag,
                          { backgroundColor: colors.surface },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: applyFontScale(12),
                            color: colors.textPrimary,
                          }}
                        >
                          {p}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.actionsCol}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(ROUTES.EDITAR_CONTATO, {
                      id: item.id,
                    })
                  }
                  style={[
                    styles.iconBtn,
                    isLargeButtons && {
                      padding: 10,
                    },
                  ]}
                  accessibilityLabel="Editar contato"
                >
                  <MaterialIcons
                    name="edit"
                    size={actionIconSize}
                    color={colors.pillDark}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => confirmDelete(item.id)}
                  style={[
                    styles.iconBtn,
                    isLargeButtons && {
                      padding: 10,
                    },
                  ]}
                  accessibilityLabel="Excluir contato"
                >
                  <MaterialIcons
                    name="delete"
                    size={actionIconSize}
                    color="#A855F7"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <FAB
        icon="plus"
        style={[
          styles.fab,
          { backgroundColor: colors.primary },
          isLargeButtons && {
            width: 70,
            height: 70,
            borderRadius: 35,
          },
        ]}
        onPress={() => navigation.navigate(ROUTES.EDITAR_CONTATO)}
        color={colors.onPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 0,
    marginTop: 8,
    marginBottom: 4,
  },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14 },

  contactBox: {
    marginHorizontal: 0,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  specialty: { marginBottom: 4 },
  text: { fontSize: 13 },
  profilesRow: { flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' },
  profileTag: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  actionsCol: { marginLeft: 8, alignItems: 'flex-end' },
  iconBtn: { padding: 6 },
  fab: { position: 'absolute', right: 16, bottom: 20 },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  chip: { marginBottom: 6 },
});
