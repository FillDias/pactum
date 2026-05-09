import { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Animated, useWindowDimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  fundo:   '#FFFFFF',
  fundo2:  '#F7F6F3',
  texto1:  '#1A1A1A',
  texto2:  '#6B6B6B',
  borda:   '#E5E5E3',
  verde:   '#2A7A50',
  verdeBg: '#F0F9F4',
  verdeBd: '#B8E0CC',
}
const D = {
  fundo:  '#0A0A0A',
  fundo2: '#0F0F0F',
  card:   '#161616',
  borda:  '#222222',
  verde:  '#3D9E6E',
  texto:  '#E0E0E0',
  dim:    '#5A5A5A',
}
const MAX_W = 1120

// ── Helpers ───────────────────────────────────────────────────────────────────
function Centered({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions()
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: width >= 768 ? 48 : 20 }}>
        {children}
      </View>
    </View>
  )
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current
  const ty      = useRef(new Animated.Value(24)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, delay, useNativeDriver: true }),
      Animated.timing(ty,      { toValue: 0, duration: 650, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity, transform: [{ translateY: ty }] }}>{children}</Animated.View>
}

function Tag({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <View style={{
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: dark ? D.borda : C.borda,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginBottom: 28,
    }}>
      <Text style={{ color: dark ? D.dim : C.texto2, fontSize: 12, letterSpacing: 0.6 }}>{text}</Text>
    </View>
  )
}

function Divisor({ dark }: { dark?: boolean }) {
  return <View style={{ height: 1, backgroundColor: dark ? D.borda : C.borda }} />
}

