# Luke's Chess Frontend

This is a modern React + Vite chess frontend featuring:

- Interactive chessboard with move history navigation
- Stockfish engine integration (runs in-browser via Web Worker)
- Evaluation bar and best move arrows
- Play against the computer (CPU mode)
- Floating Spotify music player widget
- Responsive design and sidebar navigation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Install dependencies

```sh
npm install
```

### Run the development server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```sh
npm run build
```

### Lint the code

```sh
npm run lint
```

## Features

- **Chessboard**: Drag and drop pieces, supports move/capture sounds.
- **Engine Analysis**: Uses Stockfish for evaluation and best move suggestions.
- **Eval Bar**: Visualizes the current evaluation.
- **Move Navigation**: Step through move history.
- **CPU Mode**: Play against Stockfish as Black.
- **Music Player**: Connect your Spotify account and control playback.
- **Sidebar**: Quick navigation and user avatar.

## Stockfish Integration

The Stockfish engine runs as a Web Worker from `public/stockfish.js`. Make sure the file is present and accessible.

## Customization

- Update the Spotify client ID in `src/components/FloatingMusicPlayer.jsx` to enable Spotify integration.
- Tweak board and UI styles in the React components and CSS files.

## License

This project is for educational and personal use.
