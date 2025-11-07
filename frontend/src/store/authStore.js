import { create } from 'zustand'
import apiClient from '../api/client'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  // Google OAuth Login
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/google', { token: googleToken })
      const { user, token } = response.data.data

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ user, token, isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  // Email/Password Register
  register: async (name, email, password, confirmPassword) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword
      })
      const { user, token } = response.data.data

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ user, token, isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      })
      throw error
    }
  },

  // Email/Password Login
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response.data.data

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ user, token, isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  // Update Profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      const updatedUser = response.data.data

      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser, isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Update failed',
        isLoading: false,
      })
      throw error
    }
  },

  // Check Auth Status
  checkAuth: async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      set({ user: null, token: null })
      return false
    }

    try {
      await apiClient.get('/auth/verify')
      return true
    } catch (error) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      set({ user: null, token: null })
      return false
    }
  },

  // Clear Error
  clearError: () => set({ error: null })
}))
