import { useState } from "react";
import { REGIONS, REGION_LABELS } from "../../db";
import { BtnAnim } from "../../components/BtnAnim";
import { BtnToggle } from "../../components/BtnToggle";
import { FraseComponent } from "./FraseComponent";
import { REGION_ICONS, REGION_PALETTES, VIEW_ORDER } from "./constants";
import { playClip, resolveClip, stop, useAudioState } from "../audio";
import "./RegionToggles.css";

function CuentoComparer({ cuento }) {
  const [visible, setVisible] = useState(
    Object.fromEntries(REGIONS.map((region) => [region, true]))
  );
  const { url } = useAudioState();

  function toggleRegion(region) {
    setVisible((prev) => ({ ...prev, [region]: !prev[region] }));
  }

  return (
    <article
      className="w-100 mx-auto p-4 rounded-4 bg-white bg-opacity-10"
      style={{ maxWidth: 720 }}
    >
      <h2 className="text-center mb-4">{cuento.title}</h2>

      <div className="region-toggles">
        {REGIONS.map((region) => {
          const palette = REGION_PALETTES[region];
          const Icon = REGION_ICONS[region] ?? null;

          return (
            <div key={region} className="region-toggle">
              <BtnToggle
                active={visible[region]}
                onChange={() => toggleRegion(region)}
                color={palette.border}
                size={64}
                shadowSize={6}
                borderRadius={18}
                square
                className="region-toggle__btn"
                aria-label={`${
                  visible[region] ? "Ocultar" : "Mostrar"
                } frases de la región ${REGION_LABELS[region]}`}
              >
                {Icon && <Icon color="#ffffff" />}
              </BtnToggle>
            </div>
          );
        })}
      </div>

      <div className="d-flex flex-column gap-3">
        {cuento.frases.map((frase) => (
          <div key={frase.id}>
            {VIEW_ORDER.map(
              (region) =>
                visible[region] && (
                  <FraseComponent
                    key={region}
                    region={region}
                    frase={frase.content[region]}
                    audioUrl={resolveClip(cuento.folder, frase.id, region)}
                    isActive={url === resolveClip(cuento.folder, frase.id, region)}
                    onPlay={(audioUrl) => playClip(audioUrl)}
                  />
                )
            )}
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-4">
        <BtnAnim
          color="#e94b4b"
          size="sm"
          shadowSize={5}
          borderRadius={16}
          onClick={stop}
          padding={10}
        >
          Detener audio
        </BtnAnim>
      </div>
    </article>
  );
}

export { CuentoComparer };