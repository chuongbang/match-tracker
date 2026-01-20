import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('players').select('*')
      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'POST') {
    const { name } = req.body
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ name }])
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
