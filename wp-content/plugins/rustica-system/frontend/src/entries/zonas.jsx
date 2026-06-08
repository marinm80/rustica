import { createRoot } from 'react-dom/client'
import ZonasApp from '../apps/ZonasApp'

const el = document.getElementById('rustica-zonas')
if (el) createRoot(el).render(<ZonasApp />)
