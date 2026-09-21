import { useEffect } from "react";
import { playSequence, stop, useAudioState } from "../audio";

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
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            playSequence(
              cuento.folder,
              region,
              cuento.frases.map((frase) => frase.id)
            )
          }
        >
          ▶ Escuchar
        </button>
        {playing && (
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={stop}
          >
            ⏹ Detener
          </button>
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