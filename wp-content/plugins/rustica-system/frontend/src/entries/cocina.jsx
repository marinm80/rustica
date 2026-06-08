import { createRoot } from 'react-dom/client'
import CocinaApp from '../apps/CocinaApp'

const el = document.getElementById('rustica-cocina')
if (el) createRoot(el).render(<CocinaApp />)
