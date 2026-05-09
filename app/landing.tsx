import { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Animated, useWindowDimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import HeroCanvas from '../components/HeroCanvas'

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  branco:  '#FFFFFF',
  creme:   '#F4F3EF',     // fundo alternativo quente — igual ao Wealthsimple
  creme2:  '#ECEAE3',     // levemente mais escuro para cards
  texto1:  '#1A1A1A',
  texto2:  '#6E6E6E',
  texto3:  '#AAAAAA',
  verde:   '#2A7A50',
  verdeBg: '#EBF5EF',
  verdeBd: '#A8D5B8',
  borda:   '#E0DED8',
}
const D = {
  fundo:  '#0A0A0A',
  card:   '#131313',
  borda:  '#1E1E1E',
  verde:  '#3D9E6E',
  texto:  '#EAEAEA',
  dim:    '#525252',
  dim2:   '#353535',
}
const MAX_W = 1160

// ── Helpers ───────────────────────────────────────────────────────────────────
function Centered({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions()
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: width >= 768 ? 56 : 24 }}>
        {children}
      </View>
    </View>
  )
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current
  const ty      = useRef(new Animated.Value(32)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, delay, useNativeDriver: true }),
      Animated.timing(ty,      { toValue: 0, duration: 800, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity, transform: [{ translateY: ty }] }}>{children}</Animated.View>
}

// Eyebrow — letras pequenas acima do título (estilo Wealthsimple)
function Eyebrow({ text, light }: { text: string; light?: boolean }) {
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      color: light ? D.dim : C.texto3,
      marginBottom: 20,
    }}>
      {text}
    </Text>
  )
}

