# Montanha de Aco

Montanha de Aco e um jogo tatico em navegador com estetica steampunk, progressao persistente, construcao de deck e batalhas por turnos. O projeto foi construido com React, TypeScript, Vite, Zustand e Supabase, com foco em uma experiencia single-page fluida e pronta para evoluir para recursos online.

## Visao Geral

No papel de comandante da Fundicao, o jogador desbloqueia cartas, monta um deck de batalha, abre boosters na Forja e entra em combate contra a inteligencia do jogo. O projeto tambem ja prepara a base para sincronizacao em nuvem e futuras features PvP.

### Destaques

- Colecao tatica com 20 cartas tematicas.
- Deck builder com limite de 20 cartas e ate 3 copias por carta.
- Sistema de booster da Forja com desbloqueio progressivo.
- Batalha por turnos com atributos, habilidades e log de combate.
- Persistencia local via `localStorage`.
- Sincronizacao opcional em nuvem com Supabase e login por magic link.
- Modal de detalhes das cartas com historia, atributos e contexto tatico.
- Ambientacao visual steampunk com animacoes em `framer-motion`.

## Preview do Fluxo

O jogo e organizado em uma unica aplicacao React com multiplas telas:

1. Menu principal.
2. Dashboard da campanha.
3. Forja para abrir boosters e visualizar a colecao.
4. Construtor de deck.
5. Arena de combate.
6. Telas de vitoria e derrota.

## Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand

### Backend / Servicos

- Supabase Auth
- Supabase Database

### Integracao externa

- Deck of Cards API
  Observacao: existe fallback interno para manter o jogo funcional mesmo sem a API externa.

## Funcionalidades

### Progressao

- Perfil do comandante.
- Creditos da Forja.
- Cartas desbloqueadas.
- Deck selecionado.
- Historico de batalhas e vitorias.
- Persistencia local e opcionalmente em nuvem.

### Forja

- Cada booster custa `90` creditos.
- Cada booster entrega `3` cartas.
- O sistema prioriza cartas ainda nao desbloqueadas.
- A tela da colecao permite abrir um modal com historia, detalhes taticos e atributos da carta.

### Deck Builder

- Deck com tamanho fixo de `20` cartas.
- Limite de `3` copias por carta.
- Somente cartas desbloqueadas podem ser adicionadas.
- Visualizacao rapida e consulta detalhada por modal.

### Batalha

- Sistema por turnos.
- Mao, deck, mesa e cemiterio.
- Atributos como ataque, defesa e escudo.
- Habilidades de carta com resolucao em combate.
- Registro textual das jogadas.

### Nuvem

- Login por email magic link com Supabase.
- Sincronizacao de progresso, colecao, deck e configuracoes.
- Fallback local automatico quando Supabase nao esta configurado.

## Estrutura do Projeto

```text
src/
  assets/             Artes, icones e imagens
  components/         Componentes compartilhados e modais
  data/               Catalogo estatico de cartas
  features/           Telas principais do jogo
  hooks/              Hooks de controle de batalha
  services/           Integracoes, auth e progressao
  store/              Estado global com Zustand
  types/              Tipos centrais do dominio
  utils/              Regras auxiliares e logica de apoio
public/
  icons/              Icones do app / PWA
supabase-schema.sql   Schema da tabela de progresso
```

## Como Rodar Localmente

### Requisitos

- Node.js 18+
- npm 9+

### Instalacao

```bash
npm install
```

### Ambiente

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Se essas variaveis nao forem informadas, o jogo continua funcionando localmente, mas os recursos de autenticacao e sincronizacao em nuvem ficam desabilitados.

### Desenvolvimento

```bash
npm run dev
```

### Build de Producao

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## Configurando o Supabase

O projeto espera uma tabela chamada `player_progress`. O schema base ja esta no arquivo [supabase-schema.sql](./supabase-schema.sql).

### Passos

1. Crie um projeto no Supabase.
2. Copie a URL e a anon key para o `.env`.
3. Execute o SQL do arquivo `supabase-schema.sql` no SQL Editor do projeto.
4. Ative o provedor de email magic link no painel de Auth.
5. Ajuste a URL de redirecionamento conforme seu ambiente de deploy.

### O que e salvo na nuvem

- Nome do comandante.
- Rank e nivel.
- Creditos da Forja.
- Batalhas jogadas e vitorias.
- Cartas desbloqueadas.
- Deck selecionado.
- Data da ultima jogada.
- Configuracoes de musica.

## Regras Importantes do Jogo

- Deck inicial com cartas basicas predefinidas.
- Cartas iniciais desbloqueadas:
  `guardiao-de-ferro`, `automato-defensor`, `medico-do-vapor`, `tecnico-de-campo`, `lamina-fantasma`, `torre-de-vapor-mk1`, `sabotador-mecanico`, `torre-mecanica`
- Booster custa `90` creditos.
- Tamanho do deck: `20`.
- Limite por carta no deck: `3`.

## Persistencia

O projeto usa duas camadas:

- Local: `localStorage`
- Nuvem: Supabase

Quando o usuario faz login, o jogo tenta carregar o snapshot da nuvem. Se nao houver registro remoto, o snapshot local e promovido automaticamente.

## Arquitetura de Estado

O estado global principal fica em `src/store/gameStore.ts` e concentra:

- navegacao entre telas
- perfil e progressao
- autenticacao
- configuracoes
- estado da batalha
- forja e deck builder

Essa centralizacao facilita persistencia, sincronizacao e regras de dominio.

## Estilo Visual

Montanha de Aco aposta em uma direcao steampunk com:

- gradientes metalicos
- tipografia dramatica
- overlays de vapor e grade
- molduras de raridade
- transicoes e motion design

## Deploy

O app pode ser publicado facilmente em plataformas como:

- Vercel
- Netlify
- Cloudflare Pages

Para deploy com Supabase:

1. Configure as variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
2. Adicione a URL publica do app nas configuracoes de Auth do Supabase.
3. Gere a build com `npm run build`.

## Melhorias Futuras

- Arena PvP real com matchmaking.
- Lobby online e salas privadas.
- Mais cartas, classes e raridades.
- Efeitos visuais adicionais nas habilidades.
- Sistema de quests e recompensas.
- Ranking online.
- Testes automatizados para combate e progressao.
- Code splitting para reduzir o tamanho do bundle principal.

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```

## Observacoes Tecnicas

- O build atual funciona normalmente, mas o Vite pode emitir aviso de chunk principal acima de 500 kB.
- A aplicacao foi preparada para continuar jogavel mesmo quando integracoes externas nao estiverem disponiveis.
- O design e a narrativa das cartas fazem parte da identidade do projeto e podem ser expandidos a partir de `src/data/cards.ts`.

## Licenca

Este projeto ainda nao possui uma licenca definida. Se for publicar no GitHub publicamente, vale adicionar uma licenca como MIT.

## Autor

Se quiser, voce pode substituir esta secao pelo seu nome, perfil do GitHub, portfolio e links de deploy.
