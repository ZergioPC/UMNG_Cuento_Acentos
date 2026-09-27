# Explicación para un agente IA: cómo funciona el mapa 3D (MapScene + InteractiveMap)

## 1. Visión general

El mapa 3D es una escena de React Three Fiber (R3F) que muestra Colombia dividida en regiones. La navegación ocurre por **PageFlipBook** (página "hard", ver App.jsx:21). 

- **MapScene (src/scenes/MapScene/index.jsx)**: wrapper que lazy-carga `InteractiveMap` (chunk separado para Three/Drei). Recibe `cuento`, `region`, `onSelectRegion`, `onBack`. No renderiza si `cuento` es null.
- **InteractiveMap (src/components/InteractiveMap/index.jsx)**: monta `<Canvas>` con cámara orto-perspectiva fija, gestos (arrastre/rueda/teclado), vuelo suave (spring), fondo de mar con shader cartoon, unas pocas nubes con shader propio, luz toon y bordes de color por región, resaltado/animación por región y un HUD con pistas ("Arrastra para mover · rueda para acercar...").
- Modelo: `src/assets/mapa3d/regiones_colombia.glb`. Texturas PNG por región/ bases. El mapa se ve como una isla sobre un plano de mar (shader propio).

## 2. Arquitectura y responsabilidades

| Archivo | Rol |
|---|---|
| `MapScene/index.jsx` | UI overlay (barra superior con botón atrás + título del cuento). Lazy-load de InteractiveMap. |
| `InteractiveMap/index.jsx` | Orquestación: Canvas, estado de hover/notice, detección pointer/coarse/reduced-motion, control de `frameloop` (pause cuando canvas no visible). Exporta `InteractiveMap`. |
| `constants.js` | Config única: URLs (GLB+PNG), `BASE_MESHES`, `REGION_MESHES`, `MESHES`, `CAMERA`, `WORLD`, `CLOUDS`, `CONTROLS`, `TEXTURE`, `TOON`, `OUTLINE`, `ANIM`, `LIGHT`, `SOON_LABEL`. |
| `useMapNodes.js` (implícito en index.jsx:39-65) | Carga GLB (`useGLTF`) + texturas (`useTexture`) en orden `MESHES`. Clona nodos (`scene.getObjectByName(...).clone()`) para no mutar cache GLTF (evita que animaciones afecten siguiente montaje). Agrupa `bases` y `regions`. |
| `BaseMesh.jsx` | Suelo/mundo (no interactivo). Aplica material con `cast=false`, `receive=true`. |
| `RegionMesh.jsx` | Región interactiva: anima Y (oscilación idle + resorte 2º orden), maneja hover/click, aplica salto (`jumpImpulse`) al seleccionar, cursor pointer solo si `regionKey != null`, y monta el borde toon (`<Line segments>` de drei) como hijo del nodo. |
| `useMapMaterial.js` | Crea `MeshStandardMaterial` nuevo por malla (GLB trae emissiveFactor que lavaría textura) con `anisotropy` limitado por GPU. Además usa la misma textura como `emissiveMap` (intensidad baja) y parchea el shader con `onBeforeCompile` para cuantizar la luz. Dispone material al cleanup. |
| `toonLight.js` | GLSL plano del parche toon: cuantiza `reflectedLight.directDiffuse` en bandas planas justo antes del difuso total, con el borde de cada banda suavizado un píxel con `fwidth`. Sin uniforms (`bands` va como literal). |
| `regionOutline.js` | Matemática pura del borde: `EdgesGeometry` con umbral de ángulo + filtro por banda de altura → `Array` plano de coordenadas con el contorno de la cara superior de un slab (así lo exige el `<Line segments>` de drei). Sin React. |
| `Clouds.jsx` | Nubes de fondo: `CLOUDS.count` quads con `ShaderMaterial` propio, pre-rotados de cara a la cámara (pitch fijo) y arrastrados en X por detrás de la isla. Posiciones con PRNG sembrado, `uTime` acumulado a mano, congelado con reduced-motion. |
| `cloudShader.js` | GLSL de las nubes: silueta por distancia con signo (tres lóbulos con base plana) mordida por noise de valor, recorte con `fwidth`, dos tonos cuantizados. Sin texturas ni CDN. |
| `WaterBackground.jsx` | Mar de fondo: plano grande bajo la base del GLB con `ShaderMaterial` propio. Saca el nivel del agua del `Box3` real de las bases, acumula `uTime` a mano y se congela con reduced-motion. |
| `waterShader.js` | GLSL del mar cartoon: bandas planas de oleaje, espuma por umbral, rompientes en la costa y destellos. Sin texturas ni dependencias. |
| `useFlightCamera.js` | Rig de cámara "orbital sobre suelo": mira punto `(x,z)` en `groundY`, altura = `distance*sin(pitch)`, detrás = `distance*cos(pitch)`. Control: drag (proyecta sobre plano Y=0), wheel (zoom clamp), teclado (WASD/flechas), suavizado exponencial. |
| `framing.js` | Matemáticas puras: `createRig`, `clampTarget`, `place(camera,rig)`, `fitDistance(w,h)` (ajusta distancia para que mapa entre completo según aspect ratio + pitch). |
| `useReducedMotion.js` | Detecta `prefers-reduced-motion: reduce`. Desactiva resorte/idle y hace cambios instantáneos. |

