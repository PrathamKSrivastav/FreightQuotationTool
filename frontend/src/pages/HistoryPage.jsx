import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchQuotes()
  }, [user, navigate])

  const fetchQuotes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/quotes/my-quotes')
      console.log('Quotes response:', response.data)
      setQuotes(response.data.data || [])
    } catch (err) {
      console.error('Error fetching quotes:', err)
      setError(err.response?.data?.message || 'Failed to fetch quotes')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async (pdfUrl) => {
  if (!pdfUrl) {
    alert('PDF is not yet generated')
    return
  }

  try {
    const response = await fetch(`http://localhost:5000${pdfUrl}`)
    if (!response.ok) {
      throw new Error('Failed to download PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `quote_${new Date().getTime()}.pdf`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download error:', error)
    alert('Failed to download PDF')
  }
}


  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Quote History</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading quotes...</p>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No quotes yet</p>
            <button
              onClick={() => navigate('/quote')}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded"
            >
              Create Your First Quote
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">From</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Weight</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {quote.origin_city}, {quote.origin_country}
                    </td>
                    <td className="px-6 py-4">
                      {quote.destination_city}, {quote.destination_country}
                    </td>
                    <td className="px-6 py-4">{quote.weight} kg</td>
                    <td className="px-6 py-4 font-semibold">
                      ${quote.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          quote.quote_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : quote.quote_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quote.quote_status.charAt(0).toUpperCase() +
                          quote.quote_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadPDF(quote.pdf_url)}
                        disabled={!quote.pdf_url}
                        className="text-blue-500 hover:text-blue-600 disabled:text-gray-300 font-semibold"
                      >
                        {quote.pdf_url ? 'Download' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
