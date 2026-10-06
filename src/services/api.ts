import axios from 'axios';
import type { Usuario, RunTrabajo, Habilidad, Evento, Efecto } from '../types';
import {
  IS_DESIGN_PREVIEW,
  advancePreviewRun,
  createPreviewRun,
  getPreviewRun,
  previewRanking,
  previewSkills,
} from '../preview/designPreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  if (IS_DESIGN_PREVIEW) {
    return Promise.reject(new Error('Las llamadas al backend están deshabilitadas en la vista de diseño local.'));
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper de extracción de ID de MongoDB
export function getId(item: any): string {
  if (!item) return '';
  return item._id ? String(item._id) : item.id ? String(item.id) : '';
}

// Normalización de objeto RunTrabajo proveniente del backend
export function normalizeRun(raw: any): RunTrabajo {
  if (!raw) {
    return {
      id: '',
      userId: '',
      edadActual: 18,
      añoActual: 2027,
      dineroGenerado: 0,
      salarioActual: 0,
      estado: 'ACTIVA',
      trabajoActual: null,
      estudioNombre: 'Tecnólogo en Informática',
    };
  }

  const runId = getId(raw);
  const userId = typeof raw.user === 'object' ? getId(raw.user) : String(raw.user || raw.usuario || '');

  const tieneReferenciaTrabajo = raw.trabajo !== null && raw.trabajo !== undefined;

  let trabajoActual = null;
  const esEmpleado = raw.empleado === true && raw.trabajo !== null && raw.trabajo !== undefined;

  if (tieneReferenciaTrabajo && raw.trabajo && typeof raw.trabajo === 'object') {
    trabajoActual = {
      id: getId(raw.trabajo),
      puesto: raw.trabajo.puesto || raw.trabajo.nombre || 'Desarrollador',
      empresa: raw.trabajo.empresa || 'Empresa Tech',
      tier: raw.trabajo.tier || 'Junior',
      salarioAnual: raw.trabajo.salarioBase || raw.trabajo.salarioAnual || raw.salarioActual || 10000,
    };
  }

  return {
    id: runId,
    _id: runId,
    userId: userId,
    user: userId,
    edadActual: typeof raw.edadActual === 'number' ? raw.edadActual : Number(raw.edadActual || 18),
    añoActual: Number(raw.anioActual || raw.añoActual || 2027),
    anioActual: Number(raw.anioActual || raw.añoActual || 2027),
    dineroGenerado: typeof raw.dineroGenerado === 'number' ? raw.dineroGenerado : Number(raw.dineroGenerado || 0),
    salarioActual: esEmpleado ? (raw.salarioActual || (trabajoActual?.salarioAnual || 0)) : 0,
    estado: raw.estado === 'MUERTO' || raw.muerto ? 'MUERTO' : (raw.estado?.toLowerCase().includes('completa') || raw.estado?.toLowerCase().includes('finaliza') || Number(raw.edadActual) >= 65) ? 'FINALIZADA' : raw.estado === 'En proceso' ? 'ACTIVA' : raw.estado || 'ACTIVA',
    muerto: raw.muerto || raw.estado === 'MUERTO',
    esSeniorInterno: raw.esSeniorInterno || false,
    trabajoActual: esEmpleado ? trabajoActual : null,
    estudioNombre: 'Tecnólogo en Informática en UTEC',
    decisionesTomadas: raw.decisionesTomadas || [],
    historialAnual: raw.historialAnual || [],
  };
}

// --- AUTH API ---
export async function loginApi(credentials: { email: string; password?: string }) {
  const res = await api.post('/usuario/login', credentials);
  if (res.data?.token) {
    localStorage.setItem('token', res.data.token);
  }
  const loggedUser: Usuario = res.data?.user || {
    id: res.data?.userId || 'usr-1',
    username: res.data?.user?.username || credentials.email.split('@')[0],
    email: credentials.email,
  };
  return { auth: true, token: res.data.token, user: loggedUser };
}

export async function registerApi(data: { username: string; email: string; password?: string }) {
  const res = await api.post('/usuario/crear', data);
  const createdUser = res.data;
  const loginRes = await loginApi({ email: data.email, password: data.password || '123456' });
  return loginRes || { auth: true, token: 'token-' + getId(createdUser), user: createdUser };
}

