import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  const { type, startDate, endDate } = req.query

  try {
    let query = supabase.from('sessions').select('*')

    if (type === 'daily' && startDate) {
      query.eq('session_date', startDate)
    } else if (type === 'range' && startDate && endDate) {
      query.gte('session_date', startDate).lte('session_date', endDate)
    }

    const { data: sessions, error: sessionsError } = await query

    if (sessionsError) throw sessionsError

    const report = []

    for (const session of sessions) {
      const { data: stats, error: statsError } = await supabase
        .from('player_session_stats')
        .select('*')
        .eq('session_id', session.id)

      if (statsError) throw statsError

      report.push({
        session: session,
        players: stats,
        totalReceivable: stats.reduce((sum, p) => {
          // Master player (player_id ≠ null): no fee. Temp player (player_id = null): add fee
          const isMaster = p.player_id !== null && p.player_id !== undefined
          const payable = isMaster
            ? (p.losses - p.wins) * p.per_match_reward
            : p.fee + (p.losses - p.wins) * p.per_match_reward
          return sum + payable
        }, 0),
      })
    }

    res.status(200).json(report)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
