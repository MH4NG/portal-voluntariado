# Pontes — Portal de Voluntariado Municipal

**Pontes** conecta pessoas e instituições que precisam de ajuda a voluntários da cidade
(projeto-piloto em Petrópolis, RJ). Quem precisa publica um pedido; quem quer ajudar encontra ações
no mapa ou na lista e fala **direto** com a pessoa responsável, por WhatsApp, e-mail ou redes
sociais. Não existe chat interno.

Este repositório é o **MVP de front-end**: não há back-end. Os dados de exemplo e as contas
ficam no navegador.

🔗 **Ao vivo:** https://pontes-petropolis.vercel.app
📦 **Repositório:** https://github.com/MH4NG/portal-voluntariado

## Funcionalidades

| Rota | O que faz |
| --- | --- |
| `/` | Página inicial: apresentação (`#inicio`), contadores de impacto (`#impacto`), “Como funciona” com as duas jornadas (`#como-funciona`) e mural das chamadas mais urgentes (`#acoes`). |
| `/acoes` | Mapa interativo (Google Maps) com lista filtrável por busca, causa e urgência. Os filtros ficam na URL (`?q=`, `?categoria=`, `?urgencia=`, `?acao=<id>`), então dá para compartilhar o link. |
| `/acoes/:id` | Detalhes da ação: necessidades, local, mini-mapa, botões de contato direto (WhatsApp com mensagem pronta, `mailto:`, Instagram, Facebook, site) e ações relacionadas. |
| `/acoes/nova` | Novo pedido de ajuda (exige conta de beneficiário). |
| `/cadastro` | Cadastro em etapas com dois perfis: `?perfil=voluntario` ou `?perfil=beneficiario`. Sem parâmetro, mostra a escolha de perfil. |
| `/entrar` | Login simulado por e-mail. `?next=/caminho` leva de volta à página de origem (só caminhos internos). |
| `*` | Página 404 amigável. |

O rodapé (`#contato`) aparece em todas as páginas.

## Tecnologias

- **Vite 8** + **React 19** + **TypeScript 7**
- **Tailwind CSS v4** (`@tailwindcss/vite`), com os tokens definidos via `@theme` em `src/index.css`
- **React Router 7** (data router, páginas carregadas sob demanda)
- **GSAP 3** + ScrollTrigger + `@gsap/react` para as animações
- **@vis.gl/react-google-maps** para o Google Maps (AdvancedMarker, InfoWindow, Geocoding)
- **oxlint** para lint

## Como rodar

Requisitos: Node.js 20 ou mais recente.

```bash
npm install
cp .env.example .env      # opcional: preencha a chave do Google Maps
npm run dev               # http://localhost:5173
```

Outros scripts:

```bash
npm run build     # tsc -b + vite build (saída em dist/)
npm run preview   # serve o build localmente
npm run lint      # oxlint
```

O workflow em `.github/workflows/ci.yml` roda `lint → build` (o build inclui a checagem de tipos
do `tsc -b`) a cada push e pull request.

## Deploy

Publicado no Vercel (projeto `pontes-petropolis`, escopo `h4-ng`) com o repositório conectado
pela integração Git. O deploy é automático:

| Evento | Resultado |
| --- | --- |
| push na `main` | deploy de **produção** |
| push em qualquer outra branch | **preview** com URL própria |

A Vercel detecta o Vite sozinha (build `npm run build`, saída `dist/`). O `vercel.json` na raiz
reescreve todas as rotas para `index.html`; sem isso, as rotas do React Router (`/acoes`,
`/acoes/:id`, `/cadastro`…) respondem 404 quando acessadas diretamente, em vez de navegando pelo app.

