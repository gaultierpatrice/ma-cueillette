# Ma Cueillette

Application web full stack pour recenser et explorer des cueillettes (fruits, légumes) : **Angular** (interface), **Spring Boot** (API REST), **PostgreSQL** (données), sécurisée par **JWT** et rôles (utilisateur, producteur, administrateur).

## Prérequis

| Outil | Version cible | Usage |
|--------|----------------|--------|
| **Java** | 21 (Temurin recommandé) | Backend Spring Boot (aligné sur la CI GitHub) |
| **Maven** | 3.9+ | Build backend |
| **Node.js** | 22 | Build et tests frontend |
| **npm** | 10+ (fourni avec Node 22) | Paquets frontend |
| **PostgreSQL** | 17 (ou compatible) | Base locale hors Docker, ou via Docker |
| **Docker** & **Docker Compose** | récents | Optionnel : stack complète conteneurisée |

Environnements de développement adaptés : **IntelliJ IDEA** / **VS Code ou Cursor** (Angular & Java), **terminal** PowerShell ou bash pour Maven, npm et Git. Les versions ci-dessus correspondent au workflow défini dans [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Architecture (aperçu)

```
Navigateur  →  Angular (SPA)  →  API REST `/api/*`  →  Spring Boot  →  JPA / Flyway  →  PostgreSQL
```

- **Frontend** : `frontend/` — Angular, appel API via `getApiRoot()` (`/api` en dev grâce au proxy, même origine en prod derrière Nginx).
- **Backend** : `backend/` — contrôleurs REST, services, sécurité Spring Security + JWT, validation Bean Validation.
- **Données** : schéma versionné avec **Flyway** (`backend/src/main/resources/db/migration/`).

## Choix techniques (argumentaire court)

Pour le dossier ou la soutenance : chaque ligne rappelle une **alternative plausible** et le **choix du projet**.

| Domaine | Alternative A | Alternative B | Choix retenu | Pourquoi (résumé) |
|--------|----------------|----------------|--------------|-------------------|
| Frontend SPA | **Angular** | React, Vue | Angular | Structure imposée (modules, CLI), TypeScript natif, écosystème entreprise cohérent avec une équipe Java. |
| Backend API | **Spring Boot** | Node (Nest), Quarkus | Spring Boot | Écosystème mature (Sécurité, JPA, validation), aligné avec le référentiel formation Java / entreprise. |
| Base relationnelle | **PostgreSQL** | MySQL, MariaDB | PostgreSQL | Standard robuste, types riches, image officielle Docker, bonne intégration JPA. |
| Accès données | **Spring Data JPA** (+ Flyway) | SQL brut, autre ORM | JPA + Flyway | Modèle objet + migrations traçables dans le dépôt (reproductibilité). |
| Auth API | **JWT stateless** | Sessions serveur | JWT | API REST sans session ; filtres Spring Security sur les routes `/api`. |
| Déploiement local / prod | **Docker Compose** | Installations manuelles seules | Docker + doc locale | Un fichier décrit services, réseau et variables ; même stack pour tous les développeurs. |

## Cloner le dépôt

```bash
git clone <url-de-votre-repo> ma_cueillette
cd ma_cueillette
```

## Configuration et secrets

1. Copier le modèle de variables :

   ```bash
   copy .env.example .env
   ```
   (Sous macOS/Linux : `cp .env.example .env`.)

2. Éditer **`.env`** : mots de passe et `JWT_SECRET` long et aléatoire (ne jamais commiter ce fichier).

3. Le dépôt ignore **`.env`** via la racine [`.gitignore`](./.gitignore). Les identifiants et clés (JWT, base, éventuelle clé e-mail) sont injectés par variables d’environnement ou par fichier `.env` selon votre mode de lancement.

Variables utilisées côté backend (voir `backend/src/main/resources/application.properties`) : `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, et éventuellement `RESEND_*` pour le contact. Pour **Docker Compose**, la racine du projet lit `.env`.

> Pour que **spring-dotenv** charge un .env à la racine, lancez Maven **depuis la racine** avec mvn -f backend/pom.xml spring-boot:run. Sinon, depuis ackend/, exportez les variables dans le terminal, configurez l’IDE, ou placez un .env dans ackend/.

## Démarrage avec Docker Compose (recommandé pour reproduire la stack)

Depuis la **racine** du dépôt, avec un `.env` valide :

```bash
docker compose up --build
```

- API : `http://localhost:8080`  
- Frontend (Nginx) : `http://localhost:4200`  
- PostgreSQL : port `5432`  
- pgAdmin (optionnel dans le compose) : port `5050`

Cela valide la **containeurisation** (Dockerfiles `backend/` et `frontend/`) et une installation **reproductible** sans installer Java/Node localement.

## Développement local (sans conteneurs applicatifs)

### 1. Base PostgreSQL

Créer une base nommée **`cueillette_db`** (ou adapter les URL dans la configuration si vous changez le nom).

Assurez-vous que `DB_USERNAME` / `DB_PASSWORD` et `JWT_SECRET` sont définis (même valeurs que dans votre `.env`).

### 2. Backend

Depuis le dossier `backend` :

```bash
cd backend
mvn spring-boot:run
```

Ou **depuis la racine du dépôt** (pratique si votre fichier `.env` est à la racine : le répertoire de travail courant est alors aligné avec Docker Compose) :

```bash
mvn -f backend/pom.xml spring-boot:run
```

Profil par défaut : `dev` (`application-dev.properties` — SQL formaté, erreurs internes pouvant être plus verbeuses côté API selon configuration). Les migrations **Flyway** s’appliquent au démarrage.

L’API écoute sur **`http://localhost:8080`**.

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
npm ci
ng serve
```

Le fichier [`frontend/proxy.conf.json`](frontend/proxy.conf.json) redirige **`/api`** vers `http://localhost:8080` : l’application utilise `apiBaseUrl` vide en développement (`environment.development.ts`).

Interface : **`http://localhost:4200`**.

## Tests et build

**Backend** (depuis `backend/`) :

```bash
mvn verify
```

**Frontend** (depuis `frontend/`) :

```bash
npm ci
ng test       # unitaires (Vitest via Angular CLI)
npm run build
```

Même enchaînement que sur la **CI GitHub Actions** pour garder la même « vérité » locale que sur le dépôt distant.

## Intégration continue

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) exécute sur les branches `main` / `master` et les pull requests :

- **backend** : `mvn -B -ntp verify`
- **frontend** : `npm ci`, `ng test`, `npm run build`

## Structure du dépôt

| Élément | Rôle |
|---------|------|
| `backend/` | API Spring Boot, migrations Flyway, tests JUnit |
| `frontend/` | Application Angular |
| `docker-compose.yml` | Postgres, backend, frontend (build image) |
| `.env.example` | Modèle non secret des variables |
| `.github/workflows/` | Pipeline CI |

---

*Projet développé dans le cadre du titre professionnel CDA (RNCP niv. 6) — ce README sert de base pour documenter l’**installation**, la **configuration**, les **choix techniques** et la **conteneurisation** exigés par la grille d’évaluation.*
