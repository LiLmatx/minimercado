import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('gm_usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  function login(token, usuario) {
    localStorage.setItem('gm_token', token)
    localStorage.setItem('gm_usuario', JSON.stringify(usuario))
    setUsuario(usuario)
  }

  function logout() {
    localStorage.removeItem('gm_token')
    localStorage.removeItem('gm_usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}