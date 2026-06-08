import { createRoot } from 'react-dom/client'
import ReservasApp from '../apps/ReservasApp'

const el = document.getElementById('rustica-reservas')
if (el) createRoot(el).render(<ReservasApp />)
