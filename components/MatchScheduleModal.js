import { useState, useEffect } from 'react'

function createRandomPairs(players) {
  // Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  
  const pairs = []
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      pairs.push([shuffled[i], shuffled[i + 1]])
    }
  }
  return pairs
}

function createMatchSchedule(pairs) {
  // Generate all possible pairings between different pairs
  const allMatches = []
  const n = pairs.length
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allMatches.push({
        pairA: pairs[i],
        pairB: pairs[j],
        pairAIdx: i,
        pairBIdx: j,
      })
    }
  }

  // Balance schedule - no pair plays twice in a row
  const balanced = []
  const used = new Set()
  let lastPairs = new Set()

  while (balanced.length < allMatches.length) {
    // Find a match where neither pair just played
    let found = false
    for (let i = 0; i < allMatches.length; i++) {
      const match = allMatches[i]
      const matchKey = `${match.pairAIdx}-${match.pairBIdx}`
      
      if (!used.has(matchKey) && 
          !lastPairs.has(match.pairAIdx) && 
          !lastPairs.has(match.pairBIdx)) {
        balanced.push({
          ...match,
          round: Math.floor(balanced.length / Math.max(1, Math.ceil(n / 2))) + 1,
        })
        used.add(matchKey)
        lastPairs.clear()
        lastPairs.add(match.pairAIdx)
        lastPairs.add(match.pairBIdx)
        found = true
        break
      }
    }

    // If no perfect match, reset and find any available
    if (!found) {
      lastPairs.clear()
      for (let i = 0; i < allMatches.length; i++) {
        const match = allMatches[i]
        const matchKey = `${match.pairAIdx}-${match.pairBIdx}`
        
        if (!used.has(matchKey)) {
          balanced.push({
            ...match,
            round: Math.floor(balanced.length / Math.max(1, Math.ceil(n / 2))) + 1,
          })
          used.add(matchKey)
          lastPairs.add(match.pairAIdx)
          lastPairs.add(match.pairBIdx)
          break
        }
      }
    }
  }

  return balanced
}

export default function MatchScheduleModal({ open, onClose, players }) {
  const [pairs, setPairs] = useState([])
  const [matches, setMatches] = useState([])

  useEffect(() => {
    if (open && players.length > 0) {
      const newPairs = createRandomPairs(players)
      setPairs(newPairs)
      const newMatches = createMatchSchedule(newPairs)
      setMatches(newMatches)
    }
  }, [open, players])

  if (!open) return null

  const handleRegenerate = () => {
    const newPairs = createRandomPairs(players)
    setPairs(newPairs)
    const newMatches = createMatchSchedule(newPairs)
    setMatches(newMatches)
  }

  // Calculate stats
  const playerMatchCount = {}
  players.forEach(p => {
    playerMatchCount[p.recordId] = 0
  })
  matches.forEach(m => {
    m.pairA.forEach(p => playerMatchCount[p.recordId]++)
    m.pairB.forEach(p => playerMatchCount[p.recordId]++)
  })

  const avgMatches = Object.values(playerMatchCount).length > 0 
    ? (Object.values(playerMatchCount).reduce((a, b) => a + b, 0) / players.length).toFixed(1)
    : 0

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Match Schedule</h3>
            <div className="text-xs text-gray-500 mt-1">
              {matches.length} matches • Avg {avgMatches} matches per player
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>

        {/* Pairs Overview */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-semibold text-gray-700 mb-2">Pairs ({pairs.length})</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {pairs.map((pair, idx) => (
              <div key={idx} className="text-xs bg-white p-2 rounded border">
                <div className="font-medium">Pair {idx + 1}</div>
                <div className="text-gray-600">{pair[0].name}</div>
                {pair[1] && <div className="text-gray-600">{pair[1].name}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Matches */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-2">
            {matches.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No matches generated</div>
            ) : (
              matches.map((match, idx) => (
                <div key={idx} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded p-3 border border-indigo-100">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Match {idx + 1} • Round {match.round}
                  </div>
                  <div className="flex items-center justify-between">
                    {/* Pair A */}
                    <div className="flex-1">
                      <div className="text-xs font-medium text-indigo-700">
                        {match.pairA.map(p => p.name).join(" & ")}
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs mx-2">vs</div>
                    {/* Pair B */}
                    <div className="flex-1 text-right">
                      <div className="text-xs font-medium text-blue-700">
                        {match.pairB.map(p => p.name).join(" & ")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Player Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-semibold text-gray-700 mb-2">Player Match Count</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {players.map(p => (
              <div key={p.recordId} className="text-xs bg-white p-2 rounded border">
                <div className="font-medium text-gray-800">{p.name}</div>
                <div className="text-indigo-600 font-bold">{playerMatchCount[p.recordId]} matches</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            🔄 Regenerate
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
