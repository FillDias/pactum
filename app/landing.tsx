import { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Animated, useWindowDimensions } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'

const C = {
  fundo:      '#FFFFFF',
  fundo2:     '#F7F7F5',
  texto1:     '#0D0D0D',
  texto2:     '#555555',
  borda:      '#E8E8E8',
  acento:     '#C8BFA8',
  acentoDark: '#0D0D0D',
}

const MAX_W = 1100

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <View style={{ width: '100%', maxWidth: MAX_W, paddingHorizontal: 48 }}>
        {children}
      </View>
    </View>
  )
}

function BrowserMockup() {
  const items = [
    { desc: 'Salario',   val: '+5.000,00', pos: true  },
    { desc: 'Aluguel',   val: '-1.200,00', pos: false },
    { desc: 'Netflix',   val: '-29,90',    pos: false },
    { desc: 'Freelance', val: '+800,00',   pos: true  },
  ]

  return (
    <View style={{
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#2A2A2A',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.22,
      shadowRadius: 48,
    }}>
      {/* Barra do browser */}
      <View style={{
        height: 38,
        backgroundColor: '#232323',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 7,
      }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5F57' }} />
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFBD2E' }} />
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#28CA41' }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{
            backgroundColor: '#3A3A3A',
            borderRadius: 5,
            paddingHorizontal: 16,
            paddingVertical: 4,
          }}>
            <Text style={{ color: '#888', fontSize: 11 }}>pactum.app</Text>
          </View>
        </View>
      </View>

      {/* Conteudo do app */}
      <View style={{ backgroundColor: '#111111', padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
          <Text style={{ color: '#C8BFA8', fontSize: 13, fontWeight: '700', letterSpacing: 2.5 }}>
            PACTUM
          </Text>
          <Text style={{ color: '#555', fontSize: 11 }}>Abril 2026</Text>
        </View>

        <View style={{
          backgroundColor: '#1C1C1C',
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#2A2A2A',
        }}>
          <Text style={{ color: '#555', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>
            Saldo do mes
          </Text>
          <Text style={{ color: '#C8BFA8', fontSize: 28, fontWeight: '700', marginTop: 5, letterSpacing: -1 }}>
            R$ 3.570,10
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#0D1E14', borderRadius: 8, padding: 10 }}>
              <Text style={{ color: '#3D9E6E', fontSize: 9, letterSpacing: 1 }}>RECEITAS</Text>
              <Text style={{ color: '#3D9E6E', fontSize: 13, fontWeight: '700', marginTop: 3 }}>
                +R$ 5.800
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#1E0D0D', borderRadius: 8, padding: 10 }}>
              <Text style={{ color: '#C94F4F', fontSize: 9, letterSpacing: 1 }}>GASTOS</Text>
              <Text style={{ color: '#C94F4F', fontSize: 13, fontWeight: '700', marginTop: 3 }}>
                -R$ 2.230
              </Text>
            </View>
          </View>
        </View>

        <Text style={{
          color: '#444',
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Lancamentos
        </Text>
        {items.map((t, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: i < items.length - 1 ? 1 : 0,
              borderBottomColor: '#1E1E1E',
            }}
          >
            <Text style={{ color: '#A0A0A0', fontSize: 12 }}>{t.desc}</Text>
            <Text style={{
              color: t.pos ? '#3D9E6E' : '#C94F4F',
              fontSize: 12,
              fontWeight: '600',
            }}>
              {t.val}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function LandingHeader() {
  return (
    <View style={{
      height: 64,
      backgroundColor: C.fundo,
      borderBottomWidth: 1,
      borderBottomColor: C.borda,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    }}>
      <View style={{
        width: '100%',
        maxWidth: MAX_W,
        paddingHorizontal: 48,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '800',
          color: C.texto1,
          letterSpacing: 3.5,
          flex: 1,
        }}>
          PACTUM
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 36 }}>
          <Text style={{ color: C.texto2, fontSize: 14 }}>Recursos</Text>
          <Text style={{ color: C.texto2, fontSize: 14 }}>Sobre</Text>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{
              borderWidth: 1,
              borderColor: C.texto1,
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: C.texto1, fontSize: 14, fontWeight: '500' }}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={{
              backgroundColor: C.acentoDark,
              paddingHorizontal: 20,
              paddingVertical: 9,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              Comecar gratis
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const FRASES = [
  'Para voce e sua familia.',
  'No controle todo mes.',
  'Investindo com proposito.',
  'Do salario ao patrimonio.',
]

function HeroSection() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const opacidade = useRef(new Animated.Value(1)).current
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    let ativo = true
    let timeoutId: ReturnType<typeof setTimeout>

    const rodar = () => {
      timeoutId = setTimeout(() => {
        if (!ativo) return
        Animated.timing(opacidade, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!ativo || !finished) return
          setIndice(i => (i + 1) % FRASES.length)
          Animated.timing(opacidade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (ativo && finished) rodar()
          })
        })
      }, 2000)
    }

    rodar()
    return () => {
      ativo = false
      clearTimeout(timeoutId)
      opacidade.stopAnimation()
    }
  }, [])

  const tamanhoTitulo = isDesktop ? 68 : 40
  const alturaLinha = isDesktop ? 78 : 50

  return (
    <View style={{ backgroundColor: C.fundo }}>
      <Centered>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 96,
          paddingBottom: 96,
          gap: 64,
        }}>
          <View style={{ flex: 3 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: C.fundo2,
              borderWidth: 1,
              borderColor: C.borda,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 7,
              marginBottom: 32,
              gap: 8,
            }}>
              <Text style={{ color: C.texto2, fontSize: 13 }}>✦</Text>
              <Text style={{ color: C.texto2, fontSize: 13 }}>Novo — Gestao familiar</Text>
            </View>

            <Text style={{
              fontSize: tamanhoTitulo,
              fontWeight: '800',
              color: C.texto1,
              lineHeight: alturaLinha,
              letterSpacing: -2,
            }}>
              Organize suas financas.
            </Text>
            <Animated.Text style={{
              fontSize: tamanhoTitulo,
              fontWeight: '800',
              color: C.acento,
              lineHeight: alturaLinha,
              letterSpacing: -2,
              marginBottom: 32,
              opacity: opacidade,
            }}>
              {FRASES[indice]}
            </Animated.Text>

            <Text style={{
              fontSize: 18,
              color: C.texto2,
              lineHeight: 30,
              marginBottom: 44,
              maxWidth: 520,
            }}>
              O Pactum reune controle de gastos, receitas e investimentos em um so lugar. Para voce, sua familia ou seu futuro.
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
              <TouchableOpacity
                onPress={() => router.push('/register')}
                style={{
                  backgroundColor: C.acentoDark,
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                  Comecar gratis
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: C.texto1, fontSize: 15, fontWeight: '500' }}>
                  Ver como funciona
                </Text>
                <Text style={{ color: C.texto1, fontSize: 16 }}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
            <BrowserMockup />
          </View>
        </View>
      </Centered>
    </View>
  )
}

const FEATURES = [
  {
    icon: 'home' as const,
    titulo: 'Controle familiar',
    desc: 'Registre receitas e gastos por categoria. Acompanhe o saldo mensal com alertas inteligentes.',
  },
  {
    icon: 'trending-up' as const,
    titulo: 'Investimentos reais',
    desc: 'Cotacoes atualizadas de acoes, FIIs e renda fixa. CDI e patrimonio consolidados em tempo real.',
  },
  {
    icon: 'bar-chart-2' as const,
    titulo: 'Saldo inteligente',
    desc: 'Navegue entre meses, compare periodos e identifique padroes de consumo com clareza.',
  },
]

function FeaturesSection() {
  return (
    <View style={{
      paddingVertical: 96,
      backgroundColor: C.fundo2,
      borderTopWidth: 1,
      borderTopColor: C.borda,
    }}>
      <Centered>
        <Text style={{
          fontSize: 11,
          color: C.texto2,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          Recursos
        </Text>
        <Text style={{
          fontSize: 40,
          fontWeight: '700',
          color: C.texto1,
          textAlign: 'center',
          letterSpacing: -1,
          marginBottom: 60,
        }}>
          Tudo que voce precisa
        </Text>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {FEATURES.map((f) => (
            <View
              key={f.titulo}
              style={{
                flex: 1,
                backgroundColor: C.fundo,
                borderRadius: 20,
                padding: 32,
                borderWidth: 1,
                borderColor: C.borda,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
              }}
            >
              <View style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                backgroundColor: C.fundo2,
                borderWidth: 1,
                borderColor: C.borda,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 22,
              }}>
                <Feather name={f.icon} size={20} color={C.texto1} />
              </View>
              <Text style={{
                fontSize: 17,
                fontWeight: '700',
                color: C.texto1,
                marginBottom: 10,
                lineHeight: 24,
              }}>
                {f.titulo}
              </Text>
              <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 24 }}>
                {f.desc}
              </Text>
            </View>
          ))}
        </View>
      </Centered>
    </View>
  )
}

