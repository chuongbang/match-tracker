import { supabase } from '../../../../lib/supabase'

export default async function handler(req, res) {
  const { sessionId } = req.query

  if (req.method === 'POST') {
    const { playerId, playerName, fee } = req.body
    try {
      const { data, error } = await supabase
        .from('session_players')
        .insert([{ 
          session_id: sessionId, 
          player_id: playerId || null,  // null for temp players
          player_name: playerName || null,
          fee: fee || 0,
          wins: 0,
          losses: 0
        }])
        .select()
      if (error) throw error
      res.status(201).json(data[0])
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('player_session_stats')
        .select('*')
        .eq('session_id', sessionId)
      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'PATCH') {
    // Update fee for all players in session
    const { fee } = req.body
    try {
      const { data, error } = await supabase
        .from('session_players')
        .update({ fee: fee || 0 })
        .eq('session_id', sessionId)
        .select()
      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
