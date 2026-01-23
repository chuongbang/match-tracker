import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { month, year } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Default to current month
    const now = new Date()
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1
    const targetYear = year ? parseInt(year) : now.getFullYear()

    // Get all session players from sessions in target month
    const { data, error } = await supabase
      .from('session_players')
      .select(`
        player_id,
        wins,
        losses,
        sessions:session_id(session_date)
      `)

    if (error) throw error

    // Filter by month/year
    const filtered = data.filter(sp => {
      if (!sp.sessions?.session_date) return false
      const [year, month, day] = sp.sessions.session_date.split('-')
      return parseInt(month) === targetMonth && parseInt(year) === targetYear
    })

    // Get master players list for names
    const { data: players } = await supabase
      .from('players')
      .select('id, name')

    const playerMap = {}
    players?.forEach(p => {
      playerMap[p.id] = p.name
    })

    // Aggregate stats per player
    const stats = {}
    filtered.forEach(sp => {
      if (!sp.player_id) return // Skip temp players
      if (!stats[sp.player_id]) {
        stats[sp.player_id] = {
          playerId: sp.player_id,
          name: playerMap[sp.player_id] || 'Unknown',
          wins: 0,
          losses: 0,
          sessions: 0,
        }
      }
      stats[sp.player_id].wins += sp.wins
      stats[sp.player_id].losses += sp.losses
      stats[sp.player_id].sessions += 1
    })

    // Calculate win rate and tier
    const leaderboard = Object.values(stats).map(stat => {
      const total = stat.wins + stat.losses
      const winRate = total > 0 ? (stat.wins / total * 100).toFixed(1) : 0

      let tier = 'Bronze'
      if (winRate >= 60) tier = 'Diamond'
      else if (winRate >= 55) tier = 'Platinum'
      else if (winRate >= 50) tier = 'Gold'
      else if (winRate >= 45) tier = 'Silver'

      return {
        ...stat,
        winRate: parseFloat(winRate),
        total,
        tier,
      }
    })

    // Sort by win rate descending
    leaderboard.sort((a, b) => b.winRate - a.winRate)

    res.status(200).json({
      month: targetMonth,
      year: targetYear,
      leaderboard,
    })
  } catch (e) {
    console.error('Error fetching leaderboard:', e)
    res.status(500).json({ error: e.message })
  }
}