// ── Browser Mockup ────────────────────────────────────────────────────────────
function BrowserMockup() {
  const [count, setCount] = useState(0)
  const target = 3570.10
  useEffect(() => {
    let v = 0; const step = target / 70
    const t = setInterval(() => {
      v += step
      if (v >= target) { setCount(target); clearInterval(t) }
      else setCount(Math.round(v * 100) / 100)
    }, 18)
    return () => clearInterval(t)
  }, [])
  const items = [
    { desc: 'Salário',   val: '+5.000,00', pos: true  },
    { desc: 'Aluguel',   val: '-1.200,00', pos: false },
    { desc: 'Freela',    val: '+800,00',   pos: true  },
    { desc: 'Netflix',   val: '-29,90',    pos: false },
  ]
  return (
    <View style={{ borderRadius: 18, overflow: 'hidden', backgroundColor: '#0C0C0C', shadowColor: '#000', shadowOffset: { width: 0, height: 40 }, shadowOpacity: 0.45, shadowRadius: 80 }}>
      {/* Chrome */}
      <View style={{ height: 40, backgroundColor: '#161616', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 }}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c => <View key={c} style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c }} />)}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#222', borderRadius: 6, paddingHorizontal: 18, paddingVertical: 4 }}>
            <Text style={{ color: '#555', fontSize: 11 }}>pactum.app</Text>
          </View>
        </View>
      </View>
      {/* App */}
      <View style={{ padding: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
          <Text style={{ color: '#C8BFA8', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>PACTUM</Text>
          <Text style={{ color: '#3A3A3A', fontSize: 10 }}>Maio 2026</Text>
        </View>
        {/* Saldo */}
        <View style={{ backgroundColor: '#141414', borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <Text style={{ color: '#3A3A3A', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' }}>Saldo do mês</Text>
          <Text style={{ color: '#C8BFA8', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -1 }}>
            R$ {count.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <View style={{ flex: 1, backgroundColor: '#0D1E14', borderRadius: 10, padding: 12 }}>
              <Text style={{ color: D.verde, fontSize: 8, letterSpacing: 1, marginBottom: 4 }}>RECEITAS</Text>
              <Text style={{ color: D.verde, fontSize: 14, fontWeight: '700' }}>+R$ 5.800</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#1E0D0D', borderRadius: 10, padding: 12 }}>
              <Text style={{ color: '#C94F4F', fontSize: 8, letterSpacing: 1, marginBottom: 4 }}>GASTOS</Text>
              <Text style={{ color: '#C94F4F', fontSize: 14, fontWeight: '700' }}>-R$ 2.230</Text>
            </View>
          </View>
        </View>
        {/* Lançamentos */}
        <Text style={{ color: '#2A2A2A', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Lançamentos</Text>
        {items.map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: '#1A1A1A' }}>
            <Text style={{ color: '#777', fontSize: 13 }}>{t.desc}</Text>
            <Text style={{ color: t.pos ? D.verde : '#C94F4F', fontSize: 13, fontWeight: '600' }}>{t.val}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
function LandingHeader({ scrollY }: { scrollY: Animated.Value }) {
  const { width } = useWindowDimensions()
  const desk = width >= 768

  const bgOpacity = scrollY.interpolate({ inputRange: [0, 90], outputRange: [0, 1], extrapolate: 'clamp' })
  const borderOpacity = scrollY.interpolate({ inputRange: [60, 90], outputRange: [0, 1], extrapolate: 'clamp' })

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 66, zIndex: 100, justifyContent: 'center' }}>
      {/* Fundo que aparece ao scrollar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.branco, opacity: bgOpacity }} />
      {/* Borda inferior que aparece junto */}
      <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: C.borda, opacity: borderOpacity }} />

      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: desk ? 56 : 24, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '900', color: C.texto1, letterSpacing: 4, flex: 1 }}>PACTUM</Text>
        {desk && (
          <View style={{ flexDirection: 'row', gap: 36, marginRight: 36 }}>
            {['Recursos', 'API', 'Sobre'].map(l => (
              <Text key={l} style={{ color: C.texto2, fontSize: 14 }}>{l}</Text>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => router.push('/login')} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: C.borda, backgroundColor: 'rgba(255,255,255,0.85)' }}>
            <Text style={{ color: C.texto1, fontSize: 14 }}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')} style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8, backgroundColor: C.texto1 }}>
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
  const desk = width >= 1024

  return (
    <View style={{ backgroundColor: C.branco, paddingTop: desk ? 160 : 110, paddingBottom: desk ? 100 : 64, overflow: 'hidden' }}>
      <HeroCanvas />
      <Centered>
        {/* Badge */}
        <FadeUp>
          <View style={{ alignSelf: desk ? 'center' : 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.verdeBg, borderWidth: 1, borderColor: C.verdeBd, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 48 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.verde }} />
            <Text style={{ color: C.verde, fontSize: 13, fontWeight: '500' }}>Disponível para iOS, Android e Web</Text>
          </View>
        </FadeUp>

        {/* Headline principal — estilo Wealthsimple: enorme, bold, respirando */}
        <FadeUp delay={80}>
          <Text style={{
            fontSize: desk ? 96 : 52,
            fontWeight: '900',
            color: C.texto1,
            letterSpacing: desk ? -4 : -2,
            lineHeight: desk ? 104 : 60,
            textAlign: desk ? 'center' : 'left',
            marginBottom: 32,
          }}>
            {'Finanças que a família\nentende juntos'}
          </Text>
        </FadeUp>

        <FadeUp delay={160}>
          <Text style={{
            fontSize: desk ? 20 : 17,
            color: C.texto2,
            lineHeight: desk ? 34 : 28,
            textAlign: desk ? 'center' : 'left',
            maxWidth: 580,
            alignSelf: desk ? 'center' : 'flex-start',
            marginBottom: 48,
          }}>
            Pactum é o app de gestão financeira familiar — acompanhe gastos, receitas, investimentos e metas com todo mundo no mesmo painel, em tempo real.
          </Text>
        </FadeUp>

        <FadeUp delay={240}>
          <View style={{ flexDirection: 'row', justifyContent: desk ? 'center' : 'flex-start', gap: 14, flexWrap: 'wrap', marginBottom: 56 }}>
            <TouchableOpacity style={{ backgroundColor: C.texto1, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 10 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Explorar o app ↓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingHorizontal: 28, paddingVertical: 15, borderRadius: 10, borderWidth: 1.5, borderColor: C.borda }}>
              <Text style={{ color: C.texto1, fontSize: 16, fontWeight: '500' }}>Ver a API →</Text>
            </TouchableOpacity>
          </View>

          {/* Platform pills */}
          <View style={{ flexDirection: 'row', justifyContent: desk ? 'center' : 'flex-start', flexWrap: 'wrap', gap: 10 }}>
            {['iOS nativo', 'Android nativo', 'Web browser', 'API REST pública'].map(p => (
              <View key={p} style={{ backgroundColor: C.creme, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                <Text style={{ color: C.texto2, fontSize: 13 }}>{p}</Text>
              </View>
            ))}
          </View>
        </FadeUp>

        {/* Mockup — abaixo no hero (desktop) */}
        {desk && (
          <FadeUp delay={320}>
            <View style={{ marginTop: 80, maxWidth: 480, alignSelf: 'center' }}>
              <BrowserMockup />
            </View>
          </FadeUp>
        )}
      </Centered>
    </View>
  )
}

// ── App Section — 6 cards estilo Wealthsimple ────────────────────────────────
const APP_CARDS = [
  { num: '01', cat: 'Dashboard',     titulo: 'Dashboard familiar',        desc: 'Saldo do mês, lançamentos recentes, carteiras e alertas de vencimento — tudo visível para toda a família em um feed compartilhado.' },
  { num: '02', cat: 'Lançamentos',   titulo: 'Lançamentos e receitas',    desc: 'Registre despesas e receitas com categorias, vencimento e recorrência. Cada lançamento pode ser privado ou visível para a família inteira.' },
  { num: '03', cat: 'Investimentos', titulo: 'Portfólio de investimentos', desc: 'Acompanhe seu portfólio com cotações ao vivo via BRAPI. Métricas de P&L, NAV, IRR e TWR para quem leva os investimentos a sério.' },
  { num: '04', cat: 'Metas',         titulo: 'Metas financeiras',          desc: 'Crie metas individuais ou familiares, com valor-alvo, prazo e progresso em tempo real. Todo mundo vê quanto falta para chegar lá.' },
  { num: '05', cat: 'Chat',          titulo: 'Chat da família',            desc: 'Mensagens entre membros e notificações automáticas quando alguém registra um gasto. Transparência sem precisar perguntar nada.' },
  { num: '06', cat: 'Relatórios',    titulo: 'Relatórios detalhados',     desc: 'Gráficos de despesas versus receitas por categoria e mês. Veja para onde o dinheiro da família está indo com clareza visual.' },
]

function AppSection() {
  const { width } = useWindowDimensions()
  const desk = width >= 1024
  return (
    <View style={{ backgroundColor: C.creme, paddingTop: 120, paddingBottom: 120 }}>
      <Centered>
        <FadeUp>
          <Eyebrow text="O Aplicativo" />
          <Text style={{ fontSize: desk ? 72 : 44, fontWeight: '900', color: C.texto1, letterSpacing: desk ? -3 : -1.5, lineHeight: desk ? 78 : 52, marginBottom: 24 }}>
            {'Tudo que a família\nprecisa, num só lugar'}
          </Text>
          <Text style={{ fontSize: 19, color: C.texto2, lineHeight: 33, marginBottom: 80, maxWidth: 560 }}>
            Do saldo do mês até o portfólio de investimentos — o Pactum entrega uma visão financeira completa, compartilhada em tempo real com quem importa.
          </Text>
        </FadeUp>

        {/* Grid 3x2 sem bordas — apenas fundo creme2 */}
        {desk ? (
          <>
            {[APP_CARDS.slice(0, 3), APP_CARDS.slice(3, 6)].map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 3, marginBottom: 3 }}>
                {row.map((card, ci) => (
                  <FadeUp key={card.num} delay={(ri * 3 + ci) * 60}>
                    <View style={{ flex: 1, backgroundColor: ri === 0 ? C.creme2 : C.branco, borderRadius: 20, padding: 40 }}>
                      <Text style={{ fontSize: 11, color: C.texto3, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>{card.cat}</Text>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: C.texto1, marginBottom: 14, lineHeight: 30, letterSpacing: -0.5 }}>{card.titulo}</Text>
                      <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 26 }}>{card.desc}</Text>
                    </View>
                  </FadeUp>
                ))}
              </View>
            ))}
          </>
        ) : (
          <View style={{ gap: 3 }}>
            {APP_CARDS.map((card, i) => (
              <FadeUp key={card.num} delay={i * 50}>
                <View style={{ backgroundColor: i % 2 === 0 ? C.creme2 : C.branco, borderRadius: 20, padding: 32 }}>
                  <Text style={{ fontSize: 11, color: C.texto3, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>{card.cat}</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.texto1, marginBottom: 10, lineHeight: 28 }}>{card.titulo}</Text>
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
  { titulo: 'Stateless',             desc: 'JWT puro, escala horizontal sem estado de sessão no servidor' },
  { titulo: 'Multi-tenant',          desc: 'Dados completamente isolados por família — sem vazamentos entre contas' },
  { titulo: 'Versionada',            desc: '/api/v1/ — novas versões sem quebrar clientes já integrados' },
  { titulo: 'Rate limiting incluso', desc: 'rack-attack bloqueia abusos e requisições excessivas por IP' },
  { titulo: 'Queue assíncrona',      desc: 'Sidekiq + Redis — emails e notificações sem bloquear os requests' },
]
const API_ENDPOINTS = [
  { method: 'GET',  path: '/saldo',          desc: 'Saldo mensal calculado' },
  { method: 'GET',  path: '/lancamentos',    desc: 'Despesas e receitas' },
  { method: 'POST', path: '/auth/login',     desc: 'Autenticação JWT' },
  { method: 'POST', path: '/familias',       desc: 'Criar grupo familiar' },
  { method: 'GET',  path: '/investimentos',  desc: 'Portfólio completo' },
  { method: 'GET',  path: '/metas',          desc: 'Metas financeiras' },
]
const mColor = (m: string) => m === 'GET' ? D.verde : '#7C9EE8'

const CODE: { text: string; color: string }[] = [
  { text: '# Saldo familiar do mês corrente',                     color: '#3D4A3A' },
  { text: 'curl -X GET \\',                                        color: '#DADADA' },
  { text: '  "https://api.pactum.app/v1/saldo\\',                 color: '#C8BFA8' },
  { text: '   ?escopo=familia&mes=5&ano=2026" \\',                 color: '#C8BFA8' },
  { text: '  -H "Authorization: Bearer eyJhbGci..."',              color: '#7C9EE8' },
  { text: '',                                                       color: '#000'    },
  { text: '{',                                                      color: '#DADADA' },
  { text: '  "saldo":          3570.10,',                          color: D.verde   },
  { text: '  "total_receitas": 5800.00,',                          color: D.verde   },
  { text: '  "total_gastos":   2229.90,',                          color: D.verde   },
  { text: '  "positivo":       true,',                             color: D.verde   },
  { text: '  "mes": 5,  "ano": 2026',                              color: D.verde   },
  { text: '}',                                                      color: '#DADADA' },
]

function ApiSection() {
  const { width } = useWindowDimensions()
  const desk = width >= 1024
  return (
    <View style={{ backgroundColor: D.fundo, paddingTop: 120, paddingBottom: 120 }}>
      <Centered>
        <FadeUp>
          <Eyebrow text="API Pactum" light />

          {/* Título grande — estilo Wealthsimple */}
          <Text style={{ fontSize: desk ? 72 : 44, fontWeight: '900', color: '#FFFFFF', letterSpacing: desk ? -3 : -1.5, lineHeight: desk ? 78 : 52, marginBottom: 24, maxWidth: 700 }}>
            {'Uma API financeira pronta\npara você integrar'}
          </Text>
          <Text style={{ fontSize: 19, color: D.dim, lineHeight: 32, marginBottom: 80, maxWidth: 560 }}>
            A API REST do Pactum expõe toda a lógica do app para qualquer desenvolvedor. Autenticação, grupos, lançamentos, investimentos e metas — sem precisar construir nada do zero.
          </Text>

          {/* Duas colunas */}
          <View style={{ flexDirection: desk ? 'row' : 'column', gap: 64 }}>

            {/* Esquerda: diferenciais */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 2.5, textTransform: 'uppercase', color: D.dim, marginBottom: 4 }}>
                Diferenciais técnicos
              </Text>
              <View style={{ height: 1, backgroundColor: D.dim2, marginBottom: 0 }} />
              {API_DIFERENCIAIS.map(d => (
                <View key={d.titulo} style={{ paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: D.dim2, flexDirection: 'row', alignItems: 'flex-start', gap: 20 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: D.verde, marginTop: 6, flexShrink: 0 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 5 }}>{d.titulo}</Text>
                    <Text style={{ color: D.dim, fontSize: 14, lineHeight: 22 }}>{d.desc}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={{ marginTop: 40, backgroundColor: D.verde, paddingHorizontal: 28, paddingVertical: 15, borderRadius: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Explorar a API</Text>
                <Text style={{ color: '#FFF' }}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Direita: terminal + endpoints */}
            <View style={{ flex: 1 }}>
              {/* Terminal */}
              <View style={{ backgroundColor: '#0D0D0D', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 13, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: D.borda }}>
                  {['#FF5F57','#FFBD2E','#28CA41'].map(c => <View key={c} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />)}
                  <Text style={{ color: D.dim, fontSize: 11, marginLeft: 8, fontFamily: 'monospace' }}>GET /api/v1/saldo</Text>
                </View>
                <View style={{ padding: 28 }}>
                  {CODE.map((l, i) => (
                    <Text key={i} style={{ color: l.color, fontSize: 13, fontFamily: 'monospace', lineHeight: 23 }}>{l.text}</Text>
                  ))}
                </View>
              </View>

              {/* Endpoints */}
              <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 2.5, textTransform: 'uppercase', color: D.dim, marginBottom: 14 }}>
                Endpoints disponíveis
              </Text>
              <View style={{ gap: 6 }}>
                {API_ENDPOINTS.map(ep => (
                  <View key={ep.path} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: D.card, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 13 }}>
                    <View style={{ backgroundColor: mColor(ep.method) + '1A', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3, minWidth: 52, alignItems: 'center' }}>
                      <Text style={{ color: mColor(ep.method), fontSize: 11, fontWeight: '700', fontFamily: 'monospace' }}>{ep.method}</Text>
                    </View>
                    <Text style={{ color: '#DADADA', fontSize: 13, fontFamily: 'monospace', flex: 1 }}>{ep.path}</Text>
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
const STACK = [
  { cat: 'Frontend',         items: ['React Native + Expo', 'TypeScript', 'Zustand', 'NativeWind'] },
  { cat: 'Backend',          items: ['Ruby on Rails 7.2', 'PostgreSQL', 'Sidekiq + Redis', 'Puma'] },
  { cat: 'Auth & Segurança', items: ['JWT HS256', 'bcrypt', 'rack-attack', 'SSL + CORS'] },
  { cat: 'Infraestrutura',   items: ['Railway (CI/CD)', 'EAS Build', 'Docker-ready', 'BRAPI'] },
]

function StackSection() {
  const { width } = useWindowDimensions()
  const desk = width >= 1024
  return (
    <View style={{ backgroundColor: C.branco, paddingTop: 120, paddingBottom: 120 }}>
      <Centered>
        <FadeUp>
          <Eyebrow text="Stack Técnica" />
          <Text style={{ fontSize: desk ? 72 : 44, fontWeight: '900', color: C.texto1, letterSpacing: desk ? -3 : -1.5, lineHeight: desk ? 78 : 52, marginBottom: 24 }}>
            {'Construído com tecnologia\nde produção real'}
          </Text>
          <Text style={{ fontSize: 19, color: C.texto2, lineHeight: 33, marginBottom: 80, maxWidth: 540 }}>
            Cada tecnologia foi escolhida por um motivo. Código compartilhado entre iOS, Android e Web. Backend stateless que escala. Infraestrutura que se atualiza sozinha.
          </Text>
        </FadeUp>
        <View style={{ flexDirection: desk ? 'row' : 'column', gap: 3 }}>
          {STACK.map((col, i) => (
            <FadeUp key={col.cat} delay={i * 70}>
              <View style={{ flex: 1, backgroundColor: C.creme, borderRadius: 20, padding: 36 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.verde, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>{col.cat}</Text>
                <View style={{ gap: 14 }}>
                  {col.items.map(item => (
                    <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.borda }} />
                      <Text style={{ color: C.texto1, fontSize: 15, fontWeight: '500' }}>{item}</Text>
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
const SEC = [
  { icon: 'clock'   as const, titulo: 'JWT com expiração',      desc: 'Access token de 1h, refresh de 30 dias. Sessões stateless.' },
  { icon: 'lock'    as const, titulo: 'bcrypt nas senhas',       desc: 'Nenhuma senha armazenada em texto puro.' },
  { icon: 'shield'  as const, titulo: 'Rate limiting',           desc: 'rack-attack bloqueia abusos por IP automaticamente.' },
  { icon: 'wifi'    as const, titulo: 'SSL obrigatório',         desc: 'Todo tráfego em produção é criptografado.' },
  { icon: 'globe'   as const, titulo: 'CORS configurável',       desc: 'Aceita apenas origens autorizadas em produção.' },
  { icon: 'key'     as const, titulo: 'Secrets criptografados',  desc: 'Rails credentials — nenhum segredo exposto no código.' },
]

function SecuritySection() {
  const { width } = useWindowDimensions()
  const desk = width >= 1024
  return (
    <View style={{ backgroundColor: C.creme, paddingTop: 120, paddingBottom: 120 }}>
      <Centered>
        <FadeUp>
          <Eyebrow text="Segurança" />
          <Text style={{ fontSize: desk ? 72 : 44, fontWeight: '900', color: C.texto1, letterSpacing: desk ? -3 : -1.5, lineHeight: desk ? 78 : 52, marginBottom: 80 }}>
            {'Seus dados protegidos\npor padrão'}
          </Text>
        </FadeUp>
        {desk ? (
          [SEC.slice(0, 3), SEC.slice(3, 6)].map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap: 3, marginBottom: 3 }}>
              {row.map((item, ci) => (
                <FadeUp key={item.titulo} delay={(ri * 3 + ci) * 55}>
                  <View style={{ flex: 1, backgroundColor: C.branco, borderRadius: 20, padding: 36 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.verdeBg, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Feather name={item.icon} size={20} color={C.verde} />
                    </View>
                    <Text style={{ color: C.texto1, fontSize: 17, fontWeight: '700', marginBottom: 8, lineHeight: 24 }}>{item.titulo}</Text>
                    <Text style={{ color: C.texto2, fontSize: 14, lineHeight: 23 }}>{item.desc}</Text>
                  </View>
                </FadeUp>
              ))}
            </View>
          ))
        ) : (
          <View style={{ gap: 3 }}>
            {SEC.map((item, i) => (
              <FadeUp key={item.titulo} delay={i * 50}>
                <View style={{ backgroundColor: C.branco, borderRadius: 20, padding: 28, flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: C.verdeBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Feather name={item.icon} size={19} color={C.verde} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.texto1, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>{item.titulo}</Text>
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
    tag: 'B2C · Para famílias', preco: 'R$ 9,90', periodo: '/mês',
    titulo: 'SaaS Direto', destaque: false,
    desc: 'O app Pactum como assinatura para famílias que querem controle financeiro real, sem planilha.',
    items: ['Grupo familiar ilimitado', 'Relatórios e gráficos', 'Portfólio de investimentos', 'Chat e feed em tempo real', 'iOS, Android e Web'],
    cta: 'Começar grátis', acao: () => router.push('/register'),
  },
  {
    tag: 'B2D · Para desenvolvedores', preco: 'por req', periodo: ' ou mês',
    titulo: 'API como Produto', destaque: true,
    desc: 'Venda acesso à API para devs que querem construir apps financeiros sem reinventar a roda.',
    items: ['Autenticação pronta', 'Grupos e permissões', 'Cálculo de saldo automático', 'Investimentos e metas', 'Planos free, pro e enterprise'],
    cta: 'Explorar a API →', acao: () => {},
  },
  {
    tag: 'B2B · Para empresas', preco: 'Custom', periodo: '',
    titulo: 'White-label', destaque: false,
    desc: 'A solução completa com sua marca. Para fintechs, bancos digitais e apps de RH.',
    items: ['App com sua identidade visual', 'API exclusiva por cliente', 'SLA garantido', 'Suporte dedicado', 'Integrações customizadas'],
    cta: 'Entrar em contato', acao: () => {},
  },
]

function BusinessSection() {
  const { width } = useWindowDimensions()
  const desk = width >= 1024
  return (
    <View style={{ backgroundColor: C.branco, paddingTop: 120, paddingBottom: 120 }}>
      <Centered>
        <FadeUp>
          <Eyebrow text="Modelos de Negócio" />
          <Text style={{ fontSize: desk ? 72 : 44, fontWeight: '900', color: C.texto1, letterSpacing: desk ? -3 : -1.5, lineHeight: desk ? 78 : 52, marginBottom: 20 }}>
            {'Três caminhos para gerar\nvalor com o Pactum'}
          </Text>
          <Text style={{ fontSize: 19, color: C.texto2, lineHeight: 33, marginBottom: 80, maxWidth: 480 }}>
            A infraestrutura está pronta. A escolha de como monetizar é sua.
          </Text>
        </FadeUp>
        <View style={{ flexDirection: desk ? 'row' : 'column', gap: 3 }}>
          {PLANOS.map((p, i) => (
            <FadeUp key={p.titulo} delay={i * 80}>
              <View style={{ flex: 1, backgroundColor: p.destaque ? C.texto1 : C.creme, borderRadius: 24, padding: desk ? 44 : 36 }}>
                {p.destaque && (
                  <View style={{ alignSelf: 'flex-start', backgroundColor: D.verde, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 24 }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>Maior potencial</Text>
                  </View>
                )}
                <Text style={{ fontSize: 11, color: p.destaque ? '#555' : C.texto3, letterSpacing: 1, marginBottom: 20 }}>{p.tag}</Text>
                <Text style={{ fontSize: 46, fontWeight: '900', color: p.destaque ? '#FFF' : C.texto1, letterSpacing: -2 }}>{p.preco}</Text>
                <Text style={{ fontSize: 14, color: p.destaque ? '#555' : C.texto2, marginBottom: 28 }}>{p.periodo}</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: p.destaque ? '#FFF' : C.texto1, marginBottom: 12, letterSpacing: -0.5 }}>{p.titulo}</Text>
                <Text style={{ fontSize: 15, color: p.destaque ? '#888' : C.texto2, lineHeight: 25, marginBottom: 32 }}>{p.desc}</Text>
                <View style={{ gap: 12, marginBottom: 36 }}>
                  {p.items.map(item => (
                    <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <Text style={{ color: D.verde, fontSize: 15, lineHeight: 24 }}>✓</Text>
                      <Text style={{ color: p.destaque ? '#CCCCCC' : C.texto2, fontSize: 14, lineHeight: 24, flex: 1 }}>{item}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={p.acao} style={{ backgroundColor: p.destaque ? D.verde : 'transparent', borderWidth: p.destaque ? 0 : 1.5, borderColor: C.borda, borderRadius: 12, paddingVertical: 15, alignItems: 'center' }}>
                  <Text style={{ color: p.destaque ? '#FFF' : C.texto1, fontSize: 15, fontWeight: '700' }}>{p.cta}</Text>
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
  const desk = width >= 768
  return (
    <View style={{ backgroundColor: D.fundo, paddingTop: 120, paddingBottom: 120 }}>
      <Centered>
        <FadeUp>
          <Text style={{ fontSize: desk ? 80 : 48, fontWeight: '900', color: '#FFFFFF', letterSpacing: desk ? -3.5 : -2, lineHeight: desk ? 88 : 56, marginBottom: 24, textAlign: 'center', alignSelf: 'center', maxWidth: 680 }}>
            Pronto para colocar o Pactum em produção?
          </Text>
          <Text style={{ fontSize: 19, color: D.dim, lineHeight: 32, textAlign: 'center', marginBottom: 56, maxWidth: 480, alignSelf: 'center' }}>
            Conheça a documentação, explore os endpoints ou entre em contato para falar sobre integração ou parceria comercial.
          </Text>
          <View style={{ flexDirection: desk ? 'row' : 'column', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ backgroundColor: D.verde, paddingHorizontal: 36, paddingVertical: 17, borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Explorar a API →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ borderWidth: 1, borderColor: D.dim2, paddingHorizontal: 36, paddingVertical: 17, borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 16 }}>Entrar em contato</Text>
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
  const desk = width >= 768
  return (
    <View style={{ paddingVertical: 44, backgroundColor: D.fundo, borderTopWidth: 1, borderTopColor: D.borda }}>
      <Centered>
        <View style={{ flexDirection: desk ? 'row' : 'column', alignItems: desk ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 4 }}>PACTUM</Text>
          <View style={{ flexDirection: 'row', gap: 32, flexWrap: 'wrap' }}>
            {['Recursos', 'API', 'Sobre'].map(l => <Text key={l} style={{ color: D.dim, fontSize: 13 }}>{l}</Text>)}
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
  const scrollY = useRef(new Animated.Value(0)).current

  return (
    <View style={{ flex: 1, backgroundColor: C.branco }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <HeroSection />
        <AppSection />
        <ApiSection />
        <StackSection />
        <SecuritySection />
        <BusinessSection />
        <CtaFinalSection />
        <LandingFooter />
      </Animated.ScrollView>
      <LandingHeader scrollY={scrollY} />
    </View>
  )
}
