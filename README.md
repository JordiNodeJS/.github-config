# .github - VSCode + GitHub Copilot Configuration Suite 🚀

Una carpeta portátil y reutilizable que contiene configuraciones, skills, instrucciones y prompts especializados para optimizar el desarrollo con **VSCode** y **GitHub Copilot**.

Diseñada para ser copiada a cualquier proyecto que use VSCode y GitHub Copilot, proporcionando herramientas de automatización, patrones de arquitectura y guías de desarrollo.

## ✨ Características

- 🤖 **Skills de Copilot**: Extensiones personalizadas de agentes con conocimiento de dominio
- 📋 **Instrucciones Base**: Guías de desarrollo y convenciones del proyecto
- 💬 **Prompts Especializados**: Templates para tareas comunes (VSCode UI, GitHub PRs, etc.)
- ⚙️ **Configuración VSCode**: Settings predefinidos con temas GitHub (barra de estado, etc.)
- 🏗️ **Patrones Arquitectónicos**: Clean Architecture, DDD, Server Actions, etc.
- 🔐 **Guías de Seguridad**: Autenticación JWT, Prisma, bases de datos serverless
- 📚 **Documentación Integrada**: Skills con documentación ejecutable
- 🔧 **Configuración Portátil**: Compatible con cualquier proyecto TypeScript/JavaScript

## � Contenido de la Carpeta

```
.github/
├── instructions/               # Guías base de desarrollo
│   ├── basic.instructions.md   # Instrucciones generales (pnpm, tsx, etc.)
│   └── [more instructions]
├── skills/                     # Skills ejecutables para agentes
│   ├── component-development/  # React 19 + Shadcn UI + Tailwind patterns
│   ├── clean-architecture-frontend/  # Clean Architecture patterns
│   ├── prisma-nextjs16/        # Prisma ORM best practices
│   ├── server-actions-patterns/ # Next.js Server Actions guide
│   ├── nextjs16-proxy-middleware/ # Authentication middleware
│   ├── testing-automation/     # Vitest + Playwright
│   ├── performance-optimization/ # Core Web Vitals + Caching
│   └── [more skills]
├── prompts/                    # Prompts especializados
│   ├── bar-vscode.prompt.md   # Configuración de barra de estado VSCode
│   └── [more prompts]
└── copilot-instructions.md     # Instrucciones específicas de proyectos (ej: Movies Tracker)
.vscode/
├── settings.json               # Configuración VSCode con colores GitHub
```

## 🚀 Uso Rápido

### 1. Integrar en un Proyecto Existente

Copia la carpeta `.github` a la raíz de tu proyecto:

```bash
cp -r .github /path/to/your/project/
cp -r .vscode /path/to/your/project/
```

### 2. Personalizar para tu Proyecto

Edita `copilot-instructions.md` con detalles específicos de tu proyecto:

- Stack tecnológico
- Patrones arquitectónicos
- Convenciones de nombres
- Flujos de trabajo

### 3. Usar Skills de Copilot

Los skills están documentados dentro de cada carpeta. Por ejemplo:

- `server-actions-patterns/SKILL.md` para patrones de Server Actions
- `clean-architecture-frontend/SKILL.md` para arquitectura limpia
- `testing-automation/SKILL.md` para estrategias de testing

## 📚 Skills Disponibles

### Core Development

| Skill                           | Descripción                                        |
| ------------------------------- | -------------------------------------------------- |
| **component-development**       | React 19, Shadcn UI, Tailwind CSS 4 en Next.js 16  |
| **clean-architecture-frontend** | Clean Architecture + Dependency Rule para frontend |
| **nextjs-ddd-architect**        | Domain-Driven Design para Next.js 16 App Router    |
| **server-actions-patterns**     | Patrones y best practices de Server Actions        |
| **prisma-nextjs16**             | Prisma ORM con Neon serverless + Next.js 16        |

### Testing & Quality

| Skill                        | Descripción                             |
| ---------------------------- | --------------------------------------- |
| **testing-automation**       | Vitest, Playwright, integration testing |
| **sonarqube-best-practices** | SonarLint quality gates para Next.js    |
| **e2e-production**           | E2E testing con Chrome DevTools MCP     |
| **webapp-testing**           | UI/UX testing y debugging               |

### DevOps & Infrastructure

| Skill                     | Descripción                                  |
| ------------------------- | -------------------------------------------- |
| **vercel-cli-management** | Despliegues y variables de entorno en Vercel |
| **vercel-env-sync**       | Sincronizar .env con configuración Vercel    |
| **github-pull-request**   | Workflow completo de PRs con GitHub CLI      |
| **windows-symlinks**      | Crear symlinks en Windows sin admin          |

### Tools & Integrations

