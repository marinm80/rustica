import { Link } from 'react-router-dom'

const TOOLS = [
  { to: '/comandas', label: 'Comandas', description: 'Gestionar órdenes por mesa', emoji: '🍽️' },
  { to: '/cocina',   label: 'Cocina',   description: 'Cola de pedidos activos', emoji: '👨‍🍳' },
  { to: '/reservas', label: 'Reservas', description: 'Administrar reservaciones', emoji: '📅' },
]

export function DashboardPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-stone-700 mb-6">Panel de operación</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map(t => (
          <Link
            key={t.to}
            to={t.to}
            className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow border border-stone-200"
          >
            <div className="text-3xl mb-2">{t.emoji}</div>
            <h3 className="font-semibold text-stone-800">{t.label}</h3>
            <p className="text-sm text-stone-500 mt-1">{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