const PASSOS = [
  {
    num: '01',
    titulo: 'Cadastre suas receitas',
    desc: 'Adicione salarios, freelances e entradas extras. Tudo categorizado e organizado por mes.',
  },
  {
    num: '02',
    titulo: 'Lance seus gastos',
    desc: 'Registre despesas, defina vencimentos e acompanhe o saldo do mes em tempo real.',
  },
  {
    num: '03',
    titulo: 'Acompanhe seu patrimonio',
    desc: 'Veja investimentos crescerem. Analise meses anteriores e tome decisoes com confianca.',
  },
]

function HowItWorksSection() {
  return (
    <View style={{
      paddingVertical: 96,
      backgroundColor: C.fundo,
      borderTopWidth: 1,
      borderTopColor: C.borda,
    }}>
      <Centered>
        <Text style={{
          fontSize: 11,
          color: C.texto2,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          Processo
        </Text>
        <Text style={{
          fontSize: 40,
          fontWeight: '700',
          color: C.texto1,
          textAlign: 'center',
          letterSpacing: -1,
          marginBottom: 72,
        }}>
          Como funciona
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {PASSOS.map((p, i) => (
            <View
              key={p.num}
              style={{
                flex: 1,
                paddingHorizontal: 32,
                borderRightWidth: i < PASSOS.length - 1 ? 1 : 0,
                borderRightColor: C.borda,
              }}
            >
              <Text style={{
                fontSize: 56,
                fontWeight: '800',
                color: C.borda,
                letterSpacing: -2,
                marginBottom: 16,
              }}>
                {p.num}
              </Text>
              <Text style={{
                fontSize: 17,
                fontWeight: '700',
                color: C.texto1,
                marginBottom: 10,
                lineHeight: 24,
              }}>
                {p.titulo}
              </Text>
              <Text style={{ fontSize: 15, color: C.texto2, lineHeight: 24 }}>
                {p.desc}
              </Text>
            </View>
          ))}
        </View>
      </Centered>
    </View>
  )
}

function CtaSection() {
  return (
    <View style={{ paddingVertical: 96, backgroundColor: C.acentoDark }}>
      <Centered>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 52,
            fontWeight: '800',
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: -2,
            lineHeight: 58,
            marginBottom: 16,
            maxWidth: 560,
          }}>
            Pronto para comecar?
          </Text>
          <Text style={{
            fontSize: 17,
            color: '#999999',
            textAlign: 'center',
            marginBottom: 44,
          }}>
            Crie sua conta gratis. Sem cartao de credito.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={{
              backgroundColor: C.acento,
              paddingHorizontal: 44,
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: C.texto1, fontSize: 16, fontWeight: '700' }}>
              Criar conta gratis
            </Text>
          </TouchableOpacity>
        </View>
      </Centered>
    </View>
  )
}

function LandingFooter() {
  return (
    <View style={{
      paddingVertical: 40,
      backgroundColor: C.fundo,
      borderTopWidth: 1,
      borderTopColor: C.borda,
    }}>
      <Centered>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{
            color: C.texto1,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: 3.5,
          }}>
            PACTUM
          </Text>
          <View style={{ flexDirection: 'row', gap: 32 }}>
            <Text style={{ color: C.texto2, fontSize: 13 }}>Recursos</Text>
            <Text style={{ color: C.texto2, fontSize: 13 }}>Sobre</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: C.texto2, fontSize: 13 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: C.texto2, fontSize: 13 }}>
            © 2026 Pactum. Todos os direitos reservados.
          </Text>
        </View>
      </Centered>
    </View>
  )
}

export default function Landing() {
  return (
    <View style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.fundo} />
      <LandingHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
        <LandingFooter />
      </ScrollView>
    </View>
  )
}
