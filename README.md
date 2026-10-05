# LaburoYHambre — Frontend (React + TypeScript + Vite)

¡Bienvenido al repositorio frontend de **LaburoYHambre**! Un simulador interactivo de carrera profesional en tecnología creado para desarrolladores en Uruguay y Latinoamérica.

---

## Acerca del Proyecto

**LaburoYHambre** es una experiencia interactiva donde encarnas a un desarrollador de software a partir de los 18 años (tras comenzar la carrera de **Tecnólogo en Informática**). A lo largo de 47 años de carrera (hasta los 65 años), deberás tomar decisiones estratégicas, elegir capacitaciones, aceptar o rechazar ofertas laborales en diversas empresas (desde carnicerías locales hasta multinacionales como Globant, Mercado Libre o Google), gestionar gastos impulsivos y aumentar tus habilidades clave.

El proyecto está dividido formalmente en **dos repositorios separados**:
1. **Backend**: API REST en Node.js, Express y MongoDB (`LaburoYHambre`).
2. **Frontend**: Aplicación Web React SPA con TypeScript y Vite (`frontLaburoYHambre`).

---

## Tecnologías Utilizadas

- **Core**: React 18, TypeScript
- **Build Tool / Bundler**: [Vite](https://vitejs.dev/)
- **Enrutamiento**: React Router DOM v6
- **Cliente HTTP**: Axios (con interceptores JWT)
- **Estilos**: Vanilla CSS con variables de diseño, layout responsivo y estética retro-sticker personalizada
- **Iconos y Stickers**: Assets gráficos en formato PNG/SVG personalizados por rango de edad y nivel socioeconómico

---

## Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior
- **Backend en ejecución**: El repositorio de backend [LaburoYHambre](https://github.com/usuario/LaburoYHambre) debe estar ejecutándose en tu entorno local (o remoto).

---

## Instalación y Configuración Local

Sigue estos pasos para ejecutar el frontend en tu computadora:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jhonch1s/frontLaburoYHambre.git
cd frontLaburoYHambre
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto (puedes tomar como base `.env.example`):
```env
VITE_API_URL=http://localhost:3000
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible por defecto en `http://localhost:5173`.

---

## Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

- `npm run dev`: Inicia el servidor de desarrollo con Hot Module Replacement (HMR).
- `npm run build`: Compila la aplicación optimizada para producción en la carpeta `dist`.
- `npm run preview`: Sirve localmente la build de producción creada con `npm run build`.

---

## Mecánicas del Juego en el Frontend

1. **Autenticación**: Registro e Inicio de Sesión con JWT guardado en `localStorage`.
2. **Menú Principal**:
   - **Continuar carrera**: Carga la partida activa guardada.
   - **Nueva partida**: Finaliza cualquier partida activa previa e inicia un nuevo camino a los 18 años.
   - **Ranking Global**: Visualiza a los jugadores con mayor patrimonio acumulado a los 65 años.
   - **Historial Personal**: Muestra tus partidas anteriores y sus detalles.
3. **Panel de Control del Juego (`/game`)**:
   - **Avatar Dinámico**: Evoluciona según tu franja de edad (Joven 18-30, Adulto 31-50, Veterano 51-65) y tu capital ($500k para moderado, $10M para rico).
   - **Habilidades (Acordeón desplegable)**: Muestra el nivel actual (0 al 10) de Backend, Frontend, Inglés, Cloud, Liderazgo, .NET y Ciberseguridad.
   - **Historial de Carrera**: Libreta paginada de 10 en 10 años mostrando el progreso de tus sueldos y patrimonio.
   - **Modal de Eventos**: Eventos con opciones de contratación, capacitaciones y riesgo financiero. Opción adaptativa para aceptar o mantenerse desempleado/empleado.
