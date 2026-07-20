## Context

La página principal contiene un titular que menciona explícitamente a Ayacucho. El cambio sustituye esa ubicación fija por un mensaje genérico, sin introducir personalización basada en geolocalización ni modificar la estructura de la página.

## Goals / Non-Goals

**Goals:**

- Mostrar exactamente "Tendencias asiáticas que llegan a tu ciudad" en el bloque de tendencias de la página principal.
- Cubrir el texto visible con una prueba end-to-end.

**Non-Goals:**

- Determinar o mostrar la ciudad real del usuario.
- Cambiar otros titulares, estilos, rutas o datos de tendencias.

## Decisions

- Actualizar únicamente el literal que compone el titular de tendencias. Es la alternativa de menor alcance y satisface el mensaje requerido; no se añadirá una capa de localización porque "tu ciudad" es texto estático.
- La prueba end-to-end verificará el titular por su contenido visible en la página principal. Esto protege el comportamiento observable sin acoplar la prueba a la implementación interna.

## Risks / Trade-offs

- [Una prueba que compare el texto completo puede requerir ajuste ante cambios editoriales futuros] → Mantenerla enfocada únicamente en este titular contractual.
- [Usuarios podrían interpretar que existe personalización geográfica] → El alcance deja explícito que el cambio solo sustituye la redacción.
