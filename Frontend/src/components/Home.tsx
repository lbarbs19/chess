import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>Pawn Stars</h1>
      <button onClick={handleCreateLobby} style={{ margin: "1rem", padding: "1rem 2rem", fontSize: "1.2rem" }}>Create Lobby</button>
      <form onSubmit={handleJoinLobby} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Enter Lobby Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem", marginBottom: "0.5rem", textTransform: "uppercase" }}
          maxLength={6}
        />
        <button type="submit" style={{ padding: "0.5rem 1.5rem", fontSize: "1rem" }}>Join Lobby</button>
      </form>
      <Link to="/chess" style={{ marginTop: '2rem', fontSize: '1.1rem', color: '#5ecb8c', textDecoration: 'underline', fontWeight: 600 }}>
        Go to Classic Chess App
      </Link>
    </div>
  );
};

export default Home;
