import { useState } from 'react';
import type { SkillCheckEvent } from '../types';

interface EventManagerProps {
  events: SkillCheckEvent[];
  onEventsChange: (events: SkillCheckEvent[]) => void;
}

const DND_SKILLS = [
  'Athletics', 'Acrobatics', 'Sleight of Hand', 'Stealth',
  'Arcana', 'History', 'Investigation', 'Nature', 'Religion',
  'Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival',
  'Deception', 'Intimidation', 'Performance', 'Persuasion'
];

export function EventManager({ events, onEventsChange }: EventManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<SkillCheckEvent>>({
    name: '',
    skill: DND_SKILLS[0],
    difficulty: 10,
    description: ''
  });

  const addEvent = () => {
    if (!newEvent.name || !newEvent.skill) return;

    const event: SkillCheckEvent = {
      id: Date.now().toString(),
      name: newEvent.name,
      skill: newEvent.skill,
      difficulty: newEvent.difficulty || 10,
      description: newEvent.description
    };

    onEventsChange([...events, event]);
    setNewEvent({ name: '', skill: DND_SKILLS[0], difficulty: 10, description: '' });
    setIsAdding(false);
  };

  const startEdit = (event: SkillCheckEvent) => {
    setEditingId(event.id);
    setNewEvent({
      name: event.name,
      skill: event.skill,
      difficulty: event.difficulty,
      description: event.description
    });
  };

  const saveEdit = () => {
    if (!newEvent.name || !newEvent.skill || !editingId) return;

    const updatedEvents = events.map(event =>
      event.id === editingId
        ? {
            ...event,
            name: newEvent.name!,
            skill: newEvent.skill!,
            difficulty: newEvent.difficulty || 10,
            description: newEvent.description || ''
          }
        : event
    );

    onEventsChange(updatedEvents);
    setEditingId(null);
    setNewEvent({ name: '', skill: DND_SKILLS[0], difficulty: 10, description: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewEvent({ name: '', skill: DND_SKILLS[0], difficulty: 10, description: '' });
  };

  const removeEvent = (id: string) => {
    onEventsChange(events.filter(e => e.id !== id));
  };

  return (
    <div className="event-manager">
      <h2>技能检定事件</h2>

      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-card">
            {editingId === event.id ? (
              <div className="edit-event-form">
                <input
                  type="text"
                  placeholder="事件名称"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                />

                <select
                  value={newEvent.skill}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, skill: e.target.value }))}
                >
                  {DND_SKILLS.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="难度值 (DC)"
                  value={newEvent.difficulty}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, difficulty: parseInt(e.target.value) || 10 }))}
                />

                <textarea
                  placeholder="描述 (可选)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />

                <div className="form-actions">
                  <button onClick={saveEdit} className="save-btn">保存</button>
                  <button onClick={cancelEdit} className="cancel-btn">取消</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{event.name}</h3>
                <div className="event-details">
                  <span className="skill">技能: {event.skill}</span>
                  <span className="difficulty">DC: {event.difficulty}</span>
                </div>
                {event.description && (
                  <p className="description">{event.description}</p>
                )}
                <div className="card-actions">
                  <button onClick={() => startEdit(event)} className="edit-btn">
                    编辑
                  </button>
                  <button onClick={() => removeEvent(event.id)} className="remove-btn">
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
          添加检定事件
        </button>
      ) : isAdding ? (
        <div className="add-event-form">
          <input
            type="text"
            placeholder="事件名称"
            value={newEvent.name}
            onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
          />

          <select
            value={newEvent.skill}
            onChange={(e) => setNewEvent(prev => ({ ...prev, skill: e.target.value }))}
          >
            {DND_SKILLS.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="难度值 (DC)"
            value={newEvent.difficulty}
            onChange={(e) => setNewEvent(prev => ({ ...prev, difficulty: parseInt(e.target.value) || 10 }))}
          />

          <textarea
            placeholder="描述 (可选)"
            value={newEvent.description}
            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
          />

          <div className="form-actions">
            <button onClick={addEvent} className="save-btn">保存</button>
            <button onClick={() => setIsAdding(false)} className="cancel-btn">取消</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
