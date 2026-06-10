import { createRoot } from 'react-dom/client'
import ZonasApp from '../apps/ZonasApp'
import '../tailwind.css'

const el = document.getElementById('rustica-zonas')
if (el) createRoot(el).render(<ZonasApp />)
