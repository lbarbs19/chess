import React from 'react';

interface TeamCardProps {
  teamName: string;
  players: string[];
  captain: string | null;
  onAdd: () => void;
  onRemove: () => void;
  disabledRemove: boolean;
}

const TEAM_SIZE = 16;

const TeamCard: React.FC<TeamCardProps> = ({ teamName, players, captain, onAdd, onRemove, disabledRemove }) => (
  <div className="team-card">
    <div className="team-title">{teamName}</div>
    <div className="team-list-scroll">
      {Array.from({ length: TEAM_SIZE }).map((_, i) => (
        <div className={`player-slot${players[i] ? ' filled' : ''}${players[i] === captain ? ' captain' : ''}`} key={i}>
          <div className="avatar-circle">{players[i] ? players[i][0].toUpperCase() : '?'}</div>
          <div className="player-name">
            {players[i] || <span className="empty-slot">Empty Slot</span>}
            {players[i] === captain && <span className="captain-badge">★ Captain</span>}
          </div>
        </div>
      ))}
    </div>
    <div className="team-actions">
      <button onClick={onAdd}>Add Random User</button>
      <button onClick={onRemove} disabled={disabledRemove}>Remove User</button>
    </div>
  </div>
);

export default TeamCard;