## 3. Flujo de datos

1. **App** pasa: `cuento` (objeto con `frases`, `title`...), `region` (key activa: `"paisa"|"rolo"|"costeño"|null`), `onSelectRegion(key)`, `onBack()`.
2. **MapScene** recibe `cuento` y pasa `regions={REGIONS}` (array global `["paisa","rolo","costeño"]` de src/db/index.js) a InteractiveMap. También pasa `activeRegion={region}` y callbacks.
3. **InteractiveMap** mapea `REGIONS` (disponibles globalmente) vs `REGION_MESHES`: en `MapContents`, cada nodo region tiene `regionKey = regions.includes(node.key) ? node.key : null` (líneas 99-106). 
   - Si `node.key == null` (Amazonia/Pacífico en constants) → `regionKey=null` → dibujado/resaltado pero **no navegable**.
   - Si cuento no incluye esa key en `regions` (lista global) → tampoco navegable.
4. Selección: `RegionMesh.handleClick` valida umbral de drag + `rig.dragging/moved`. Llama `jump()` (rebote), luego `onSelect(regionKey,label)`. InteractiveMap retrasa navegación `ANIM.settleMs` (550ms) salvo `reduced` (0ms) para que se vea el rebote antes de cambiar página (comentarios 160-175).

## 4. Modelo 3D y mapeo

- GLB: `regiones_colombia.glb` (ruta MAPA_URL). Nodos esperados: `BaseCol`, `Base_map`, `Caribe`, `Andes`, `Orinoquia`, `Amazonia`, `Pacifico` (coinciden con `BASE_MESHES` y `REGION_MESHES.name`).
- Texturas en orden `MESHES = [...BASE_MESHES,...REGION_MESHES]` → `useTexture` devuelve array en ese orden; `useMapNodes` indexa por nombre.
- Clonado de objetos: `scene.getObjectByName(name)?.clone()` evita mutaciones persistentes en cache de `useGLTF`.
- UVs glTF con V hacia abajo: `TEXTURE.flipY = false` (comentario constants.js:85) porque Three.js TextureLoader carga con flipY=true por defecto; se corrige a false.

## 5. Cámara, controles y encuadre

