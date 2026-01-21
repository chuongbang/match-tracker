import { useState, useEffect } from 'react'
import { formatDate } from '../lib/supabase'

export default function ReportView() {
  const [reportType, setReportType] = useState('daily')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchReport() {
    setLoading(true)
    try {
      const url = new URL('/api/reports/' + reportType, window.location.origin)
      if (reportType === 'daily') {
        url.searchParams.append('startDate', startDate)
      } else if (reportType === 'range') {
        url.searchParams.append('startDate', startDate)
        url.searchParams.append('endDate', endDate)
      }

      const res = await fetch(url.toString())
      const data = await res.json()
      setReport(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType, startDate, endDate])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>

      <div className="flex gap-4 mb-4">
        <select value={reportType} onChange={e => setReportType(e.target.value)} className="border p-2 rounded">
          <option value="daily">Daily</option>
          <option value="range">Range</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />

        {reportType === 'range' && (
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        )}

        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {report.length === 0 ? (
        <p className="text-gray-500">No data for this period.</p>
      ) : (
        <div className="space-y-6">
          {report.map((item, idx) => (
            <div key={idx} className="bg-white rounded p-4">
              <h3 className="text-lg font-semibold mb-2">{formatDate(item.session.session_date)} (Fee: {item.session.service_fee})</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Player</th>
                    <th className="text-center p-2">Wins</th>
                    <th className="text-center p-2">Losses</th>
                    <th className="text-center p-2">Per Match</th>
                    <th className="text-center p-2">Fee</th>
                    <th className="text-right p-2">Total Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {item.players.map((p, i) => {
                    // Master player (player_id ≠ null): no fee. Temp player (player_id = null): add fee
                    const isMaster = p.player_id !== null && p.player_id !== undefined
                    const displayTotal = isMaster
                      ? (p.losses - p.wins) * p.per_match_reward
                      : p.fee + (p.losses - p.wins) * p.per_match_reward
                    
                    return (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">{p.player_name || p.name || 'Unknown'}</td>
                        <td className="text-center p-2">{p.wins}</td>
                        <td className="text-center p-2">{p.losses}</td>
                        <td className="text-center p-2">{p.per_match_reward}</td>
                        <td className="text-center p-2">{isMaster ? '–' : p.fee}</td>
                        <td className="text-right p-2 font-semibold">{displayTotal?.toFixed(2) || 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="mt-3 text-right font-bold text-lg">
                Total Receivable: {item.totalReceivable.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
