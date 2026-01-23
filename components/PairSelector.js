import { useState, useEffect } from 'react'

const tierRank = {
  Diamond: 5,
  Platinum: 4,
  Gold: 3,
  Silver: 2,
  Bronze: 1,
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateBalancedPairs(playersWithTier) {
  // Sort by tier (high to low)
  const sorted = [...playersWithTier].sort((a, b) => {
    const tierA = tierRank[a.tier] || 0
    const tierB = tierRank[b.tier] || 0
    return tierB - tierA
  })

  // Pair: 1st with last, 2nd with 2nd-last, etc. (balanced)
  const pairs = []
  const used = new Set()
  
  for (let i = 0; i < sorted.length / 2; i++) {
    const topIdx = i
    const bottomIdx = sorted.length - 1 - i
    if (topIdx !== bottomIdx) {
      pairs.push([sorted[topIdx], sorted[bottomIdx]])
      used.add(topIdx)
      used.add(bottomIdx)
    }
  }

  // Add remaining (if odd number)
  for (let i = 0; i < sorted.length; i++) {
    if (!used.has(i)) {
      pairs.push([sorted[i]])
    }
  }

  return pairs
}

export default function PairSelector({ open, onClose, players }) {
  const [pairs, setPairs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && players.length > 0) {
      generatePairsWithTier()
    }
  }, [open, players])

  const generatePairsWithTier = async () => {
    setLoading(true)
    try {
      // Fetch leaderboard for current month
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      
      const res = await fetch(`/api/leaderboard?month=${month}&year=${year}`)
      const data = await res.json()
      
      // Create map of playerId -> tier
      const tierMap = {}
      data.leaderboard?.forEach(player => {
        tierMap[player.playerId] = player.tier
      })

      // Add tier to each player
      const playersWithTier = players.map(p => ({
        ...p,
        tier: p.id ? (tierMap[p.id] || 'Bronze') : undefined, // Only master players have tier
      }))

      // Generate balanced pairs
      setPairs(generateBalancedPairs(playersWithTier))
    } catch (e) {
      console.error('Error fetching leaderboard:', e)
      // Fallback to simple shuffle if error
      setPairs(generateSimplePairs(players))
    } finally {
      setLoading(false)
    }
  }

  function generateSimplePairs(playersData) {
    const shuffled = shuffleArray(playersData)
    const newPairs = []
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        newPairs.push([shuffled[i], shuffled[i + 1]])
      } else {
        newPairs.push([shuffled[i]])
      }
    }
    return newPairs
  }

  const handleRegenerate = () => {
    generatePairsWithTier()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Random Pairs ({pairs.length})</h3>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-gray-500 py-4">Loading tiers...</div>
            ) : (
              pairs.map((pair, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded p-3 border border-blue-100">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Match {idx + 1}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-700">{pair[0].name}</div>
                      {pair[0].tier && <div className="text-xs text-blue-500 font-medium">{pair[0].tier}</div>}
                    </div>
                    <div className="text-gray-400 text-sm mx-2">vs</div>
                    {pair.length > 1 ? (
                      <div className="flex-1 text-right">
                        <div className="text-sm font-medium text-purple-700">{pair[1].name}</div>
                        {pair[1].tier && <div className="text-xs text-purple-500 font-medium">{pair[1].tier}</div>}
                      </div>
                    ) : (
                      <div className="flex-1 text-right text-sm text-gray-400">—</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            🔄 Re-Random
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
