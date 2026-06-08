import { createRoot } from 'react-dom/client'
import MeseroApp from '../apps/MeseroApp'

const el = document.getElementById('rustica-mesero')
if (el) createRoot(el).render(<MeseroApp />)
