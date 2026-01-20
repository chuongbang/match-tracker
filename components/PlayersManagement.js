import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function PlayersManagement({ onBack }) {
  const [masterPlayers, setMasterPlayers] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMasterPlayers()
  }, [])

  async function fetchMasterPlayers() {
    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('players').select('*').order('name')
        if (!error) {
          setMasterPlayers(data || [])
          return
        }
      }
      // Fallback to localStorage
      const raw = localStorage.getItem('masterPlayers')
      if (raw) setMasterPlayers(JSON.parse(raw))
    } catch (e) {
      console.error('Error fetching players:', e)
    } finally {
      setLoading(false)
    }
  }

  async function addPlayer() {
    if (!newName.trim()) return

    const newPlayer = { id: uuidv4(), name: newName }
    setMasterPlayers(prev => [...prev, newPlayer])

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('players').insert([{ id: newPlayer.id, name: newName }])
      } catch (e) {
        console.error('Error adding player:', e)
      }
    }

    // Save to localStorage
    localStorage.setItem('masterPlayers', JSON.stringify([...masterPlayers, newPlayer]))
    setNewName('')
  }

  async function deletePlayer(id) {
    setMasterPlayers(prev => prev.filter(p => p.id !== id))

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('players').delete().eq('id', id)
      } catch (e) {
        console.error('Error deleting player:', e)
      }
    }

    const updated = masterPlayers.filter(p => p.id !== id)
    localStorage.setItem('masterPlayers', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-indigo-700 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back
        </button>

        <div className="bg-white rounded p-6">
          <h2 className="text-2xl font-bold mb-4">Master Player List</h2>

          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              placeholder="Enter player name"
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={addPlayer}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : masterPlayers.length === 0 ? (
            <p className="text-gray-500">No players yet. Add one above!</p>
          ) : (
            <div className="space-y-2">
              {masterPlayers.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                  <span className="font-medium">{p.name}</span>
                  <button
                    onClick={() => deletePlayer(p.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
