import { supabase } from '../../../../lib/supabase'

export default async function handler(req, res) {
  const { sessionId } = req.query

  if (req.method === 'POST') {
    const { playerAId, playerBId, winnerId, amount } = req.body
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            session_id: sessionId,
            player_a_id: playerAId,
            player_b_id: playerBId,
            winner_id: winnerId,
            amount,
          },
        ])
        .select()
      if (error) throw error
      res.status(201).json(data[0])
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
