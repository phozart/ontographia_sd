# Systems Thinking Studio

A free, browser-based tool for creating Causal Loop Diagrams (CLDs) and system dynamics models.

## Features

- **Causal Loop Diagrams** - Create variables and connections with positive/negative polarity
- **Stock & Flow Diagrams** - Model accumulations with stocks, flows, converters, and clouds
- **Feedback Loops** - Mark reinforcing (R) and balancing (B) loops
- **Delay Markers** - Indicate time delays in causal relationships
- **Export** - Save diagrams as PNG, SVG, or JSON
- **Local Storage** - All data stays in your browser

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker

```bash
# Build and run
docker-compose up --build

# Or run directly
docker build -t sd-studio .
docker run -p 3000:3000 sd-studio
```

## Tech Stack

- Next.js 16
- React 19
- Pure SVG canvas (no external diagram libraries)
- Material UI Icons

## License

MIT License - see [LICENSE](LICENSE)