// ── Browser Mockup ────────────────────────────────────────────────────────────
function BrowserMockup() {
  const [count, setCount] = useState(0)
  const target = 3570.10
  useEffect(() => {
    let v = 0
    const step = target / 60
    const t = setInterval(() => {
      v += step
      if (v >= target) { setCount(target); clearInterval(t) }
      else setCount(Math.round(v * 100) / 100)
    }, 20)
    return () => clearInterval(t)
  }, [])
  const items = [
    { desc: 'Salario',  val: '+5.000,00', pos: true  },
    { desc: 'Aluguel',  val: '-1.200,00', pos: false },
    { desc: 'Freela',   val: '+800,00',   pos: true  },
    { desc: 'Netflix',  val: '-29,90',    pos: false },
  ]
  return (
    <View style={{
      borderRadius: 16, overflow: 'hidden',
      borderWidth: 1, borderColor: '#222',
      shadowColor: '#000', shadowOffset: { width: 0, height: 32 },
      shadowOpacity: 0.4, shadowRadius: 64,
    }}>
      <View style={{ height: 38, backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 7 }}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
          <View key={c} style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c }} />
        ))}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#2A2A2A', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 4 }}>
            <Text style={{ color: '#666', fontSize: 11 }}>pactum.app</Text>
          </View>
        </View>
      </View>
      <View style={{ backgroundColor: '#0E0E0E', padding: 20, minWidth: 300 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#C8BFA8', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>PACTUM</Text>
          <Text style={{ color: '#444', fontSize: 10 }}>Maio 2026</Text>
        </View>
        <View style={{ backgroundColor: '#161616', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#222' }}>
          <Text style={{ color: '#444', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' }}>Saldo do mes</Text>
          <Text style={{ color: '#C8BFA8', fontSize: 26, fontWeight: '700', marginTop: 6, letterSpacing: -1 }}>
            R$ {count.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#0D1E14', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#1A3020' }}>
              <Text style={{ color: D.verde, fontSize: 8, letterSpacing: 1 }}>RECEITAS</Text>
              <Text style={{ color: D.verde, fontSize: 13, fontWeight: '700', marginTop: 3 }}>+R$ 5.800</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#1E0D0D', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#301A1A' }}>
              <Text style={{ color: '#C94F4F', fontSize: 8, letterSpacing: 1 }}>GASTOS</Text>
              <Text style={{ color: '#C94F4F', fontSize: 13, fontWeight: '700', marginTop: 3 }}>-R$ 2.230</Text>
            </View>
          </View>
        </View>
        <Text style={{ color: '#333', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Lançamentos</Text>
        {items.map((t, i) => (
          <View key={i} style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: 8, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: '#1A1A1A',
          }}>
            <Text style={{ color: '#888', fontSize: 12 }}>{t.desc}</Text>
            <Text style={{ color: t.pos ? D.verde : '#C94F4F', fontSize: 12, fontWeight: '600' }}>{t.val}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
function LandingHeader() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768
  return (
    <View style={{ height: 64, backgroundColor: C.fundo, borderBottomWidth: 1, borderBottomColor: C.borda, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: isDesktop ? 48 : 20, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: C.texto1, letterSpacing: 3.5, flex: 1 }}>PACTUM</Text>
        {isDesktop && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
            <Text style={{ color: C.texto2, fontSize: 14 }}>Recursos</Text>
            <Text style={{ color: C.texto2, fontSize: 14 }}>API</Text>
            <Text style={{ color: C.texto2, fontSize: 14 }}>Sobre</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: isDesktop ? 32 : 0 }}>
          <TouchableOpacity onPress={() => router.push('/login')} style={{ borderWidth: 1, borderColor: C.borda, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: C.texto1, fontSize: 14, fontWeight: '500' }}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')} style={{ backgroundColor: C.texto1, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8 }}>
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>Começar grátis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  return (
    <View style={{ backgroundColor: C.fundo, paddingVertical: isDesktop ? 100 : 60 }}>
      <Centered>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', gap: 64 }}>
          <View style={{ flex: isDesktop ? 3 : undefined }}>
            <FadeUp>
              <View style={{
                alignSelf: 'flex-start', backgroundColor: C.verdeBg,
                borderWidth: 1, borderColor: C.verdeBd, borderRadius: 20,
                paddingHorizontal: 14, paddingVertical: 6, marginBottom: 36,
              }}>
                <Text style={{ color: C.verde, fontSize: 12, fontWeight: '500' }}>
                  Disponível para iOS, Android e Web
                </Text>
              </View>

              <Text style={{
                fontSize: isDesktop ? 72 : 44,
                fontWeight: '800',
                color: C.texto1,
                lineHeight: isDesktop ? 80 : 54,
                letterSpacing: -2.5,
                marginBottom: 28,
              }}>
                {'Finanças que a família\nentende juntos'}
              </Text>

              <Text style={{ fontSize: 18, color: C.texto2, lineHeight: 32, marginBottom: 44, maxWidth: 520 }}>
                Pactum é o app de gestão financeira familiar — acompanhe gastos, receitas, investimentos e metas com todo mundo no mesmo painel, em tempo real.
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <TouchableOpacity
                  style={{ backgroundColor: C.texto1, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 }}
                >
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Explorar o app ↓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ borderWidth: 1, borderColor: C.borda, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 10 }}
                >
                  <Text style={{ color: C.texto1, fontSize: 15, fontWeight: '500' }}>Ver a API →</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 36 }}>
                {['iOS nativo', 'Android nativo', 'Web browser', 'API REST pública'].map(p => (
                  <View key={p} style={{
                    backgroundColor: C.fundo2, borderWidth: 1, borderColor: C.borda,
                    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                  }}>
                    <Text style={{ color: C.texto2, fontSize: 12 }}>{p}</Text>
                  </View>
                ))}
              </View>
            </FadeUp>
          </View>

          {isDesktop && (
            <View style={{ flex: 2 }}>
              <FadeUp delay={180}>
                <BrowserMockup />
              </FadeUp>
            </View>
          )}
        </View>
      </Centered>
    </View>
  )
}

// ── App Section ───────────────────────────────────────────────────────────────
const APP_CARDS = [
  { icon: 'home'         as const, titulo: 'Dashboard familiar',          desc: 'Saldo do mês, lançamentos recentes, carteiras e alertas de vencimento — tudo visível para toda a família em um feed compartilhado.' },
  { icon: 'dollar-sign'  as const, titulo: 'Lançamentos e receitas',       desc: 'Registre despesas e receitas com categorias, vencimento e recorrência. Cada lançamento pode ser privado ou visível para a família inteira.' },
  { icon: 'trending-up'  as const, titulo: 'Portfólio de investimentos',   desc: 'Acompanhe seu portfólio com cotações ao vivo via BRAPI. Métricas de P&L, NAV, IRR e TWR para quem leva os investimentos a sério.' },
  { icon: 'target'       as const, titulo: 'Metas financeiras',            desc: 'Crie metas individuais ou familiares, com valor-alvo, prazo e progresso em tempo real. Todo mundo vê quanto falta para chegar lá.' },
  { icon: 'message-circle' as const, titulo: 'Chat da família',            desc: 'Mensagens entre membros e notificações automáticas quando alguém registra um gasto. Transparência sem precisar perguntar nada.' },
  { icon: 'bar-chart-2'  as const, titulo: 'Relatórios detalhados',        desc: 'Gráficos de despesas versus receitas por categoria e mês. Veja para onde o dinheiro da família está indo com clareza visual.' },
]

function AppSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const rows = [APP_CARDS.slice(0, 3), APP_CARDS.slice(3, 6)]
  return (
    <View style={{ backgroundColor: C.fundo2, paddingVertical: 96, borderTopWidth: 1, borderTopColor: C.borda }}>
      <Centered>
        <FadeUp>
          <Tag text="O Aplicativo" />
          <Text style={{ fontSize: isDesktop ? 56 : 38, fontWeight: '800', color: C.texto1, letterSpacing: -1.5, lineHeight: isDesktop ? 64 : 46, marginBottom: 20 }}>
            {'Tudo que a família precisa,\nnum só lugar'}
          </Text>
          <Text style={{ fontSize: 18, color: C.texto2, lineHeight: 32, marginBottom: 64, maxWidth: 560 }}>
            Do saldo do mês até o portfólio de investimentos — o Pactum entrega uma visão financeira completa, compartilhada em tempo real com quem importa.
          </Text>
        </FadeUp>

        {isDesktop ? rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 16, marginBottom: ri < rows.length - 1 ? 16 : 0 }}>
            {row.map((card, ci) => (
              <FadeUp key={card.titulo} delay={(ri * 3 + ci) * 70}>
                <View style={{ flex: 1, backgroundColor: C.fundo, borderRadius: 20, padding: 32, borderWidth: 1, borderColor: C.borda }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.verdeBg, borderWidth: 1, borderColor: C.verdeBd, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Feather name={card.icon} size={20} color={C.verde} />
                  </View>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.texto1, marginBottom: 10, lineHeight: 24 }}>{card.titulo}</Text>
                  <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 26 }}>{card.desc}</Text>
                </View>
              </FadeUp>
            ))}
          </View>
        )) : (
          <View style={{ gap: 14 }}>
            {APP_CARDS.map((card, i) => (
              <FadeUp key={card.titulo} delay={i * 60}>
                <View style={{ backgroundColor: C.fundo, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: C.borda }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.verdeBg, borderWidth: 1, borderColor: C.verdeBd, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Feather name={card.icon} size={20} color={C.verde} />
                  </View>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: C.texto1, marginBottom: 8, lineHeight: 24 }}>{card.titulo}</Text>
                  <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 26 }}>{card.desc}</Text>
                </View>
              </FadeUp>
            ))}
          </View>
        )}
      </Centered>
    </View>
  )
}

