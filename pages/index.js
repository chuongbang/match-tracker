import { useEffect, useState } from 'react'
import Header from '../components/Header'
import PlayerCard from '../components/PlayerCard'
import AddPlayerModal from '../components/AddPlayerModal'
import ReportView from '../components/ReportView'
import PlayersManagement from '../components/PlayersManagement'
import SessionSelector from '../components/SessionSelector'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

function computeTotal(player, serviceFee, perMatchReward) {
  // Master players: no fee. Temp players: add fee
  return player.isMaster 
    ? (player.losses - player.wins) * perMatchReward
    : serviceFee + (player.losses - player.wins) * perMatchReward
}

export default function Home() {
  const [view, setView] = useState('session') // 'session', 'reports', 'players'
  const [players, setPlayers] = useState([])
  const [masterPlayers, setMasterPlayers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [serviceFee, setServiceFee] = useState(0)
  const [perMatchReward, setPerMatchReward] = useState(10)
  const [sessionId, setSessionId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showSessionSelector, setShowSessionSelector] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchMasterPlayers()
  }, [])

  async function fetchMasterPlayers() {
    try {
      if (isSupabaseConfigured()) {
        const { data } = await supabase.from('players').select('*').order('name')
        if (data) {
          setMasterPlayers(data)
          localStorage.setItem('masterPlayers', JSON.stringify(data))
          return
        }
      }
      const raw = localStorage.getItem('masterPlayers')
      if (raw) setMasterPlayers(JSON.parse(raw))
    } catch (e) {
      console.error('Error fetching master players:', e)
    }
  }

  async function initSession(date) {
    try {
      if (isSupabaseConfigured()) {
        const { data: existing } = await supabase
          .from('sessions')
          .select('id, service_fee, per_match_reward')
          .eq('session_date', date)
          .single()

        if (existing) {
          setSessionId(existing.id)
          setServiceFee(existing.service_fee || 0)
          setPerMatchReward(existing.per_match_reward || 10)
          fetchSessionPlayers(existing.id)
          setShowSessionSelector(false)
          return
        }
      }
      
      setShowSessionSelector(true)
    } catch (e) {
      console.error('Error initializing session:', e)
      setShowSessionSelector(true)
    }
  }

  function handleDateChange(date) {
    setSelectedDate(date)
    setPlayers([])
    setSessionId(null)
    setShowSessionSelector(true)
    initSession(date)
  }

  function handleSessionSelect(session) {
    setSessionId(session.id)
    setServiceFee(session.service_fee || 0)
    setPerMatchReward(session.per_match_reward || 10)
    fetchSessionPlayers(session.id)
    setShowSessionSelector(false)
  }

  async function fetchSessionPlayers(sId) {
    try {
      const res = await fetch(`/api/sessions/${sId}/players`)
      const data = await res.json()
      setPlayers(
        data.map(p => ({
          recordId: p.id,  // session_players.id (PK) for PATCH/DELETE
          id: p.player_id,  // for reference to master player
          name: p.player_name,
          wins: p.wins,
          losses: p.losses,
          isMaster: !!p.player_id,  // true if has player_id
        }))
      )
    } catch (e) {
      console.error('Error fetching players:', e)
    }
  }

  useEffect(() => {
    localStorage.setItem('sessionPlayers', JSON.stringify({ players, serviceFee, perMatchReward }))
  }, [players, serviceFee, perMatchReward])

  async function addPlayer(playerData) {
    const newPlayer = { 
      recordId: playerData.recordId || uuidv4(),  // session_players.id will be set by API
      id: playerData.id || uuidv4(), 
      name: playerData.name, 
      wins: 0, 
      losses: 0,
      isMaster: playerData.isMaster || false
    }
    setPlayers(prev => [...prev, newPlayer])
  }

  function updatePlayer(id, changes) {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...changes } : p)))
  }

  function deletePlayer(id) {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  async function updateServiceFee(fee) {
    setServiceFee(fee)
  }

  async function updatePerMatchReward(reward) {
    setPerMatchReward(reward)
  }

  async function saveAll() {
    if (!sessionId || !isSupabaseConfigured()) {
      alert('Cannot save: no session or Supabase not configured')
      return
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceFee,
          perMatchReward,
          players,
        }),
      })

      if (res.ok) {
        alert('✅ Session saved to Supabase!')
      } else {
        alert('❌ Error saving session')
      }
    } catch (e) {
      console.error('Error saving:', e)
      alert('❌ Error: ' + e.message)
    }
  }

  if (!mounted) return null

  if (view === 'reports') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-indigo-700">
        <div className="w-full p-4">
          <button
            onClick={() => setView('session')}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Back to Session
          </button>
          <ReportView />
        </div>
      </div>
    )
  }

  if (view === 'players') {
    return <PlayersManagement onBack={() => { setView('session'); fetchMasterPlayers() }} />
  }

  if (showSessionSelector && view === 'session') {
    return (
      <div className="min-h-screen">
        <div className="w-full">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-semibold">Chọn ngày:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <SessionSelector 
            date={selectedDate} 
            onSelectSession={handleSessionSelect}
            masterPlayers={masterPlayers}
            onSessionCreated={(session) => handleSessionSelect(session)}
          />
        </div>
      </div>
    )
  }

  const totalWins = players.reduce((s, p) => s + p.wins, 0)
  const totalLosses = players.reduce((s, p) => s + p.losses, 0)
  // Only count fee for temp players
  const totalFees = players.filter(p => !p.isMaster).length * serviceFee
  const netBet = players.reduce((s, p) => s + (p.wins - p.losses) * perMatchReward, 0)
  const totalReceivable = players.reduce((s, p) => s + computeTotal(p, serviceFee, perMatchReward), 0)

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <Header
          date={new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          sessionId={sessionId}
          serviceFee={serviceFee}
          perMatchReward={perMatchReward}
          onServiceFeeChange={updateServiceFee}
          onPerMatchChange={updatePerMatchReward}
          onAdd={() => setModalOpen(true)}
          onReports={() => setView('reports')}
          onPlayers={() => setView('players')}
          onChangeDate={() => setShowSessionSelector(true)}
        />

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3 p-2 md:p-4">
          <div className="col-span-1 card text-center p-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">W/L</div>
            <div className="text-lg md:text-2xl font-bold">{totalWins}/{totalLosses}</div>
          </div>
          <div className="col-span-1 card text-center p-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">Net</div>
            <div className="text-lg md:text-2xl font-bold text-green-600">{netBet > 0 ? '+' : ''}{netBet.toFixed(0)}</div>
          </div>
          <div className="col-span-1 card text-center p-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">Fee</div>
            <div className="text-lg md:text-2xl font-bold text-orange-600">{totalFees.toFixed(0)}</div>
          </div>
          <div className="col-span-1 card text-center p-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">Total</div>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{(netBet + totalFees).toFixed(0)}</div>
          </div>
          <div className="col-span-2 md:col-span-2 card text-center p-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">Receivable</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">{totalReceivable.toFixed(0)}</div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {players.length === 0 ? (
            <div className="card text-center text-gray-600 py-8">No players for this date. Click "+" to add!</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {players.map(p => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  serviceFee={serviceFee}
                  perMatchReward={perMatchReward}
                  sessionId={sessionId}
                  onChange={updatePlayer}
                  onDelete={deletePlayer}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPlayerModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onAdd={addPlayer} 
        masterPlayers={masterPlayers}
        sessionId={sessionId}
        serviceFee={serviceFee}
      />
    </div>
  )
}
