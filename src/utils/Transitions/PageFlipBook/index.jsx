import { Children, useEffect, useImperativeHandle, useRef } from "react";
import { PageFlip } from "page-flip/dist/js/page-flip.module.js";

import "./PageFlipBook.css";

const WIDTH_TOLERANCE = 2;
const FLIP_TIMEOUT = 1000;

function buildSettings(width, height) {
  return {
    // width/height son obligatorios y > 0: en "stretch" definen la proporción
    // de la página, que la librería luego ajusta al contenedor.
    width: Math.max(width, 1),
    height: Math.max(height, 1),
    size: "stretch",
    // portrait mientras blockWidth < minWidth * 2; el host se acota a 520px
    minWidth: 300,
    maxWidth: 520,
    autoSize: true,
    usePortrait: true,
    showCover: false,
    // sin handlers de touch/mouse: el scroll interno y la selección de texto
    // del cuento siguen funcionando y el flip solo ocurre por código
    useMouseEvents: false,
    // disableFlipByClick debe quedar en false: Flip.flip() lo consulta y con
    // true aborta los flips programáticos, porque los puntos sintéticos de
    // flipPrev caen en el medio del spread y no en una esquina.
    disableFlipByClick: false,
    showPageCorners: false,
    mobileScrollSupport: false,
    drawShadow: true,
    maxShadowOpacity: 0.35,
    flippingTime: 600,
    startZIndex: 1,
  };
}

function PageFlipBook({ ref, children, startPage = 0, onPageChange }) {
  const hostRef = useRef(null);
  const flipRef = useRef(null);
  const pagesRef = useRef(null);
  const busyRef = useRef(false);
  const watchdogRef = useRef(null);
  const fromRef = useRef(startPage);
  const reducedRef = useRef(false);
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  });

  useEffect(() => {
    // page-flip anima con requestAnimationFrame, no con CSS: el soporte de
    // reduced-motion se resuelve acá y no con un @media en el CSS.
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (event) => {
      reducedRef.current = event.matches;
    };

    sync(media);
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    let width = host.clientWidth;

    function init(index) {
      if (pagesRef.current === null) {
        pagesRef.current = Array.from(
          host.querySelectorAll(":scope > .book-page")
        );
      } else {
        // tras un destroy() las páginas quedan colgando del .stf__block huérfano
        for (const page of pagesRef.current) host.appendChild(page);
      }

      // page-flip es dueño de `block`: React nunca lo renderiza, por eso
      // destroy() puede removerlo sin romper el unmount de React.
      const block = document.createElement("div");
      host.appendChild(block);

      const flip = new PageFlip(block, buildSettings(width, host.clientHeight));

      // 'flip' se dispara al final de la animación y también en turnToPage()
      flip.on("flip", (event) => {
        window.clearTimeout(watchdogRef.current);
        busyRef.current = false;
        if (event.data === fromRef.current) return;
        onPageChangeRef.current?.(event.data, fromRef.current);
      });

      flip.loadFromHTML(pagesRef.current);
      flipRef.current = flip;

      if (index > 0) flip.turnToPage(index);
    }

    function destroy() {
      if (flipRef.current === null) return;
      flipRef.current.destroy();
      flipRef.current = null;
    }

    function handleResize() {
      const next = host.clientWidth;

      // el alto oscila con la barra de URL del móvil: solo importa el ancho
      if (Math.abs(next - width) <= WIDTH_TOLERANCE || busyRef.current) return;

      const index = flipRef.current?.getCurrentPageIndex() ?? startPage;

      width = next;
      destroy();
      init(index);
    }

    init(startPage);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(watchdogRef.current);
      destroy();
    };
  }, [startPage]);

  useImperativeHandle(
    ref,
    () => ({
      goTo(index) {
        const flip = flipRef.current;
        if (flip === null || busyRef.current) return;

        const current = flip.getCurrentPageIndex();
        if (index === current || index < 0 || index >= flip.getPageCount()) return;

        fromRef.current = current;

        if (reducedRef.current) {
          flip.turnToPage(index);
          return;
        }

        busyRef.current = true;
        flip.flip(index);

        // si la animación no llega a dispararse, el evento 'flip' nunca
        // llega: sin esto la navegación quedaría bloqueada para siempre
        window.clearTimeout(watchdogRef.current);
        watchdogRef.current = window.setTimeout(() => {
          busyRef.current = false;
        }, FLIP_TIMEOUT);
      },
      resetScroll(index) {
        const page = pagesRef.current?.[index];
        if (page === undefined) return;

        page.scrollTop = 0;
        for (const node of page.querySelectorAll("*")) node.scrollTop = 0;
      },
    }),
    []
  );

  return (
    <div ref={hostRef} className="pageflip-book">
      {Children.map(children, (child, index) => (
        // data-density define la animación: "soft" dobla la página con un
        // clip-path poligonal (tipo curled), "hard" la rota plana en 3D.
        // "soft" clona el nodo en cada volteo, por eso el contenido debe ser
        // declarativo y sin refs.
        <div key={index} className="book-page" data-density="soft">
          {child}
        </div>
      ))}
    </div>
  );
}

export { PageFlipBook };