// ── API Section ───────────────────────────────────────────────────────────────
const API_DIFERENCIAIS = [
  { titulo: 'Stateless',              desc: 'JWT puro, escala horizontal sem estado de sessão no servidor' },
  { titulo: 'Multi-tenant',           desc: 'Dados completamente isolados por família — sem vazamentos entre contas' },
  { titulo: 'Versionada',             desc: '/api/v1/ — novas versões sem quebrar clientes já integrados' },
  { titulo: 'Rate limiting incluso',  desc: 'rack-attack bloqueia abusos e requisições excessivas por IP' },
  { titulo: 'Queue assíncrona',       desc: 'Sidekiq + Redis — emails e notificações sem bloquear os requests' },
]

const API_ENDPOINTS = [
  { method: 'GET',  path: '/saldo',         desc: 'Saldo mensal calculado' },
  { method: 'GET',  path: '/lancamentos',   desc: 'Despesas e receitas' },
  { method: 'POST', path: '/auth/login',    desc: 'Autenticação JWT' },
  { method: 'POST', path: '/familias',      desc: 'Criar grupo familiar' },
  { method: 'GET',  path: '/investimentos', desc: 'Portfólio completo' },
  { method: 'GET',  path: '/metas',         desc: 'Metas financeiras' },
]

const methodColor = (m: string) => m === 'GET' ? '#3D9E6E' : '#7C9EE8'

