import axios from 'axios';
import type { Usuario, RunTrabajo, Habilidad, Evento, OpcionEvento, Efecto } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar Authorization: Bearer <token>
api.interceptors.request.use((config) => {
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

  let trabajoActual = null;
  const esEmpleado = raw.empleado !== false && raw.trabajo !== null;

  if (esEmpleado && raw.trabajo && typeof raw.trabajo === 'object') {
    trabajoActual = {
      id: getId(raw.trabajo),
      puesto: raw.trabajo.puesto || raw.trabajo.nombre || 'Desarrollador',
      empresa: raw.trabajo.empresa || 'Empresa Tech',
      tier: raw.trabajo.tier || 'Junior',
      salarioAnual: raw.trabajo.salarioBase || raw.trabajo.salarioAnual || raw.salarioActual || 10000,
    };
  } else if (esEmpleado && raw.salarioActual > 0) {
    trabajoActual = {
      id: 'job-active',
      puesto: 'Pasante Trainee de Informática',
      empresa: 'Startup Tech Innovadora',
      tier: 'Junior',
      salarioAnual: raw.salarioActual,
    };
  }

  return {
    id: runId,
    _id: runId,
    userId: userId,
    user: userId,
    edadActual: typeof raw.edadActual === 'number' ? raw.edadActual : 18,
    añoActual: raw.anioActual || raw.añoActual || 2027,
    anioActual: raw.anioActual || raw.añoActual || 2027,
    dineroGenerado: typeof raw.dineroGenerado === 'number' ? raw.dineroGenerado : 0,
    salarioActual: esEmpleado ? (raw.salarioActual || (trabajoActual?.salarioAnual || 0)) : 0,
    estado: raw.estado === 'MUERTO' ? 'MUERTO' : raw.estado === 'En proceso' ? 'ACTIVA' : raw.estado === 'Completada' ? 'FINALIZADA' : raw.estado || 'ACTIVA',
    muerto: raw.muerto || raw.estado === 'MUERTO',
    esSeniorInterno: raw.esSeniorInterno || false,
    trabajoActual: esEmpleado ? trabajoActual : null,
    estudioNombre: 'Tecnólogo en Informática',
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
  const res = await api.post(`/runTrabajo/iniciarRun/${userId}`, { estudioInicialId });
  return normalizeRun(res.data);
}

export async function getDetalleRun(userId: string): Promise<RunTrabajo[]> {
  const res = await api.get(`/runTrabajo/obtenerRunTrabajo/${userId}`);
  const list = Array.isArray(res.data) ? res.data : [res.data];
  return list.map(normalizeRun);
}

export async function aumentarAño(userId: string, runId?: string): Promise<RunTrabajo> {
  if (runId) {
    await api.patch(`/runTrabajo/aumentarAnio/${runId}/${userId}`);
  }
  await api.patch(`/runTrabajo/aumentarEdad/${userId}`);
  await api.patch(`/runTrabajo/aumentarDinero/${userId}`);

  const updated = await getRunActiva(userId);
  if (updated) return updated;

  const allRuns = await getDetalleRun(userId);
  return allRuns[0] || normalizeRun({});
}

// --- HABILIDADES API ---
export async function getHabilidades(runId: string): Promise<Habilidad[]> {
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

export async function evaluarEvento(_runId?: string, currentRun?: RunTrabajo | null): Promise<Evento | null> {
  if (!currentRun) return null;

  const anio = currentRun.anioActual || currentRun.añoActual || 2027;
  const edad = currentRun.edadActual || 18;
  const esEmpleado = !!currentRun.trabajoActual;
  const dineroActual = typeof currentRun.dineroGenerado === 'number' ? currentRun.dineroGenerado : 0;

  // 1. Ciclo de eventos estricto cada 3 a 4 años (sin excepciones de despedido)
  const transcurridos = anio - 2027;
  const esCicloAnos = transcurridos > 0 && transcurridos % 3 === 0;

  if (!esCicloAnos) {
    return null;
  }

  const res = await api.get('/evento/ver');
  if (res.data && Array.isArray(res.data) && res.data.length > 0) {
    let eventosDB = res.data;

    // Obtener lista de IDs de eventos ya resueltos en esta partida
    const eventosResueltosIds = (currentRun.decisionesTomadas || [])
      .map((d: any) => (d.evento ? String(d.evento) : ''))
      .filter(Boolean);

    // A. Filtrar eventos por rango de edad
    eventosDB = eventosDB.filter((ev: any) => {
      const min = typeof ev.edadMinima === 'number' ? ev.edadMinima : 18;
      const max = typeof ev.edadMaxima === 'number' ? ev.edadMaxima : 65;
      return edad >= min && edad <= max;
    });

    // B. Filtrar eventos no repetibles ya resueltos
    eventosDB = eventosDB.filter((ev: any) => {
      const evId = getId(ev);
      if (ev.repetible === false && eventosResueltosIds.includes(evId)) {
        return false;
      }
      return true;
    });

    // C. Filtrar por requisitos de trabajo
    eventosDB = eventosDB.filter((ev: any) => {
      if (ev.reqTrabajo === true && !esEmpleado) {
        return false;
      }
      return true;
    });

    // D. Filtrar gastos por fondos suficientes
    eventosDB = eventosDB.filter((ev: any) => {
      if (ev.tipo === 'GASTO' || (typeof ev.bonificacion === 'number' && ev.bonificacion < 0)) {
        const costo = Math.abs(ev.bonificacion || 0);
        if (dineroActual < costo) {
          return false;
        }
      }
      return true;
    });

    // E. Evaluar probabilidad real del evento
    eventosDB = eventosDB.filter((ev: any) => {
      const prob = typeof ev.probabilidad === 'number' ? ev.probabilidad : 0.5;
      return Math.random() <= prob;
    });

    if (eventosDB.length === 0) return null;

    // F. Si está despedido, priorizar ofertas laborales si existen en la selección
    if (!esEmpleado) {
      const eventosEmpleo = eventosDB.filter((ev: any) => ev.tipo === 'DESEMPLEO');
      if (eventosEmpleo.length > 0) {
        eventosDB = eventosEmpleo;
      }
    }

    const selectedIndex = Math.floor(Math.random() * eventosDB.length);
    const rawEv = eventosDB[selectedIndex];
    const evId = getId(rawEv);

    const opcionesRes = await api.get(`/opcion/evento/${evId}/opciones`);
    let opcionesDB: OpcionEvento[] = [];

    if (opcionesRes.data && Array.isArray(opcionesRes.data)) {
      opcionesDB = await Promise.all(
        opcionesRes.data.map(async (op: any) => {
          const opId = getId(op);
          const efectos = await getEfectosDeOpcion(opId);
          return {
            id: opId,
            _id: opId,
            evento: evId,
            texto: op.texto || op.titulo || 'Seleccionar opción',
            efectos,
          };
        })
      );
    }

    return {
      id: evId,
      _id: evId,
      titulo: rawEv.titulo,
      descripcion: rawEv.descripcion,
      tipo: rawEv.tipo,
      bonificacion: rawEv.bonificacion,
      probabilidad: rawEv.probabilidad,
      opciones: opcionesDB,
    };
  }

  return null;
}

export async function tomarDecision(
  runId: string,
  eventoId: string,
  opcionId: string
): Promise<{ success: boolean; runActualizada?: RunTrabajo }> {
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

export async function getPartidasAnteriores(idUsuario: string): Promise<any[]>{
  const res = await api.get(`/runTrabajo/obtenerRunTrabajo/${idUsuario}`);

  const raw = res.data;
  console.log(res);
  const list = Array.isArray(raw)
    ? raw
    : raw
      ? [raw]
      : [];

    console.log(raw)
    return list.map((item: any, idx: number) => {
      const userObj = typeof item.user === 'object' ? item.user: {};
      return {
        id: getId(item) || `rank-${idx}`,
        username: userObj.username || item.usuario,
        fecha: item.fecha,
        edadActual: item.edadActual || 65,
        dineroGenerado: typeof item.dineroGenerado === 'number' ? item.dineroGenerado : 0,
        estado : item.estado || 'Completada'
      };
    });

  return [];
}
