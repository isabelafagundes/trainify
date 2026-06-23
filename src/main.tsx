import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import { temaManager } from './application/state/tema.state'
import { DadosProvider } from './interface/rota/DadosProvider'
import { RotasApp } from './interface/rota/RotasApp'

await temaManager.inicializar()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <DadosProvider>
        <RotasApp />
      </DadosProvider>
    </HashRouter>
  </StrictMode>,
)
