---
title: Neon MCP Database Management Rules
description: Reglas para gestión y operación de bases de datos Neon usando MCP (Model Context Protocol)
tags: [neon, database, mcp, postgresql, devops]
---

# Reglas de Gestión de Base de Datos Neon con MCP

## Contexto del Proyecto

Este proyecto utiliza **Neon** como base de datos PostgreSQL serverless y **MCP (Model Context Protocol)** para gestionar la base de datos mediante lenguaje natural desde Cursor.

### Información de la Base de Datos

**Base de datos principal:**
- **Nombre:** `neondb`
- **Proyecto:** `neon-indigo-kite`
- **Project ID:** `wispy-poetry-52762475`
- **Branch:** `main` (br-broad-union-abfa4pb3)

Cuando se soliciten operaciones en la base de datos sin especificar proyecto o base de datos, usar estos valores por defecto.

### Configuración Neon MCP

El proyecto tiene configurado Neon MCP Server de dos formas:

1. **Servidor Remoto (OAuth) - RECOMENDADO:**
   - URL: `https://mcp.neon.tech/mcp`
   - Configuración: `config/cursor-mcp-neon-remoto-config.json`
   - No requiere API key, usa OAuth para autenticación

2. **Servidor Local (API Key):**
   - API Key: `napi_yv54tdn73q06d9nldaanlzhlf29y7qmulwcoobifgl10yt553hl35e4y2z5ilneq`
   - Configuración estándar: `config/cursor-mcp-neon-config.json`
   - Configuración Windows: `config/cursor-mcp-neon-config-windows.json`

## Uso de MCP con Neon

### Principios Fundamentales

1. **Siempre usar MCP para operaciones de base de datos:** Cuando el usuario solicite operaciones relacionadas con bases de datos, usar las herramientas MCP de Neon disponibles.

2. **Verificar antes de modificar:** Antes de ejecutar operaciones destructivas (DROP, DELETE, TRUNCATE), siempre:
   - Verificar el estado actual
   - Confirmar con el usuario
   - Documentar la operación

3. **Usar lenguaje natural:** El usuario puede solicitar operaciones en lenguaje natural. Convertir estas solicitudes a comandos MCP apropiados.

### Operaciones Comunes con MCP

#### Gestión de Proyectos

- **Listar proyectos:** Usar `list_mcp_resources` o preguntar directamente al usuario: "List my Neon projects"
- **Buscar recursos:** "Search for 'production' across my Neon resources"
- **Crear proyecto:** "Create a new Neon project named 'my-project'"

#### Gestión de Bases de Datos

- **Listar bases de datos:** "List databases in project 'project-name'"
- **Obtener connection string:** "Show me the connection string for database 'db-name'"
- **Listar tablas:** "What tables are in database 'db-name'?"
- **Ver esquema:** "Show me the schema for database 'db-name'"

#### Consultas SQL

- **Consultas SELECT:** "Show me the first 10 rows from the 'users' table"
- **Consultas con filtros:** "Find all users where email contains '@example.com'"
- **Agregaciones:** "Run this query: SELECT COUNT(*) FROM users"
- **Información de columnas:** "What columns are in the 'users' table?"

#### Modificaciones de Esquema

- **Crear tablas:** "Create a table 'products' with columns id (SERIAL PRIMARY KEY), name (VARCHAR(255)), price (DECIMAL(10,2))"
- **Agregar columnas:** "Add a column 'email' of type VARCHAR(255) to the 'users' table"
- **Modificar columnas:** "Change the 'name' column in 'users' table to VARCHAR(500)"
- **Eliminar columnas:** "Remove the 'old_field' column from 'users' table"
- **Crear índices:** "Create an index on 'email' column in 'users' table"

#### Branching y Migraciones

- **Crear branch:** "Create a branch 'feature-auth' from branch 'main'"
- **Listar branches:** "List all branches in project 'project-name'"
- **Generar diff:** "Generate a schema diff for branch 'br-feature-auth'"
- **Aplicar migraciones:** "Apply migrations from branch 'br-feature-auth' to 'main'"

### Ejemplos de Uso en Código

Cuando el usuario solicite operaciones de base de datos, usar estas herramientas MCP:

```typescript
// Ejemplo: El usuario pregunta "¿Qué tablas hay en mi base de datos?"
// Usar MCP para listar tablas en lugar de escribir SQL manualmente
```

### Buenas Prácticas

