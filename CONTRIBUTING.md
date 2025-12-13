
# CONTRIBUTING - Podium

Thanks for your interest in contributing to Podium. We're happy to have you here.
Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

## Table of Contents 📚

- [About this repository](#about-this-repository-)
- [Structure](#structure-%EF%B8%8F)
- [Testing](#testing-)
- [Development](#development-)
- [Branches Convention](#branches-convention-)
- [Commit Convention](#commit-convention-)
- [GitHub Issue Management](#github-issue-management)
- [Release](#release-)

## About this repository 📁

This repository is a Bun monorepo for a foosball tournament management application. It contains:
- **API**: Hono + Drizzle ORM + MySQL backend
- **Web**: Nuxt 3 + Vue 3 + Pinia + Tailwind CSS frontend
- **Shared**: Common types, validators (Zod), and utilities

## Structure 🏗️

```
podium/
```

| Path | Description |
|------|-------------|

## Testing 🧪

```bash
bun run test           # All tests
bun run test:shared    # Shared package tests
bun run test:api       # API integration tests
bun run test:web       # Web component tests
```

## Development 🚀

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/YOUR_USERNAME/podium.git
```

### Navigate to project directory

```bash
cd podium
```

### Create a new Branch

```bash
git checkout -b feat/#1-my-new-feature
```

### Install dependencies

```bash
make install
# or
bun install
```

### Setup environment

```bash
make setup
```

### Run the project

```bash
make dev
# or
bun run dev
```

### Useful commands

```bash
make help       # Show all commands
make db-reset   # Reset and seed database
make logs       # View Docker logs
make stop       # Stop all services
```

## Branches Convention 🌿

### Main branches

- `main`: Production branch
- `dev`: Development branch

### Naming Convention 📛

```
<type>/#<issue-number>-<short-description>
```

- `type`: Type of the branch
- `issue-number`: Issue number
- `short-description`: Short description of the issue

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `hotfix` | Critical bug fix |
| `chore` | Maintenance tasks |
| `docs` | Documentation |
| `test` | Tests |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `bonus` | Optional/bonus features |

### Examples

```
feat/#1-add-user-authentication
fix/#2-fix-login-redirect
chore/#3-update-dependencies
docs/#4-update-readme
bonus/#5-add-docker-config
```

## Commit Convention 📝

Before you create a Pull Request, please check whether your commits comply with the commit conventions used in this repository.

### Format

```
<emoji> <type>(<scope>): <subject>
```

### Emojis

| Emoji | Type | Description |
|-------|------|-------------|
| ✨ | feat | Introduce new features |
| 🐛 | fix | Fix a bug |
| 🚑️ | hotfix | Critical hotfix |
| 📝 | docs | Add or update documentation |
| 💄 | style | Add or update UI/styling |
| ♻️ | refactor | Refactor code |
| ⚡️ | perf | Improve performance |
| ✅ | test | Add or update tests |
| 🔧 | chore | Add or update configuration files |
| 🏗️ | build | Add or update build system |
| 👷 | ci | Add or update CI configuration |
| 🔥 | chore | Remove code or files |
| ⬆️ | chore | Upgrade dependencies |
| 🚀 | chore | Deploy or release |
| 🔒️ | security | Fix security issues |

### Scopes

| Scope | Description |
|-------|-------------|
| `api` | Backend API changes |
| `web` | Frontend changes |
| `shared` | Shared package changes |
| `db` | Database changes |
| `auth` | Authentication changes |
| `docker` | Docker configuration |
| `deps` | Dependencies |

### Subject Rules

- Use imperative mood (add, change, remove, fix)
- Don't capitalize first letter
- No dot (.) at the end

### Examples

```
✨ feat(api): add tournament CRUD endpoints
🐛 fix(web): fix login form validation
♻️ refactor(shared): simplify ranking calculation
📝 docs: update installation instructions
⬆️ chore(deps): upgrade nuxt to 3.14
🔧 chore(docker): add healthcheck to mysql service
```

## GitHub Issue Management

### Labels

#### Type Labels

| Name | Color | Description |
|------|-------|-------------|
| `setup` | #0052CC | Initial configuration |
| `feature` | #0E8A16 | New feature |
| `fix` | #D73A4A | Bug fix |
| `hotfix` | #FF3333 | Critical bug fix |
| `docs` | #0075CA | Documentation |
| `test` | #BFD4F2 | Tests |
| `refactor` | #FBCA04 | Code refactoring |
| `chore` | #808080 | Maintenance tasks |

#### Domain Labels

| Name | Color | Description |
|------|-------|-------------|
| `backend` | #5319E7 | Server-side code (API) |
| `frontend` | #1D76DB | Client-side code (Nuxt) |
| `auth` | #B60205 | Authentication/Authorization |
| `algorithm` | #FBCA04 | Complex business logic |
| `security` | #D93F0B | Security |
| `devops` | #006B75 | Infrastructure/Deployment |
| `bonus` | #7057FF | Optional features |

#### Priority Labels

| Name | Color | Description |
|------|-------|-------------|
| 🔴 Critical | #FF0000 | Blocking issue |
| 🟡 Important | #FFA500 | High priority |
| 🟢 Bonus | #00FF00 | Optional/nice-to-have |

### Create Labels

```bash
gh label create "setup" --color "0052CC" --description "Configuration initiale"
gh label create "backend" --color "5319E7" --description "Code côté serveur (API)"
gh label create "frontend" --color "1D76DB" --description "Code côté client (Nuxt)"
gh label create "auth" --color "B60205" --description "Authentification/Autorisation"
gh label create "feature" --color "0E8A16" --description "Nouvelle fonctionnalité"
gh label create "algorithm" --color "FBCA04" --description "Logique métier complexe"
gh label create "security" --color "D93F0B" --description "Sécurité"
gh label create "documentation" --color "0075CA" --description "Documentation"
gh label create "testing" --color "BFD4F2" --description "Tests"
gh label create "devops" --color "006B75" --description "Infrastructure/Déploiement"
gh label create "bonus" --color "7057FF" --description "Fonctionnalité bonus"
```

## Development Workflow 🔄

### Branch Strategy

1. **Main Branches**:
   - `main` - Production branch (protected)
   - `dev` - Development branch (default)

2. **Feature Branches**: `<type>/#<issue-number>-<description>`

3. **No Direct Commits**: All changes MUST go through pull requests

### Pull Request Requirements

Before submitting a pull request, ensure:

- [ ] Code follows project conventions
- [ ] Tests pass (`bun run test`)
- [ ] Linting passes (`bun run lint`)
- [ ] TypeScript compiles (`bun run typecheck`)
- [ ] Documentation updated if needed

### Code Review Process

1. **Self-Review**: Review your own changes before requesting review
2. **Automated Checks**: Ensure CI pipeline passes
3. **Peer Review**: At least one approval required
4. **Merge**: Only after all checks pass

## Release 🚀

### Versioning

Using [Semantic Versioning](https://semver.org/):

```
<major>.<minor>.<patch>
```

- `major`: Breaking changes
- `minor`: New features
- `patch`: Bug fixes

### Examples

- `1.0.0` - First release
- `1.1.0` - New feature added
- `1.1.1` - Bug fix

---

<p align="center">
  <strong>🏆 Podium - Gestionnaire de tournois de baby-foot</strong>
</p>
