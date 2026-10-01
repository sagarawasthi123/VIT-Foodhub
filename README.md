# VIT-Foodhub

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-v3xevqks)

## CI/CD

VIT-FoodHub uses **Jenkins** for continuous integration. The automated pipeline includes the following stages:

- **Checkout**: Retrieves the source code repository.
- **Install Dependencies**: Installs Node.js dependencies (`npm ci`).
- **Build**: Compiles the TypeScript application and builds production static assets (`npm run build`).
- **Test/Validate**: Executes code linting (`npm run lint`) and TypeScript type checks (`npm run typecheck`).
- **Docker Build**: Builds the production container image tagged as `vit-foodhub:jenkins-%BUILD_NUMBER%`.
