import { createRoot } from 'react-dom/client'
import MeseroApp from '../apps/MeseroApp'
import '../tailwind.css'

const el = document.getElementById('rustica-mesero')
if (el) createRoot(el).render(<MeseroApp />)
