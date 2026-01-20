import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { sessionDate } = req.query
    try {
      const query = supabase.from('sessions').select('*')
      if (sessionDate) {
        query.eq('session_date', sessionDate)
      }
      const { data, error } = await query
      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'POST') {
    const { sessionDate, serviceFee } = req.body
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ session_date: sessionDate, service_fee: serviceFee }])
        .select()
      if (error) throw error
      res.status(201).json(data[0])
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'PATCH') {
    const { sessionId, serviceFee, perMatchReward } = req.body
    try {
      const updates = {}
      if (serviceFee !== undefined) updates.service_fee = serviceFee
      if (perMatchReward !== undefined) updates.per_match_reward = perMatchReward

      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
