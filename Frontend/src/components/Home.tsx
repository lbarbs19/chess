import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css";
import HelpWidget from './HelpWidget';

function generateLobbyCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [createHover, setCreateHover] = useState(false);
  const [joinHover, setJoinHover] = useState(false);

  const handleCreateLobby = () => {
    const code = generateLobbyCode();
    navigate(`/lobby/${code}`);
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length > 0) {
      navigate(`/lobby/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="pawnstars-home-bg">
      <HelpWidget />
      <div className="pawnstars-home-card">
        <h1 className="pawnstars-title">Pawn Stars</h1>
        <p className="pawnstars-desc">
          Play chess as a team - Create a lobby to captain a team, or join the battle as your own piece.
        </p>
        <motion.button
          className="pawnstars-btn"
          onClick={handleCreateLobby}
          onMouseEnter={() => setCreateHover(true)}
          onMouseLeave={() => setCreateHover(false)}
          whileHover={{ scale: 1.09, boxShadow: "0 6px 24px #2dceef88", rotate: -2 }}
          whileTap={{ scale: 0.97, rotate: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          Create Lobby
        </motion.button>
        <form onSubmit={handleJoinLobby} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <input
            type="text"
            placeholder="Enter Lobby Code"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            className="pawnstars-input"
            maxLength={6}
            autoFocus
          />
          <motion.button
            type="submit"
            className="pawnstars-btn"
            style={{ margin: 0 }}
            onMouseEnter={() => setJoinHover(true)}
            onMouseLeave={() => setJoinHover(false)}
            whileHover={{ scale: 1.09, boxShadow: "0 6px 24px #5ecb8c88", rotate: 2 }}
            whileTap={{ scale: 0.97, rotate: -1 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
          >
            Join Lobby
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Home;
