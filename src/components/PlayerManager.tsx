import { useState } from 'react';
import type { Player } from '../types';

interface PlayerManagerProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
}

const DND_SKILLS = [
  'Athletics', 'Acrobatics', 'Sleight of Hand', 'Stealth',
  'Arcana', 'History', 'Investigation', 'Nature', 'Religion',
  'Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival',
  'Deception', 'Intimidation', 'Performance', 'Persuasion'
];

export function PlayerManager({ players, onPlayersChange }: PlayerManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: '',
    skills: {}
  });

  const addPlayer = () => {
    if (!newPlayer.name) return;

    const player: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      skills: newPlayer.skills || {}
    };

    onPlayersChange([...players, player]);
    setNewPlayer({ name: '', skills: {} });
    setIsAdding(false);
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setNewPlayer({
      name: player.name,
      skills: { ...player.skills }
    });
  };

  const saveEdit = () => {
    if (!newPlayer.name || !editingId) return;

    const updatedPlayers = players.map(player =>
      player.id === editingId
        ? {
            ...player,
            name: newPlayer.name!,
            skills: newPlayer.skills || {}
          }
        : player
    );

    onPlayersChange(updatedPlayers);
    setEditingId(null);
    setNewPlayer({ name: '', skills: {} });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPlayer({ name: '', skills: {} });
  };

  const removePlayer = (id: string) => {
    onPlayersChange(players.filter(p => p.id !== id));
  };

  const updateSkillModifier = (skill: string, value: string) => {
    const modifier = parseInt(value) || 0;
    setNewPlayer(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: modifier }
    }));
  };

  return (
    <div className="player-manager">
      <h2>玩家管理</h2>

      <div className="players-list">
        {players.map(player => (
          <div key={player.id} className="player-card">
            {editingId === player.id ? (
              <div className="edit-player-form">
                <input
                  type="text"
                  placeholder="玩家姓名"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                />

                <div className="skills-form">
                  <h4>技能修正值</h4>
                  <div className="skills-grid">
                    {DND_SKILLS.map(skill => (
                      <div key={skill} className="skill-input">
                        <label>{skill}</label>
                        <input
                          type="number"
                          value={newPlayer.skills?.[skill] || ''}
                          onChange={(e) => updateSkillModifier(skill, e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={saveEdit} className="save-btn">保存</button>
                  <button onClick={cancelEdit} className="cancel-btn">取消</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{player.name}</h3>
                <div className="skills-display">
                  {Object.entries(player.skills).map(([skill, modifier]) => (
                    <span key={skill} className="skill-tag">
                      {skill}: {modifier >= 0 ? '+' : ''}{modifier}
                    </span>
                  ))}
                </div>
                <div className="card-actions">
                  <button onClick={() => startEdit(player)} className="edit-btn">
                    编辑
                  </button>
                  <button onClick={() => removePlayer(player.id)} className="remove-btn">
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!isAdding && !editingId ? (
        <button onClick={() => setIsAdding(true)} className="add-btn">
          添加玩家
        </button>
      ) : isAdding ? (
        <div className="add-player-form">
          <input
            type="text"
            placeholder="玩家姓名"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
          />

          <div className="skills-form">
            <h4>技能修正值</h4>
            <div className="skills-grid">
              {DND_SKILLS.map(skill => (
                <div key={skill} className="skill-input">
                  <label>{skill}</label>
                  <input
                    type="number"
                    value={newPlayer.skills?.[skill] || ''}
                    onChange={(e) => updateSkillModifier(skill, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={addPlayer} className="save-btn">保存</button>
            <button onClick={() => setIsAdding(false)} className="cancel-btn">取消</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
