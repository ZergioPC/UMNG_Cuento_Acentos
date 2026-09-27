import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useReducedMotion } from "./useReducedMotion";
import { CLOUDS, CAMERA, CONTROLS, WORLD } from "./constants";
import { cloudFragmentShader, cloudVertexShader } from "./cloudShader";

// PRNG sembrado (mulberry32). Las posiciones se sacan de acá y no de
// Math.random porque PageFlip desmonta el canvas al voltear la página: con
// random las nubes saltarían de sitio cada vez que se vuelve al mapa.
function mulberry32(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Nubes de fondo: pocos quads con el shader cartoon de cloudShader.js, parados
// de cara a la cámara y arrastrándose en X por detrás de la isla. No hay cielo
// ni horizonte, así que son un detalle de horizonte y no una capa que tape el
// cuento: por eso van en la banda detrás de la costa y no sobre el mapa.
//
// props: ninguno. Lee CLOUDS y el reduced-motion directo, como el resto de la
// escena.
function Clouds() {
  const reduced = useReducedMotion();
  const time = useRef(0);
  const meshes = useRef([]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const materials = useMemo(
    () =>
      Array.from({ length: CLOUDS.count }, (_, index) =>
        new THREE.ShaderMaterial({
          vertexShader: cloudVertexShader,
          fragmentShader: cloudFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uBands: { value: CLOUDS.bands },
            // Cada nube con su propio desfase: si comparten semilla, todas se
            // deformarían al mismo tiempo y se leería una repetida.
            uSeed: { value: new THREE.Vector2(index * 3.7, index * 1.9) },
            uOpacity: { value: CLOUDS.opacity },
            uTop: { value: new THREE.Color(CLOUDS.top) },
            uBottom: { value: new THREE.Color(CLOUDS.bottom) },
          },
          // La nube no escribe en el depth buffer (así se mezclan entre sí)
          // pero sí se somete al del mapa, que es lo que la hace pasar por
          // detrás de la isla.
          transparent: true,
          depthWrite: false,
        })
      ),
    []
  );

  // La posición de cada nube sale del PRNG una sola vez, en el montaje.
  const layout = useMemo(() => {
    const random = mulberry32(CLOUDS.seed);
    const { min, max } = CLOUDS.size;
    const speed = CLOUDS.speed;

    return materials.map(() => ({
      x: (random() - 0.5) * CLOUDS.area.x,
      z: CLOUDS.area.centerZ + (random() - 0.5) * CLOUDS.area.z,
      y: THREE.MathUtils.lerp(CLOUDS.height.min, CLOUDS.height.max, random()),
      scale: THREE.MathUtils.lerp(min, max, random()),
      speed: THREE.MathUtils.lerp(speed.min, speed.max, random()),
    }));
  }, [materials]);

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    },
    [geometry, materials]
  );

  useFrame((_, delta) => {
    // Con reduced-motion las nubes se dibujan quietas: el tiempo no avanza y
    // el shader sigue pintando las mismas siluetas.
    if (reduced) return;

    // El tiempo se acumula acá y no se lee de state.clock, igual que el mar:
    // al cambiar `frameloop` R3F reinicia el reloj y las nubes darían un salto
    // de fase al volver a la página del mapa.
    const dt = Math.min(delta, CONTROLS.maxDelta);
    time.current += dt;

    const span = CLOUDS.area.x;
    const half = span / 2;

    // El tiempo del shader no depende del mesh, así que se sube a todos antes
    // de mover: si un ref todavía no está listo, la nube no se teletransporta
    // de todas formas.
    materials.forEach((material) => {
      material.uniforms.uTime.value = time.current;
    });

    layout.forEach((cloud, index) => {
      const mesh = meshes.current[index];
      if (mesh === null || mesh === undefined) return;

      // Wrap en X: la nube reaparece por el otro borde del rectángulo, así
      // que nunca se va del encuadre ni hay que teletransportarla.
      const drift = cloud.x + time.current * cloud.speed;
      mesh.position.x =
        WORLD.center.x + ((((drift + half) % span) + span) % span) - half;
    });
  });

  return (
    <>
      {layout.map((cloud, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          geometry={geometry}
          material={materials[index]}
          // Los quads se pre-rotan para quedar de cara a la cámara: el pitch es
          // fijo (CAMERA.pitch), así que no hace falta billboarding por frame.
          rotation={[-CAMERA.pitch, 0, 0]}
          position={[WORLD.center.x + cloud.x, cloud.y, cloud.z]}
          scale={[cloud.scale, cloud.scale / CLOUDS.aspect, 1]}
        />
      ))}
    </>
  );
}

export { Clouds };
