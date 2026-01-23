import { useState, useEffect } from 'react'

const checkboxStyle = {
  width: '20px',
  height: '20px',
  minWidth: '20px',
  minHeight: '20px',
  cursor: 'pointer',
  accentColor: '#22c55e',
  WebkitAppearance: 'checkbox',
  appearance: 'checkbox',
}

export default function AddPlayerModal({ open, onClose, onAdd, masterPlayers, sessionId, serviceFee }) {
  const [selectedIds, setSelectedIds] = useState([]) // Multiple selection for master
  const [tempName, setTempName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedIds([])
      setTempName('')
    }
  }, [open])

  if (!open) return null

  function toggleSelection(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function submit(e) {
    e.preventDefault()

    let hasAdded = false
    let tempName_ = tempName.trim()
    let selectedIds_ = [...selectedIds]

    if (!tempName_ && selectedIds_.length === 0) {
      alert('Please enter a temporary name or select master players')
      return
    }

    // Save to Supabase if sessionId provided
    if (sessionId) {
      saveToSupabase(tempName_, selectedIds_)
    }

    setSelectedIds([])
    setTempName('')
    onClose()
  }

  async function saveToSupabase(tempName, playerIds) {
    setAdding(true)
    try {
      // Add temporary player with name
      if (tempName) {
        const res = await fetch(`/api/sessions/${sessionId}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            playerName: tempName, 
            fee: serviceFee 
          }),
        })
        const data = await res.json()
        if (data.id) {
          console.log('✅ Temp player added:', data)
          onAdd({ 
            recordId: data.id,
            id: null,
            name: tempName, 
            fee: serviceFee,
            isMaster: false,
            wins: 0,
            losses: 0,
            paid: false
          })
        }
      }

      // Add selected master players
      for (const playerId of playerIds) {
        const res = await fetch(`/api/sessions/${sessionId}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            playerId, 
            fee: serviceFee 
          }),
        })
        const data = await res.json()
        if (data.id) {
          const player = masterPlayers.find(p => p.id === playerId)
          console.log('✅ Master player added:', data)
          onAdd({
            recordId: data.id,
            id: playerId,
            name: player?.name,
            fee: 0,  // Master players don't have fee
            isMaster: true,
            wins: 0,
            losses: 0,
            paid: false
          })
        }
      }
      
      console.log('✅ All players added to session')
    } catch (e) {
      console.error('❌ Error saving to Supabase:', e)
      alert('Error adding players: ' + e.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <form onSubmit={submit} className="bg-white rounded p-6 w-96 max-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Players</h3>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>

        {/* Add Temporary - Top */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Add Temporary Player</label>
          <input
            type="text"
            placeholder="Enter player name (optional)"
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Divider */}
        <div className="border-t my-3"></div>

        {/* Select Master Players - Bottom */}
        <div className="flex-1 overflow-hidden flex flex-col mb-4 min-h-0">
          <label className="block text-sm font-medium mb-2">Select Master Players</label>
          <div className="border rounded p-3 overflow-y-auto flex-1">
            {masterPlayers.length === 0 ? (
              <p className="text-gray-500 text-sm">No master players available. Add some first!</p>
            ) : (
              <div className="space-y-2">
                {masterPlayers.map(p => (
                  <div key={p.id} className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded">
                    <input
                      id={`player_${p.id}`}
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelection(p.id)}
                      style={checkboxStyle}
                    />
                    <label 
                      htmlFor={`player_${p.id}`}
                      className="flex-1 cursor-pointer text-sm md:text-base"
                    >
                      {p.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button type="submit" disabled={adding} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
            {adding ? 'Adding...' : `Add (${tempName.trim() ? '1' : '0'} + ${selectedIds.length})`}
          </button>
        </div>
      </form>
    </div>
  )
}
