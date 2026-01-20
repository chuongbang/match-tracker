import { supabase } from '../../../../lib/supabase'

export default async function handler(req, res) {
  const { sessionId } = req.query

  if (req.method === 'POST') {
    const { serviceFee, perMatchReward, players } = req.body

    try {
      // Update session
      await supabase
        .from('sessions')
        .update({ service_fee: serviceFee })
        .eq('id', sessionId)

      // Upsert session_players
      for (const player of players) {
        await supabase.from('session_players').upsert(
          {
            session_id: sessionId,
            player_id: player.id,
            fee: serviceFee,
            per_match_reward: perMatchReward,
          },
          { onConflict: 'session_id,player_id' }
        )
      }

      res.status(200).json({ success: true, sessionId })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
