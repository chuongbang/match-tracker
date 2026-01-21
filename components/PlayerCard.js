import { useState } from 'react'

export default function PlayerCard({ player, serviceFee, perMatchReward, onChange, onDelete, sessionId }) {
  const [syncing, setSyncing] = useState(false)
  const [editingWins, setEditingWins] = useState(false)
  const [editingLosses, setEditingLosses] = useState(false)
  const [editingFee, setEditingFee] = useState(false)
  const [winsInput, setWinsInput] = useState(player.wins)
  const [lossesInput, setLossesInput] = useState(player.losses)
  const [feeInput, setFeeInput] = useState(player.fee || 0)
  
  // Master players: no fee. Temp players: use their individual fee
  const playerFee = player.isMaster ? 0 : (player.fee || 0)
  const total = player.isMaster 
    ? (player.losses - player.wins) * perMatchReward
    : playerFee + (player.losses - player.wins) * perMatchReward

  const handleWin = async () => {
    const newWins = player.wins + 1
    onChange(player.recordId, { wins: newWins })

    // Sync to Supabase if sessionId provided
    if (sessionId) {
      setSyncing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/players/${player.recordId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'win' }),
        })
      } catch (e) {
        console.error('Error syncing win:', e)
      } finally {
        setSyncing(false)
      }
    }
  }

  const handleLoss = async () => {
    const newLosses = player.losses + 1
    onChange(player.recordId, { losses: newLosses })

    // Sync to Supabase if sessionId provided
    if (sessionId) {
      setSyncing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/players/${player.recordId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'loss' }),
        })
      } catch (e) {
        console.error('Error syncing loss:', e)
      } finally {
        setSyncing(false)
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${player.name}?`)) return
    
    // Delete from UI
    onDelete(player.id)

    // Delete from Supabase if sessionId provided
    if (sessionId) {
      try {
        await fetch(`/api/sessions/${sessionId}/players/${player.recordId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
        console.log('✅ Player deleted from session')
      } catch (e) {
        console.error('Error deleting player:', e)
      }
    }
  }

  const handleWinsEdit = async () => {
    const newWins = Number(winsInput)
    if (isNaN(newWins) || newWins < 0) {
      alert('Invalid number')
      return
    }

    onChange(player.recordId, { wins: newWins })
    setEditingWins(false)

    // Sync to Supabase
    if (sessionId) {
      setSyncing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/players/${player.recordId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_wins', value: newWins }),
        })
        console.log('✅ Wins updated')
      } catch (e) {
        console.error('Error updating wins:', e)
      } finally {
        setSyncing(false)
      }
    }
  }

  const handleLossesEdit = async () => {
    const newLosses = Number(lossesInput)
    if (isNaN(newLosses) || newLosses < 0) {
      alert('Invalid number')
      return
    }

    onChange(player.recordId, { losses: newLosses })
    setEditingLosses(false)

    // Sync to Supabase
    if (sessionId) {
      setSyncing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/players/${player.recordId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_losses', value: newLosses }),
        })
        console.log('✅ Losses updated')
      } catch (e) {
        console.error('Error updating losses:', e)
      } finally {
        setSyncing(false)
      }
    }
  }

  const handleFeeEdit = async () => {
    const newFee = Number(feeInput)
    if (isNaN(newFee) || newFee < 0) {
      alert('Invalid number')
      return
    }

    onChange(player.recordId, { fee: newFee })
    setEditingFee(false)

    // Sync to Supabase - update individual player's fee
    if (sessionId) {
      setSyncing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/players/${player.recordId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_fee', value: newFee }),
        })
        console.log('✅ Fee updated')
      } catch (e) {
        console.error('Error updating fee:', e)
      } finally {
        setSyncing(false)
      }
    }
  }

  return (
    <div className="card mb-2 p-3 opacity-90 hover:opacity-100 transition">
      {/* Header: Name + Total */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-lg font-bold">
            {player.name}
            {player.isMaster ? (
              <span className="ml-1 text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">M</span>
            ) : (
              <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">T</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-purple-600">{total.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Payable</div>
        </div>
      </div>

      {/* Stats: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
        {editingWins ? (
          <div className="bg-blue-50 rounded p-1.5 text-center">
            <input
              type="number"
              value={winsInput}
              onChange={e => setWinsInput(e.target.value)}
              className="w-full border-2 border-blue-500 p-1 rounded text-center font-bold"
              autoFocus
            />
            <button
              onClick={handleWinsEdit}
              className="text-xs mt-1 w-full bg-blue-500 text-white py-0.5 rounded"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            className="bg-blue-50 rounded p-1.5 text-center cursor-pointer hover:bg-blue-100"
            onClick={() => {
              setWinsInput(player.wins)
              setEditingWins(true)
            }}
          >
            <div className="text-xl md:text-2xl font-bold text-blue-600">{player.wins}</div>
            <div className="text-xs text-gray-600">W</div>
          </div>
        )}

        {editingLosses ? (
          <div className="bg-red-50 rounded p-1.5 text-center">
            <input
              type="number"
              value={lossesInput}
              onChange={e => setLossesInput(e.target.value)}
              className="w-full border-2 border-red-500 p-1 rounded text-center font-bold"
              autoFocus
            />
            <button
              onClick={handleLossesEdit}
              className="text-xs mt-1 w-full bg-red-500 text-white py-0.5 rounded"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            className="bg-red-50 rounded p-1.5 text-center cursor-pointer hover:bg-red-100"
            onClick={() => {
              setLossesInput(player.losses)
              setEditingLosses(true)
            }}
          >
            <div className="text-xl md:text-2xl font-bold text-red-600">{player.losses}</div>
            <div className="text-xs text-gray-600">L</div>
          </div>
        )}

        <div className="bg-green-50 rounded p-1.5 text-center">
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {(player.losses - player.wins) * perMatchReward >= 0 ? '+' : ''}
            {((player.losses - player.wins) * perMatchReward).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">Bet</div>
        </div>
        {editingFee && !player.isMaster ? (
          <div className="bg-orange-50 rounded p-1.5 text-center">
            <input
              type="number"
              value={feeInput}
              onChange={e => setFeeInput(e.target.value)}
              className="w-full border-2 border-orange-500 p-1 rounded text-center font-bold"
              autoFocus
            />
            <button
              onClick={handleFeeEdit}
              className="text-xs mt-1 w-full bg-orange-500 text-white py-0.5 rounded"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            className={`bg-orange-50 rounded p-1.5 text-center ${!player.isMaster ? 'cursor-pointer hover:bg-orange-100' : ''}`}
            onClick={() => {
              if (!player.isMaster) {
                setFeeInput(playerFee)
                setEditingFee(true)
              }
            }}
          >
            <div className="text-xl md:text-2xl font-bold text-orange-600">{playerFee.toFixed(0)}</div>
            <div className="text-xs text-gray-600">Fee</div>
          </div>
        )}
      </div>

      {/* Buttons: Full width mobile, inline desktop */}
      <div className="flex gap-1.5 justify-end">
        <button
          disabled={syncing}
          className="flex-1 md:flex-none px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-semibold text-sm md:text-base"
          onClick={handleWin}
        >
          +W
        </button>
        <button
          disabled={syncing}
          className="flex-1 md:flex-none px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 font-semibold text-sm md:text-base"
          onClick={handleLoss}
        >
          +L
        </button>
        <button
          className="flex-1 md:flex-none px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold text-sm md:text-base"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