- Pitch fijo `CAMERA.pitch = π/4` (45°). Mirador siempre en `(rig.x, groundY, rig.z)`. Posición cámara = `(rig.x, groundY + d*sin45°, rig.z + d*cos45°)`. Rotación X = `-pitch`.
- Drag: proyecta puntero sobre plano `GROUND = Plane(Y=1, -groundY)`. Mantiene punto agarrado bajo dedo → mueve `targetX,targetZ` con signo inverso (comentario useFlightCamera 124-131) para que mapa siga dirección del dedo.
- Zoom: rueda multiplica/divide `targetDistance` por `CONTROLS.zoomStep` (1.12), clamp [4.5, 16].
- Teclado: `KEY_STEPS` mapea flechas/WASD con signos ajustados (eje +X cámara empuja contenido a izquierda → para mover mapa a derecha se resta X).
- Suavizado: `focusDamping=12` (Lerp exponencial `1-e^(-k*dt)`), `zoomDamping=10` (THREE.MathUtils.damp). Integración con `dt` clamp a `CONTROLS.maxDelta=0.1`.
- Encuadre inicial: `fitDistance(w,h)` calcula distancia mínima para que modelo entre completo (considera aspect + pitch + `fitMargin=1.12`). Solo se aplica si `rig.touched == false`. Al primer movimiento/zoom deja de imponerse (`touched=true`).
- Límites mundo: `WORLD.minX/maxX/minZ/maxZ` protegen bordes (valores ajustados al GLB).

## 6. Animaciones (regiones)

- Estado interno `spring` (memo): `{ lift, velocity, pending, time, restY }`. React no re-renderiza por frame (usa `useFrame`).
- Target lift: `isActive ? activeLift(0.16) : hovered ? hoverLift(0.1) : 0`.
- Integrador Verlet-like con subpasos fijos: acumula `pending += dt`, mientras `pending >= step (1/120)` aplica ODE `v' = -k(y-t)-c v`, `y' = v`, `pending -= step`. Esto evita divergencia si un frame pierde dt (comentarios 80-96 RegionMesh).
- Idle: `sin(time*idleSpeed + index*phaseStep)*idleAmplitude` (0.01). `time` se acumula manual (no usa `state.clock`) para evitar salto de fase al reanudar `frameloop` (cambia cuando canvas deja de estar visible).
- `jump()` añade `ANIM.jumpImpulse` a `velocity` al click (rebote visible antes de navegación).
- Reduced motion: `lift = target` instantáneo, sin idle, sin subpasos.

## 7. Interactividad, rendimiento y UX

- `frameloop={visible ? "always" : "never"}`: pausa R3F cuando `<div class="imap">` sale de viewport (IntersectionObserver threshold 0). Evita GPU cuando página mapa no visible (PageFlip puede tenerla fuera de layout).
- `dpr={[1,2]}`, `antialias:true`, sombras direccionales con bias (`-0.0005`) para evitar shadow acne.
- Pointer: drag umbral `dragThresholdPx=6` para distinguir clic vs arrastre (chequeado en RegionMesh `event.delta` y `rig.moved`). Touch: hover ignorado (`pointerType !== "mouse"`), hint cambia a "Arrastra para mover · dos dedos para acercar" (`coarse`).
- HUD burbuja (`.imap__bubble`): muestra `notice` (timeout 2600ms para "Próximamente"), o `hoverInfo`, o hint por dispositivo. `pointer-events:none` para no robar gestos.
- Cursor: pointer solo regiones con `regionKey!=null` y hovered.
- Focus: canvas `tabIndex=0` + outline visible `:focus-visible` para accesibilidad teclado.
- El mar también se detiene con `frameloop="never"` (su `uTime` solo avanza en `useFrame`) y con `prefers-reduced-motion` queda congelado. Las nubes usan el mismo patrón. Ni el mar ni las nubes reciben puntero (sin handlers, R3F no los raycastea) ni sombras (ShaderMaterial sin luces). El borde toon tampoco se raycastea (`raycast={() => null}`).

## 8. Cómo aplicar cambios (guía para agente IA)

### A. Cambiar qué regiones son navegables (mapear claves)

Editar `src/components/InteractiveMap/constants.js` → `REGION_MESHES`. El campo `key` debe coincidir con la clave usada en `cuento.frases[].content` (o estructura de datos). Valores actuales:
- Caribe → `costeño`
- Andes → `paisa` 
- Orinoquia → `rolo`
- Amazonia → `null` (no navegable)
- Pacífico → `null`

