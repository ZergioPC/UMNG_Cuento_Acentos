# AGENTS.md

## Project Overview

App para comparar frases de diferentes cuentos. El usuario escoge un cuento, y luego verá un mapa donde al dar clic en una región mostrará el cuento con los modismos locales. También permite comparar frase por frase para encontrar las diferencias entre regionalismos.

## Tech Stack

- React
- JavaScript
- Vite
- Bootstrap (CSS)
- pnpm

## Estilos CSS

Tener un enfoque Mobile-First

## Botones

El proyecto tiene dos componentes de botón. Usar siempre estos, no crear `<button>` sueltos.

### `BtnAnim` — botón principal con animación

`src/components/BtnAnim/index.jsx` · clase `btn-blue`

Botón sólido con sombra inferior y efecto de presión. Es el estilo por defecto para acciones principales (enviar, navegar, confirmar).

Props:

- `color` — color base en hex (por defecto `#2bb0fd`); la sombra se autoscurece con `darken()`
- `size` — `"sm"` (40px), `"md"` (80px), `"lg"` (140px) o un número en px
- `shadowSize` — grosor de la sombra en px (por defecto `8`)
- `padding` — número (px) o valor CSS
- `borderRadius` — número (px) o valor CSS (por defecto `28`)
- `square` — `true` fuerza ancho y alto iguales a `size`
- `type`, `onClick`, `className` y el resto de props se pasan al `<button>`

```jsx
<BtnAnim color="#e94b4b" size="sm" onClick={handleClick}>
  Enviar
</BtnAnim>
```

### `BtnSimple` — botón de icono

`src/components/BtnSimple/index.jsx` · clase `icon-btn`

Botón sin fondo para iconos. El color lo hereda del contenedor y solo cambia en hover/focus.

Props:

- `icon` — **obligatorio**, componente SVG a renderizar (ej. el de una librería de iconos)
- `size` — tamaño del SVG en px (por defecto `24`)
- `hoverColor` — color del icono en hover/focus (por defecto `#fff`)
- `type`, `onClick`, `className` y el resto de props se pasan al `<button>`

```jsx
<BtnSimple icon={XIcon} size={20} hoverColor="#ff5c5c" onClick={close} />
```

Reglas: Mobile-First, no escribir estilos inline (usar CSS del componente) y no inventar nuevos estilos de botón.

> !important NO EJECUTAR SCRIPTS SIN AUTORIZACION
> Solo lint y build
