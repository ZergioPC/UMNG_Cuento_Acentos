import { useEffect } from "react";
import { REGION_LABELS } from "../../db";
import {
  playFrase,
  playSequence,
  resolveClip,
  stop,
  useAudioState,
} from "../audio";
import { BtnAnim } from "../../components/BtnAnim";
import { AudioButton } from "../../components/AudioButton";
import "./CuentoReader.css";

function CuentoReader({ cuento, region }) {
  const { current, playing } = useAudioState();

  useEffect(() => () => stop(), []);

  // Las frases finales de algunos cuentos solo existen en una región. Sin este
  // filtro se renderizaría un <p> vacío y el índice de audio no coincidiría.
  const frases = cuento.frases.filter((frase) => Boolean(frase.content[region]));
  const hasAudio = frases.some((frase) =>
    Boolean(resolveClip(cuento, frase.id, region))
  );

  return (
    <article className="cuento-reader">
      <h2 className="text-center mb-4">{cuento.title}</h2>

      <div className="cuento-reader__actions">
        <BtnAnim
          padding={10}
          borderRadius={10}
          disabled={!hasAudio}
          onClick={() => playSequence(cuento, region)}
        >
          ▶ Escuchar
        </BtnAnim>
        {playing && (
          <BtnAnim
            color="#e74c3c"
            padding={10}
            borderRadius={10}
            onClick={stop}
          >
            ⏹ Detener
          </BtnAnim>
        )}
      </div>

      <ul className="cuento-reader__list list-unstyled m-0">
        {frases.map((frase) => {
          const hasClip = Boolean(resolveClip(cuento, frase.id, region));
          const isActive =
            current?.fraseId === frase.id && current?.region === region;

          return (
            <li
              key={frase.id}
              className={`cuento-reader__frase${
                isActive ? " cuento-reader__frase--active" : ""
              }`}
            >
              {hasClip && (
                <AudioButton
                  active={isActive && playing}
                  label={`la frase ${frase.id + 1} en ${REGION_LABELS[region]}`}
                  onClick={() => playFrase(cuento, frase, region)}
                />
              )}
              <p className="cuento-reader__text">{frase.content[region]}</p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export { CuentoReader };
