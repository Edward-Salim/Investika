# Investika: Commit Guidelines

To maintain a clean and readable project history, we use **Conventional Commits**. This allows us to automatically generate changelogs and manage versions.

## Format
`<type>[optional scope]: <description>`

## Common Types
- **feat**: A new feature for the user, not a new feature for builds.
- **fix**: A bug fix for the user, not a fix to a build script.
- **docs**: Changes to the documentation.
- **style**: Formatting, missing semi colons, etc; no production code change.
- **refactor**: Refactoring production code, eg. renaming a variable.
- **test**: Adding missing tests, refactoring tests; no production code change.
- **chore**: Updating grunt tasks etc; no production code change.
- **perf**: A code change that improves performance.
- **ci**: Changes to CI configuration files and scripts.
- **build**: Changes that affect the build system or external dependencies.

## Examples
- `feat: add AI concierge chat interface`
- `fix: resolve responsive layout issue on mobile`
- `docs: update setup instructions in README`
- `chore: add paraglide-js for i18n support`

---
*Note: Always use lowercase for the type and description. Keep the description concise.*

## Development Focus (Current Phase)
- **Frontend Prototype First**: Focus strictly on hardcoded frontend prototypes and UI/UX design.
- **No Backend Logic**: Do not implement or modify backend logic, database schemas, or API endpoints for now.
- **Design Aspect**: The current priority is the design aspect and visual excellence. Hardcode all data and interactions until the design is finalized.
