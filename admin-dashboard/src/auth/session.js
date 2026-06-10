const KEYS = {
  token:       'rustica_token',
  apiUrl:      'rustica_api_url',
  displayName: 'rustica_user_display_name',
  userRole:    'rustica_user_role',
  esGerente:   'rustica_es_gerente',
  isStaff:     'rustica_is_staff',
  lastTool:    'rustica_last_tool',
}

export function readSession() {
  return Object.fromEntries(
    Object.entries(KEYS).map(([field, key]) => [field, localStorage.getItem(key)])
  )
}

export function writeSession(partial) {
  Object.entries(partial).forEach(([field, value]) => {
    if (KEYS[field] && value !== undefined) {
      localStorage.setItem(KEYS[field], value)
    }
  })
}

export function clearSession() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key))
}

export { KEYS }
