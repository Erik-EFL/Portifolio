import { describe, expect, it } from 'vitest'
import ABOUT from '@/constant/Data/About.data'
import {
  BIRTH_DATE,
  calculateAge,
  getGreeting,
  getPeriodOfDay,
  resolveAboutScript,
  resolveAboutScripts
} from './about-script.service'

/** Datas montadas com componentes locais: o cálculo precisa ser de fuso local. */
const em = (ano: number, mes: number, dia: number, hora = 10) =>
  new Date(ano, mes - 1, dia, hora)

describe('calculateAge', () => {
  it('conta a idade em anos completos', () => {
    expect(calculateAge(BIRTH_DATE, em(2026, 11, 20))).toBe(31)
  })

  it('não antecipa o ano novo antes do aniversário', () => {
    expect(calculateAge(BIRTH_DATE, em(2026, 4, 10))).toBe(30)
  })

  it('vira a idade no próprio dia do aniversário', () => {
    expect(calculateAge(BIRTH_DATE, em(2026, 4, 11))).toBe(31)
  })

  it('não escorrega um dia por causa do fuso (meia-noite UTC)', () => {
    // new Date('1995-04-11') é 1995-04-10 21:00 em UTC-3: a idade viraria 30.
    expect(calculateAge('1995-04-11', em(2026, 4, 11, 0))).toBe(31)
  })

  it('recusa formato inválido e data futura', () => {
    expect(() => calculateAge('11/04/1995', em(2026, 11, 20))).toThrow(
      /YYYY-MM-DD/
    )
    expect(() => calculateAge('2030-01-01', em(2026, 11, 20))).toThrow(/future/)
  })
})

describe('getPeriodOfDay / getGreeting', () => {
  it('quebra o dia nas faixas certas', () => {
    expect(getPeriodOfDay(em(2026, 11, 20, 0))).toBe('lateNight')
    expect(getPeriodOfDay(em(2026, 11, 20, 5))).toBe('lateNight')
    expect(getPeriodOfDay(em(2026, 11, 20, 6))).toBe('morning')
    expect(getPeriodOfDay(em(2026, 11, 20, 11))).toBe('morning')
    expect(getPeriodOfDay(em(2026, 11, 20, 12))).toBe('afternoon')
    expect(getPeriodOfDay(em(2026, 11, 20, 17))).toBe('afternoon')
    expect(getPeriodOfDay(em(2026, 11, 20, 18))).toBe('night')
    expect(getPeriodOfDay(em(2026, 11, 20, 23))).toBe('night')
  })

  it('traduz a saudação por idioma', () => {
    expect(getGreeting('ptBR', em(2026, 11, 20, 9))).toBe('bom dia')
    expect(getGreeting('ptBR', em(2026, 11, 20, 14))).toBe('boa tarde')
    expect(getGreeting('ptBR', em(2026, 11, 20, 20))).toBe('boa noite')
    expect(getGreeting('ptBR', em(2026, 11, 20, 3))).toBe('boa madrugada')
    expect(getGreeting('enUS', em(2026, 11, 20, 20))).toBe('good evening')
  })
})

