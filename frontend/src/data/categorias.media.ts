/**
 * Imágenes y acentos visuales por categoría (tomados del diseño de referencia
 * stitch_oppastore_ui_ux_design/oppastore_home). El overlay usa los containers
 * pastel del design system para el toque kawaii.
 */
const BASE = "https://lh3.googleusercontent.com/aida-public/";

export interface MediaCategoria {
  imagen: string;
  /** Clase del gradiente de superposición (tono pastel por categoría). */
  overlay: string;
}

export const MEDIA_CATEGORIAS: Record<string, MediaCategoria> = {
  skincare: {
    imagen: `${BASE}AB6AXuC4TwXjEGuMn9zhy5jpjKfA3xJ4xwZuks9wYRnjrTMQInhRZl5gIyoxI2AdaLvV0pSdAqciJgTA7D2lfxsfVUMjrnQnYzyI3CoaSxrg954e5WownyXlys3eLEzHf9HOGK_BziuQRw1ZAVJ1dm_4Uvep7GUwrcSzANFP9L5_utqKo7pYJRXOFzN9q_eqpZu3-3yqOOuVAJLZIe84_w3BMOavIuCyVaaNR1cTrCe874Ws-ffmIq8UpmbO`,
    overlay: "from-surface-container-highest/80",
  },
  snacks: {
    imagen: `${BASE}AB6AXuBqUuRJ6fcbPyLaiIDNZ9xy3y1dt9fGN6DhvYTTXoKK-jTkzFvJnjWXvI3PyvFlMd90fnZnHsHi6pg1upLJ1Wtck2ArN7WsmMrbfeqH7Z_yJKyt3v3sx1EkVGWtRXTwt1jtLhvCNV58rzA-AOrz364KwTUq27MzbFNLTpQZ5rIQmD4lzKnw6vs7-gQ3eJtDojjRbnpw4yvHKM-2M-Kk-SKhkCA8xzol_olh--8TibcTdJjEF4Rbokoa`,
    overlay: "from-secondary-container/80",
  },
  peluches: {
    imagen: `${BASE}AB6AXuD03kfFtgfjSXRyWf6R7fv4KCH5OC1a9kbSm-jtoALqA4eHbfwNeVDUOhvhgMFU7s3rWvNMH7UkpEM3igv_rRiR9iiYvKqY1s_5pEjOUuqejNwGbJ20cvNlNFCcKUJQPcEiHo-QZv18k15qW4spoBU-V6FjjooXvtedmjqPU0-k0ma-DI9LTzxxfAmTgmQ9rIfD8iIFR-q2my7oOz25JI5P9pZ32HtuoYFXNCVYqf-wSdQDKme9UNjB`,
    overlay: "from-tertiary-container/80",
  },
  accesorios: {
    imagen: `${BASE}AB6AXuDdtXAMI4E5q1XxRNn2j4Pw8IcmGw52NlFbrO16T4GIHIPljjkWAZVRqs8T8Ox_V72Y-W6MpHt9bs_l5MAgmkUT4EkGea4YVLS7IIAQ0diy9DfwzZK4QVAdi0kYXcQv5gHQNc4LphWjVYpFT5Q0fPta9uXpeNSbzD62ME6K0lY5QeJs_zadIo0hfWeGx7ada-__TJl-3owJcuvW8fAtmu2ImyUr9PzksCnCv2ntJlVD5VSHGPjadkKg`,
    overlay: "from-surface-container-low/80",
  },
  colecciones: {
    imagen: `${BASE}AB6AXuCoUZV3kkKn9om6dkxzKlVQnk3GHhzdbclnds9aokrjGxGHcy2pPFoEb8T5HgBd9T9KAKmduDpmvX3TSDHVZV_oeDP3JWodQ1RJjZ7PsJlh8hiSmcmyLuGtymaIf59rFi_GkmWsMsbhxHLXbDHBRxlI-TEWItt9i29p3ey0dOlCOSkFUq0quVBCu4-QRtqaROjCu-dxyphpJE7i4m4kmd6M9930SAIF2zeQ_81n-kWFfVNjp1wAYUxY`,
    overlay: "from-primary-container/80",
  },
  drops: {
    imagen: `${BASE}AB6AXuDvJMaqewAte9Y6JO9pvTO8Fap-tlVXNdS398_qUBbuD7iVh5Y33wWkt_RYItyHrcyHSFG0u1VZt8HRcfsnqCZH0PwcyNW17vc8lgi4nRhVN7_6Y8f_V3QaWp1wc5DWim52Zwt3CGe0hh9Sg5UCTtRDg-Yu9QtGVQRQVHkn2uix7LgmEFaJrCpkgCWzcK3b0EVriNJi7-yLw6vp_c_SOpMZ3W1tNtWH0vlHvN-GO9lMkootZBpb3a1u`,
    overlay: "from-secondary-fixed/80",
  },
};

/** Imágenes del hero (mockup oppastore_home). */
export const HERO_MEDIA = {
  flatLay: `${BASE}AB6AXuBY7C7DUyBu7CBs_RGkusaf058CnG9SLZq_XBLNyxN57huioUHsiRJ0HQkj8ytFGacST-CoTFxp9vlnBRnXgeqy3oFKjEAktF7hXH7DcTco3RI1VzO6-TFsWqVVHzj0MEsPBIF6SzM4u_bj9U0uhRM9K65WymPQeRdU7fCAyk8jLnQYG5iDMGqfZr5-ERE5ZSdxMrNJc1vLyXhCSr0ct9xbDxOc1k5aIA9OpFjJLW1FPQStABAZ3t8H`,
  panda: `${BASE}AB6AXuB1ZQgCwz7_uNl18sWiNiJkq5Uw_YFOsuUUDImL8FkopI7dubFpwwrytOuUePV6n5xGM86tywqx3YBT2r3N9zZ0E30Mb1ZNHZO6eZUp5uNxMnwoL8FnSu5OLZokOXzmGl21okg9RSkzo7N4HBFUW0Ew1sdlDwaFbWJ9_lqvHXVe624ygRxFVHwdjqUTCyP7yiqAKSZpD1nqB2j0m_fqlI6_5246_D2kTgW_JwDf_UzoRAbcGvUK5W0S`,
};
