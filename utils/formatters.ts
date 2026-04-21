// Funções utilitárias de formatação para exibição de dados no app

// Formata número para moeda brasileira (ex: R$ 1.250,00)
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

// Formata mês e ano por extenso (ex: "Abril 2026")
export const formatarMesAno = (mes: number, ano: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${meses[mes - 1]} ${ano}`
}

// Retorna o número do mês atual (1–12)
export const getMesAtual = (): number => new Date().getMonth() + 1

// Retorna o ano atual
export const getAnoAtual = (): number => new Date().getFullYear()
