import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null
          })
        })
      })
    })
  }
}))

// Test component to use auth context
function TestComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={signOut} data-testid="sign-out">
        Sign Out
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides initial loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles sign out functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })
    
    const signOutButton = screen.getByTestId('sign-out')
    await user.click(signOutButton)
    
    // Verify sign out was called
    expect(require('@/lib/supabaseClient').supabase.auth.signOut).toHaveBeenCalled()
  })

  it('updates user state when authenticated', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com'
    }
    
    // Mock authenticated user
    require('@/lib/supabaseClient').supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com')
    })
  })
})