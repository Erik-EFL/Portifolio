<h1 align="center"> ☀️ Portfolio 🔎</h1>

<div align="center" style=''>

![Preview](Carousel.gif)

</div>

## 📓 Sobre

O projeto foi desenvolvido com o intuito de mostrar meus projetos e habilidades.

<details>
  <summary>Sobre o desenvolvimento</summary>
  <br />

Para o desenvolvimento do projeto, utilizei o framework ReactJS, com o objetivo de praticar e aprender mais sobre a biblioteca. O projeto foi desenvolvido com o intuito de mostrar meus projetos e habilidades, além de ser um portfólio pessoal.
Além do outras bibliotecas, como o React Router Dom, para a navegação entre as páginas, e o React Icons, para a utilização de ícones, styled-components, para a estilização dos componentes entre outras bibliotecas.

  <br />
</details>

### Habilidades utilizadas durante o desenvolvimento 💻

<details>
  <summary> 🦾 Habilidades</summary>
  <br />

- Desenvolvimento de aplicações React
- Desenvolvimento de portfólio
- Desenvolvimento de aplicações responsivas
- Desenvolvimento de aplicações com React Hooks
- Desenvolvimento de aplicações com React Router
- Metodologia ágil(Kanban)

  <br />
</details>

<details>
  <summary> 🖥️ Tecnologias</summary>
  <br />

- React.js
  - Components Funcional
  - Hooks
  - React Router
- HTML5
- CSS3
- JavaScript
- Material-ui
- Styled-components
- Git
- GitHub-pages
- Vercel

  <br />
</details>

<details>
  <summary> 🖥️ Implementações futuras 🖥️</summary>
  <br />

- Front-end
  - Aplicar atomic design
  - Criar easter eggs na página
  - ~~Criar uma página de contato/ About me~~ (feito: `/about`)
  - ~~Criar area de admin~~ (feito: `/admin`, com login Firebase)
  - ~~Aplicar testes unitários~~ (feito: Vitest, ver "Testes")
- Back-end

  - ~~Criar uma api para armazenar os dados dos projetos~~ (feito: Functions + tabela de conteúdo)
  - Criar testes de integração
  - ~~Criar testes E2E~~ (feito: Playwright, ver "Testes")
  - ~~Aplicar testes unitários~~ (feito: `node --test` em `functions/`)

    <br />
  </details>

## 🗂️ Estrutura

```text
src/
  app.tsx                 rotas (code splitting por rota) + layout raiz
  pages/                  Home, About, Skills, Projects, Admin, error-page
  components/             Header, Footer, Mobile (barra inferior), Cards,
                          Skeleton, Toggle, Input, ErrorBoundary
  store/language.store.ts Zustand + react-query: idioma e conteúdo do portfólio
  services/               admin-api (tabela de conteúdo), portfolio-data
                          (merge + localização), firebase-auth
  context/theme.context   tema claro/escuro persistido em localStorage
  Styles/                 tokens (grayscale/goldenPalette/semantic), temas e
                          GlobalStyle
  constant/Data/data.json conteúdo estático usado como fallback da API
e2e/                      testes de ponta a ponta (Playwright)
functions/                backend Firebase (Functions + tabela do appbackend)
```

As seções de texto (`home`, `about`, `navigation`, ...) guardam um bloco por
idioma. **Skills não**: `skills` e `skillsDetails` têm uma lista única — o texto
base em português vale também para o inglês e a tradução é opcional, embutida na
própria entrada (`{ name: 'Boa comunicação', translations: { enUS: 'Good
communication' } }`). Assim não existe "skill que só aparece em um idioma".

O conteúdo vem da API administrativa (`/rows`) e é mesclado **por cima** de
`src/constant/Data/data.json`. Se a API estiver fora, o site continua de pé com
o conteúdo estático — é o que os testes chamam de fallback. Depois de um login
bem-sucedido em `/admin`, o painel lê e grava essas mesmas linhas.

## 🧪 Testes

| Comando                 | O que roda                                             |
| ----------------------- | ------------------------------------------------------ |
| `npm run test`          | unitários (Vitest + Testing Library, jsdom)            |
| `npm run test:coverage` | unitários com cobertura e **piso que falha o build**   |
| `npm run test:e2e`      | ponta a ponta (Playwright: desktop 1400×900 e Pixel 5) |
| `npm run test:e2e:ui`   | mesma suíte com a interface do Playwright              |
| `npm run verify`        | typecheck + lint + testes + build (o que a CI roda)    |

- Os e2e sobem o build de produção (`vite build` + `vite preview` na :4173) e
  interceptam as APIs: a do admin responde 503 (para exercitar o fallback) e a
  do GitHub é stubbada, então nada depende de rede nem de rate limit.