describe('resolveAboutScripts', () => {
  const noite = em(2026, 11, 20, 20)
  const opcoes = { language: 'ptBR' as const, now: noite }

  it('troca a frase genérica: 1ª é a saudação, 2ª é a idade', () => {
    const [texto] = resolveAboutScripts(
      ['Oi, o script vai aqui! Eu tenho o script vai aqui anos.'],
      opcoes
    )

    expect(texto).toBe('Oi, boa noite! Eu tenho 31 anos.')
  })

  it('conta as ocorrências genéricas ao longo dos parágrafos', () => {
    const textos = resolveAboutScripts(
      ['o script vai aqui.', 'segundo parágrafo', 'ele tem o script vai aqui.'],
      opcoes
    )

    expect(textos).toEqual(['Boa noite.', 'segundo parágrafo', 'ele tem 31.'])
  })

  it('deixa a sobra genérica literal em vez de inventar texto', () => {
    const texto = resolveAboutScript(
      'a: o script vai aqui b: o script vai aqui c: o script vai aqui',
      opcoes
    )

    expect(texto).toBe('a: boa noite b: 31 c: o script vai aqui')
  })

  it('usa os placeholders específicos e os de chaves', () => {
    const [texto] = resolveAboutScripts(
      [
        'Oi, o script da saudacao vai aqui! Tenho o script da idade vai aqui anos.',
        '{{saudacao}} / {{idade}} / {{greeting}} / {{age}}'
      ],
      opcoes
    )

    expect(texto).toBe('Oi, boa noite! Tenho 31 anos.')
    expect(
      resolveAboutScripts(
        ['{{saudacao}} / {{idade}} / {{greeting}} / {{age}}'],
        opcoes
      )[0]
    ).toBe('Boa noite / 31 / boa noite / 31')
  })

  it('ignora caixa e acento no placeholder', () => {
    const texto = resolveAboutScript(
      'Oi, O SCRIPT DA SAUDAÇÃO VAI AQUI! Tenho o Script da Idade Vai Aqui anos.',
      opcoes
    )

    expect(texto).toBe('Oi, boa noite! Tenho 31 anos.')
  })

  it('respeita a ordem dos placeholders misturados', () => {
    const texto = resolveAboutScript(
      'idade: o script da idade vai aqui / generico 1: o script vai aqui / generico 2: o script vai aqui',
      opcoes
    )

    expect(texto).toBe('idade: 31 / generico 1: boa noite / generico 2: 31')
  })

  it('resolve em inglês quando o idioma é enUS', () => {
    const [texto] = resolveAboutScripts(['Hi, o script vai aqui! 31?'], {
      language: 'enUS',
      now: em(2026, 11, 20, 9)
    })

    expect(texto).toBe('Hi, good morning! 31?')
  })

  it('não mexe no texto sem placeholder nem na formatação do conteúdo', () => {
    const original = ['Sem placeholder aqui.', '', 'Reticências... e ção.']

    expect(resolveAboutScripts(original, opcoes)).toEqual(original)
  })

  it('substitui a frase entre aspas usada no admin, sem deixar as aspas', () => {
    const [texto] = resolveAboutScripts(
      [
        'Olá tudo bem! "aqui vai o javascript" Eu sou o Erik, tenho "aqui vai o javascript" anos.'
      ],
      opcoes
    )

    expect(texto).toBe('Olá tudo bem! Boa noite Eu sou o Erik, tenho 31 anos.')
  })

  it('aceita a mesma frase sem aspas ou com aspas curvas', () => {
    expect(
      resolveAboutScript(
        'Oi, aqui vai o javascript! Tenho aqui vai o javascript.',
        opcoes
      )
    ).toBe('Oi, boa noite! Tenho 31.')
    expect(resolveAboutScript('Oi, “aqui vai o javascript”.', opcoes)).toBe(
      'Oi, boa noite.'
    )
  })

  it('mantém a minúscula quando o placeholder não abre a frase', () => {
    const [texto] = resolveAboutScripts(
      [
        'Oi, "aqui vai o javascript", tudo bem? Tenho "aqui vai o javascript" anos.'
      ],
      opcoes
    )

    expect(texto).toBe('Oi, boa noite, tudo bem? Tenho 31 anos.')
  })

  it('resolve o texto em inglês do admin', () => {
    const [texto] = resolveAboutScripts(
      [
        'Hi "aqui vai o javascript" nice to meet you, I\'m Erik, I\'m "aqui vai o javascript" years old.'
      ],
      { language: 'enUS', now: em(2026, 11, 20, 9) }
    )

    expect(texto).toBe(
      "Hi good morning nice to meet you, I'm Erik, I'm 31 years old."
    )
  })

  it('o texto de fallback do site não vaza placeholder para a tela', () => {
    const textos = resolveAboutScripts(ABOUT.ptBR, opcoes)

    expect(textos[0]).toContain('boa noite')
    expect(textos[0]).toContain('31 anos')
    expect(textos.join(' ')).not.toMatch(/script/i)
    expect(textos.join(' ')).not.toContain('${')
  })
})
