import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signOut } from '../lib/supabase'

export default function Header({ date, serviceFee, perMatchReward, sessionId, onAdd, onServiceFeeChange, onPerMatchChange, onReports, onLeaderboard, onPlayers, onChangeDate, onPairs, user }) {
  const [editingFee, setEditingFee] = useState(false)
  const [editingReward, setEditingReward] = useState(false)
  const [feeInput, setFeeInput] = useState(serviceFee)
  const [rewardInput, setRewardInput] = useState(perMatchReward)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFeeBlur = async () => {
    const newFee = Number(feeInput)
    onServiceFeeChange(newFee)
    setEditingFee(false)
    
    // Update to Supabase if sessionId exists
    if (sessionId) {
      try {
        // Update session fee
        await fetch(`/api/sessions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, serviceFee: newFee })
        })
        
        // Update all players' fee in this session
        await fetch(`/api/sessions/${sessionId}/players`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fee: newFee })
        })
      } catch (e) {
        console.error('Error updating fee:', e)
      }
    }
  }

  const handleRewardBlur = async () => {
    const newReward = Number(rewardInput)
    onPerMatchChange(newReward)
    setEditingReward(false)
    
    // Update to Supabase if sessionId exists
    if (sessionId) {
      try {
        await fetch(`/api/sessions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, perMatchReward: newReward })
        })
      } catch (e) {
        console.error('Error updating reward:', e)
      }
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-2 p-2 md:p-4 bg-white/90 rounded">
      {/* User info + Logout */}
      {user && (
        <div className="flex justify-between items-center text-xs md:text-sm mb-2">
          <span className="text-gray-600">Đăng nhập: <strong>{user.email}</strong></span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Đăng xuất
          </button>
        </div>
      )}

      {/* Row 1: Date + Change button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="bg-indigo-100 rounded px-2 md:px-3 py-1 md:py-2 font-medium text-sm md:text-base flex items-center gap-1">
          {date}
          {onChangeDate && (
            <button
              onClick={onChangeDate}
              className="ml-1 px-2 py-0.5 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
            >
              🗓️
            </button>
          )}
        </div>

        {/* Fee & Reward: Stack on mobile, inline on desktop */}
        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
          <span className="font-medium">Fee:</span>
          {editingFee ? (
            <input
              type="number"
              value={feeInput}
              onChange={e => setFeeInput(e.target.value)}
              onBlur={handleFeeBlur}
              onKeyDown={e => e.key === 'Enter' && handleFeeBlur()}
              autoFocus
              className="border p-1 w-16 rounded"
            />
          ) : (
            <div
              onClick={() => setEditingFee(true)}
              className="bg-yellow-300 rounded px-2 py-1 cursor-pointer hover:bg-yellow-400 font-medium"
            >
              {serviceFee}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
          <span className="font-medium">Bet:</span>
          {editingReward ? (
            <input
              type="number"
              value={rewardInput}
              onChange={e => setRewardInput(e.target.value)}
              onBlur={handleRewardBlur}
              onKeyDown={e => e.key === 'Enter' && handleRewardBlur()}
              autoFocus
              className="border p-1 w-16 rounded"
            />
          ) : (
            <div
              onClick={() => setEditingReward(true)}
              className="bg-orange-300 rounded px-2 py-1 cursor-pointer hover:bg-orange-400 font-medium"
            >
              {perMatchReward}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Action buttons - responsive grid */}
      <div className="grid grid-cols-5 gap-1 md:flex md:gap-2 md:justify-end">
        <button
          onClick={onPlayers}
          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded text-xs md:text-sm font-semibold"
        >
          👥
        </button>
        <button
          onClick={onLeaderboard}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded text-xs md:text-sm font-semibold"
        >
          🏆
        </button>
        <button
          onClick={onPairs}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded text-xs md:text-sm font-semibold"
        >
          🎲
        </button>
        <button
          onClick={onReports}
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded text-xs md:text-sm font-semibold"
        >
          📊
        </button>
        <button
          onClick={onAdd}
          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded text-xs md:text-sm font-semibold"
        >
          ➕
        </button>
      </div>
    </div>
  )
}