// --- RUN API ---
export async function getRunActiva(userId: string): Promise<RunTrabajo | null> {
  if (IS_DESIGN_PREVIEW) return getPreviewRun();
  const res = await api.get(`/runTrabajo/obtenerRunTrabajoActivo/${userId}`);
  if (res.data) {
    const rawRun = Array.isArray(res.data) ? res.data[0] : res.data;
    if (rawRun && rawRun._id) {
      return normalizeRun(rawRun);
    }
  }
  return null;
}

export async function crearRun(userId: string, estudioInicialId?: string | number): Promise<RunTrabajo> {
  if (IS_DESIGN_PREVIEW) return createPreviewRun();
  const res = await api.post(`/runTrabajo/iniciarRun/${userId}`, { estudioInicialId });
  return normalizeRun(res.data);
}

export async function getDetalleRun(userId: string): Promise<RunTrabajo[]> {
  if (IS_DESIGN_PREVIEW) return [getPreviewRun()];
  const res = await api.get(`/runTrabajo/obtenerRunTrabajo/${userId}`);
  const list = Array.isArray(res.data) ? res.data : [res.data];
  return list.map(normalizeRun);
}

export async function aumentarAño(userId: string, runId?: string): Promise<RunTrabajo> {
  if (IS_DESIGN_PREVIEW) return advancePreviewRun();
  try {
    if (runId) {
      await api.patch(`/runTrabajo/aumentarAnio/${runId}/${userId}`).catch(() => { });
    }
    await api.patch(`/runTrabajo/aumentarEdad/${userId}`).catch(() => { });
    await api.patch(`/runTrabajo/aumentarDinero/${userId}`).catch(() => { });
  } catch (err) {
    console.warn('Advertencia al avanzar año en backend:', err);
  }

  const updated = await getRunActiva(userId);
  if (updated) return updated;

  const allRuns = await getDetalleRun(userId);
  if (runId) {
    const matched = allRuns.find((r) => getId(r) === runId);
    if (matched) return matched;
  }
  return allRuns[0] || normalizeRun({});
}

// --- HABILIDADES API ---
export async function getHabilidades(runId: string): Promise<Habilidad[]> {
  if (IS_DESIGN_PREVIEW) return [...previewSkills];
  const res = await api.get(`/habilidadJugador/obtenerHabilidades/${runId}`);
  if (res.data && Array.isArray(res.data)) {
    return res.data.map((item: any) => {
      const habObj = typeof item.habilidad === 'object' ? item.habilidad : {};
      return {
        id: getId(item) || getId(habObj),
        _id: getId(item) || getId(habObj),
        nombre: habObj.nombre || item.nombre || 'Habilidad',
        descripcion: habObj.descripcion || '',
        nivel: typeof item.nivel === 'number' ? item.nivel : 0,
      };
    });
  }
  return [];
}

// --- EVENTOS, OPCIONES & EFECTOS API ---
export async function getEfectosDeOpcion(opcionId: string): Promise<Efecto[]> {
  if (IS_DESIGN_PREVIEW) return [];
  const res = await api.get(`/efectoOpcion/opcion/${opcionId}`);
  if (res.data && Array.isArray(res.data)) {
    return res.data
      .map((rel: any) => rel.efecto)
      .filter((ef: any) => ef && typeof ef === 'object')
      .map((ef: any) => ({
        id: getId(ef),
        _id: getId(ef),
        tipo: ef.tipo || 'MODIFICAR_HABILIDAD',
        objetivo: ef.objetivo || 'Backend',
        valor: typeof ef.valor === 'number' ? ef.valor : 1,
      }));
  }
  return [];
}