1. **Siempre verificar la conexión:** Antes de operaciones críticas, verificar que MCP está funcionando
2. **Documentar cambios:** Registrar cambios importantes en `ddbb/docs/`
3. **Usar transacciones cuando sea apropiado:** Para operaciones múltiples relacionadas
4. **Validar datos:** Verificar tipos y restricciones antes de insertar/modificar
5. **Backup antes de cambios destructivos:** Especialmente en producción

### Seguridad

⚠️ **IMPORTANTE:**

1. **Revisar operaciones:** Siempre revisar las acciones solicitadas por el LLM antes de ejecutarlas
2. **No usar en producción directa:** MCP es principalmente para desarrollo
3. **Proteger API keys:** Nunca commitear API keys en el repositorio
4. **Modo solo lectura:** Para operaciones de solo lectura, usar configuración con header `x-read-only: true`

### Configuración de Solo Lectura

Para operaciones más seguras (solo lectura):

```json
{
  "mcpServers": {
    "Neon": {
      "url": "https://mcp.neon.tech/mcp",
      "headers": {
        "x-read-only": "true"
      }
    }
  }
}
```

## Herramientas MCP Disponibles

El servidor Neon MCP proporciona las siguientes capacidades:

1. **Gestión de proyectos:** Crear, listar, buscar proyectos
2. **Gestión de bases de datos:** Listar, crear, obtener connection strings
3. **Consultas SQL:** Ejecutar queries SELECT, INSERT, UPDATE, DELETE
4. **Gestión de esquema:** Crear/modificar tablas, columnas, índices
5. **Branching:** Crear branches, generar diffs de esquema
6. **Migraciones:** Aplicar y gestionar migraciones

## Documentación Relacionada

### Documentación Principal

- **docs/INSTALAR_NEON_MCP_CURSOR.md:** Guía completa de instalación y configuración
- **docs/INSTALAR_NEON_MCP.md:** Instalación rápida
- **docs/configurar-servidor-remoto-neon.md:** Configuración de servidor remoto (OAuth)
- **docs/TROUBLESHOOTING_MCP_NEON.md:** Solución de problemas comunes
- **docs/OBTENER_CONNECTION_STRING_NEON.md:** Cómo obtener connection strings
- **docs/CONFIGURAR_DBEAVER_NEON.md:** Configuración de DBeaver

### Documentación en ddbb/

- **ddbb/docs/README.md:** Documentación general de base de datos
- **ddbb/docs/GUIA_MCP_NEON.md:** Guía detallada de uso de MCP con Neon

### Archivos de Configuración

- **config/cursor-mcp-neon-config.json:** Configuración estándar (servidor local)
- **config/cursor-mcp-neon-config-windows.json:** Configuración para Windows
- **config/cursor-mcp-neon-remoto-config.json:** Configuración servidor remoto (OAuth)

### Scripts Disponibles

- **ddbb/scripts/:** Scripts útiles para trabajar con Neon MCP
- **scripts/obtener-connection-string.sh:** Obtener connection string
- **scripts/neonctl-commands.sh:** Comandos útiles de neonctl
- **scripts/diagnosticar-mcp-neon.sh:** Diagnosticar problemas MCP

## Troubleshooting

### MCP no responde

1. Verificar que el servidor está configurado en Cursor Settings
2. Reiniciar Cursor completamente
3. Verificar conexión a internet (para servidor remoto)
4. Verificar API key (para servidor local)

### Error de autenticación

1. Para servidor remoto: Re-autorizar con OAuth
2. Para servidor local: Verificar que la API key es válida
3. Verificar en: https://console.neon.tech/app/settings/api-keys

### Operaciones fallan

1. Verificar que la base de datos existe
2. Verificar permisos del usuario/API key
3. Revisar logs de Cursor para errores específicos
4. Consultar `docs/TROUBLESHOOTING_MCP_NEON.md`

## Comandos de Referencia

### Verificar MCP funciona

Preguntar a Cursor: `"List my Neon projects"` o `"Get started with Neon"`

### Operaciones comunes

- `"List all databases in my project"`
- `"Show me the connection string for database 'neondb'"`
- `"What tables are in database 'neondb'?"`
- `"Show me the first 10 rows from table 'users'"`
- `"Create a table 'products' with columns id, name, price"`

## Notas Importantes

1. **MCP es para desarrollo:** No usar para operaciones críticas de producción sin revisión
2. **Backup regular:** Neon tiene backups automáticos, pero documentar cambios importantes
3. **Versionado:** Usar branches de Neon para cambios de esquema importantes
4. **Documentación:** Mantener `ddbb/docs/` actualizado con cambios de esquema
5. **Scripts:** Guardar scripts SQL útiles en `ddbb/scripts/`
