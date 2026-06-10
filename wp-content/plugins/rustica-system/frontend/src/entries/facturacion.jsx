import { createRoot } from 'react-dom/client'
import FacturacionApp from '../apps/FacturacionApp'
import '../tailwind.css'

const el = document.getElementById('rustica-facturacion')
if (el) createRoot(el).render(<FacturacionApp />)
