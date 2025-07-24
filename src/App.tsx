import { useState } from 'react'
import './App.css'
import type { Player, SkillCheckEvent, CheckSession } from './types'
import { PlayerManager } from './components/PlayerManager'
import { EventManager } from './components/EventManager'
import { CheckSessionCreator } from './components/CheckSessionCreator'
import { CheckSessionManager } from './components/CheckSessionManager'

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<SkillCheckEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<CheckSession | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'session'>('setup');

  const handleCreateSession = (session: CheckSession) => {
    setCurrentSession(session);
    setActiveTab('session');
  };

  const handleUpdateSession = (session: CheckSession) => {
    setCurrentSession(session);
  };

  const handleCloseSession = () => {
    setCurrentSession(null);
    setActiveTab('setup');
  };

  return (
    <div className="app">
      <header>
        <h1>D&D 5e 技能检定计算器</h1>
        <nav className="tab-nav">
          <button
            className={activeTab === 'setup' ? 'active' : ''}
            onClick={() => setActiveTab('setup')}
          >
            设置
          </button>
          <button
            className={activeTab === 'session' ? 'active' : ''}
            onClick={() => setActiveTab('session')}
            disabled={!currentSession}
          >
            检定会话
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'setup' ? (
          <div className="setup-tab">
            <div className="setup-grid">
              <PlayerManager
                players={players}
                onPlayersChange={setPlayers}
              />
              <EventManager
                events={events}
                onEventsChange={setEvents}
              />
            </div>
            <CheckSessionCreator
              players={players}
              events={events}
              onCreateSession={handleCreateSession}
            />
          </div>
        ) : (
          <CheckSessionManager
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            onCloseSession={handleCloseSession}
          />
        )}
      </main>
    </div>
  )
}

export default App
