import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        return
      }

      // Đăng nhập thành công
      router.push('/')
    } catch (err) {
      setError('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Aurora Dream Vivid Bloom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(175, 109, 255, 0.85), transparent 68%),
            radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 100, 180, 0.75), transparent 68%),
            radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 235, 170, 0.98), transparent 68%),
            radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120, 190, 255, 0.3), transparent 68%),
            linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
          `,
        }}
      />
      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
            Dragon Match Tracker
          </h1>
          <p className="text-center text-gray-600 mb-6">Đăng nhập để tiếp tục</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-4">
            Liên hệ admin để cấp tài khoản
          </p>
        </div>
      </div>
    </div>
  )
}
