import { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Animated, useWindowDimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'

// ── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  fundo:      '#FFFFFF',
  fundo2:     '#F7F7F5',
  texto1:     '#0D0D0D',
  texto2:     '#555555',
  borda:      '#E8E8E8',
  acento:     '#C8BFA8',
  acentoDark: '#0D0D0D',
}
const D = {
  fundo:  '#0A0A0A',
  fundo2: '#111111',
  card:   '#161616',
  borda:  '#232323',
  verde:  '#3D9E6E',
  roxo:   '#7C6AF7',
  texto:  '#E0E0E0',
  dim:    '#666666',
  comentario: '#4A4A4A',
}

const MAX_W = 1120

// ── Helpers ──────────────────────────────────────────────────────────────────
function Centered({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: 48 }}>
        {children}
      </View>
    </View>
  )
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current
  const ty = useRef(new Animated.Value(28)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
      Animated.timing(ty,      { toValue: 0, duration: 700, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity, transform: [{ translateY: ty }] }}>{children}</Animated.View>
}

function Label({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <View style={{
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: dark ? D.borda : C.borda,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginBottom: 28,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    }}>
      <Text style={{ color: dark ? D.verde : C.texto2, fontSize: 12 }}>✦</Text>
      <Text style={{ color: dark ? D.dim : C.texto2, fontSize: 12, letterSpacing: 0.4 }}>{text}</Text>
    </View>
  )
}

