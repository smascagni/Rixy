# Rixy — Premium Multi-Calculator Suite

A sleek, modern web app providing a home for multiple precision calculators. Built with React, Vite, and Tailwind CSS v4.

## Calculators

| Calculator | Status | Description |
|---|---|---|
| **Chemical Mixing Ratio** | ✅ Active | Calculate dilution volumes for any ratio across metric and imperial units |
| **EV vs Gas Range** | ✅ Active | Compare driving range and annual cost between gasoline and electric vehicles |
| **Unit Converter** | 🔜 Coming Soon | Advanced dilution ratio and fluid unit conversions |

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Container**: nginx:stable-alpine-slim (multi-stage build)

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Docker
The image is published to the GitHub Container Registry:

```bash
docker pull ghcr.io/smascagni/rixy:latest
docker run -p 8080:80 ghcr.io/smascagni/rixy:latest
```

Then open [http://localhost:8080](http://localhost:8080).

### Building from source

Uses a two-stage build: `node:20-alpine` to compile the app, then `nginx:stable-alpine-slim` to serve the static output — producing the smallest possible final image.

```bash
docker build -t rixy .
docker run -p 8080:80 rixy
```