| Skill                        | Descripción                               |
| ---------------------------- | ----------------------------------------- |
| **notion-management**        | Notion API para Node.js/JavaScript        |
| **performance-optimization** | Core Web Vitals, caching, bundle analysis |
| **skill-creator**            | Crear nuevos skills personalizados        |

## �️ Requisitos

- **VSCode** con extensión GitHub Copilot
- **Node.js** 18+ (para usar skills con CLI tools)
- **Git** configurado
- **GitHub CLI** (opcional, para skill `github-pull-request`)

## ⚡ Primeros Pasos

### Opción 1: Integrar en Proyecto Existente

```bash
# En la raíz de tu proyecto
cp -r /path/to/.github .
cp -r /path/to/.vscode .
```

### Opción 2: Clonar y Usar como Template

```bash
git clone https://github.com/JordiNodeJS/.github-config.git my-project
cd my-project
rm -rf .git
git init
```

### Opción 3: Usar como Subtree

```bash
git subtree add --prefix=.github https://github.com/JordiNodeJS/.github-config.git main --squash
```

## 🎯 Casos de Uso

### Para Proyectos Next.js 16

1. Lee [copilot-instructions.md](./copilot-instructions.md)
2. Personaliza con tu stack específico
3. Usa skills como `server-actions-patterns`, `prisma-nextjs16`, etc.

### Para Proyectos React + TypeScript

1. Usa skills: `component-development`, `clean-architecture-frontend`
2. Adapta instrucciones base según tu caso

### Para Testing y QA

1. Skill `testing-automation` para Vitest + Playwright
2. Skill `e2e-production` para Chrome DevTools MCP
3. Skill `sonarqube-best-practices` para quality gates

### Para DevOps / Deployment

1. Skill `vercel-cli-management` para Vercel
2. Skill `github-pull-request` para workflow de PRs
3. Skill `vercel-env-sync` para sincronizar variables de entorno

## 📖 Cómo Usar los Skills

Cada skill está documentado en su carpeta correspondiente (archivo `SKILL.md`):

### Ejemplo: Crear un Componente React

```bash
# Lee la guía del skill
cat .github/skills/component-development/SKILL.md

# Luego, pide a Copilot:
# "Create a reusable Button component following the component-development skill patterns"
```

### Ejemplo: Implementar Clean Architecture

```bash
# Lee la guía del skill
cat .github/skills/clean-architecture-frontend/SKILL.md

# Usa la estructura recomendada en tu proyecto
```

### Ejemplo: Crear una Server Action

```bash
# Lee la guía del skill
cat .github/skills/server-actions-patterns/SKILL.md

# Pide a Copilot un patrón específico
```

## 🔧 Configuración VSCode

La carpeta `.vscode/settings.json` incluye:

- ✅ Temas inspirados en GitHub (Dark/Light)
- ✅ Configuración de barra de estado con colores GitHub
- ✅ Integración con GitHub Copilot
- ✅ Preferencias de formateo (Prettier, ESLint)

## 📋 Instrucciones Base

Las instrucciones en `.github/instructions/` incluyen:

- **basic.instructions.md**: Comandos útiles (`pnpm dlx kill-port`, `tsx`, etc.)
- **copilot-instructions.md**: Instrucciones específicas de proyectos
- Más instrucciones personalizadas según proyecto

## 🌳 Estructura Típica de un Proyecto con .github

```
mi-proyecto/
├── .github/                    # ← Carpeta portátil
│   ├── instructions/
│   ├── skills/
│   ├── prompts/
│   └── copilot-instructions.md
├── .vscode/                    # ← Configuración VS Code
│   └── settings.json
├── src/
├── package.json
├── README.md
└── .gitignore
```

## 🤝 Contribuir

Para agregar nuevos skills o mejorar los existentes:

1. Crea una carpeta en `.github/skills/[skill-name]`
2. Escribe `SKILL.md` documentando el patrón
3. Incluye ejemplos ejecutables
4. Submit un PR

Ver guía completa en [skill-creator](./skills/skill-creator/SKILL.md)

## � Licencia

Este proyecto está bajo licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Jordi** - [@JordiNodeJS](https://github.com/JordiNodeJS)

Creado como suite de herramientas reutilizables para desarrollo con VSCode y GitHub Copilot.

## 🙏 Inspiración y Agradecimientos

- [GitHub](https://github.com) por GitHub Copilot y las best practices
- [Next.js](https://nextjs.org/) community
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)

## 📞 Soporte

¿Preguntas o sugerencias?

- 🐛 [Abre un issue](https://github.com/JordiNodeJS/.github-config/issues)
- 💬 [Discusiones](https://github.com/JordiNodeJS/.github-config/discussions)

## 🔗 Enlaces Útiles

- [VSCode Documentation](https://code.visualstudio.com/docs)
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

⭐ **Si esta suite de herramientas te fue útil, considera darle una estrella!**

Hecha con ❤️ para la comunidad de desarrolladores que usan VSCode + GitHub Copilot
