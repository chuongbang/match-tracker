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
          losses: 0,
          paid: false
        }])
        .select()
      if (error) throw error
      res.status(201).json(data[0])
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'GET') {
    try {
      // Get all session_players with their names (from either player_name or joined players table)
      const { data, error } = await supabase
        .from('session_players')
        .select('id, session_id, player_id, player_name, wins, losses, fee, paid, players(name)')
        .eq('session_id', sessionId)
      if (error) throw error
      
      // Map to include player name from either temp name or master player name
      const mapped = data.map(p => ({
        ...p,
        player_name: p.player_name || (p.players?.name) || 'Unknown'
      }))
      
      res.status(200).json(mapped)
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
