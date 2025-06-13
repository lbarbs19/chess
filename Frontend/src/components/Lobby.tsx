import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import './Lobby.css';
import TeamCard from './TeamCard';

const TEAM_SIZE = 17;
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
    const baseName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    const fullName = baseName + randomNum;
    
    // Limit to 12 characters
    name = fullName.length > 12 ? fullName.substring(0, 12) : fullName;
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
    <div className="lobby-root">      <div className="lobby-header">
        <h1>Are you ready?</h1>
        <div className="lobby-code">Lobby Code: <span style={{ fontFamily: 'monospace', fontSize: '2rem' }}>{code}</span></div>
      </div>
      <div className="lobby-main">
        <TeamCard
          teamName="Team 1"
          players={team1}
          captain={captain1}
          onAdd={() => addUser(1)}
          onRemove={() => removeUser(1)}
          disabledRemove={team1.length === 0}
        />        <div className="vs-center">
          <div className="vs-logo">VS</div>
          <button className="designate-captain-btn" onClick={() => designateCaptain(2)} disabled={team2.length === 0}>Designate Team 2 Captain</button>
        </div>
        <TeamCard
          teamName="Team 2"
          players={team2}
          captain={captain2}
          onAdd={() => addUser(2)}
          onRemove={() => removeUser(2)}
          disabledRemove={team2.length === 0}
        />
      </div>
      <div className="lobby-footer">
        <span>{team1.length + team2.length} / {TOTAL_PLAYERS} players joined</span>
      </div>
    </div>
  );
};

export default Lobby;
