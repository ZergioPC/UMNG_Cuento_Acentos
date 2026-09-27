import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import { useMapMaterial } from "./useMapMaterial";
import { useReducedMotion } from "./useReducedMotion";
import { ANIM, CONTROLS } from "./constants";

// Una región del mapa. Es un slab extruido en el GLB: se lo anima en Y
// sumando una oscilación de reposo y un resorte que responde al hover y al
// clic. El estado del resorte se integra a mano en el frame, así que React
// solo re-renderiza cuando cambia el hover.
//
// props:
//   object    Mesh del GLB (el nodo se llama igual que la región)
//   texture   diffuse de la región
//   label     nombre para el HUD
//   regionKey clave dentro de cuento.frases[].content, o null si aún no hay
//             frases para esta región
//   index     posición en REGION_MESHES, desfasa la oscilación
//   isActive  la región ya elegida en este cuento
//   rig       estado de useFlightCamera, para no tomar un arrastre por clic
//   onSelect  (regionKey, label) al picar, con el rebote ya lanzado
//   onHover   ({ label, disabled }) al entrar el puntero, null al salir
function RegionMesh({
  object,
  texture,
  label,
  regionKey,
  index,
  isActive,
  rig,
  onSelect,
  onHover,
}) {
  const reduced = useReducedMotion();
  const gl = useThree((state) => state.gl);
  const [hovered, setHovered] = useState(false);

  // lift es el aporte extra del resorte; la oscilación se suma aparte para no
  // ensuciar el estado del resorte. Se integra a mano en el frame, así que no
  // necesita ser estado de React.
  const spring = useMemo(
    () => ({
      lift: 0,
      velocity: 0,
      pending: 0,
      time: 0,
      restY: object.position.y,
    }),
    [object]
  );

  useMapMaterial(object, texture);

  // El cursor lo maneja solo la región habilitada: las que no tienen frases
  // igual se resaltan al hover, pero no invitan a clic.
  useEffect(() => {
    if (regionKey === null) return;

    gl.domElement.style.cursor = hovered ? "pointer" : "default";

    return () => {
      gl.domElement.style.cursor = "default";
    };
  }, [gl, hovered, regionKey]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, CONTROLS.maxDelta);
    const target = isActive
      ? ANIM.activeLift
      : hovered
        ? ANIM.hoverLift
        : 0;

    if (reduced) {
      // Sin resorte: el hover cambia la altura de golpe y no oscila.
      spring.lift = target;
      spring.velocity = 0;
    } else {
      // Integración con sub-paso fijo: con el dt de un frame perdido el
      // integrador explícito diverge y la región sale despedida.
      spring.pending += dt;
      while (spring.pending >= ANIM.step) {
        spring.velocity +=
          (-ANIM.stiffness * (spring.lift - target) -
            ANIM.damping * spring.velocity) *
          ANIM.step;
        spring.lift += spring.velocity * ANIM.step;
        spring.pending -= ANIM.step;
      }
      // El tiempo se acumula acá y no se lee de state.clock: al cambiar
      // `frameloop` R3F reinicia el reloj, y las cinco regiones darían un
      // salto de fase al volver a la página del mapa.
      spring.time += dt;
    }

    const idle = reduced
      ? 0
      : Math.sin(spring.time * ANIM.idleSpeed + index * ANIM.phaseStep) *
        ANIM.idleAmplitude;

    object.position.y = spring.restY + idle + spring.lift;
  });

  function jump() {
    if (reduced) return;
    spring.velocity += ANIM.jumpImpulse;
  }

  function handlePointerOver(event) {
    // En touch no hay hover: el dedo está siempre encima.
    if (event.pointerType !== "mouse") return;
    setHovered(true);
    onHover?.({ label, disabled: regionKey === null });
  }

  function handleClick(event) {
    // R3F entrega el clic aunque haya habido arrastre, así que el umbral se
    // chequea acá además del estado del rig.
    if (event.delta > CONTROLS.dragThresholdPx) return;
    if (rig !== undefined && (rig.dragging || rig.moved)) return;

    jump();
    onSelect(regionKey, label);
  }

  function handlePointerOut() {
    setHovered(false);
    onHover?.(null);
  }

  return (
    <primitive
      object={object}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

export { RegionMesh };
