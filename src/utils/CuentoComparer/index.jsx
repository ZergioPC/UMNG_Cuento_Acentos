import { useState } from "react";
import { REGIONS, REGION_LABELS } from "../../db";
import { BtnAnim } from "../../components/BtnAnim";
import { BtnToggle } from "../../components/BtnToggle";
import { FraseComponent } from "./FraseComponent";
import { REGION_ICONS, REGION_PALETTES, VIEW_ORDER } from "./constants";
import { playFrase, resolveClip, stop, useAudioState } from "../audio";
import "./RegionToggles.css";
import "./CuentoComparer.css";

function CuentoComparer({ cuento }) {
  const [visible, setVisible] = useState(
    Object.fromEntries(REGIONS.map((region) => [region, true]))
  );
  const { current, playing } = useAudioState();

  function toggleRegion(region) {
    setVisible((prev) => ({ ...prev, [region]: !prev[region] }));
  }

  return (
    <article className="cuento-comparer">
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
        {cuento.frases.map((frase) => {
          const variants = VIEW_ORDER.filter(
            (region) => visible[region] && Boolean(frase.content[region])
          );

          if (variants.length === 0) return null;

          return (
            <div key={frase.id}>
              {variants.map((region) => {
                const isActive =
                  current?.fraseId === frase.id && current?.region === region;

                return (
                  <FraseComponent
                    key={region}
                    region={region}
                    frase={frase.content[region]}
                    label={`la frase ${frase.id + 1} en ${REGION_LABELS[region]}`}
                    audioUrl={resolveClip(cuento, frase.id, region)}
                    isActive={isActive && playing}
                    onPlay={() => playFrase(cuento, frase, region)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {playing && (
        <div className="cuento-comparer__actions">
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
      )}
    </article>
  );
}

export { CuentoComparer };
