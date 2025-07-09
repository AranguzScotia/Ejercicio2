import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx' // Ajustado para que App.tsx esté en la raíz del frontend, no en src/
import './styles/globals.css' // Asumiendo que aquí están los estilos globales

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
