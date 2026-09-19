# Backlog de Issues - StudyBookShelf

Abaixo está o detalhamento do Product Requirements Document (PRD) quebrado em Issues acionáveis para o Kanban.

---

## Epic 1: Infraestrutura e Configuração Inicial

### Issue #1: Setup do Projeto Next.js e Banco de Dados
**Descrição:** Inicializar o repositório utilizando Next.js (App Router), Tailwind CSS e shadcn/ui. Configurar o banco de dados relacional PostgreSQL (Neon/Supabase) integrando o Prisma ORM.
**Critérios de Aceite:**
- [x] O projeto roda localmente sem erros (`npm run dev`).
- [x] Prisma instalado e esquema inicial gerado.
- [x] Variáveis de ambiente configuradas no `.env.example`.

### Issue #2: Autenticação de Usuários
**Descrição:** Integrar o NextAuth.js (Auth.js) para permitir login e registro utilizando a conta do GitHub.
**Critérios de Aceite:**
- [x] Tabelas do NextAuth criadas no Prisma (`User`, `Account`, `Session`, etc.).
- [x] Fluxo de login com GitHub funcionando na página inicial.
- [x] Proteção de rotas para garantir que o dashboard seja privado.

---

## Epic 2: Motor de Inteligência Artificial

### Issue #3: Integração do Google Gemini para Categorização de Tópicos
**Descrição:** Criar uma rota de API (`/api/ai/categorize`) utilizando o Vercel AI SDK para receber um input de texto livre e retornar um objeto JSON estruturado.
**Critérios de Aceite:**
- [x] A rota recebe um `prompt` do usuário (ex: "Quero aprender React").
- [x] A IA retorna um JSON contendo `title`, `description` e `domain`.
- [x] Tratamento de erros caso o LLM falhe ao estruturar os dados.

---

## Epic 3: Funcionalidades Core (Gestão de Conhecimento)

### Issue #4: Interface de Criação de Tópicos
**Descrição:** Desenvolver o componente do Frontend onde o desenvolvedor digita o que deseja aprender.
**Critérios de Aceite:**
- [x] Input de texto com botão de "Adicionar".
- [x] Feedback de carregamento (spinner) enquanto aguarda a IA processar.
- [x] Requisição disparada salva o resultado no banco via endpoint do backend.

### Issue #5: Kanban Board de Tópicos (My Board)
**Descrição:** Criar o painel onde o usuário visualiza seus tópicos privados.
**Critérios de Aceite:**
- [x] Tópicos agrupados visualmente por `Domain` (ex: Frontend, Backend).
- [x] Organizados em colunas por `Status` (A Aprender, Estudando, Dominado).
- [x] Usuário pode alterar o status de um tópico através de um Select/Drag-and-Drop.
- [x] Tópicos podem ter a visibilidade alterada entre Privado/Público.

---

## Epic 4: Aspectos Sociais e Comunidade

### Issue #6: Feed da Comunidade (Público)
**Descrição:** Exibir tópicos marcados como `PUBLIC` por todos os usuários na plataforma.
**Critérios de Aceite:**
- [x] Uma aba dedicada a "Community".
- [x] Exibe cartões de tópicos com informações resumidas e identificação do autor (foto, nome).
- [x] Tópicos privados (`PRIVATE`) **não** devem aparecer neste feed sob nenhuma circunstância.

### Issue #7: Sistema de Favoritos e Seguidores (A Fazer)
**Descrição:** Permitir que desenvolvedores construam curadorias favoritando tópicos de outros e seguindo perfis.
**Critérios de Aceite:**
- [x] Botão de favoritar em tópicos públicos do Feed da Comunidade.
- [x] Página de perfil público do usuário com botão "Seguir" (implementado botão seguir direto no card).
- [x] Filtro no Feed da Comunidade para ver apenas tópicos de "Quem eu sigo".