// ── Browser mockup animado ────────────────────────────────────────────────────
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
    { desc: 'Salario',   val: '+5.000,00', pos: true  },
    { desc: 'Aluguel',   val: '-1.200,00', pos: false },
    { desc: 'Freela',    val: '+800,00',   pos: true  },
    { desc: 'Netflix',   val: '-29,90',    pos: false },
  ]

  return (
    <View style={{
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#222',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 32 },
      shadowOpacity: 0.35,
      shadowRadius: 64,
    }}>
      <View style={{ height: 38, backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 7 }}>
        <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#FF5F57' }} />
        <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#FFBD2E' }} />
        <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#28CA41' }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#2A2A2A', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 4 }}>
            <Text style={{ color: '#666', fontSize: 11 }}>pactum.app</Text>
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: '#0E0E0E', padding: 20, minWidth: 300 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: C.acento, fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>PACTUM</Text>
          <Text style={{ color: '#444', fontSize: 10 }}>Abril 2026</Text>
        </View>

        <View style={{ backgroundColor: '#161616', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#222' }}>
          <Text style={{ color: '#444', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' }}>Saldo do mes</Text>
          <Text style={{ color: C.acento, fontSize: 26, fontWeight: '700', marginTop: 6, letterSpacing: -1 }}>
            R$ {count.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#0D1E14', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#1A3020' }}>
              <Text style={{ color: '#3D9E6E', fontSize: 8, letterSpacing: 1 }}>RECEITAS</Text>
              <Text style={{ color: '#3D9E6E', fontSize: 13, fontWeight: '700', marginTop: 3 }}>+R$ 5.800</Text>
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
            <Text style={{ color: t.pos ? '#3D9E6E' : '#C94F4F', fontSize: 12, fontWeight: '600' }}>{t.val}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────
function LandingHeader() {
  return (
    <View style={{
      height: 64, backgroundColor: C.fundo,
      borderBottomWidth: 1, borderBottomColor: C.borda,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: 48, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: C.texto1, letterSpacing: 3.5, flex: 1 }}>PACTUM</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 36 }}>
          <Text style={{ color: C.texto2, fontSize: 14 }}>Recursos</Text>
          <Text style={{ color: C.texto2, fontSize: 14 }}>API</Text>
          <Text style={{ color: C.texto2, fontSize: 14 }}>Sobre</Text>
          <TouchableOpacity onPress={() => router.push('/login')} style={{ borderWidth: 1, borderColor: C.borda, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: C.texto1, fontSize: 14, fontWeight: '500' }}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')} style={{ backgroundColor: C.acentoDark, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 8 }}>
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>Comecar gratis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
const FRASES = ['Para voce e sua familia.', 'No controle todo mes.', 'Investindo com proposito.', 'Do salario ao patrimonio.']

function HeroSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const opacidade = useRef(new Animated.Value(1)).current
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    let ativo = true
    const rodar = () => {
      setTimeout(() => {
        if (!ativo) return
        Animated.timing(opacidade, { toValue: 0, duration: 400, useNativeDriver: true }).start(({ finished }) => {
          if (!ativo || !finished) return
          setIndice(i => (i + 1) % FRASES.length)
          Animated.timing(opacidade, { toValue: 1, duration: 400, useNativeDriver: true }).start(({ finished }) => {
            if (ativo && finished) rodar()
          })
        })
      }, 2400)
    }
    rodar()
    return () => { ativo = false; opacidade.stopAnimation() }
  }, [])

  return (
    <View style={{ backgroundColor: C.fundo, paddingVertical: 96 }}>
      <Centered>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', gap: 64 }}>
          <View style={{ flex: 3 }}>
            <FadeUp delay={0}>
              <Label text="Novo — Gestao familiar + API para devs" />
              <Text style={{ fontSize: isDesktop ? 66 : 40, fontWeight: '800', color: C.texto1, lineHeight: isDesktop ? 74 : 50, letterSpacing: -2 }}>
                Organize suas{'\n'}financas.
              </Text>
              <Animated.Text style={{ fontSize: isDesktop ? 66 : 40, fontWeight: '800', color: C.acento, lineHeight: isDesktop ? 74 : 50, letterSpacing: -2, marginBottom: 32, opacity: opacidade }}>
                {FRASES[indice]}
              </Animated.Text>
              <Text style={{ fontSize: 17, color: C.texto2, lineHeight: 30, marginBottom: 44, maxWidth: 500 }}>
                O Pactum reune controle de gastos, receitas e investimentos em um so lugar. Para voce, sua familia ou integrado via API nos seus produtos.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <TouchableOpacity onPress={() => router.push('/register')} style={{ backgroundColor: C.acentoDark, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 }}>
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Comecar gratis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.borda, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 10 }}>
                  <Text style={{ color: C.texto1, fontSize: 15, fontWeight: '500' }}>Ver API</Text>
                  <Text style={{ color: C.texto1 }}>→</Text>
                </TouchableOpacity>
              </View>
            </FadeUp>
          </View>

          {isDesktop && (
            <View style={{ flex: 2 }}>
              <FadeUp delay={200}>
                <BrowserMockup />
              </FadeUp>
            </View>
          )}
        </View>
      </Centered>
    </View>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
const STATS = [
  { valor: 'REST API', label: 'Endpoints documentados' },
  { valor: 'JWT',      label: 'Autenticação segura' },
  { valor: 'Real-time', label: 'Cotações atualizadas' },
  { valor: 'Familiar', label: 'Dados por escopo' },
]

function StatsBar() {
  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.borda, backgroundColor: C.fundo2 }}>
      <Centered>
        <View style={{ flexDirection: 'row', paddingVertical: 32 }}>
          {STATS.map((s, i) => (
            <View key={s.valor} style={{
              flex: 1, alignItems: 'center',
              borderRightWidth: i < STATS.length - 1 ? 1 : 0,
              borderRightColor: C.borda,
            }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.texto1, letterSpacing: -0.5 }}>{s.valor}</Text>
              <Text style={{ fontSize: 13, color: C.texto2, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Centered>
    </View>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'home' as const,        titulo: 'Controle familiar',    desc: 'Receitas e gastos por categoria. Saldo mensal com toggle Eu / Familia para ver o financeiro de toda a casa.' },
  { icon: 'trending-up' as const, titulo: 'Investimentos reais',  desc: 'Cotacoes ao vivo de acoes, FIIs, ETFs e renda fixa. CDI estimado e patrimonio consolidado em tempo real.' },
  { icon: 'bar-chart-2' as const, titulo: 'Relatorios completos', desc: 'Navegue entre meses, compare periodos, identifique padroes de consumo e tome decisoes com confianca.' },
]

function FeaturesSection() {
  return (
    <View style={{ paddingVertical: 96, backgroundColor: C.fundo }}>
      <Centered>
        <FadeUp>
          <Text style={{ fontSize: 11, color: C.texto2, letterSpacing: 2.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>Recursos</Text>
          <Text style={{ fontSize: 42, fontWeight: '800', color: C.texto1, textAlign: 'center', letterSpacing: -1, marginBottom: 16 }}>Tudo que voce precisa</Text>
          <Text style={{ fontSize: 17, color: C.texto2, textAlign: 'center', lineHeight: 28, marginBottom: 64, maxWidth: 540, alignSelf: 'center' }}>
            Do lancamento diario ao patrimonio de longo prazo — em um so app.
          </Text>
        </FadeUp>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.titulo} delay={i * 100}>
              <View style={{ flex: 1, backgroundColor: C.fundo2, borderRadius: 20, padding: 32, borderWidth: 1, borderColor: C.borda }}>
                <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: C.fundo, borderWidth: 1, borderColor: C.borda, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <Feather name={f.icon} size={20} color={C.texto1} />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.texto1, marginBottom: 10, lineHeight: 24 }}>{f.titulo}</Text>
                <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 25 }}>{f.desc}</Text>
              </View>
            </FadeUp>
          ))}
        </View>
      </Centered>
    </View>
  )
}

