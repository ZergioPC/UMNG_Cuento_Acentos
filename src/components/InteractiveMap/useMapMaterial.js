import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { patchToonLight } from "./toonLight";
import { TEXTURE, TOON } from "./constants";

// El GLB no trae texturas (0 imágenes en el glTF.json) y sí trae un material
// por malla, con emissiveFactor igual al baseColorFactor: reutilizarlo
// sumaría luz sobre la textura y la lavaría. Por eso cada malla recibe un
// MeshStandardMaterial nuevo, con su PNG.
//
// Sobre ese material se hace el toon de dos maneras baratas y reversibles
// desde constantes:
//   - la misma textura también como emissiveMap, a intensidad baja, para que
//     el mapa se lea como tinta iluminada por dentro;
//   - onBeforeCompile cuantiza la luz directa en bandas planas (toonLight.js).
function useMapMaterial(object, texture, { cast = true, receive = true } = {}) {
  const gl = useThree((state) => state.gl);

  useLayoutEffect(() => {
    if (object === null || texture === undefined) return;

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = TEXTURE.flipY;
    texture.anisotropy = Math.min(
      TEXTURE.anisotropy,
      gl.capabilities.getMaxAnisotropy()
    );

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: TEXTURE.roughness,
      metalness: TEXTURE.metalness,
      // emissiveMap comparte la misma instancia que map: los dos leen el
      // canal 0 de UV, así que no hace falta clonar la textura ni disponer
      // nada extra (el PNG es cacheado por useTexture).
      emissive: new THREE.Color(TEXTURE.emissive.color),
      emissiveMap: texture,
      emissiveIntensity: TEXTURE.emissive.intensity,
    });

    // El material sigue siendo un MeshStandardMaterial: lo que cambia es que
    // la luz directa entra cuantizada. Se compila una sola vez por tipo de
    // material porque el parche es el mismo para todas las mallas.
    material.onBeforeCompile = (shader) => patchToonLight(shader, TOON);

    object.material = material;
    object.castShadow = cast;
    object.receiveShadow = receive;

    // Solo se destruye el material que se creó acá: el del GLB está
    // cacheado por useGLTF y lo comparten los demás montajes.
    return () => material.dispose();
  }, [cast, gl, object, receive, texture]);
}

export { useMapMaterial };