export async function evaluarEvento(runId?: string, currentRun?: RunTrabajo | null): Promise<Evento | null> {
  if (IS_DESIGN_PREVIEW) return null;
  const targetId = runId || (currentRun ? getId(currentRun) : '');
  if (!targetId) return null;

  try {
    const res = await api.get(`/evento/evaluar/${targetId}`);
    if (res.data && (res.data.id || res.data._id)) {
      return {
        id: getId(res.data),
        _id: getId(res.data),
        titulo: res.data.titulo,
        descripcion: res.data.descripcion,
        tipo: res.data.tipo,
        bonificacion: res.data.bonificacion,
        probabilidad: res.data.probabilidad,
        opciones: (res.data.opciones || []).map((op: any) => ({
          id: getId(op),
          _id: getId(op),
          evento: getId(res.data),
          texto: op.texto || op.titulo || 'Seleccionar opción',
          efectos: op.efectos || [],
        })),
      };
    }
  } catch (err: any) {
    console.group('Error en evaluarEvento');
    console.warn('Mensaje de error:', err.message);

    if (err.response) {
      // El servidor respondió con un status fuera del rango 2xx (404, 500, etc.)
      console.warn('Código HTTP (Status):', err.response.status);
      console.warn('Respuesta del servidor (Data):', err.response.data);
    } else if (err.request) {
      // La petición se hizo pero no se recibió respuesta (red/CORS)
      console.warn('Sin respuesta del servidor. Request:', err.request);
    } else {
      // Error en código JS/TS antes o después de la petición
      console.warn('Error de JS/sintaxis:', err);
    }

    console.groupEnd();
  }
  return null;
}

export async function tomarDecision(
  runId: string,
  eventoId: string,
  opcionId: string
): Promise<{ success: boolean; runActualizada?: RunTrabajo }> {
  if (IS_DESIGN_PREVIEW) return { success: true, runActualizada: getPreviewRun() };
  try {
    const res = await api.post(`/opcion/tomarOpcion/${eventoId}/${runId}`, { opcionId });
    if (res.data) {
      return { success: true, runActualizada: res.data.runTrabajo ? normalizeRun(res.data.runTrabajo) : undefined };
    }
  } catch (err) {
    console.warn('Tomar decisión procesado:', err);
  }
  return { success: true };
}

// --- RANKING API ---
export async function getRankingGlobal(): Promise<any[]> {
  if (IS_DESIGN_PREVIEW) return [...previewRanking];
  const res = await api.get('/ranking');
  if (res.data && Array.isArray(res.data)) {
    return res.data.map((item: any, idx: number) => {
      const userObj = typeof item.user === 'object' ? item.user : {};
      return {
        id: getId(item) || `rank-${idx}`,
        username: userObj.username || item.usuario || `Jugador #${idx + 1}`,
        dineroGenerado: typeof item.dineroGenerado === 'number' ? item.dineroGenerado : 0,
        edadActual: item.edadActual || 65,
        estado: item.estado || 'Completada',
      };
    });
  }
  return [];
}

export async function getPartidasAnteriores(idUsuario: string): Promise<any[]> {
  if (IS_DESIGN_PREVIEW) {
    return [{
      id: getPreviewRun().id,
      username: 'Alex Dev',
      fecha: '2026-09-30',
      edadActual: getPreviewRun().edadActual,
      dineroGenerado: getPreviewRun().dineroGenerado,
      estado: getPreviewRun().estado,
    }];
  }
  const res = await api.get(`/runTrabajo/obtenerRunTrabajo/${idUsuario}`);

  const raw = res.data;
  console.log(res);
  const list = Array.isArray(raw)
    ? raw
    : raw
      ? [raw]
      : [];

  return list.map((item: any, idx: number) => {
    const userObj = typeof item.user === 'object' ? item.user : {};
    return {
      id: getId(item) || `rank-${idx}`,
      username: userObj.username || item.usuario,
      fecha: item.fecha,
      edadActual: item.edadActual || 65,
      dineroGenerado: typeof item.dineroGenerado === 'number' ? item.dineroGenerado : 0,
      estado: item.estado || 'Completada'
    };
  });

  return [];
}


export async function getDetallePartida(idRunTrabajo: string): Promise<RunTrabajo> {
  if (IS_DESIGN_PREVIEW) return getPreviewRun();
  const res = await api.get(`/runTrabajo/obtenerRunTrabajoDetalle/${idRunTrabajo}`);
  console.log(idRunTrabajo)
  console.log(res);

  const raw = Array.isArray(res.data) ? res.data[0] : res.data;
  console.log(raw);
  return normalizeRun(raw);


}
