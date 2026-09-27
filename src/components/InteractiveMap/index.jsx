import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";

import { BaseMesh } from "./BaseMesh";
import { RegionMesh } from "./RegionMesh";
import { useFlightCamera } from "./useFlightCamera";
import { useReducedMotion } from "./useReducedMotion";
import {
  ANIM,
  BASE_MESHES,
  CAMERA,
  LIGHT,
  MAPA_URL,
  MESHES,
  REGION_MESHES,
  SOON_LABEL,
  WORLD,
} from "./constants";

import "./InteractiveMap.css";

const HINT_TOUCH = "Arrastra para mover · dos dedos para acercar";
const HINT_MOUSE = "Arrastra para mover · rueda para acercar · flechas o WASD";
const NOTICE_MS = 2600;

// Posición inicial coherente con el rig. useFlightCamera la sobrescribe en un
// layout effect, pero sin esto el primer frame saldría con la cámara por
// defecto de R3F.
const START_POSITION = [
  WORLD.center.x,
  WORLD.groundY + CAMERA.startDistance * Math.sin(CAMERA.pitch),
  WORLD.center.z + CAMERA.startDistance * Math.cos(CAMERA.pitch),
];

// Relee el GLB y reparte las 7 texturas por nombre. Los nodos se clonan:
// useGLTF cachea la escena, así que animar el nodo original dejaría el modelo
// chueco para el siguiente montaje.
function useMapNodes() {
  const { scene } = useGLTF(MAPA_URL);
  const textures = useTexture(MESHES.map((mesh) => mesh.texture));

  const byName = useMemo(() => {
    const map = new Map();
    MESHES.forEach((mesh, index) => map.set(mesh.name, textures[index]));
    return map;
  }, [textures]);

  return useMemo(() => {
    const pick = (list) =>
      list
        .map((mesh) => ({
          name: mesh.name,
          label: mesh.label ?? mesh.name,
          key: mesh.key ?? null,
          texture: byName.get(mesh.name),
          object: scene.getObjectByName(mesh.name)?.clone() ?? null,
        }))
        // Un nombre mal escrito dejaría una región invisible pero contada
        // para el desfase; mejor descartarla.
        .filter((node) => node.object !== null);

    return { bases: pick(BASE_MESHES), regions: pick(REGION_MESHES) };
  }, [byName, scene]);
}

function MapContents({ regions, activeRegion, onSelect, onHover }) {
  const { bases, regions: regionNodes } = useMapNodes();
  const rig = useFlightCamera();

  return (
    <>
      <ambientLight intensity={LIGHT.ambientIntensity} />
      <directionalLight
        castShadow
        position={LIGHT.position}
        intensity={LIGHT.intensity}
        shadow-mapSize-width={LIGHT.shadow.mapSize}
        shadow-mapSize-height={LIGHT.shadow.mapSize}
        shadow-camera-left={LIGHT.shadow.left}
        shadow-camera-right={LIGHT.shadow.right}
        shadow-camera-top={LIGHT.shadow.top}
        shadow-camera-bottom={LIGHT.shadow.bottom}
        shadow-camera-near={LIGHT.shadow.near}
        shadow-camera-far={LIGHT.shadow.far}
        shadow-bias={LIGHT.shadow.bias}
      />

      {bases.map((node) => (
        <BaseMesh key={node.name} object={node.object} texture={node.texture} />
      ))}

      {regionNodes.map((node, index) => (
        <RegionMesh
          key={node.name}
          object={node.object}
          texture={node.texture}
          label={node.label}
          // null = se dibuja y se resalta, pero el clic no navega: o no hay
          // frases para la región o el cuento no la trae en `regions`.
          regionKey={regions.includes(node.key) ? node.key : null}
          index={index}
          // El node.key null también hace de "nada elegido": sin esta guarda
          // Amazonia salía en alto como activa con region === null.
          isActive={node.key !== null && activeRegion === node.key}
          rig={rig}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </>
  );
}

function InteractiveMap({ regions, activeRegion, onSelectRegion }) {
  const reduced = useReducedMotion();
  const hostRef = useRef(null);
  const navTimer = useRef(0);
  const noticeTimer = useRef(0);
  const [hover, setHover] = useState(null);
  const [notice, setNotice] = useState(null);
  const [visible, setVisible] = useState(true);
  const [coarse, setCoarse] = useState(false);

  // PageFlip deja la página vieja fuera del layout, pero el <canvas> sigue
  // montado y su loop seguiría gastando GPU. Con frameloop="never" R3F salta
  // el update() de la raíz; el rAF global nunca se detiene, así que volver a
  // "always" reanuda en el frame siguiente.
  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = (event) => setCoarse(event.matches);

    sync(media);
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(navTimer.current);
      window.clearTimeout(noticeTimer.current);
    },
    []
  );

  // El rebote ya lo lanzó RegionMesh; la navegación espera a que se asiente
  // para que el salto se vea antes de que la página se voltee.
  function handleSelect(regionKey, label) {
    if (regionKey === null) {
      window.clearTimeout(noticeTimer.current);
      setNotice(`${label} · ${SOON_LABEL}`);
      noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
      return;
    }

    window.clearTimeout(navTimer.current);
    navTimer.current = window.setTimeout(
      () => onSelectRegion(regionKey),
      reduced ? 0 : ANIM.settleMs
    );
  }

  function handleHover(next) {
    setHover(next);
    if (next === null) return;
    window.clearTimeout(noticeTimer.current);
    setNotice(null);
  }

  const message = notice ?? hoverInfo(hover) ?? (coarse ? HINT_TOUCH : HINT_MOUSE);

  return (
    <div ref={hostRef} className="imap">
      <Canvas
        className="imap__canvas"
        shadows
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{
          fov: CAMERA.fov,
          near: CAMERA.near,
          far: CAMERA.far,
          position: START_POSITION,
        }}
        gl={{ antialias: true }}
      >
        <MapContents
          regions={regions}
          activeRegion={activeRegion}
          onSelect={handleSelect}
          onHover={handleHover}
        />
      </Canvas>

      <p className="imap__bubble" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

function hoverInfo(hover) {
  if (hover === null) return null;
  return hover.disabled ? `${hover.label} · ${SOON_LABEL}` : hover.label;
}

export { InteractiveMap };
