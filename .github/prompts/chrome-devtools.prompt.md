---
name: Chrome DevTools Debugging Rules
description: Reglas para usar Chrome DevTools para depuración visual y verificación de aplicaciones web
---

# Reglas de Depuración con Chrome DevTools

## Principio General

**SIEMPRE utiliza Chrome DevTools (browser automation) para depurar y verificar aplicaciones web visualmente**, especialmente cuando:

- Necesitas verificar el estado visual de una aplicación
- Hay errores de renderizado o problemas de UI
- Necesitas inspeccionar el DOM, estilos CSS, o console logs
- Verificas que las rutas y páginas funcionan correctamente
- Detectas errores de runtime que no aparecen en el servidor

## ¿Por qué Chrome DevTools?

1. **Renderizado Real**: Ejecuta JavaScript y renderiza la página como un usuario real
2. **Errores de Runtime**: Detecta errores de JavaScript, hydration issues, y problemas de React
3. **Inspección Visual**: Permite ver exactamente qué se muestra al usuario
4. **Console Logs**: Captura todos los mensajes de consola del navegador
5. **Network Requests**: Monitorea todas las peticiones HTTP/API

## Cuándo NO usar Chrome DevTools

- Verificación de código estático (mejor usar `read_file` o `grep`)
- Verificación de archivos de configuración
- Análisis de linter errors (usar `read_lints`)
- Verificación de sintaxis de código

## Herramientas Disponibles

### Browser Automation (MCP next-devtools)

El MCP next-devtools proporciona las siguientes acciones:

- `start`: Inicia el navegador (se instala automáticamente si es necesario)
- `navigate`: Navega a una URL
- `click`: Hace clic en un elemento
- `type`: Escribe texto en un elemento
- `evaluate`: Ejecuta JavaScript en el contexto del navegador
- `screenshot`: Toma capturas de pantalla
- `console_messages`: Obtiene mensajes de la consola del navegador
- `close`: Cierra el navegador

### Para Next.js específicamente

Si trabajas con Next.js 16+:

- Usa `nextjs_index` para descubrir servidores Next.js en ejecución
- Usa `nextjs_call` para obtener errores de compilación y runtime
- Combina con browser automation para verificación visual completa

## Flujo de Trabajo Recomendado

### 1. Verificación Inicial de la Aplicación

```plaintext
1. Iniciar el servidor de desarrollo (si no está corriendo)
2. Usar browser automation para navegar a la URL
3. Tomar screenshot para verificación visual
4. Revisar console_messages para errores
5. Verificar network_requests si hay problemas de API
```

### 2. Depuración de Problemas Específicos

```plaintext
1. Navegar a la página problemática
2. Usar evaluate() para inspeccionar el estado del DOM
3. Capturar console_messages para errores de JavaScript
4. Tomar screenshots para documentar el problema
5. Verificar network_requests para problemas de API
```

### 3. Verificación Post-Implementación

```plaintext
1. Después de hacer cambios, SIEMPRE verificar visualmente con browser
2. Navegar a todas las rutas afectadas
3. Probar interacciones clave (clicks, formularios)
4. Verificar que no hay errores en consola
5. Confirmar que el diseño se ve correctamente
```

## Ejemplos de Uso

### Verificar que la App Funciona

```plaintext
- start: Inicia el navegador
- navigate: Navega a http://localhost:3000 (o el puerto correspondiente)
- screenshot: Captura el estado inicial
- console_messages: Verifica errores en consola
- close: Cierra el navegador
```

### Depurar un Error Visual

```plaintext
- navigate: Ve a la página con el problema
- screenshot: Captura el estado actual
- console_messages errorsOnly: Solo errores de consola
- evaluate: Inspecciona elementos específicos del DOM
```

### Probar Interacciones

```plaintext
- navigate: Ve a la página
- click: Haz clic en botones/links
- type: Completa formularios
- screenshot: Documenta cada paso
- console_messages: Verifica que no hay errores después de interactuar
```

## Consideraciones Importantes

1. **Puerto por Defecto**: Next.js normalmente usa puerto 3000, pero verifica con `nextjs_index`
2. **Headless Mode**: Por defecto puede ejecutarse en headless. Para depuración visual, puedes desactivarlo
3. **Timeouts**: Algunas acciones pueden tardar (carga de páginas, APIs), espera suficiente tiempo
4. **Screenshots**: Son útiles para documentar problemas y verificar cambios visuales

## Integración con Next.js MCP

Cuando trabajes con Next.js, combina ambos enfoques:

- `nextjs_call` para errores de compilación y runtime del servidor
- Browser automation para verificación visual del cliente

Esto te da una visión completa del estado de la aplicación.
