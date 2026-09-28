import "./Papel.css";

// Capa de fondo de papel. Se estira hasta cubrir el 100% del padre, sin
// importar qué tamaño tenga: el padre define la caja y la imagen se deforma
// para llenarla.
//
// El padre debe ser un contexto de posicionamiento (position: relative) y la
// escena va en un hermano. La capa se pinta con z-index: -1 para quedar
// debajo del contenido sin que cada escena tenga que subir su z-index, y
// con pointer-events: none para no robar el scroll ni los clics del texto.
function Papel({ className = "" }) {
  return <div className={`papel ${className}`.trim()} aria-hidden="true" />;
}

export { Papel };
