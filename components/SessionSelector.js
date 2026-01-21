import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, formatDate } from '../lib/supabase'

export default function SessionSelector({ date, onSelectSession, onSessionCreated }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [newSessionFee, setNewSessionFee] = useState('0')
  const [newSessionReward, setNewSessionReward] = useState('20')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (date) {
      fetchSessions(date)
    }
  }, [date])

  async function fetchSessions(date) {
    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('sessions')
          .select('id, name, session_date, service_fee, per_match_reward')
          .eq('session_date', date)
          .order('created_at', { ascending: false })

        setSessions(data || [])
      }
    } catch (e) {
      console.error('Error fetching sessions:', e)
    } finally {
      setLoading(false)
    }
  }

  async function createSession(e) {
    e.preventDefault()
    if (!newSessionName.trim()) {
      alert('Vui lòng nhập tên buổi')
      return
    }

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          name: newSessionName,
          session_date: date,
          service_fee: Number(newSessionFee),
          per_match_reward: Number(newSessionReward),
        }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        console.log('✅ Session created:', data)
        setSessions(prev => [data, ...prev])
        setNewSessionName('')
        setNewSessionFee('0')
        setNewSessionReward('10')
        setShowNewForm(false)
        
        // Trigger both callbacks
        if (onSelectSession) onSelectSession(data)
        if (onSessionCreated) onSessionCreated(data)
      }
    } catch (e) {
      console.error('❌ Error creating session:', e)
      alert('❌ Lỗi: ' + e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Sessions for {formatDate(date)}</h3>
        <button
          onClick={() => {
            // Auto-fill session name with date format
            const formatted = formatDate(date)
            setNewSessionName(`Buổi ${formatted}`)
            setShowNewForm(!showNewForm)
          }}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
        >
          + New Session
        </button>
      </div>

      {showNewForm && (
        <form onSubmit={createSession} className="border rounded p-3 mb-3 bg-gray-50">
          <input
            type="text"
            placeholder="Session name (e.g., Badminton 20/1)"
            value={newSessionName}
            onChange={e => setNewSessionName(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Service Fee"
              value={newSessionFee}
              onChange={e => setNewSessionFee(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Per Match Reward"
              value={newSessionReward}
              onChange={e => setNewSessionReward(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={creating}
              className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="flex-1 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No sessions for this date</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s)}
              className="w-full text-left p-3 border rounded hover:bg-blue-50 hover:border-blue-500 transition"
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-600">Fee: {s.service_fee} • Per Match: {s.per_match_reward}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
