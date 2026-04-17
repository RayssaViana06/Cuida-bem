// src/features/contatos/store/contacts.context.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/features/AuthContext';
import { loadContacts, saveContacts } from '../services/contacts.storage';
import api from '@/api/client'; // ⬅️ usamos o mesmo client da autenticação

const ContactsCtx = createContext(null);

export function ContactsProvider({ children }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);

  // 🔄 Carrega contatos sempre que o usuário logado mudar
  useEffect(() => {
    let cancelled = false;

    async function syncContacts() {
      if (!user?.id) {
        if (!cancelled) setContacts([]);
        return;
      }

      const userId = user.id;

      // 1) Tenta carregar do AsyncStorage primeiro
      const localList = (await loadContacts(userId)) || [];

      if (localList.length > 0) {
        if (!cancelled) setContacts(localList);
        return;
      }

      // 2) Se não houver nada local, tenta buscar do Vercel (db.json)
      try {
        const res = await api.get('/contatos', {
          params: { userId }, // ex.: /contatos?userId=1
        });

        const apiList = Array.isArray(res.data) ? res.data : [];

        if (apiList.length === 0) {
          if (!cancelled) setContacts([]);
          return;
        }

        // 3) Mapeia o formato do db.json -> formato interno do app
        const mapped = apiList.map((c) => ({
          id: c.id, // mantém o id numérico de seed
          userId,
          name: c.name ?? c.nome ?? '',
          phone: c.phone ?? c.telefone ?? '',
          // "tipo" do JSON entra como specialty, "observacoes" pode ir para location
          specialty: c.specialty ?? c.especialidade ?? c.tipo ?? '',
          location: c.location ?? c.local ?? c.observacoes ?? '',
          address: c.address ?? c.endereco ?? '',
          profiles: c.profiles ?? c.perfis ?? [],
        }));

        if (!cancelled) setContacts(mapped);
        await saveContacts(userId, mapped);
      } catch (e) {
        console.warn('Erro ao sincronizar contatos da API:', e);
        // fallback: fica com o que tiver local (provavelmente vazio)
        if (!cancelled) setContacts(localList);
      }
    }

    syncContacts();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const persist = async (updatedList) => {
    setContacts(updatedList);
    if (user?.id) {
      await saveContacts(user.id, updatedList);
    }
  };

  const add = async (c) => {
    if (!user?.id) return;

    const item = {
      ...c,
      id: c.id ?? Date.now().toString(),
      userId: user.id,
    };

    const updated = [item, ...contacts];
    await persist(updated);
  };

  const update = async (c) => {
    if (!user?.id) return;

    const updated = contacts.map((x) =>
      x.id === c.id ? { ...x, ...c } : x,
    );
    await persist(updated);
  };

  const remove = async (id) => {
    if (!user?.id) return;

    const updated = contacts.filter((x) => x.id !== id);
    await persist(updated);
  };

  const value = useMemo(
    () => ({ contacts, add, update, remove }),
    [contacts],
  );

  return (
    <ContactsCtx.Provider value={value}>
      {children}
    </ContactsCtx.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsCtx);
  if (!ctx) throw new Error('useContacts must be used within ContactsProvider');
  return ctx;
}
