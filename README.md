# VibeChess

A modern React + Vite chess application featuring multiple game modes:

- **Classic Chess**: Interactive chessboard with move history navigation
- **Pawn Stars Mode**: Collaborative chess for streamers and viewers
- Stockfish engine integration (runs in-browser via Web Worker)
- Evaluation bar and best move arrows
- Play against the computer (CPU mode)
- Floating Spotify music player widget
- Responsive design and sidebar navigation

## Pawn Stars Game Mode

**Pawn Stars** is a collaborative chess mode designed for streamers and their audiences:

### How It Works

#### Captain Mode

1. **Two Captains** (typically streamers) face off - one controls White, one controls Black
2. **Viewers join** the game room using a room code
3. **Each viewer is randomly assigned** to control a specific piece (pawn, rook, knight, etc.)
4. **On each turn**, the captain chooses which piece will move
5. **The player controlling that piece** decides where it moves (must be a legal chess move)
6. **When a piece is captured**, that player is out of the game
7. **Game continues** until checkmate, stalemate, or draw

#### No-Captain Mode

1. **Players join** the game room using a room code
2. **Each player is randomly assigned** to control a specific piece
3. **On each turn**, a random piece that can make a legal move is automatically selected
4. **The player controlling that piece** has 10 seconds to decide where it moves
5. **If time expires**, a random legal move is made automatically
6. **When a piece is captured**, that player is out of the game

### Game Settings

- **Move Timer**: Default 10 seconds (configurable in game settings)
- **Game Mode**: Captain mode or No-Captain mode
- **Room Size**: Maximum number of players (up to 32 pieces)

### Rules

- Only legal chess moves are allowed
- Players can only move their assigned piece when selected
- **Captain Mode**: Captains choose which piece moves, cannot override the player's move choice
- **No-Captain Mode**: Random piece selection with 10-second move timer
- Chat is available for coordination and strategy discussion
- Game follows standard chess rules for win/draw conditions
- If move timer expires, a random legal move is automatically made

### Roles

- **Captain**: Chooses which piece moves each turn, leads team strategy
- **Player**: Controls a specific piece, decides its movement when selected
- **Spectator**: Watches the game, can participate in chat

This mode creates engaging content for streams while giving viewers direct participation in the game outcome.

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
