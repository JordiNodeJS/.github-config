# 📦 Skills Recomendadas para Movies Tracker App

Este documento lista las skills recomendadas del ecosistema [skills.sh](https://skills.sh) para desarrollar la aplicación Movies Tracker.

---

## 🚀 Skills Esenciales (Instalar Primero)

### 1. find-skills
**Repositorio:** `vercel-labs/skills`
**Instalación:**
```bash
npx skills add vercel-labs/skills@find-skills -g -y
```
**Descripción:** Permite descubrir e instalar skills del ecosistema. Es la skill base para encontrar más capacidades.

---

### 2. vercel-react-best-practices
**Repositorio:** `vercel-labs/agent-skills`
**Instalación:**
```bash
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
```
**Descripción:** Guías de optimización de rendimiento para React y Next.js desde Vercel Engineering. Incluye patrones de data fetching, bundle optimization y Server Components.

**Uso:** Al escribir, revisar o refactorizar código React/Next.js para asegurar patrones óptimos.

---

### 3. frontend-design
**Repositorio:** `anthropics/skills`
**Instalación:**
```bash
npx skills add anthropics/skills@frontend-design -g -y
```
**Descripción:** Guía para crear interfaces frontend distintivas y de grado producción. Evita estéticas genéricas de "AI slop" con atención excepcional a detalles estéticos.

**Uso:** Al diseñar componentes, páginas o interfaces completas con estética Avant-Garde/Cyberpunk.

---

## 🎨 Skills de Diseño y UX

### 4. web-design-guidelines
**Repositorio:** `vercel-labs/agent-skills`
**Instalación:**
```bash
npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y
```
**Descripción:** Revisa código UI para cumplimiento de Web Interface Guidelines. Incluye accesibilidad, UX y mejores prácticas.

**Uso:** Cuando se pide "revisar mi UI", "verificar accesibilidad", "auditar diseño".

---

### 5. vercel-composition-patterns
**Repositorio:** `vercel-labs/agent-skills`
**Instalación:**
```bash
npx skills add vercel-labs/agent-skills@vercel-composition-patterns -g -y
```
**Descripción:** Patrones de composición React que escalan. Útil para refactoring de componentes.

**Uso:** Al estructurar componentes complejos o refactorizar para mejor composición.

---

## 🚀 Skills de Deployment

### 6. vercel-deploy
**Repositorio:** `vercel-labs/agent-skills`
**Instalación:**
```bash
npx skills add vercel-labs/agent-skills@vercel-deploy -g -y
```
**Descripción:** Despliega aplicaciones y sitios web a Vercel. No requiere autenticación - retorna URL de preview y link de deployment.

**Uso:** "Deploy mi app", "Desplegar a producción", "Crear preview deployment".

---

## 📋 Skills Adicionales (Opcionales)

### 7. remotion-best-practices
**Repositorio:** `remotion-dev/skills`
**Instalación:**
```bash
npx skills add remotion-dev/skills@remotion-best-practices -g -y
```
**Descripción:** Mejores prácticas para Remotion (videos con React). Útil si se añade generación de video.

---

## 🔧 Instalación Rápida (Todas las esenciales)

```bash
# Instalar todas las skills esenciales de una vez
npx skills add vercel-labs/skills@find-skills -g -y
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
npx skills add anthropics/skills@frontend-design -g -y
npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y
npx skills add vercel-labs/agent-skills@vercel-composition-patterns -g -y
npx skills add vercel-labs/agent-skills@vercel-deploy -g -y
```

---

## 📚 Comandos Útiles del CLI

```bash
# Buscar skills por categoría
npx skills find nextjs
npx skills find react testing
npx skills find prisma
npx skills find tailwind

# Verificar actualizaciones
npx skills check

# Actualizar todas las skills
npx skills update

# Ver skills instaladas
npx skills list
```

---

## 🏷️ Categorías de Skills Disponibles

| Categoría | Keywords de Búsqueda |
|-----------|---------------------|
| Web Development | `react`, `nextjs`, `typescript`, `css`, `tailwind` |
| Testing | `testing`, `jest`, `playwright`, `e2e` |
| DevOps | `deploy`, `docker`, `kubernetes`, `ci-cd` |
| Documentation | `docs`, `readme`, `changelog`, `api-docs` |
| Code Quality | `review`, `lint`, `refactor`, `best-practices` |
| Design | `ui`, `ux`, `design-system`, `accessibility` |
| Productivity | `workflow`, `automation`, `git` |

---

## 🔗 Enlaces Útiles

- [Skills.sh Homepage](https://skills.sh/)
- [Skills Documentation](https://skills.sh/docs)
- [Skills CLI Reference](https://skills.sh/docs/cli)
- [Vercel Labs Agent Skills](https://skills.sh/vercel-labs/agent-skills)
- [Anthropics Skills](https://skills.sh/anthropics/skills)

---

## 📝 Notas

- El flag `-g` instala la skill globalmente (nivel usuario)
- El flag `-y` omite prompts de confirmación
- Las skills se almacenan en `~/.skills/` o `%USERPROFILE%\.skills\` en Windows
- GitHub Copilot soporta skills nativamente
