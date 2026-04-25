# Code Quality

> **Tipo:** CODE_QUALITY · **Duración estimada:** 180 min · **Nivel:** Intermedio (requiere competencia `code_quality` nivel 1)

## Objetivo

Reducir la deuda técnica de un módulo legacy de forma sistemática: bajar la complejidad ciclomática a ≤ 15 en todas las funciones, eliminar la duplicación de código, y corregir todas las violaciones de linter; sin cambiar el comportamiento observable del módulo.

## Instrucciones

### 1. Prepara tu entorno

```bash
git clone <url-de-tu-repositorio>
cd workshop-code-quality/starter-code
pnpm install
pnpm test   # todos los tests deben pasar antes de empezar
```

### 2. Analiza el estado inicial

```bash
pnpm lint         # revisa las violaciones de ESLint
pnpm complexity   # revisa la complejidad ciclomática por función
pnpm duplication  # revisa el porcentaje de código duplicado
```

Identifica en `src/order-processor.js`:
- La función con CC más alta (debe quedar ≤ 15)
- Los bloques de código duplicados (deben quedar ≤ 5%)
- Las violaciones de linter (deben quedar en 0)

### 3. Refactoriza sin cambiar comportamiento

Reglas:
- **No modificar** `tests/order-processor.test.js`
- **No cambiar** la API pública: nombres de funciones y sus parámetros deben permanecer igual
- Ejecuta `pnpm test` con frecuencia para verificar que nada se rompe

Técnicas recomendadas:
- **Extract Function**: descompón funciones grandes en funciones auxiliares más pequeñas
- **DRY**: elimina bloques duplicados moviéndolos a funciones reutilizables
- **Replace Magic Number with Constant**: nombra los valores numéricos con constantes descriptivas

### 4. Verifica las métricas

```bash
pnpm test         # 0 tests fallando
pnpm lint         # 0 errores
pnpm complexity   # ninguna función con CC > 15
pnpm duplication  # ≤ 5% de duplicación
```

### 5. Abre el Pull Request

El PR debe ir contra `main`. El grader se ejecuta automáticamente al abrir el PR.

## Criterios de evaluación

| Métrica | Peso | Umbral |
|---|---|---|
| Complejidad ciclomática | 35% | Max CC ≤ 15 en todas las funciones |
| Duplicación de código | 35% | Duplicación ≤ 5% |
| Violaciones de linter | 30% | 0 errores de ESLint |

## Recursos

- [Refactoring Guru — Extract Function](https://refactoring.guru/extract-method)
- [Refactoring Guru — Duplicate Code](https://refactoring.guru/smells/duplicate-code)
- [ESLint — complexity rule](https://eslint.org/docs/latest/rules/complexity)
- [jscpd — Copy/Paste Detector](https://github.com/kucherenko/jscpd)
