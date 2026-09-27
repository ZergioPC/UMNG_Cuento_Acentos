import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Mismo criterio que PageFlipBook: el soporte de reduced-motion se resuelve
// acá y no con un @media en el CSS, porque la animación corre en el loop de
// R3F y no en transiciones de CSS.
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
