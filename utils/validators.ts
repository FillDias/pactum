// Funções de validação de formulários usadas nas telas do app

// Valida e-mail no formato padrão
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Valida se a senha tem pelo menos 6 caracteres
export const validarSenha = (senha: string): boolean => {
  return senha.length >= 6
}

// Valida se o valor monetário é um número positivo
export const validarValor = (valor: number): boolean => {
  return valor > 0 && isFinite(valor)
}

// Valida se um texto obrigatório não está vazio
export const validarCampoObrigatorio = (texto: string): boolean => {
  return texto.trim().length > 0
}
