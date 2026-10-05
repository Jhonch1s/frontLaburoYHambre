import type { Habilidad, RunTrabajo, Usuario } from '../types';

// La vista de diseño se habilita explícitamente y solo en desarrollo.
export const IS_DESIGN_PREVIEW = import.meta.env.DEV && import.meta.env.VITE_DESIGN_PREVIEW === 'true';

export const previewUser: Usuario = {
  id: 'design-preview-user',
  username: 'Alex Dev',
  email: 'preview@local.invalid',
};

const career = [
  { edad: 18, anio: 2027, puestoEmpresa: 'Estudiante @ Instituto Tecnológico', salarioAnual: 0 },
  { edad: 19, anio: 2028, puestoEmpresa: 'Pasante Frontend @ Startup Tech Innovadora', salarioAnual: 10000 },
  { edad: 20, anio: 2029, puestoEmpresa: 'Desarrollador Trainee @ Startup Tech Innovadora', salarioAnual: 15000 },
  { edad: 21, anio: 2030, puestoEmpresa: 'Desarrollador Junior @ Startup Tech Innovadora', salarioAnual: 18000 },
  { edad: 22, anio: 2031, puestoEmpresa: 'Desarrollador Junior @ Globant', salarioAnual: 21000 },
  { edad: 23, anio: 2032, puestoEmpresa: 'Desarrollador Frontend @ Globant', salarioAnual: 25000 },
  { edad: 24, anio: 2033, puestoEmpresa: 'Desarrollador Frontend @ Globant', salarioAnual: 29000 },
  { edad: 25, anio: 2034, puestoEmpresa: 'Desarrollador Frontend @ Globant', salarioAnual: 33000 },
  { edad: 26, anio: 2035, puestoEmpresa: 'Desarrollador Frontend @ Globant', salarioAnual: 37000 },
];

function makePreviewRun(): RunTrabajo {
  let dineroAcumulado = 0;
  const historialAnual = career.map((row) => {
    dineroAcumulado += row.salarioAnual;
    return { ...row, dineroAcumulado };
  });

  return {
    id: 'design-preview-run',
    userId: previewUser.id,
    edadActual: 26,
    anioActual: 2035,
    añoActual: 2035,
    dineroGenerado: dineroAcumulado,
    salarioActual: 37000,
    estado: 'ACTIVA',
    trabajoActual: {
      id: 'design-preview-job',
      puesto: 'Desarrollador Frontend',
      empresa: 'Globant',
      tier: 'Semi Senior',
      salarioAnual: 37000,
    },
    estudioNombre: 'Tecnólogo en Informática',
    historialAnual,
  };
}

let currentRun = makePreviewRun();

export function getPreviewRun(): RunTrabajo {
  return currentRun;
}

export function createPreviewRun(): RunTrabajo {
  currentRun = {
    ...makePreviewRun(),
    edadActual: 18,
    anioActual: 2027,
    añoActual: 2027,
    dineroGenerado: 0,
    salarioActual: 10000,
    trabajoActual: {
      id: 'design-preview-first-job',
      puesto: 'Pasante Trainee de Informática',
      empresa: 'Startup Tech Innovadora',
      tier: 'Trainee',
      salarioAnual: 10000,
    },
    historialAnual: [{ ...career[0], dineroAcumulado: 0 }],
  };
  return currentRun;
}

export function advancePreviewRun(): RunTrabajo {
  const edadActual = Math.min(65, currentRun.edadActual + 1);
  const anioActual = (currentRun.anioActual || 2035) + 1;
  const salarioAnual = currentRun.salarioActual || 0;
  const dineroGenerado = currentRun.dineroGenerado + salarioAnual;
  currentRun = {
    ...currentRun,
    edadActual,
    anioActual,
    añoActual: anioActual,
    dineroGenerado,
    estado: edadActual >= 65 ? 'Completada' : 'ACTIVA',
    historialAnual: [
      ...(currentRun.historialAnual || []),
      {
        edad: edadActual,
        anio: anioActual,
        puestoEmpresa: currentRun.trabajoActual
          ? `${currentRun.trabajoActual.puesto} @ ${currentRun.trabajoActual.empresa}`
          : 'Sin empleo',
        salarioAnual,
        dineroAcumulado: dineroGenerado,
      },
    ],
  };
  return currentRun;
}

export const previewSkills: Habilidad[] = [
  { id: 'frontend', nombre: 'Frontend', nivel: 7 },
  { id: 'backend', nombre: 'Backend', nivel: 5 },
  { id: 'ingles', nombre: 'Inglés', nivel: 6 },
  { id: 'infra', nombre: 'Cloud e Infraestructura', nivel: 4 },
  { id: 'liderazgo', nombre: 'Liderazgo', nivel: 3 },
];

export const previewRanking = [
  { id: 'rank-1', username: 'Sofía Código', dineroGenerado: 870000, edadActual: 65, estado: 'Completada' },
  { id: 'rank-2', username: 'Martín Stack', dineroGenerado: 743000, edadActual: 65, estado: 'Completada' },
  { id: 'rank-3', username: 'Alex Dev', dineroGenerado: 612000, edadActual: 65, estado: 'Completada' },
];
