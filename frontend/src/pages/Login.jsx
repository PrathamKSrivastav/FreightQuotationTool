import { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const { user, login, loginWithGoogle, isLoading, error, clearError } = useAuthStore()
  const [activeTab, setActiveTab] = useState('email')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/quote')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setLocalError('')
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields')
      return
    }

    try {
      await login(formData.email, formData.password)
      navigate('/quote')
    } catch (error) {
      setLocalError(error.response?.data?.message || 'Login failed')
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential)
    } catch (error) {
      setLocalError('Google login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Freight Quotation
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Get instant freight quotes in seconds
        </p>

        {/* Error Message */}
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error || localError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => {
              setActiveTab('email')
              setLocalError('')
            }}
            className={`flex-1 pb-2 text-sm font-semibold transition ${
              activeTab === 'email'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => {
              setActiveTab('google')
              setLocalError('')
            }}
            className={`flex-1 pb-2 text-sm font-semibold transition ${
              activeTab === 'google'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Google
          </button>
        </div>

        {/* Email Login Form */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-red-500 hover:text-red-600 font-semibold"
              >
                Sign up here
              </button>
            </p>
          </form>
        )}

        {/* Google Login */}
        {activeTab === 'google' && (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setLocalError('Google login failed')}
            />
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-8">
          By logging in, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  )
}
