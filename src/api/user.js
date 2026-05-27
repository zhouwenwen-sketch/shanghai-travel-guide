import api from './index'

export function login(username, password) {
  return api.post('/users/login', { username, password })
}

export function register(username, password) {
  return api.post('/users/register', { username, password })
}



