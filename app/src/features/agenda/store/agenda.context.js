// src/features/agenda/store/agenda.context.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { loadAgenda, saveAgenda } from '../services/agenda.storage';
import { toISODate, toTimeHHMM } from '@/utils/datetime';
import { useAuth } from '@/features/AuthContext'; // ✅ AuthContext
import api from '@/api/client'; // ✅ ADICIONADO: client HTTP para buscar seed remoto (Vercel)

const AgendaCtx = createContext(null);

// 🔐 Resolve uma chave de usuário estável para a Agenda
// - Se tiver user.id → usa só o id (mantém compatibilidade com dados já salvos)
// - Se NÃO tiver id, mas tiver email → usa "email:..." (separa usuários da API)
// - Se não tiver nada → null (modo legado, evita salvar se possível)
function resolveAgendaUserKey(user) {
  if (!user) return null;

  if (user.id !== undefined && user.id !== null) {
    return String(user.id);
  }

  if (user.email) {
    return `email:${String(user.email).toLowerCase()}`;
  }

  return null;
}

// 🔄 Converte um compromisso vindo do backend (db.json / JSON Server)
// para o formato interno usado pela Agenda do app.
function mapRemoteAppointmentToLocal(remote) {
  if (!remote) return null;

  const rawDate = remote.data || remote.date;
  const rawTime = remote.hora || remote.time;

  const date = toISODate(rawDate);
  const time = toTimeHHMM(rawTime);

  let doctorName = remote.medico || remote.doctor || '';
  if (typeof doctorName === 'string') {
    // Evita "Dr. Dr. Fulano" na tela
    doctorName = doctorName.replace(/^Dr\.?\s*/i, '').trim();
  }

  return {
    id: String(remote.id ?? Date.now().toString()),
    date,
    time,
    category: remote.titulo || remote.category || '',
    specialty: remote.especialidade || remote.specialty || '',
    doctor: doctorName,
    profile: remote.local || remote.profile || '',
    reminder: remote.lembrete || remote.reminder || '',
  };
}

export function AgendaProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]); // [{ id, date:'YYYY-MM-DD', time:'HH:MM', ... }]
  const [userId, setUserId] = useState(null); // ID único para agenda (string)
  const [initialized, setInitialized] = useState(false);

  // 🔄 Sempre que o usuário logado mudar, recarrega a agenda correta
  useEffect(() => {
    let cancelled = false;

    async function syncAgenda() {
      // Enquanto o Auth ainda estiver carregando, seguramos
      if (authLoading) return;

      const uid = resolveAgendaUserKey(user);
      setUserId(uid);

      try {
        // Se não tiver usuário (logout), zera a lista
        if (!uid) {
          if (!cancelled) {
            setItems([]);
            setInitialized(true);
          }
          return;
        }

        // 1) Carrega do AsyncStorage normalmente
        let data = await loadAgenda(uid);
        let list = Array.isArray(data) ? data : [];

        // 2) Se estiver vazio, tenta puxar seed do backend (Vercel read-only)
        const hasNumericId =
          user && user.id !== undefined && user.id !== null;

        if (hasNumericId && list.length === 0) {
          try {
            const response = await api.get('/compromissos', {
              params: { userId: user.id },
            });

            const remote = Array.isArray(response.data) ? response.data : [];

            if (remote.length > 0) {
              const seeded = remote
                .map(mapRemoteAppointmentToLocal)
                .filter(Boolean);

              if (seeded.length > 0) {
                await saveAgenda(uid, seeded);
                list = seeded;
              }
            }
          } catch (err) {
            console.warn('AgendaProvider remote seed error:', err);
          }
        }

        if (!cancelled) {
          setItems(list);
          setInitialized(true);
        }
      } catch (e) {
        console.warn('AgendaProvider sync error:', e);
        if (!cancelled) {
          setItems([]);
          setInitialized(true);
        }
      }
    }

    syncAgenda();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const persist = async (nextList) => {
    setItems(nextList);

    // se não tiver userId, evita salvar "global" em @agenda_v1
    if (!userId) return;

    await saveAgenda(userId, nextList);
  };

  const add = async (payload) => {
    const item = {
      ...payload,
      id: payload.id ?? Date.now().toString(),
      date: toISODate(payload.date),
      time: toTimeHHMM(payload.time),
    };
    await persist([item, ...items]);
  };

  const update = async (payload) => {
    const normalized = {
      ...payload,
      date: toISODate(payload.date),
      time: toTimeHHMM(payload.time),
    };

    const next = items.map((it) =>
      it.id === normalized.id ? { ...it, ...normalized } : it
    );

    await persist(next);
  };

  const remove = async (id) => {
    const next = items.filter((it) => it.id !== id);
    await persist(next);
  };

  const getById = (id) => items.find((it) => it.id === id) || null;

  const value = useMemo(
    () => ({
      items,
      add,
      update,
      remove,
      getById,
      initialized,
    }),
    [items, initialized]
  );

  return <AgendaCtx.Provider value={value}>{children}</AgendaCtx.Provider>;
}

export function useAgenda() {
  const ctx = useContext(AgendaCtx);
  if (!ctx) throw new Error('useAgenda must be used within AgendaProvider');
  return ctx;
}
