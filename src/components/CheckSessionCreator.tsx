import { useState } from 'react';
import type { Player, SkillCheckEvent, CheckSession, CheckItem } from '../types';

interface CheckSessionCreatorProps {
  players: Player[];
  events: SkillCheckEvent[];
  onCreateSession: (session: CheckSession) => void;
}

export function CheckSessionCreator({ players, events, onCreateSession }: CheckSessionCreatorProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [sessionName, setSessionName] = useState('');

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const createSession = () => {
    if (selectedPlayers.length === 0 || selectedEvents.length === 0) {
      alert('请至少选择一个玩家和一个检定事件');
      return;
    }

    const items: CheckItem[] = [];

    selectedPlayers.forEach(playerId => {
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      selectedEvents.forEach(eventId => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const modifier = player.skills[event.skill] || 0;

        items.push({
          id: `${playerId}-${eventId}-${Date.now()}`,
          playerId,
          playerName: player.name,
          eventId,
          eventName: event.name,
          skill: event.skill,
          modifier,
          difficulty: event.difficulty,
          result: 'pending'
        });
      });
    });

    const session: CheckSession = {
      id: Date.now().toString(),
      name: sessionName || `检定会话 ${new Date().toLocaleString()}`,
      items,
      createdAt: new Date()
    };

    onCreateSession(session);

    // 重置选择
    setSelectedPlayers([]);
    setSelectedEvents([]);
    setSessionName('');
  };

  return (
    <div className="check-session-creator">
      <h2>创建检定会话</h2>

      <div className="session-name">
        <input
          type="text"
          placeholder="会话名称 (可选)"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
        />
      </div>

      <div className="selection-section">
        <div className="player-selection">
          <h3>选择玩家</h3>
          {players.length === 0 ? (
            <p className="empty-message">请先添加玩家</p>
          ) : (
            <div className="selection-list">
              {players.map(player => (
                <label key={player.id} className="selection-item">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayerSelection(player.id)}
                  />
                  <span>{player.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="event-selection">
          <h3>选择检定事件</h3>
          {events.length === 0 ? (
            <p className="empty-message">请先添加检定事件</p>
          ) : (
            <div className="selection-list">
              {events.map(event => (
                <label key={event.id} className="selection-item">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => toggleEventSelection(event.id)}
                  />
                  <span>{event.name} ({event.skill}, DC {event.difficulty})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="preview">
        <h3>预览</h3>
        <p>将创建 {selectedPlayers.length} 个玩家 × {selectedEvents.length} 个事件 = {selectedPlayers.length * selectedEvents.length} 个检定项目</p>
      </div>

      <button
        onClick={createSession}
        disabled={selectedPlayers.length === 0 || selectedEvents.length === 0}
        className="create-session-btn"
      >
        创建检定会话
      </button>
    </div>
  );
}
