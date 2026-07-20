## ADDED Requirements

### Requirement: Titular genérico de tendencias en la página principal
La página principal SHALL mostrar el titular de la sección de tendencias como "Tendencias asiáticas que llegan a tu ciudad" y no SHALL mostrar "Tendencias asiáticas que llegan a Ayacucho" en ese titular.

#### Scenario: Visitante visualiza el titular de tendencias
- **WHEN** un visitante abre la página principal
- **THEN** visualiza el texto "Tendencias asiáticas que llegan a tu ciudad" en la sección de tendencias

#### Scenario: El titular no depende de una ciudad fija
- **WHEN** un visitante abre la página principal
- **THEN** el titular de tendencias no contiene la ubicación fija "Ayacucho"
