import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { TEXTURE } from "./constants";

// El GLB no trae texturas (0 imágenes en el glTF.json) y sí trae un material
// por malla, con emissiveFactor igual al baseColorFactor: reutilizarlo
// sumaría luz sobre la textura y la lavaría. Por eso cada malla recibe un
// MeshStandardMaterial nuevo, con su PNG.
//
// El material es un MeshStandardMaterial normal, sin parche de shader: la
// región se ve con la luz difusa de la escena y la misma textura como
// emissiveMap a intensidad 1 (TEXTURE.emissive), que es lo que la hace leerse
// como tinta plana en vez de foto. No hay cuantizado de luz.
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

    object.material = material;
    object.castShadow = cast;
    object.receiveShadow = receive;

    // Solo se destruye el material que se creó acá: el del GLB está
    // cacheado por useGLTF y lo comparten los demás montajes.
    return () => material.dispose();
  }, [cast, gl, object, receive, texture]);
}

export { useMapMaterial };