La disponibilidad efectiva también depende de `REGIONS` global (App pasa `regions={REGIONS}` desde `src/db/index.js`). Si quieres habilitar una región para todos los cuentos, añade su key a `REGIONS` array. Si la quieres condicional por cuento, cambia cómo App pasa `regions` (no usa `REGIONS` global, sino `cuento.regions` o similar).

**Regla:** para que un clic navegue, se requiere `regionKey != null` (definido en constantes) **Y** `regions.includes(node.key)` (lo que pasa MapScene). Ver RegionMesh línea 101, InteractiveMap líneas 162-175.

### B. Añadir/modificar regiones o modelo GLB

1. Actualizar GLB (`regiones_colombia.glb`) y/o PNGs en `src/assets/mapa3d/`.
2. En `constants.js`: añadir/editar `BASE_MESHES` o `REGION_MESHES` con `name` exacto del nodo en GLB, `key` (navegación) o `null`, `label`, `texture` (import PNG).
3. `MESHES` se construye automáticamente (`[...BASE_MESHES,...REGION_MESHES]`). El orden debe coincidir con orden usado en `useTexture` (importar texturas en ese mismo orden lógico). 
4. Si cambian bounds del modelo: ajustar `WORLD.model` (`minX,maxX,minZ,maxZ`) y posiblemente `WORLD.minX/maxX/minZ/maxZ`, `fitMargin`.
5. Probar: nombres mal escritos → nodo filtrado (useMapNodes línea 61) → región invisible (silencioso). Mejor verificar nombres con inspección del GLB.

### C. Cambiar cámara/encuadre/controles

- Distancias/ángulo: `CAMERA` (pitch, startDistance, min/maxDistance, fov, near/far).
- Límites de target: `WORLD` (center, min/max XZ, groundY).
- Suavizado/gestos: `CONTROLS` (focusDamping, zoomDamping, dragThresholdPx, zoomStep, keyboardSpeed, maxDelta).
- Inicial encuadre: modificar `fitDistance` lógica o `WORLD.fitMargin`. Recuerda que solo aplica si `rig.touched==false`.

**Importante:** `place()` asume pitch fijo y mira plano Y=groundY. Cambiar pitch rompe proyección drag (GROUND plano Y constante) y cálculo de `fitDistance` (usa `sin(pitch)` para altura proyectada).

### D. Cambiar animaciones de regiones

Editar `ANIM`:
- Idle: `idleAmplitude`, `idleSpeed`, `phaseStep`
- Lift: `hoverLift`, `activeLift`  
- Resorte: `stiffness`, `damping` (ODE), `jumpImpulse`, `step` (subpaso fijo 1/120). No bajar `step` arbitrariamente (debe ser <= dt típico). `settleMs` controla retraso navegación post-rebote.
- Reduced motion ignora todo esto.

Integración manual en RegionMesh (no depende de R3F clock). Cambios aquí son locales a región.

### E. Cambiar materiales/texturas

`useMapMaterial`: crea material nuevo siempre. Parámetros en `TEXTURE` (flipY, roughness, metalness, anisotropy). Para toggles (wireframe, emissive, etc.) añadir props a BaseMesh/RegionMesh y pasar a hook. No reutilizar material GLB.

Sombras: `LIGHT.shadow` + `castShadow/receiveShadow`. Bias negativo para evitar acne. MapSize 1024 (ligero para móvil).

### F. UI/UX (MapScene overlay + HUD)

- Barra superior: `MapScene.css` (gradiente, safe-area, pointer-events split). Título trunca con ellipsis.
- Loading fallback: "Cargando mapa…" mientras lazy carga chunk InteractiveMap.
- Hint/notice: `InteractiveMap` gestiona `message` (notice > hover > hint). Cambiar textos `HINT_TOUCH`, `HINT_MOUSE`, `SOON_LABEL`.

### G. Integración App/PageFlip

- Página MAP es índice 2, `density="hard"` (evita clonar canvas y dejarlo blanco). Ver App.jsx:21. 
- Al seleccionar región: `onSelectRegion` → App.setRegion + `book.goTo(PAGE.CUENTO)` (delay 550ms en mapa para ver rebote).
- Al volver: `onBack` → vuelve a SELECT/MAP según escena.
- `frameloop` pausa cuando canvas no intersecta viewport (útil con PageFlip).

