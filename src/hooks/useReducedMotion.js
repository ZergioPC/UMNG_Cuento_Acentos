import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// El soporte de reduced-motion se resuelve acá y no con un @media en el CSS:
// las escenas pueden animar con transiciones CSS o con el loop de R3F, y el
// hook sirve para las dos sin duplicar la consulta.
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const sync = (event) => setReduced(event.matches);

    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export { useReducedMotion };