// ── API Section ───────────────────────────────────────────────────────────────
function ApiSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  const codeLines = [
    { type: 'comment', text: '# Buscar posições de uma carteira' },
    { type: 'cmd',     text: 'curl -X GET https://api.pactum.app/v1/portfolios/123/positions \\' },
    { type: 'param',   text: '  -H "Authorization: Bearer eyJhbGci..."' },
    { type: 'blank',   text: '' },
    { type: 'comment', text: '# Resposta' },
    { type: 'key',     text: '{' },
    { type: 'key',     text: '  "portfolioId": "123",' },
    { type: 'str',     text: '  "totalMarketValue": 15420.50,' },
    { type: 'str',     text: '  "totalPl": 943.20,' },
    { type: 'key',     text: '  "positions": [...]' },
    { type: 'key',     text: '}' },
  ]

  const colorFor = (type: string) => {
    if (type === 'comment') return D.commentario ?? '#4A4A4A'
    if (type === 'cmd') return '#E0E0E0'
    if (type === 'param') return '#C8BFA8'
    if (type === 'key') return '#7C9EE8'
    if (type === 'str') return '#3D9E6E'
    return '#888'
  }

  const API_FEATURES = [
    { icon: 'lock' as const,      text: 'JWT Auth',          sub: 'Tokens seguros por usuario' },
    { icon: 'zap' as const,       text: 'REST JSON',         sub: 'Endpoints padrao HTTP' },
    { icon: 'users' as const,     text: 'Escopo familiar',   sub: 'Dados individuais ou da familia' },
    { icon: 'activity' as const,  text: 'Cotacoes live',     sub: 'BRAPI integrado' },
  ]

  return (
    <View style={{ backgroundColor: D.fundo, paddingVertical: 96 }}>
      <Centered>
        <FadeUp>
          <Label text="Para desenvolvedores" dark />
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 64, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 42, fontWeight: '800', color: '#FFF', letterSpacing: -1, lineHeight: 50, marginBottom: 20 }}>
                API para integrar{'\n'}finanças nos seus{'\n'}produtos.
              </Text>
              <Text style={{ fontSize: 16, color: D.dim, lineHeight: 27, marginBottom: 40 }}>
                Use a infraestrutura do Pactum para criar seus proprios dashboards, apps financeiros ou integracoes. REST, JWT e dados em tempo real.
              </Text>

              <View style={{ gap: 16, marginBottom: 40 }}>
                {API_FEATURES.map(f => (
                  <View key={f.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: D.card, borderWidth: 1, borderColor: D.borda, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={f.icon} size={16} color={D.verde} />
                    </View>
                    <View>
                      <Text style={{ color: '#E0E0E0', fontSize: 14, fontWeight: '600' }}>{f.text}</Text>
                      <Text style={{ color: D.dim, fontSize: 12, marginTop: 1 }}>{f.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: D.verde + '18', borderWidth: 1, borderColor: D.verde + '44', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-start' }}>
                <Text style={{ color: D.verde, fontSize: 14, fontWeight: '600' }}>Explorar API</Text>
                <Text style={{ color: D.verde }}>→</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: D.fundo2, borderRadius: 16, borderWidth: 1, borderColor: D.borda, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: D.borda }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5F57' }} />
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFBD2E' }} />
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#28CA41' }} />
                  <Text style={{ color: D.dim, fontSize: 11, marginLeft: 8 }}>terminal</Text>
                </View>
                <View style={{ padding: 24 }}>
                  {codeLines.map((l, i) => (
                    <Text key={i} style={{ color: colorFor(l.type), fontSize: 13, fontFamily: 'monospace', lineHeight: 22 }}>
                      {l.text}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                {['/portfolios', '/lancamentos', '/saldo', '/securities'].map(ep => (
                  <View key={ep} style={{ backgroundColor: D.card, borderRadius: 8, borderWidth: 1, borderColor: D.borda, paddingHorizontal: 12, paddingVertical: 7 }}>
                    <Text style={{ color: D.dim, fontSize: 11, fontFamily: 'monospace' }}>{ep}</Text>
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

// ── How it works ──────────────────────────────────────────────────────────────
const PASSOS = [
  { num: '01', titulo: 'Cadastre suas receitas', desc: 'Salarios, freelances, entradas extras. Categorizado e organizado por mes automaticamente.' },
  { num: '02', titulo: 'Lance seus gastos',       desc: 'Registre despesas, defina vencimentos e acompanhe o saldo do mes em tempo real.' },
  { num: '03', titulo: 'Acompanhe seu patrimonio', desc: 'Veja investimentos crescerem. Analise periodos e tome decisoes com confianca.' },
]

function HowItWorksSection() {
  return (
    <View style={{ paddingVertical: 96, backgroundColor: C.fundo2, borderTopWidth: 1, borderTopColor: C.borda }}>
      <Centered>
        <FadeUp>
          <Text style={{ fontSize: 11, color: C.texto2, letterSpacing: 2.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>Processo</Text>
          <Text style={{ fontSize: 42, fontWeight: '800', color: C.texto1, textAlign: 'center', letterSpacing: -1, marginBottom: 72 }}>Como funciona</Text>
        </FadeUp>
        <View style={{ flexDirection: 'row' }}>
          {PASSOS.map((p, i) => (
            <FadeUp key={p.num} delay={i * 120}>
              <View style={{ flex: 1, paddingHorizontal: 32, borderRightWidth: i < PASSOS.length - 1 ? 1 : 0, borderRightColor: C.borda }}>
                <Text style={{ fontSize: 54, fontWeight: '800', color: C.borda, letterSpacing: -2, marginBottom: 16 }}>{p.num}</Text>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.texto1, marginBottom: 10, lineHeight: 24 }}>{p.titulo}</Text>
                <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 25 }}>{p.desc}</Text>
              </View>
            </FadeUp>
          ))}
        </View>
      </Centered>
    </View>
  )
}

// ── CTA duplo ─────────────────────────────────────────────────────────────────
function CtaSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  return (
    <View style={{ paddingVertical: 96, backgroundColor: C.acentoDark }}>
      <Centered>
        <FadeUp>
          <Text style={{ fontSize: 11, color: '#555', letterSpacing: 2.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>Comece agora</Text>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: -2, lineHeight: 56, marginBottom: 60, maxWidth: 560, alignSelf: 'center' }}>
            Pronto para comecar?
          </Text>
        </FadeUp>

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24 }}>
          <FadeUp delay={100}>
            <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 24, padding: 36, borderWidth: 1, borderColor: '#222' }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.acento + '18', borderWidth: 1, borderColor: C.acento + '33', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Feather name="smartphone" size={20} color={C.acento} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 10 }}>Para usuarios</Text>
              <Text style={{ fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 28 }}>
                Controle financeiro completo para voce e sua familia. Gratis para comecar.
              </Text>
              <TouchableOpacity onPress={() => router.push('/register')} style={{ backgroundColor: C.acento, borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: C.texto1, fontWeight: '700', fontSize: 15 }}>Criar conta gratis</Text>
              </TouchableOpacity>
            </View>
          </FadeUp>

          <FadeUp delay={200}>
            <View style={{ flex: 1, backgroundColor: '#0A1A0D', borderRadius: 24, padding: 36, borderWidth: 1, borderColor: D.verde + '33' }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: D.verde + '18', borderWidth: 1, borderColor: D.verde + '33', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Feather name="code" size={20} color={D.verde} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 10 }}>Para desenvolvedores</Text>
              <Text style={{ fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 28 }}>
                Integre gestao financeira nos seus produtos via API REST. Documentacao em breve.
              </Text>
              <TouchableOpacity style={{ backgroundColor: D.verde + '22', borderWidth: 1, borderColor: D.verde + '55', borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: D.verde, fontWeight: '700', fontSize: 15 }}>Ver documentacao</Text>
              </TouchableOpacity>
            </View>
          </FadeUp>
        </View>
      </Centered>
    </View>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <View style={{ paddingVertical: 40, backgroundColor: C.fundo, borderTopWidth: 1, borderTopColor: C.borda }}>
      <Centered>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: C.texto1, fontSize: 16, fontWeight: '800', letterSpacing: 3.5 }}>PACTUM</Text>
          <View style={{ flexDirection: 'row', gap: 32 }}>
            <Text style={{ color: C.texto2, fontSize: 13 }}>Recursos</Text>
            <Text style={{ color: C.texto2, fontSize: 13 }}>API</Text>
            <Text style={{ color: C.texto2, fontSize: 13 }}>Sobre</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: C.texto2, fontSize: 13 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: C.texto2, fontSize: 13 }}>© 2026 Pactum.</Text>
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
        <StatsBar />
        <FeaturesSection />
        <ApiSection />
        <HowItWorksSection />
        <CtaSection />
        <LandingFooter />
      </ScrollView>
    </View>
  )
}
