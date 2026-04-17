// app/src/features/medicamentos/services/medicamentos.service.js

import {
  loadMeds,
  getMedById,
  upsertMed,
  deleteMedById,
  saveMeds,
} from './medicamentos.storage';

import { getCurrentUser } from '@/features/auth/services/authService';
import api from '@/api/client'; // client HTTP para buscar seed remoto (Vercel)

// Resolve o ID do usuário logado
async function resolveUserId(options = {}) {
  if (options.userId) {
    return String(options.userId);
  }

  const current = await getCurrentUser();
  if (!current?.id) {
    throw new Error('Usuário não autenticado ou sem ID definido');
  }

  return String(current.id);
}

/**
 * Sincroniza medicamentos remotos (JSON Server read-only) com o armazenamento local.
 *
 * Regras:
 * - Sempre tenta carregar do AsyncStorage primeiro.
 * - Se já houver dados locais, NÃO mexe em nada (não sobrescreve).
 * - Se estiver vazio, tenta buscar no backend: /medicamentos?userId={id}
 * - Se vier algo do backend, grava em AsyncStorage e devolve essa lista.
 */
async function syncRemoteMedsIfEmpty(userId) {
  // 1) Carrega o que já existe localmente
  const localList = await loadMeds(userId);

  if (Array.isArray(localList) && localList.length > 0) {
    // Já tem dados locais -> não sobrescreve com backend
    return localList;
  }

  // 2) Tenta buscar seed no backend (Vercel read-only)
  try {
    const response = await api.get('/medicamentos', {
      params: { userId },
    });

    const remoteList = Array.isArray(response.data) ? response.data : [];

    if (remoteList.length > 0) {
      // Normaliza: garante id sempre como STRING
      const normalized = remoteList.map((m) => ({
        ...m,
        id: String(m.id),
      }));

      // Salva no AsyncStorage para seguir usando tudo localmente depois
      await saveMeds(userId, normalized);
      return normalized;
    }
  } catch (error) {
    console.warn('Erro sincronizando medicamentos remotos:', error);
  }

  // 3) Se nada deu certo, mantém o local (vazio mesmo)
  return localList || [];
}

// Lista todos os medicamentos do usuário atual
export async function listMedicines(options = {}) {
  const userId = await resolveUserId(options);
  // Agora: tenta sincronizar seed remoto se o local estiver vazio
  const meds = await syncRemoteMedsIfEmpty(userId);
  return meds;
}

// Busca 1 medicamento pelo id para o usuário atual
export async function getMedicine(id, options = {}) {
  if (!id) {
    throw new Error('ID obrigatório');
  }
  const userId = await resolveUserId(options);
  const med = await getMedById(userId, String(id));
  if (!med) {
    throw new Error('Medicamento não encontrado');
  }
  return med;
}

// Cria um novo medicamento para o usuário atual
export async function createMedicine(payload, options = {}) {
  if (!payload) throw new Error('Payload obrigatório');

  const userId = await resolveUserId(options);
  const saved = await upsertMed(userId, payload);
  return saved;
}

// Atualiza um medicamento existente do usuário atual
export async function updateMedicine(id, payload, options = {}) {
  if (!id) throw new Error('ID obrigatório');
  if (!payload) throw new Error('Payload obrigatório');

  const userId = await resolveUserId(options);
  const saved = await upsertMed(userId, { ...payload, id: String(id) });
  return saved;
}

// Remove um medicamento do usuário atual
export async function deleteMedicine(id, options = {}) {
  if (!id) throw new Error('ID obrigatório');

  const userId = await resolveUserId(options);
  await deleteMedById(userId, String(id));
  return true;
}

export default {
  listMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