- `e2e/a11y.spec.ts` roda o axe (WCAG 2 A/AA) em todas as páginas e falha em
  violações `serious`/`critical`. O iframe do YouTube (DOM de terceiro) fica
  fora do scan.
- O piso de cobertura (`vite.config.js`) é o número real medido: ~32% de
  linhas. Módulos só de estilo (`*.style.ts`, `*.styled.ts`, `src/Styles`) não
  entram no cálculo — não têm ramificação e são cobertos pelos e2e.
- O backend tem seus próprios testes (`cd functions && npm test`, `node --test`).

## 🔧 Scripts

```sh
npm run dev            # servidor de desenvolvimento (5173)
npm run build          # build de produção (dist/)
npm run preview        # serve o build (8080)
npm run typecheck      # tsc --noEmit (inclui e2e/)
npm run lint           # eslint, 0 warnings permitidos
npm run lint:fix       # eslint --fix
npm run format         # prettier
npm run functions:build        # compila functions/
npm run firebase:deploy:functions
```

O hook de pré-commit (`.husky/pre-commit`) roda `lint-staged` (eslint --fix +
prettier nos arquivos staged) e `npm run typecheck` antes de cada commit.

## 🔍 SEO e compartilhamento

- **Endereço público em um lugar só**: `VITE_SITE_URL` (default
  `https://erik-efl.github.io/Portifolio`). O build injeta esse valor em
  `canonical`, `og:url` e `og:image` (todos precisam ser absolutos) pelo plugin
  `site-url` do `vite.config.js`. Trocar de domínio = mudar a variável.
- **`public/og-image.png`** é o card 1200×630 do Open Graph. Regera com
  `node scripts/make-og-image.cjs` (usa Playwright para renderizar o HTML do
  card com a foto de `src/assets/Image/perfil.webp`).
- `og:image` em `.ico` ou caminho relativo é ignorado por WhatsApp/LinkedIn —
  por isso o card é PNG absoluto, com `og:image:width/height/alt`.
- **GitHub Pages em subpasta**: `VITE_BASE_PATH=/Portifolio/` no build do CI e
  `basename` do router tirado de `import.meta.env.BASE_URL`, senão
  `/Portifolio/about` cai no `errorElement`. Com domínio próprio, apague
  `VITE_BASE_PATH`.
- O CI copia `dist/index.html` para `dist/404.html`: sem isso, abrir
  `/Portifolio/about` direto devolve o 404 do GitHub (o app nunca carrega).
- `robots.txt` só é lido na **raiz do domínio**: em `usuario.github.io/projeto`
  ele é ignorado pelo crawler. Para um domínio próprio, coloque em `public/`.
- **Metas por rota**: cada página chama `usePageMeta(META, '/rota')`
  (`src/seo/`), que troca título, description, canonical, `og:*`, `twitter:*`,
  `html lang` (pt-BR/en) e `og:locale`. O `/admin` é `noindex, nofollow`.
- **Headings**: o `h1` da home é o nome (`Sou Erik Ferreira Lima`), o cargo é
  `h2`; `/skills` e `/projects` têm `h1` só para leitor de tela (o desenho não
  tem título visível), e os cards de skill vão de `h2` (categoria) a `h3` (item).
- **JSON-LD** `Person` + `WebSite` no `index.html` (nome, cargo, stack e
  `sameAs` dos perfis) — é o que permite o Google montar o painel da pessoa.
- **`dist/sitemap.xml`** é gerado no build pelo plugin `sitemap` (as 4 rotas
  públicas, com `lastmod`); em `public/` ele não poderia usar `VITE_SITE_URL`.
  Envie em Search Console → Sitemaps, já que o `robots.txt` da subpasta é
  ignorado.

## 🎨 Tema e breakpoints

- As cores saem de tokens semânticos (`theme.semantic.surface`,
  `surfaceElevated`, `border`, `text`, `textMuted`, `accent`, `onAccent`,
  `scrollbar`), nunca de `theme.mode === 'dark' ? ...` espalhado. Para trocar
  uma cor, mexa em `src/Styles/base-styles/colors.ts`.
- O tema vive em `localStorage['theme']` (`'light' | 'dark'`) e é aplicado como
  `data-theme` no `<html>`, então o primeiro paint já sai certo.
- Idiomas: `ptBR` e `enUS`, guardados em `localStorage['language']`. Os textos
  vêm do conteúdo (não há i18next).
- Breakpoints: `640.2px` é o corte do mobile (barra inferior no lugar do menu do
  header); `900px` empilha o hero.

## 🚀 CI

`.github/workflows/deploy.yml` roda em push na `main` e em pull request:

- **Build**: `npm ci` → typecheck → lint → `test:coverage` (piso de cobertura) →
  build, com o `lcov` publicado como artefato.