### H. Mar de fondo (shader cartoon)

`constants.js` → `WATER` es la palanca de todo: `size` (extensión del plano), `drop` (holgura bajo la base), `island` (semiejes de la elipse que hace de costa), `shore` (near/far del agua clara), `deep`/`shallow`/`foam` (colores), `bands` (cuántas franjas planas de oleaje), `foamStrength`, `sparkle` y `speed` (multiplicador del tiempo).

`waterShader.js` es GLSL plano, sin imports: si hay que cambiar el *look* (más oleaje, otro color, olas que siguen a la cámara) se toca ahí; si hay que cambiar el *tamaño o la velocidad*, se toca `WATER`. Reglas del shader:

- Todo se calcula con `vWorld = world.xz` (posición en el suelo), no con UV ni con `viewDir`: así el oleaje no se deforma con el zoom ni con la perspectiva.
- El aire cartoon sale de **cuantizar** (`floor(waves * uBands) / uBands`) y de umbrales con borde duro (`smoothstep`), no de degradados suaves. Subir `bands` lo vuelve más realista y menos cartoon.
- Los dos `#include` del final (`tonemapping_fragment`, `colorspace_fragment`) **no son opcionales**: sin ellos el agua no recibe el tone mapping (ACES por defecto en R3F) ni la conversión a sRGB, y se ve más oscura/opaca que el resto de la escena.
- `uTime` lo avanza `WaterBackground` sumando `delta` con clamp, nunca `state.clock` (mismo motivo que en RegionMesh: el reloj se reinicia al pausar el `frameloop`).
- El nivel del agua se deriva del `Box3` de las bases, no de una constante: si el slab del GLB cambia de grosor, el mar sigue quedando debajo sin tocar código.

### I. Estética toon (luz, bordes y nubes)

Tres palancas independientes, todas en `constants.js`:

**1. Luz toon — `TOON` (`bands`, `edgeSoftness`) + `TEXTURE.emissive`.**
`useMapMaterial` sigue creando un `MeshStandardMaterial` (no se cambió de material: se perderían sombras y el resto del pipeline estándar) y le añade dos cosas:
- `emissiveMap` = la misma textura que `map`, con `emissive` blanco y `emissiveIntensity` baja. Por encima de ~0.3 la sombra de los slabs se lava y el mapa deja de leerse como volumen.
- `material.onBeforeCompile = (shader) => patchToonLight(shader, TOON)`, que reemplaza `#include <lights_fragment_end>` (r186, línea ~192 de `meshphysical.glsl.js`) por un bloque que cuantiza `reflectedLight.directDiffuse`. Reglas del parche:
  - Se toca **solo** `directDiffuse` (luz directa, con la sombra ya aplicada). `indirectDiffuse` (ambiente) y la emisión entran después: cuantizarlas deja las caras planas y la sombra parece un agujero.
  - El cuantizado reescala el color por `paso / luma` en vez de mezclarlo con gris, así cada banda conserva el tono de la textura.
  - `bands` y `edgeSoftness` van como **literales** del template, no como uniforms: son constantes de módulo. Si algún día se animan hay que pasarlos a uniform y fijar `material.customProgramCacheKey()`, porque la clave de caché del programa es el código de `onBeforeCompile`.
  - `bands <= 1` no parchea nada (el material queda estándar).
  - El punto de parche es interno de three: si sube de versión, hay que volver a verificar que `#include <lights_fragment_end>` siga existiendo en `meshphysical`.

