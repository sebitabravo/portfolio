### E2E Tests: Home Page

**Suite ID:** `HOME-E2E`
**Feature:** navegación principal y filtro de proyectos

---

## Test Case: `HOME-E2E-001` - sección crítica y filtrado

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @home

**Description/Objective:** validar que la página principal renderiza secciones clave y que el filtrado por tecnología funciona.

**Preconditions:**
- Servidor de la app activo en `PLAYWRIGHT_BASE_URL`.
- Datos de proyectos cargados desde `src/lib/data.ts`.

### Flow Steps:
1. Entrar a `/`.
2. Confirmar que existen los encabezados de Proyectos y Contacto.
3. Validar que la pestaña "Todas" está activa.
4. Aplicar filtro "React".
5. Verificar que hay tarjetas visibles tras filtrar.

### Expected Result:
- Secciones críticas visibles al cargar.
- El estado activo del tab cambia correctamente.
- El filtrado muestra al menos un proyecto.

### Key verification points:
- `role=heading` con textos críticos.
- `role=tab` con `aria-selected` correcto.
- Conteo de cards visibles mayor a cero.

### Notes:
- Este test prioriza estabilidad de navegación y discovery de proyectos.

---

## Test Case: `HOME-A11Y-001` y `HOME-A11Y-002` - auditoría de accesibilidad

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @a11y

**Description/Objective:** ejecutar axe-core sobre home en español e inglés para detectar violaciones de accesibilidad.

**Preconditions:**
- Servidor activo en `PLAYWRIGHT_BASE_URL`.
- Scripts cliente inicializados.

### Flow Steps:
1. Abrir `/`.
2. Ejecutar auditoría axe-core.
3. Abrir `/en`.
4. Repetir auditoría axe-core.

### Expected Result:
- Cero violaciones críticas en ambos locales.

### Key verification points:
- `results.violations` debe ser un arreglo vacío.
