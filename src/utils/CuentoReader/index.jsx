import { useEffect } from "react";
import { playSequence, stop, useAudioState } from "../audio";
import { BtnAnim } from "../../components/BtnAnim";

function CuentoReader({ cuento, region }) {
  const { playing } = useAudioState();

  useEffect(() => () => stop(), []);

  return (
    <article
      className="w-100 p-4 rounded-4 bg-white bg-opacity-10"
      style={{ maxWidth: 720 }}
    >
      <h2 className="text-center mb-4">{cuento.title}</h2>

      <div className="d-flex justify-content-center gap-3 mb-4">
        <BtnAnim
          padding={10}
          borderRadius={10}
          onClick={() =>
            playSequence(
              cuento.folder,
              region,
              cuento.frases.map((frase) => frase.id)
            )
          }
        >
          ▶ Escuchar
        </BtnAnim>
        {playing && (
          <BtnAnim color="#e74c3c" onClick={stop}>
            ⏹ Detener
          </BtnAnim>
        )}
      </div>

      <ul className="list-unstyled d-flex flex-column gap-3 m-0">
        {cuento.frases.map((frase) => (
          <li key={frase.id}>
            <p className="lh-base m-0">{frase.content[region]}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export { CuentoReader };