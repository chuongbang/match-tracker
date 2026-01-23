import { supabase } from '../../../../../lib/supabase'

export default async function handler(req, res) {
  const { sessionId, playerId } = req.query
  // playerId is actually session_players.id (PK)

  if (req.method === 'PATCH') {
    const { action, value } = req.body // 'win', 'loss', 'set_wins', 'set_losses', 'set_fee', 'set_paid'

    try {
      console.log(`[PATCH] sessionId=${sessionId}, playerId=${playerId}, action=${action}`)
      
      // Fetch current wins/losses using PK
      const { data: player, error: fetchError } = await supabase
        .from('session_players')
        .select('wins, losses, fee, paid')
        .eq('id', playerId)
        .single()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }

      if (!player) {
        return res.status(404).json({ error: 'Player record not found' })
      }

      let update = {}
      if (action === 'win') {
        update = { wins: (player?.wins || 0) + 1 }
      } else if (action === 'loss') {
        update = { losses: (player?.losses || 0) + 1 }
      } else if (action === 'set_wins') {
        update = { wins: value }
      } else if (action === 'set_losses') {
        update = { losses: value }
      } else if (action === 'set_fee') {
        update = { fee: value }
      } else if (action === 'set_paid') {
        update = { paid: value }
      }

      const { error } = await supabase
        .from('session_players')
        .update(update)
        .eq('id', playerId)

      if (error) {
        console.error('Update error:', error)
        throw error
      }

      res.status(200).json({ success: true })
    } catch (e) {
      console.error('PATCH error:', e)
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('session_players')
        .delete()
        .eq('id', playerId)

      if (error) throw error

      res.status(200).json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