const CODE_LINES = [
  { text: '# Saldo familiar do mês corrente',                              color: '#4A5568' },
  { text: 'curl -X GET \\',                                                 color: '#E0E0E0' },
  { text: '  "https://api.pactum.app/v1/saldo\\',                          color: '#C8BFA8' },
  { text: '   ?escopo=familia&mes=5&ano=2026" \\',                          color: '#C8BFA8' },
  { text: '  -H "Authorization: Bearer eyJhbGci..."',                       color: '#7C9EE8' },
  { text: '',                                                                color: '#000' },
  { text: '{',                                                               color: '#E0E0E0' },
  { text: '  "saldo":           3570.10,',                                  color: D.verde   },
  { text: '  "total_receitas":  5800.00,',                                  color: D.verde   },
  { text: '  "total_gastos":    2229.90,',                                  color: D.verde   },
  { text: '  "positivo":        true,',                                     color: D.verde   },
  { text: '  "mes": 5, "ano":   2026',                                      color: D.verde   },
  { text: '}',                                                               color: '#E0E0E0' },
]

function ApiSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  return (
    <View style={{ backgroundColor: D.fundo, paddingVertical: 96 }}>
      <Centered>
        <FadeUp>
          {/* Tag + Header */}
          <Tag text="API Pactum" dark />
          <View style={{ marginBottom: 72, maxWidth: 620 }}>
            <Text style={{ fontSize: isDesktop ? 56 : 38, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: isDesktop ? 64 : 46, marginBottom: 20 }}>
              {'Uma API financeira pronta\npara você integrar'}
            </Text>
            <Text style={{ fontSize: 18, color: D.dim, lineHeight: 30 }}>
              A API REST do Pactum expõe toda a lógica do app para qualquer desenvolvedor. Autenticação, grupos, lançamentos, investimentos e metas — sem precisar construir nada do zero.
            </Text>
          </View>

          {/* Duas colunas */}
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 56 }}>

            {/* Coluna esquerda: diferenciais + CTA */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: D.dim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                Diferenciais técnicos
              </Text>
              <Divisor dark />
              <View style={{ marginBottom: 48 }}>
                {API_DIFERENCIAIS.map(d => (
                  <View key={d.titulo} style={{
                    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
                    paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: D.borda,
                  }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: D.verde, marginTop: 5, flexShrink: 0 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>{d.titulo}</Text>
                      <Text style={{ color: D.dim, fontSize: 13, lineHeight: 21 }}>{d.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={{
                backgroundColor: D.verde, paddingHorizontal: 28, paddingVertical: 14,
                borderRadius: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8,
              }}>
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Explorar a API</Text>
                <Text style={{ color: '#FFF', fontSize: 15 }}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Coluna direita: terminal + endpoints */}
            <View style={{ flex: 1 }}>
              {/* Terminal */}
              <View style={{ backgroundColor: '#0E0E0E', borderRadius: 16, borderWidth: 1, borderColor: D.borda, overflow: 'hidden', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: D.borda, backgroundColor: '#111' }}>
                  {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
                    <View key={c} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
                  ))}
                  <Text style={{ color: D.dim, fontSize: 11, marginLeft: 8, fontFamily: 'monospace' }}>
                    GET /api/v1/saldo
                  </Text>
                </View>
                <View style={{ padding: 24 }}>
                  {CODE_LINES.map((l, i) => (
                    <Text key={i} style={{ color: l.color, fontSize: 13, fontFamily: 'monospace', lineHeight: 22 }}>
                      {l.text}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Endpoints */}
              <Text style={{ fontSize: 11, color: D.dim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
                Endpoints disponíveis
              </Text>
              <View style={{ gap: 8 }}>
                {API_ENDPOINTS.map(ep => (
                  <View key={ep.path} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: D.card, borderRadius: 10, borderWidth: 1, borderColor: D.borda,
                    paddingHorizontal: 16, paddingVertical: 12,
                  }}>
                    <View style={{ backgroundColor: methodColor(ep.method) + '1A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, minWidth: 50, alignItems: 'center' }}>
                      <Text style={{ color: methodColor(ep.method), fontSize: 11, fontWeight: '700', fontFamily: 'monospace' }}>{ep.method}</Text>
                    </View>
                    <Text style={{ color: '#E0E0E0', fontSize: 13, fontFamily: 'monospace', flex: 1 }}>{ep.path}</Text>
                    <Text style={{ color: D.dim, fontSize: 12 }}>{ep.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </FadeUp>
      </Centered>
    </View>
  )
}

// ── Stack Section ─────────────────────────────────────────────────────────────
const STACK_COLS = [
  { categoria: 'Frontend',          items: ['React Native + Expo', 'TypeScript', 'Zustand', 'NativeWind'] },
  { categoria: 'Backend',           items: ['Ruby on Rails 7.2', 'PostgreSQL', 'Sidekiq + Redis', 'Puma'] },
  { categoria: 'Auth & Segurança',  items: ['JWT HS256', 'bcrypt', 'rack-attack', 'SSL + CORS'] },
  { categoria: 'Infraestrutura',    items: ['Railway (CI/CD)', 'EAS Build', 'Docker-ready', 'BRAPI'] },
]

function StackSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  return (
    <View style={{ backgroundColor: C.fundo, paddingVertical: 96, borderTopWidth: 1, borderTopColor: C.borda }}>
      <Centered>
        <FadeUp>
          <Tag text="Stack Técnica" />
          <Text style={{ fontSize: isDesktop ? 56 : 38, fontWeight: '800', color: C.texto1, letterSpacing: -1.5, lineHeight: isDesktop ? 64 : 46, marginBottom: 20 }}>
            {'Construído com tecnologia\nde produção real'}
          </Text>
          <Text style={{ fontSize: 18, color: C.texto2, lineHeight: 32, marginBottom: 64, maxWidth: 540 }}>
            Cada tecnologia foi escolhida por um motivo. Código compartilhado entre iOS, Android e Web. Backend stateless que escala. Infraestrutura que se atualiza sozinha.
          </Text>
        </FadeUp>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 16 }}>
          {STACK_COLS.map((col, i) => (
            <FadeUp key={col.categoria} delay={i * 80}>
              <View style={{ flex: 1, backgroundColor: C.fundo2, borderRadius: 16, padding: 28, borderWidth: 1, borderColor: C.borda }}>
                <Text style={{ fontSize: 11, color: C.verde, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20, fontWeight: '600' }}>
                  {col.categoria}
                </Text>
                <View style={{ gap: 12 }}>
                  {col.items.map(item => (
                    <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.borda }} />
                      <Text style={{ color: C.texto1, fontSize: 14, fontWeight: '500' }}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </FadeUp>
          ))}
        </View>
      </Centered>
    </View>
  )
}

// ── Security Section ──────────────────────────────────────────────────────────
const SECURITY_ITEMS = [
  { icon: 'clock'   as const, titulo: 'JWT com expiração',       desc: 'Access token de 1h, refresh de 30 dias. Sessões stateless.' },
  { icon: 'lock'    as const, titulo: 'bcrypt nas senhas',        desc: 'Nenhuma senha armazenada em texto puro.' },
  { icon: 'shield'  as const, titulo: 'Rate limiting',            desc: 'rack-attack bloqueia abusos por IP automaticamente.' },
  { icon: 'wifi'    as const, titulo: 'SSL obrigatório',          desc: 'Todo tráfego em produção é criptografado.' },
  { icon: 'globe'   as const, titulo: 'CORS configurável',        desc: 'Aceita apenas origens autorizadas em produção.' },
  { icon: 'key'     as const, titulo: 'Secrets criptografados',   desc: 'Rails credentials — nenhum segredo exposto no código.' },
]

function SecuritySection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const rows = [SECURITY_ITEMS.slice(0, 3), SECURITY_ITEMS.slice(3, 6)]
  return (
    <View style={{ backgroundColor: C.fundo2, paddingVertical: 96, borderTopWidth: 1, borderTopColor: C.borda }}>
      <Centered>
        <FadeUp>
          <Tag text="Segurança" />
          <Text style={{ fontSize: isDesktop ? 56 : 38, fontWeight: '800', color: C.texto1, letterSpacing: -1.5, lineHeight: isDesktop ? 64 : 46, marginBottom: 64 }}>
            {'Seus dados protegidos\npor padrão'}
          </Text>
        </FadeUp>
        {isDesktop ? rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 16, marginBottom: ri < rows.length - 1 ? 16 : 0 }}>
            {row.map((item, ci) => (
              <FadeUp key={item.titulo} delay={(ri * 3 + ci) * 60}>
                <View style={{ flex: 1, backgroundColor: C.fundo, borderRadius: 16, padding: 28, borderWidth: 1, borderColor: C.borda, flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.verdeBg, borderWidth: 1, borderColor: C.verdeBd, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Feather name={item.icon} size={18} color={C.verde} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.texto1, fontSize: 15, fontWeight: '700', marginBottom: 6 }}>{item.titulo}</Text>
                    <Text style={{ color: C.texto2, fontSize: 14, lineHeight: 22 }}>{item.desc}</Text>
                  </View>
                </View>
              </FadeUp>
            ))}
          </View>
        )) : (
          <View style={{ gap: 12 }}>
            {SECURITY_ITEMS.map((item, i) => (
              <FadeUp key={item.titulo} delay={i * 50}>
                <View style={{ backgroundColor: C.fundo, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: C.borda, flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.verdeBg, borderWidth: 1, borderColor: C.verdeBd, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Feather name={item.icon} size={18} color={C.verde} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.texto1, fontSize: 15, fontWeight: '700', marginBottom: 5 }}>{item.titulo}</Text>
                    <Text style={{ color: C.texto2, fontSize: 14, lineHeight: 22 }}>{item.desc}</Text>
                  </View>
                </View>
              </FadeUp>
            ))}
          </View>
        )}
      </Centered>
    </View>
  )
}

// ── Business Models ───────────────────────────────────────────────────────────
const PLANOS = [
  {
    tag:      'B2C · Para famílias',
    preco:    'R$ 9,90',
    periodo:  '/mês',
    titulo:   'SaaS Direto',
    desc:     'O app Pactum como assinatura para famílias que querem controle financeiro real, sem planilha.',
    items:    ['Grupo familiar ilimitado', 'Relatórios e gráficos', 'Portfólio de investimentos', 'Chat e feed em tempo real', 'iOS, Android e Web'],
    destaque: false,
    cta:      'Começar grátis',
    acao:     () => router.push('/register'),
  },
  {
    tag:      'B2D · Para desenvolvedores',
    preco:    'por req',
    periodo:  ' ou mês',
    titulo:   'API como Produto',
    desc:     'Venda acesso à API para devs que querem construir apps financeiros sem reinventar a roda.',
    items:    ['Autenticação pronta', 'Grupos e permissões', 'Cálculo de saldo automático', 'Investimentos e metas', 'Planos free, pro e enterprise'],
    destaque: true,
    cta:      'Explorar a API →',
    acao:     () => {},
  },
  {
    tag:      'B2B · Para empresas',
    preco:    'Custom',
    periodo:  '',
    titulo:   'White-label',
    desc:     'A solução completa com sua marca. Para fintechs, bancos digitais e apps de RH que querem finanças familiares como feature.',
    items:    ['App com sua identidade visual', 'API exclusiva por cliente', 'SLA garantido', 'Suporte dedicado', 'Integrações customizadas'],
    destaque: false,
    cta:      'Entrar em contato',
    acao:     () => {},
  },
]

function BusinessSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  return (
    <View style={{ backgroundColor: C.fundo, paddingVertical: 96, borderTopWidth: 1, borderTopColor: C.borda }}>
      <Centered>
        <FadeUp>
          <Tag text="Modelos de Negócio" />
          <Text style={{ fontSize: isDesktop ? 56 : 38, fontWeight: '800', color: C.texto1, letterSpacing: -1.5, lineHeight: isDesktop ? 64 : 46, marginBottom: 20 }}>
            {'Três caminhos para gerar\nvalor com o Pactum'}
          </Text>
          <Text style={{ fontSize: 18, color: C.texto2, lineHeight: 32, marginBottom: 64, maxWidth: 480 }}>
            A infraestrutura está pronta. A escolha de como monetizar é sua.
          </Text>
        </FadeUp>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 20 }}>
          {PLANOS.map((p, i) => (
            <FadeUp key={p.titulo} delay={i * 100}>
              <View style={{
                flex: 1,
                backgroundColor: p.destaque ? C.texto1 : C.fundo2,
                borderRadius: 24, padding: 36,
                borderWidth: 1, borderColor: p.destaque ? C.texto1 : C.borda,
              }}>
                {p.destaque && (
                  <View style={{ alignSelf: 'flex-start', backgroundColor: D.verde, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 20 }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>Maior potencial</Text>
                  </View>
                )}
                <Text style={{ fontSize: 11, color: p.destaque ? '#666' : C.texto2, letterSpacing: 0.8, marginBottom: 20 }}>
                  {p.tag}
                </Text>
                <Text style={{ fontSize: 42, fontWeight: '800', color: p.destaque ? '#FFF' : C.texto1, letterSpacing: -1.5 }}>
                  {p.preco}
                </Text>
                <Text style={{ fontSize: 14, color: p.destaque ? '#666' : C.texto2, marginBottom: 24 }}>
                  {p.periodo}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: p.destaque ? '#FFF' : C.texto1, marginBottom: 10 }}>
                  {p.titulo}
                </Text>
                <Text style={{ fontSize: 14, color: p.destaque ? '#999' : C.texto2, lineHeight: 24, marginBottom: 28 }}>
                  {p.desc}
                </Text>
                <View style={{ gap: 10, marginBottom: 32 }}>
                  {p.items.map(item => (
                    <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                      <Text style={{ color: D.verde, fontSize: 14, lineHeight: 22 }}>✓</Text>
                      <Text style={{ color: p.destaque ? '#CCC' : C.texto2, fontSize: 14, lineHeight: 22, flex: 1 }}>{item}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={p.acao}
                  style={{
                    backgroundColor: p.destaque ? D.verde : 'transparent',
                    borderWidth: p.destaque ? 0 : 1, borderColor: C.borda,
                    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
                  }}
                >
                  <Text style={{ color: p.destaque ? '#FFF' : C.texto1, fontSize: 15, fontWeight: '700' }}>
                    {p.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeUp>
          ))}
        </View>
      </Centered>
    </View>
  )
}

// ── CTA Final ─────────────────────────────────────────────────────────────────
function CtaFinalSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768
  return (
    <View style={{ backgroundColor: D.fundo, paddingVertical: 96, borderTopWidth: 1, borderTopColor: D.borda }}>
      <Centered>
        <FadeUp>
          <Text style={{ fontSize: isDesktop ? 56 : 38, fontWeight: '800', color: '#FFFFFF', letterSpacing: -2, lineHeight: isDesktop ? 64 : 48, marginBottom: 20, textAlign: 'center', alignSelf: 'center', maxWidth: 600 }}>
            Pronto para colocar o Pactum em produção?
          </Text>
          <Text style={{ fontSize: 18, color: D.dim, lineHeight: 30, textAlign: 'center', marginBottom: 48, maxWidth: 480, alignSelf: 'center' }}>
            Conheça a documentação, explore os endpoints ou entre em contato para falar sobre integração ou parceria comercial.
          </Text>
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ backgroundColor: D.verde, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Explorar a API →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ borderWidth: 1, borderColor: '#333', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '500' }}>Entrar em contato</Text>
            </TouchableOpacity>
          </View>
        </FadeUp>
      </Centered>
    </View>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function LandingFooter() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768
  return (
    <View style={{ paddingVertical: 40, backgroundColor: D.fundo, borderTopWidth: 1, borderTopColor: D.borda }}>
      <Centered>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 3.5 }}>PACTUM</Text>
          <View style={{ flexDirection: 'row', gap: 28, flexWrap: 'wrap' }}>
            <Text style={{ color: D.dim, fontSize: 13 }}>Recursos</Text>
            <Text style={{ color: D.dim, fontSize: 13 }}>API</Text>
            <Text style={{ color: D.dim, fontSize: 13 }}>Sobre</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: D.dim, fontSize: 13 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: D.dim, fontSize: 12 }}>
            Construído com 💚 usando Ruby on Rails + React Native · Pactum © 2025
          </Text>
        </View>
      </Centered>
    </View>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <View style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.fundo} />
      <LandingHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection />
        <AppSection />
        <ApiSection />
        <StackSection />
        <SecuritySection />
        <BusinessSection />
        <CtaFinalSection />
        <LandingFooter />
      </ScrollView>
    </View>
  )
}
