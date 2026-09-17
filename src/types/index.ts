export interface Usuario {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

export interface Trabajo {
  _id?: string;
  id?: string;
  puesto?: string;
  nombre?: string;
  empresa?: string;
  tier?: number | string;
  salarioAnual?: number;
  salarioActual?: number;
}

export interface RunTrabajo {
  _id?: string;
  id?: string;
  user?: string;
  userId?: string;
  edadActual: number; // 18-65
  anioActual?: number;
  añoActual?: number;
  dineroGenerado: number;
  salarioActual?: number;
  estado: 'En proceso' | 'Completada' | 'ACTIVA' | 'FINALIZADA' | 'MUERTO' | string;
  muerto?: boolean;
  esSeniorInterno?: boolean;
  trabajoActual?: Trabajo | null;
  trabajo?: Trabajo | string | null;
  estudio?: string | null;
  estudioNombre?: string;
  decisionesTomadas?: Array<{
    evento?: string;
    opcion?: string;
    fecha?: string | Date;
  }>;
  historialAnual?: Array<{
    edad: number;
    anio?: number;
    puestoEmpresa: string;
    salarioAnual: number;
    dineroAcumulado: number;
  }>;
}

export interface Habilidad {
  _id?: string;
  id?: string;
  nombre: string;
  descripcion?: string;
  nivel?: number;
}

export interface HabilidadJugador {
  _id?: string;
  id?: string;
  runTrabajo?: string;
  habilidad: Habilidad | string;
  nivel: number;
}

export interface Efecto {
  _id?: string;
  id?: string;
  tipo: string;
  objetivo: string;
  valor: number;
}

export interface EfectoOpcion {
  _id?: string;
  id?: string;
  efecto: Efecto;
  opcion: string;
}

export interface OpcionEvento {
  _id?: string;
  id?: string;
  evento?: string;
  titulo?: string;
  texto: string;
  efectos?: Efecto[];
  impactoHab?: Record<string, number> | Array<{ habilidad: string; incremento: number }> | string;
  impactoDinero?: number;
}

export interface Evento {
  _id?: string;
  id?: string;
  titulo: string;
  descripcion: string;
  tipo?: string;
  bonificacion?: number;
  probabilidad?: number;
  edadMinima?: number;
  edadMaxima?: number;
  opciones: OpcionEvento[];
}

export interface HistorialAño {
  edad: number;
  empresaYPuesto: string;
  salarioAnual: number;
  dineroAcumulado: number;
}

export interface AuthResponse {
  auth?: boolean;
  token: string;
  user: Usuario;
}
