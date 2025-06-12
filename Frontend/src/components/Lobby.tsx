import React from "react";
import { useParams } from "react-router-dom";

// Simulated player list for now
const simulatedPlayers = [
  { name: "Captain" },
  { name: "Player1" },
  { name: "Player2" },
];

const Lobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h2>Lobby Code: <span style={{ fontFamily: 'monospace', fontSize: '2rem' }}>{code}</span></h2>
      <h3>Players:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {simulatedPlayers.map((player, idx) => (
          <li key={idx} style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{player.name}</li>
        ))}
      </ul>
      <p style={{ marginTop: '2rem', color: '#888' }}>(Waiting for more players to join...)</p>
    </div>
  );
};

export default Lobby;
