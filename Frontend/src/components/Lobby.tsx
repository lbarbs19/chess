import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import './Lobby.css';

const TEAM_SIZE = 16;
const TOTAL_PLAYERS = 34;
const RANDOM_NAMES = [
  'ChessChad', 'PawnStar', 'QueenBee', 'KnightRider', 'BishopBasher', 'RookRoller',
  'KingPin', 'Checkmate', 'EnPassant', 'Castler', 'BlitzMaster', 'EndgamePro',
  'ForkLord', 'PinWizard', 'Zugzwang', 'GambitGuru', 'TempoTactician', 'FileFiend',
  'RankRuler', 'DiagonalDuke', 'CenterKing', 'EdgeLord', 'Promotionist', 'Swindler',
  'SacrificeSam', 'TrapQueen', 'OpeningOgre', 'MiddlegameMike', 'EndgameEve', 'PawnStorm',
  'BackRanker', 'DoubleCheck', 'Stalemate', 'DrawDude', 'Resigner'
];

function getRandomName(used: string[]) {
  let name;
  do {
    name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + Math.floor(Math.random() * 1000);
  } while (used.includes(name));
  return name;
}

const Lobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [captain1, setCaptain1] = useState<string | null>(null);
  const [captain2, setCaptain2] = useState<string | null>(null);

  // Dummy: whoever creates lobby is captain1, can designate captain2
  function addUser(team: 1 | 2) {
    const used = [...team1, ...team2];
    const name = getRandomName(used);
    if (team === 1 && team1.length < TEAM_SIZE) setTeam1([...team1, name]);
    if (team === 2 && team2.length < TEAM_SIZE) setTeam2([...team2, name]);
    if (team === 1 && team1.length === 0) setCaptain1(name);
    if (team === 2 && team2.length === 0) setCaptain2(name);
  }
  function removeUser(team: 1 | 2) {
    if (team === 1 && team1.length > 0) {
      const removed = team1[team1.length - 1];
      setTeam1(team1.slice(0, -1));
      if (captain1 === removed) setCaptain1(team1.length > 1 ? team1[0] : null);
    }
    if (team === 2 && team2.length > 0) {
      const removed = team2[team2.length - 1];
      setTeam2(team2.slice(0, -1));
      if (captain2 === removed) setCaptain2(team2.length > 1 ? team2[0] : null);
    }
  }
  function designateCaptain(team: 2) {
    if (team2.length > 0) setCaptain2(team2[0]);
  }

  return (
    <div className="lobby-root">
      <div className="lobby-header">
        <h1>Lobby</h1>
        <div className="lobby-code">Lobby Code: <span style={{ fontFamily: 'monospace', fontSize: '2rem' }}>{code}</span></div>
      </div>
      <div className="lobby-main">
        <div className="team-card">
          <div className="team-title">Team 1</div>
          <div className="team-list-scroll">
            {Array.from({ length: TEAM_SIZE }).map((_, i) => (
              <div className={`player-slot${team1[i] ? ' filled' : ''}${team1[i] === captain1 ? ' captain' : ''}`} key={i}>
                <div className="avatar-circle">{team1[i] ? team1[i][0].toUpperCase() : '?'}</div>
                <div className="player-name">
                  {team1[i] || <span className="empty-slot">Empty Slot</span>}
                  {team1[i] === captain1 && <span className="captain-badge">★ Captain</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="team-actions">
            <button onClick={() => addUser(1)}>Add Random User</button>
            <button onClick={() => removeUser(1)} disabled={team1.length === 0}>Remove User</button>
          </div>
        </div>
        <div className="vs-center">
          <div className="vs-logo">VS</div>
          <button className="designate-captain-btn" onClick={() => designateCaptain(2)} disabled={team2.length === 0}>Designate Team 2 Captain</button>
        </div>
        <div className="team-card">
          <div className="team-title">Team 2</div>
          <div className="team-list-scroll">
            {Array.from({ length: TEAM_SIZE }).map((_, i) => (
              <div className={`player-slot${team2[i] ? ' filled' : ''}${team2[i] === captain2 ? ' captain' : ''}`} key={i}>
                <div className="avatar-circle">{team2[i] ? team2[i][0].toUpperCase() : '?'}</div>
                <div className="player-name">
                  {team2[i] || <span className="empty-slot">Empty Slot</span>}
                  {team2[i] === captain2 && <span className="captain-badge">★ Captain</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="team-actions">
            <button onClick={() => addUser(2)}>Add Random User</button>
            <button onClick={() => removeUser(2)} disabled={team2.length === 0}>Remove User</button>
          </div>
        </div>
      </div>
      <div className="lobby-footer">
        <span>{team1.length + team2.length} / {TOTAL_PLAYERS} players joined</span>
      </div>
    </div>
  );
};

export default Lobby;
