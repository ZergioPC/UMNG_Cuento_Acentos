// Parche toon para MeshStandardMaterial. Vive aparte del hook para que el GLSL
// se pueda leer (y tocar) sin el ruido de R3F.
//
// La idea es no cambiar de material (MeshToonMaterial perdería sombras,
// niebla y el resto del pipeline estándar) sino cuantizar la luz justo antes
// de que se sume al difuso final: `directDiffuse` viene de los focos
// directos, con la sombra ya aplicada, así que las zonas en penumbra caen en
// la banda más baja y el volumen del slab se sigue leyendo. La luz ambiente y
// la emisión entran después (indirectDiffuse) y no se tocan: quantizarlas
// dejaría las caras planas y la sombra se vería como un agujero.
//
// El cuantizado reescala el color por el factor de paso en vez de mezclarlo
// con gris, así que cada banda conserva el tono de la textura y no se lava.

const LIGHT_HOOK = "#include <lights_fragment_end>";

// bands y edgeSoftness entran como literales del template, no como uniforms:
// son constantes de módulo (TOON) y no cambian en runtime, así que no hace
// falta plumbing ni plumbing de uniforms. Si algún día se animan, hay que
// pasarlas a uniform y fijar material.customProgramCacheKey, porque la clave
// de caché del programa es el código de onBeforeCompile.
function patchToonLight(shader, toon) {
  const bands = toon?.bands ?? 1;
  if (!(bands > 1)) return;

  const softness = toon.edgeSoftness ?? 0.5;

  shader.fragmentShader = shader.fragmentShader.replace(
    LIGHT_HOOK,
    `${LIGHT_HOOK}

    {
      // Brillo de la luz directa: el canal más alto alcanza la banda de luz
      // sin pasar por el tono de la textura, así que la division de abajo es
      // estable.
      float toonLuma = max(
        reflectedLight.directDiffuse.r,
        max(reflectedLight.directDiffuse.g, reflectedLight.directDiffuse.b)
      );

      if (toonLuma > 1e-4) {
        float toonCell = toonLuma * ${bands.toFixed(4)};
        float toonEdge = clamp(
          fwidth(toonCell) * 0.5 * ${softness.toFixed(4)},
          0.0,
          0.5
        );
        // Escalón con el borde suavizado justo un píxel: sin esto las bandas
        // se ven quebradas al mover la cámara.
        float toonStep = (
          floor(toonCell) + smoothstep(0.5 - toonEdge, 0.5 + toonEdge, fract(toonCell))
        ) / ${bands.toFixed(4)};

        reflectedLight.directDiffuse *= toonStep / toonLuma;
      }
    }`
  );
}

export { patchToonLight };