- **E2E**: instala o chromium e roda `npm run test:e2e`; guarda o relatório se
  falhar.
- **Functions**: `npm ci` + `npm test` dentro de `functions/`.
- **Deploy**: depois de build e e2e, publica `dist/` no GitHub Pages.

Os workflows `firebase-hosting-merge.yml` / `firebase-hosting-pull-request.yml`
foram gerados pelo Firebase CLI e hoje **não têm alvo**: `firebase.json` não tem
bloco `hosting`. Enquanto isso for verdade, eles não devem ser considerados o
deploy oficial (o do GitHub Pages é).

  <br />

### 🤝 Colaboradores 💻

<br />
<table>
  <tr>
      <td align="center">
      <a href="https://github.com/erik-efl">
        <img src="https://avatars.githubusercontent.com/u/56979306?s=400&u=526ff856d28fc3ce1926f51be6aa1f947156b8bb&v=4" width="100px;" alt="Foto de Erik Ferreida de Lima"/><br>
        <sub>
          <b>Erik Lima</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

<br />

##

## ⚙️ Status do Projeto 🛠️

```js
  let projeto {
    "status": "Em desenvolvimento"
  }
```

##

## Firebase Functions: configuração local e deploy

### Firestore e Storage: o que é usado de verdade

- **Firestore não é usado.** O conteúdo do portfólio vive no appbackend
  (`https://v1.appbackend.io/v1/rows`), acessado pela Cloud Function; o cliente
  só usa o Firebase para **Auth** (login do admin). `firestore.rules` nega tudo
  — o Admin SDK não passa por regra, então nada depende delas. Se você habilitou
  o banco pelo `firebase init`, o "modo de teste" (aberto até 2026-12-17) foi
  trocado por esta regra; se não usar para nada, pode apagar o banco no console.
- **Storage é usado**, só para os currículos (`resumes/ptBR.pdf` e
  `resumes/enUS.pdf`), sempre pela Function. `storage.rules` também nega acesso
  direto do navegador.
- Verificação feita no emulador: Admin SDK grava e lê; cliente anônimo recebe
  **403** nos dois serviços.
- Deploy das regras: `firebase deploy --only firestore:rules,storage` (o Storage
  só aceita depois que o bucket existir no console).

### Currículos (PDF) exigem o Storage habilitado

Os uploads de currículo gravam em `resumes/ptBR.pdf` e `resumes/enUS.pdf` no
bucket do Firebase Storage. **Sem o Storage habilitado no projeto não existe
bucket** e o painel mostra `Resume service is unavailable` — foi exatamente esse
o sintoma que apareceu depois do deploy. Habilite em Console → Storage →
Começar; o bucket passa a ser `<projeto>.firebasestorage.app`.

A function resolve o bucket, nesta ordem: `RESUME_STORAGE_BUCKET` (opcional) →
`storageBucket` do `FIREBASE_CONFIG` injetado pelo Firebase → padrão do Admin
SDK. Se falhar, o erro no log/console inclui o nome do bucket tentado.

### Preparar o projeto Firebase

1. Crie ou selecione um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em **Authentication → Sign-in method**, habilite **Email/Password**.
3. Crie o usuário administrador em **Authentication → Users → Add user**. Adicione o email exato à configuração `ADMIN_EMAILS` das Functions. A autorização administrativa deve ser validada no backend; ocultar rotas na interface não é controle de acesso.
4. Em **Storage**, crie/ative o bucket do projeto e copie o valor do bucket para `VITE_FIREBASE_STORAGE_BUCKET`.
5. Registre um app Web no Firebase Console e copie a configuração pública para a raiz `.env` com base em `.env.example`.
6. Configure a região das Functions no backend; os exemplos abaixo usam `us-central1`.

Os campos `VITE_FIREBASE_*` são configuração pública do SDK Web, não credenciais de servidor. Nunca coloque chaves de service account, `APPBACKEND_COLLECTION_ID` ou outros segredos em variáveis `VITE_*`: o Vite publica esses valores no bundle do navegador.

### Configuração privada das Functions

Copie `functions/.env.example` para `functions/.env.<project-id>` e defina os emails administrativos e origens permitidas. `ADMIN_EMAILS` é uma lista separada por vírgulas. `CORS_ALLOWED_ORIGINS` precisa conter as origens exatas (scheme, host e porta), sem caminho nem wildcard; inclua `http://localhost:5173` e `http://127.0.0.1:5173` para desenvolvimento local.

Configure `APPBACKEND_COLLECTION_ID` exclusivamente como secret do Firebase Functions/Secret Manager:

```sh
firebase functions:secrets:set APPBACKEND_COLLECTION_ID --project <project-id>
```

O comando solicita o valor sem colocá-lo na linha de comando. O backend precisa associar esse secret às Functions que o usam. Para emuladores locais, crie `functions/.secret.local` com os três secrets que a Function consome; não o versione nem compartilhe:

```dotenv
APPBACKEND_COLLECTION_ID=<valor-local>
ADMIN_EMAILS=seu.email@exemplo.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`APPBACKEND_COLLECTION_ID` é o id da tabela no appbackend.io: 12 caracteres alfanuméricos, copiado do painel da tabela. Um valor com outro formato faz o backend de conteúdo responder `404 Table document not found`, que aparece no app como `Admin API request failed (404)`.

### Contrato da tabela de conteúdo

A tabela guarda uma linha por seção, com as colunas `key` (nome da seção) e `value` (JSON da seção). As colunas são criadas no primeiro POST. O backend já absorve as particularidades do serviço:

- `GET /v1/rows/{tabela}` responde `{ data, page, count, perPage }` e pagina de 100 em 100; a Function desembrulha e segue as páginas, devolvendo um array para o app.
- Leituras passam por CDN: toda requisição de leitura leva um `_=<timestamp>` para não servir conteúdo velho depois de salvar ou excluir.
- Escritas são eventualmente consistentes: a linha criada volta no POST, e o painel usa essa resposta para atualizar o cache (senão um segundo "Salvar" criaria duplicata). Exclusões somem da listagem em alguns segundos — confirme pelo `GET /v1/rows/{tabela}/{_id}`, que responde 400 `Not found` quando a linha já saiu.

Sem esse arquivo a Function responde `503 CORS_NOT_CONFIGURED` e o navegador mostra apenas `Failed to fetch`, porque nenhuma resposta com erro de configuração passa pelo CORS.

### Desenvolvimento e deploy

Use Node.js `20.19+` ou `22.12+` (necessário para a versão atual do Vite e do Firebase CLI). Instale dependências na raiz e copie `.env.example` para `.env`, preenchendo os valores do app Web. Para usar os emuladores, aponte o frontend para eles:

```dotenv
VITE_ADMIN_API_URL=http://127.0.0.1:5001/demo-project/us-central1/api
VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

`VITE_FIREBASE_AUTH_EMULATOR_HOST` faz o app autenticar no emulador de Auth em vez do projeto real; deixe a variável vazia em builds de produção. O emulador de Functions precisa rodar junto do de Auth, pois valida o ID token recebido.

Inicie os emuladores:

```sh
npm install
node functions/scripts/start-firebase-emulators.mjs
```

O script inicia os emuladores configurados (Auth, Functions, Firestore, Storage e UI) sempre no projeto local `demo-project`; não exige login no Firebase.

Crie o administrador local com email verificado (a Function exige `email_verified`):

```sh
npm run firebase:seed:auth
```

O emulador de Auth mantém os usuários apenas em memória: rode o script de novo a cada reinício dos emuladores (é idempotente, atualiza quem já existe). Ele usa o primeiro email de `functions/.secret.local` e a senha padrão `admin123456`; passe email e senha como argumentos para sobrescrever.

O projeto demo usa `http://127.0.0.1:5001/demo-project/us-central1` como base local das Functions, `http://127.0.0.1:9099` para Auth, `http://127.0.0.1:8080` para Firestore, `http://127.0.0.1:9199` para Storage e `http://127.0.0.1:4000` para a UI dos emuladores. Use `npm run functions:build` para compilar as Functions.

Associe o projeto real e publique apenas as Functions:

```sh
firebase login
firebase use <project-id>
npm run firebase:deploy:functions
```

O deploy executa o build configurado em `functions/package.json`. Para validar o frontend, use os scripts existentes `npm run dev`, `npm run build` e `npm run preview`.

O frontend é publicado no GitHub Pages pelo `deploy.yml`; o Firebase Hosting não está configurado em `firebase.json`. Em qualquer hospedagem estática, configure a URL pública exata da Function no frontend e inclua a origem final do site, exatamente, em `CORS_ALLOWED_ORIGINS`. Repita isso para cada domínio/ambiente; não use curingas. Consulte o Firebase Console ou `firebase functions:list --project <project-id>` para obter a URL realmente publicada.

`tsconfig.json` usa `module: ESNext` com `moduleResolution: bundler`, compatíveis com Vite.

### ©️ Aviso de direitos autorais

</br>

Esse projeto foi desenvolvido para propósitos de aprendizagem e divulgação de meus projetos, todo o código e documentação são da autoria de [Erik-EFL](https://github.com/Erik-EFL) e os direitos pertencem exclusivamente a [Erik-EFL](https://github.com/Erik-EFL). É permitido baixar ou clonar o repositório para fins de estudo. Contudo, não é permitido publicar cópias totais ou parciais. Este aviso não cobre bibliotecas, dependências ou marcas, estas estão sujeitas a suas respectivas licenças.
