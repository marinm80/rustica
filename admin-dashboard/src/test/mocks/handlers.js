import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/jwt-auth/v1/token', () =>
    HttpResponse.json({
      token: 'test-jwt-token',
      user_display_name: 'Test Mesero',
    })
  ),

  http.get('*/rustica/v1/auth/me', () =>
    HttpResponse.json({
      user_role: 'mesero',
      es_gerente: false,
      is_staff: true,
      display_name: 'Test Mesero',
    })
  ),
]

export const handlers401Token = [
  http.post('*/jwt-auth/v1/token', () =>
    HttpResponse.json({ code: 'invalid_credentials', message: 'Credenciales inválidas' }, { status: 401 })
  ),
]

export const handlersGerente = [
  http.post('*/jwt-auth/v1/token', () =>
    HttpResponse.json({ token: 'gerente-jwt-token', user_display_name: 'Gerente Test' })
  ),
  http.get('*/rustica/v1/auth/me', () =>
    HttpResponse.json({ user_role: 'administrator', es_gerente: true, is_staff: true, display_name: 'Gerente Test' })
  ),
]

export const handlersCocina = [
  http.post('*/jwt-auth/v1/token', () =>
    HttpResponse.json({ token: 'cocina-jwt-token', user_display_name: 'Cocina Test' })
  ),
  http.get('*/rustica/v1/auth/me', () =>
    HttpResponse.json({ user_role: 'cocina', es_gerente: false, is_staff: true, display_name: 'Cocina Test' })
  ),
]