As variáveis `VITE_GOOGLE_MAPS_API_KEY` e `VITE_GOOGLE_MAPS_MAP_ID` são opcionais e ficam em
*Settings → Environment Variables* do projeto. Por serem `VITE_*`, entram no bundle no momento do
build: depois de alterá-las, é preciso um novo deploy. Sem elas, o portal publicado usa o fallback
descrito em [Google Maps](#google-maps). Se configurar a chave, inclua o domínio
`https://pontes-petropolis.vercel.app/*` na restrição por *HTTP referrer*.

## Google Maps

O portal funciona **sem** chave. Para ativar os mapas reais:

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative o faturamento.
2. Ative as APIs **Maps JavaScript API** e **Geocoding API**. A Geocoding é usada para localizar o
   endereço no cadastro de pedidos.
3. Crie uma **chave de API**. Restrinja-a por *HTTP referrer* (ex.: `http://localhost:5173/*` e o domínio
   de produção) e às duas APIs acima.
4. Em *Map Management*, crie um **Map ID** do tipo JavaScript (vetorial). Ele é necessário para os
   `AdvancedMarker`.
5. Preencha o `.env`:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=sua-chave
   VITE_GOOGLE_MAPS_MAP_ID=seu-map-id
   ```

   Sem Map ID, o app usa o `DEMO_MAP_ID` do Google, que serve apenas para desenvolvimento.

**Sem chave, ou se a API falhar** (erro de rede, chave inválida, `AUTH_FAILURE`), o portal degrada
de forma acessível:

- `/acoes` mostra a lista completa de ações com os mesmos filtros e um mapa esquemático decorativo
  de Petrópolis. Cada item tem um link “Abrir no Google Maps”.
- `/acoes/:id` mostra uma ilustração de mapa e mantém os links “Como chegar” e “Ver no mapa do portal”.
- No cadastro de pedido, o pin é posicionado no centro do bairro escolhido.

Todos os `<APIProvider>` usam as mesmas opções (`MAPS_PROVIDER_PROPS` em `src/config.ts`: idioma
`pt-BR`, região `BR`), porque o carregador da Maps API é único por página.

## Arquitetura

```
src/
├─ main.tsx               Providers (Auth, Requests) + RouterProvider
├─ router.tsx             Rotas; páginas pesadas via lazy(), com fallback e página de erro
├─ config.ts              Cidade, chaves do Maps, contatos da prefeitura
├─ types.ts               HelpRequest, perfis de usuário, contatos, categorias
├─ index.css              Tokens de design (@theme) e utilitários (focus-ring, sr-only…)
├─ context/
│  ├─ AuthContext.tsx     Autenticação simulada (localStorage)
│  └─ RequestsContext.tsx Ações (seed + criadas localmente), urgentes, addRequest
├─ data/                  Dados de demonstração: pedidos, categorias, bairros, estatísticas
├─ lib/                   Utilidades: gsap (MOTION), contato (WhatsApp/mailto), formatação,
│                         storage seguro, ids, ordenação por urgência, usePageTitle
├─ pages/                 Uma página por rota (+ RouteErrorPage)
└─ components/
   ├─ ui/                 Button/ButtonLink, Container, SectionHeading, Badge, Logo
   ├─ layout/             RootLayout, Header, MobileMenu, Footer, efeitos de rota (foco/scroll),
   │                      barra de progresso, fallback de carregamento
   ├─ home/               Hero (+ ilustrações SVG), Impacto, Como funciona, Mural de destaques
   ├─ map/                Página /acoes: filtros (sincronizados à URL), lista, mapa, marcadores,
   │                      InfoWindow, fallback esquemático
   ├─ requests/           RequestCard, ações de contato, mini-mapa, compartilhar, relacionadas
   └─ onboarding/         Escolha de perfil, assistente em etapas (rascunho em sessionStorage),
                          campos, validação, upload de imagem, seletor de local, revisão
```

Fluxo de dados: um pedido criado no cadastro de beneficiário ou em `/acoes/nova` passa por
`addRequest()`, é salvo no `localStorage` e aparece na hora no mapa e na lista, no mural da Home
(se estiver entre os mais urgentes) e em `/acoes/:id`.

## Acessibilidade (WCAG 2.1 AA)

- **Estrutura:** landmarks (`header`, `nav`, `main#conteudo`, `footer#contato`), um `h1` por página e
  títulos em ordem. Link “Pular para o conteúdo”, `<title>` por página (`usePageTitle`).
- **Navegação:** ao trocar de página, o foco vai para o `<main>` e a mudança é anunciada numa região
  `aria-live`. Âncoras (`/#como-funciona`, `#contato`) rolam até a seção e movem o foco para ela.
- **Teclado:** tudo funciona sem mouse: menu móvel com foco preso e `Esc`, abas com setas/Home/End,
  filtros com rádios nativos, marcadores do mapa focáveis, botões para ajustar o pin pelo teclado.
- **Formulários:** todo campo tem `label`. Erros aparecem num resumo com links para os campos, com
  `aria-invalid` e `aria-describedby`, e o foco vai para o título da etapa ao avançar.
- **Conteúdo dinâmico:** contagens de resultados, cópia de link/e-mail e login/logout são anunciados
  por `aria-live`.
- **Visual:** foco sempre visível (`focus-ring` / `focus-ring-inverse`), contraste ≥ 4,5:1 para texto,
  alvos de toque de no mínimo 48×48 px. A urgência é indicada por texto e ícone, não só pela cor.
  Ilustrações têm texto alternativo; os emojis são decorativos (`aria-hidden`).
- **Mobile-first:** pensado a partir de 360 px, sem rolagem horizontal.

### Movimento reduzido (WCAG 2.3.3)

Todas as animações GSAP usam `gsap.matchMedia()` com `MOTION.ok`
(`prefers-reduced-motion: no-preference`), importado de `src/lib/gsap.ts`. Com movimento reduzido,
nada é animado. As animações usam `gsap.from()`/`fromTo()` e só mexem em `transform`/`opacity`,
então o conteúdo já está visível no DOM mesmo sem JavaScript ou sem animação. A rolagem suave do
CSS também é desligada nesse modo.

## Tokens de design

Definidos em `src/index.css`. Use sempre os tokens semânticos:

| Token | Uso |
| --- | --- |
| `surface`, `surface-muted`, `surface-raised`, `surface-inverse` | Fundos: página (areia), seções alternadas, cards (branco), seções escuras (navy) |
| `ink`, `ink-muted`, `ink-inverse`, `ink-inverse-muted` | Texto principal e secundário em fundos claros e escuros |
| `primary`, `primary-hover`, `primary-soft`, `on-primary` | Ações principais (teal) |
| `urgent`, `urgent-soft`, `urgent-ink`, `on-urgent` | **Somente** destaques de urgência (âmbar) |
| `border`, `border-strong` | Bordas |
| `focus`, `focus-inverse` | Anel de foco em fundos claros e escuros |
| `success`, `danger` | Mensagens de sucesso e erro |
| `rounded-card`, `shadow-card`, `shadow-raised` | Cantos e sombras dos cards |
| `font-display` (Plus Jakarta Sans), `font-sans` (Inter) | Títulos e texto corrido |

As escalas brutas `navy-50…950`, `teal-50…900`, `amber-50…900` e `sand-50/100/200` também estão
disponíveis para ilustrações.

## Limitações do MVP

- **Autenticação simulada:** não há senha nem servidor. O cadastro salva o perfil no `localStorage`
  e o login só confere se o e-mail já foi cadastrado *neste navegador*. Não use dados reais.
- **Dados de demonstração:** os 12 pedidos, as instituições, os contatos e os números de impacto são
  fictícios.
- **Persistência local:** pedidos e contas criados ficam apenas no navegador de quem criou. Limpar
  os dados do site apaga tudo. Imagens enviadas são reduzidas e guardadas como data URL.
- **Sem moderação:** os pedidos são publicados na hora, sem revisão da prefeitura.
- **Google Maps:** o caminho com chave real (marcadores, InfoWindow, geocodificação) depende de
  configuração própria. Sem ela, vale o comportamento de fallback descrito acima.

## Cidade configurada

O portal está configurado para **Petrópolis (RJ)**. Para outro município, ajuste:

| O quê | Onde |
| --- | --- |
| Nome, UF, centro, zoom e limites (`bounds`) usados no mapa e na geocodificação | `src/config.ts` → `CITY` |
| Bairros/distritos com coordenadas aproximadas (fallback do pin sem Google Maps) | `src/data/neighborhoods.ts` |
| Ações de demonstração (endereços, coordenadas, DDD dos contatos) | `src/data/requests.ts` |
| Contorno, rios e parques do mapa esquemático de fallback | `src/components/map/MapFallback.tsx` |
| Marcos da ilustração do Hero (serra, Catedral, Palácio de Cristal, hortênsias) | `src/components/home/HeroIllustration.tsx` |
| Exemplos de telefone com DDD (24) nos formulários | `src/components/onboarding/` |

As coordenadas dos bairros e das ações de exemplo são aproximadas e servem só para demonstração.