**2. Bordes por región — `OUTLINE` + `REGION_MESHES[].outline`.**
`regionOutline.js` (matemática pura) saca el contorno de la cara superior: `EdgesGeometry(geom, threshold)` entrega solo los quiebres de verdad (las aristas coplanares del interior de la cara tienen 0° y se descartan solas) y después se filtra por banda de altura (`band`, fracción del grosor del slab). Datos medidos del GLB que explican los valores por defecto: la cara de arriba es plana en el 100% del grosor, la costa cae en el 96.8% (de ahí `band: 0.15`), y con `threshold: 25` salen ~300-520 segmentos por región, casi ninguno paralelo a los ejes (o sea, costa suave, no escalera). Detalles que no se pueden tocar a la ligera:
- El GLB viene con vértices partidos (normales planas por cara), pero `EdgesGeometry` empareja por **posición hasheada**, no por índice: por eso no hace falta `mergeVertices` (que además rompería las normales del modelo).
- `RegionMesh` monta `<Line segments>` de drei **como hijo del `<primitive>`**, así la línea hereda la transformación del nodo y sube y baja con el resorte sin sincronizar nada. No usar `<Edges geometry={...}>`: recalcularía la geometría y descartaría el filtro.
- `depthTest={false}` + `renderOrder={20 + index}` a propósito: las regiones son contiguas, sus costes comparten la misma Y y con depth test los dos colores se pisarían (z-fighting). Con `renderOrder` el desempate es determinista y no hace falta `polygonOffset` ni levantar la línea.
- `raycast={() => null}` (función, **no** `null`): R3F recorre recursivamente los hijos del mesh con handlers, y sin esto la línea se sumaría al costo del puntero y hasta podría robarle el clic al slab. Poner `raycast={null}` revienta `Raycaster.intersectObject`.

**3. Nubes — `CLOUDS` + `Clouds.jsx` + `cloudShader.js`.**
`CLOUDS` es la palanca de todo: `count`, `height`, `size`, `aspect`, `area` (rectángulo de deriva), `speed`, `top`/`bottom`, `bands`, `opacity`, `seed`. No se usa el `<Cloud>` de drei porque su textura por defecto es un CDN. Reglas del componente/shader:
- La banda en Z arranca en `CLOUDS_EDGE = WORLD.model.minZ - 0.04`, o sea justo detrás del modelo: la nube más cercana nunca se monta sobre el mapa, y como además va por detrás, el depth buffer del modelo la tapa si algún frame se cruza. Material con `depthWrite: false` + `depthTest: true`.
- **Dónde se ven depende del zoom, y hay que saber la fórmula antes de tocar `height`/`area`**: con el pitch a 45° y fov 45, un punto de altura `y` a distancia horizontal `hd` de la cámara (con `H = distancia·sin45`) está en cuadro si `(H - y)*0.41 <= hd <= (H - y)*2.41`. El eje de vista entra al suelo a `hd = H`, así que lo que está más lejos del punto que mira la cámara sale en la parte alta de la pantalla. Medido con los valores actuales: en el encuadre de celular (`fitDistance` 12.7) entran las 5 nubes entre el 77% y el 98% de la altura de pantalla, con el borde lejano del mapa en el 70%; en uno de escritorio (5.9) el mapa llena el cuadro y solo se asoma una; en `minDistance` (4.5) no se ve ninguna. Si se cambia `CLOUDS.seed` hay que volver a contar cuántas entran.
- El pitch de la cámara es fijo (`CAMERA.pitch`), así que los quads se pre-rotan con `rotation-x = -CAMERA.pitch` y no hay billboarding por frame.
- La deriva se mueve **en el quad** (posición X con wrap por `mod` en `useFrame`), no dentro del shader: así dos nubes se cruzan de verdad en vez de deformarse juntas.
- Posiciones con `mulberry32(CLOUDS.seed)`, **nunca `Math.random`**: PageFlip desmonta el canvas al voltear la página y con random las nubes saltarían de sitio al volver al mapa.
- La silueta sale de una distancia con signo (tres lóbulos con base plana) mordida por un noise de valor de dos octavas; el recorte usa `fwidth` sobre la distancia, así el borde queda de un píxel a cualquier zoom sin blur ni alpha test binario. Los dos `#include` del final son obligatorios, igual que en el mar.

## 9. Notas de implementación (buenas prácticas para cambios)

