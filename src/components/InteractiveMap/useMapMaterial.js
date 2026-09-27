import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { TEXTURE } from "./constants";

// El GLB no trae texturas (0 imágenes en el glTF.json) y sí trae un material
// por malla, con emissiveFactor igual al baseColorFactor: reutilizarlo
// sumaría luz sobre la textura y la lavaría. Por eso cada malla recibe un
// MeshStandardMaterial nuevo, con su PNG.
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
