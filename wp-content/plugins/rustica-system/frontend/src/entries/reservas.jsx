import { createRoot } from 'react-dom/client'
import ReservasApp from '../apps/ReservasApp'
import '../tailwind.css'

const el = document.getElementById('rustica-reservas')
if (el) createRoot(el).render(<ReservasApp />)