- **Nunca mutar GLTF cacheado**: siempre clonar nodos (ya hecho). Si añades lógica que modifique `object` geometry/material fuera del cleanup, tener cuidado.
- **Integrador con subpasos fijos**: mantener `ANIM.step` constante y clamp `dt <= CONTROLS.maxDelta`. No reemplazar por Euler simple con dt variable grande.
- **Proyección drag**: depende de cámara actualizada (`camera.updateMatrixWorld()`) y plano GROUND fijo. Si cambias pitch/groundY, actualizar GROUND.
- **Pointer capture**: gestiona con `setPointerCapture/releasePointerCapture` + Set de pointers (evita teleports con segundo dedo).
- **Cleanup estricto**: timers (`navTimer`, `noticeTimer`), event listeners, IntersectionObserver, media queries, dispose material. Ya presente.
- **ShaderMaterial propio = tinta propia**: un `ShaderMaterial` no hereda ni luces ni tone mapping ni sRGB. Si se escribe un shader a mano hay que incluir `tonemapping_fragment` + `colorspace_fragment` y usar `THREE.Color` (que sí convierte de sRGB a lineal si `ColorManagement` está activo).
- **Reduced motion primero**: cualquier animación nueva debe respetar `reduced`.
- **Mobile-first CSS**: usar safe-area-inset, min-height 44px en touch targets (botón atrás), `touch-action:none` en canvas.

## 10. Puntos de partida para modificaciones comunes

| Cambio deseado | Archivos a tocar | Clave |
|---|---|---|
| Habilitar Amazonia/Pacífico | `constants.js` (cambiar `key: null` → key real), y/o `src/db/index.js` `REGIONS` | Verificar claves en datos de cuentos (`frases[].content`). |
| Cambiar texto "Próximamente" | `constants.js` → `SOON_LABEL` | También afecta hoverInfo. |
| Ajustar velocidad/altura rebote | `constants.js` → `ANIM` (`stiffness`, `damping`, `jumpImpulse`, `settleMs`) | Probar con reduced motion off/on. |
| Cambiar límites de zoom/movimiento | `constants.js` → `CAMERA`/`WORLD` | Afecta encuadre inicial + UX. |
| Añadir nueva región | GLB + PNGs + `constants.js` (`REGION_MESHES` + añadir texture a imports) | Nombre nodo debe coincidir exactamente. |
| Cambiar posición inicial/centro | `WORLD.center`, `CAMERA.startDistance` | `fitDistance` puede sobrescribir distancia inicial si no tocado. |
| Cambiar el look del mar (color, franjas, espuma, velocidad) | `constants.js` → `WATER`, y `waterShader.js` para el dibujo | `bands` alto = menos cartoon; `drop` sube el agua (o la aleja del slab). |
| Cambiar el color del borde de una región | `constants.js` → `REGION_MESHES[].outline` | Un tono saturado del color del mapa: se lee como tinta política. |
| Cambiar el look de la luz toon | `constants.js` → `TOON.bands` / `TOON.edgeSoftness` y `TEXTURE.emissive.intensity` | `bands <= 1` desactiva el parche; `emissiveIntensity` alto lava la sombra. |
| Cambiar el borde (grosor, filtro, opacidad) | `constants.js` → `OUTLINE`, `regionOutline.js` para el filtro | `threshold` sube = menos aristas; `band` sube = entra el bisel del slab. |
| Cambiar el número/tamaño/deriva de las nubes | `constants.js` → `CLOUDS` (+ `CLOUDS_EDGE`/`CLOUDS_DEPTH`), y `cloudShader.js` para la silueta | Pocas a propósito: `CLOUDS_EDGE` las mantiene detrás de la isla. Mover `height` cambia cuántas entran en cuadro (ver la fórmula de la sección I). |

**Conclusión:** El mapa es un sistema acoplado (GLB + constantes + rig + springs + shader de mar + shader de nubes + parche toon del material + bordes de región + lazy-load + PageFlip). Para aplicar cambios, modifica **constantes primero** (datos/config), luego ajusta **lógica específica** (hooks/framing/shaders) solo si cambian matemáticas. Siempre respeta: clonado de nodos GLTF, integrador con subpasos, proyección sobre plano fijo, `frameloop` por visibilidad y reduced motion.