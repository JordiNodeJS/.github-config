---
name: Devtools
description: Reglas para usar Chrome DevTools para depuración visual y verificación de aplicaciones web
---

# Depuración de UI con DevTools MCPs

## Prioridad de herramientas

**Prioriza Chrome DevTools** como herramienta principal para depuración y validación de UI. Usa Next.js DevTools solo como complemento para casos específicos donde se requiera información del framework.

## Optimización de contexto

- **Prioriza `browser_snapshot`**: Usa siempre el snapshot (árbol de accesibilidad) antes que capturas visuales
- **Capturas visuales selectivas**: Usa `browser_take_screenshot` solo cuando sea estrictamente necesario
- **Tamaño reducido**: Mantén capturas ≤ 800x600 px y usa formatos ligeros (JPEG calidad 60, WEBP)

## Flujo de trabajo recomendado

1. **Navegación y análisis inicial**:
   - Usa `browser_navigate` para cargar la página
   - Usa `browser_snapshot` para obtener el estado accesible
   - Usa `browser_console_messages` para capturar errores

2. **Depuración con Chrome DevTools**:
   - Aplica herramientas CDP como `Accessibility.getFullAXTree`, `Overlay.highlightNode`
   - Usa `Runtime.evaluate` y `Runtime.getExceptionDetails` para inspección de errores
   - Monitorea redes con `Network.enable` y `Network.getResponseBody`

3. **Complemento con Next.js DevTools** (cuando sea necesario):
   - Usa `nextjs_call` para errores específicos de Next.js (hidratación, SSR, routing)
   - Usa `nextjs_index` para descubrir el servidor Next.js

4. **Interacción y pruebas**:
   - Usa `browser_click`, `browser_type`, `browser_fill_form` para interactuar
   - Verifica `browser_console_messages` después de cada interacción

## Directrices generales

- **Chrome DevTools primero**: Usa siempre Chrome DevTools como herramienta principal
- **Next.js DevTools como complemento**: Solo para casos específicos del framework
- **Minimiza contexto**: Prioriza snapshots sobre capturas visuales
- **Flexibilidad**: Permite que el LLM tome decisiones basadas en el contexto específico
