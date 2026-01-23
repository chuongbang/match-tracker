import { useState, useEffect } from 'react'

const tierColors = {
  Diamond: 'from-cyan-400 to-blue-500',
  Platinum: 'from-slate-300 to-slate-400',
  Gold: 'from-yellow-400 to-orange-400',
  Silver: 'from-gray-300 to-gray-400',
  Bronze: 'from-orange-600 to-amber-700',
  Unranked: 'from-gray-200 to-gray-300',
}

const tierEmoji = {
  Diamond: '💎',
  Platinum: '⚪',
  Gold: '🥇',
  Silver: '🥈',
  Bronze: '🥉',
  Unranked: '❓',
}

export default function LeaderboardView() {
  const [leaderboard, setLeaderboard] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
  }, [month, year])

  async function fetchLeaderboard() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?month=${month}&year=${year}`)
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
    } catch (e) {
      console.error('Error fetching leaderboard:', e)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Leaderboard</h1>
          
          {/* Month/Year Selector */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow">
            <button
              onClick={handlePrevMonth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ← Prev
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {new Date(year, month - 1).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No data for this month</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((player, idx) => {
              const bgGradient = tierColors[player.tier]
              
              return (
                <div
                  key={player.playerId}
                  className={`bg-gradient-to-r ${bgGradient} rounded-lg p-4 shadow-md transition hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white">{player.name}</div>
                        <div className="text-sm text-white/80">
                          {tierEmoji[player.tier]} {player.tier}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      {/* Win/Loss */}
                      <div className="text-right">
                        <div className="font-bold text-white">
                          {player.wins}/{player.losses}
                        </div>
                        <div className="text-xs text-white/80">W/L</div>
                      </div>

                      {/* Win Rate */}
                      <div className="text-right min-w-20">
                        <div className="font-bold text-white text-lg">
                          {player.winRate}%
                        </div>
                        <div className="text-xs text-white/80">Rate</div>
                      </div>

                      {/* Sessions */}
                      <div className="text-right">
                        <div className="font-bold text-white">
                          {player.sessions}
                        </div>
                        <div className="text-xs text-white/80">Sessions</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tier Info */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Tier System</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(tier => (
              <div key={tier} className="flex items-center gap-2">
                <span className="text-xl">{tierEmoji[tier]}</span>
                <span className="font-medium">{tier}: ≥60% / ≥55% / ≥50% / ≥45% / &lt;45%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
