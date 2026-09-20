# Backlog de Issues - StudyBookShelf

Abaixo estÃ¡ o detalhamento do Product Requirements Document (PRD) quebrado em Issues acionÃ¡veis para o Kanban.

---

## Epic 1: Infraestrutura e ConfiguraÃ§Ã£o Inicial

### Issue #1: Setup do Projeto Next.js e Banco de Dados
**DescriÃ§Ã£o:** Inicializar o repositÃ³rio utilizando Next.js (App Router), Tailwind CSS e shadcn/ui. Configurar o banco de dados relacional PostgreSQL (Neon/Supabase) integrando o Prisma ORM.
**CritÃ©rios de Aceite:**
- [x] O projeto roda localmente sem erros (`npm run dev`).
- [x] Prisma instalado e esquema inicial gerado.
- [x] VariÃ¡veis de ambiente configuradas no `.env.example`.

### Issue #2: AutenticaÃ§Ã£o de UsuÃ¡rios
**DescriÃ§Ã£o:** Integrar o NextAuth.js (Auth.js) para permitir login e registro utilizando a conta do GitHub.
**CritÃ©rios de Aceite:**
- [x] Tabelas do NextAuth criadas no Prisma (`User`, `Account`, `Session`, etc.).
- [x] Fluxo de login com GitHub funcionando na pÃ¡gina inicial.
- [x] ProteÃ§Ã£o de rotas para garantir que o dashboard seja privado.

---

## Epic 2: Motor de InteligÃªncia Artificial

### Issue #3: IntegraÃ§Ã£o do Google Gemini para CategorizaÃ§Ã£o de TÃ³picos
**DescriÃ§Ã£o:** Criar uma rota de API (`/api/ai/categorize`) utilizando o Vercel AI SDK para receber um input de texto livre e retornar um objeto JSON estruturado.
**CritÃ©rios de Aceite:**
- [x] A rota recebe um `prompt` do usuÃ¡rio (ex: "Quero aprender React").
- [x] A IA retorna um JSON contendo `title`, `description` e `domain`.
- [x] Tratamento de erros caso o LLM falhe ao estruturar os dados.

---

## Epic 3: Funcionalidades Core (GestÃ£o de Conhecimento)

### Issue #4: Interface de CriaÃ§Ã£o de TÃ³picos
**DescriÃ§Ã£o:** Desenvolver o componente do Frontend onde o desenvolvedor digita o que deseja aprender.
**CritÃ©rios de Aceite:**
- [x] Input de texto com botÃ£o de "Adicionar".
- [x] Feedback de carregamento (spinner) enquanto aguarda a IA processar.
- [x] RequisiÃ§Ã£o disparada salva o resultado no banco via endpoint do backend.

### Issue #5: Kanban Board de TÃ³picos (My Board)
**DescriÃ§Ã£o:** Criar o painel onde o usuÃ¡rio visualiza seus tÃ³picos privados.
**CritÃ©rios de Aceite:**
- [x] TÃ³picos agrupados visualmente por `Domain` (ex: Frontend, Backend).
- [x] Organizados em colunas por `Status` (A Aprender, Estudando, Dominado).
- [x] UsuÃ¡rio pode alterar o status de um tÃ³pico atravÃ©s de um Select/Drag-and-Drop.
- [x] TÃ³picos podem ter a visibilidade alterada entre Privado/PÃºblico.

---

## Epic 4: Aspectos Sociais e Comunidade

### Issue #6: Feed da Comunidade (PÃºblico)
**DescriÃ§Ã£o:** Exibir tÃ³picos marcados como `PUBLIC` por todos os usuÃ¡rios na plataforma.
**CritÃ©rios de Aceite:**
- [x] Uma aba dedicada a "Community".
- [x] Exibe cartÃµes de tÃ³picos com informaÃ§Ãµes resumidas e identificaÃ§Ã£o do autor (foto, nome).
- [x] TÃ³picos privados (`PRIVATE`) **nÃ£o** devem aparecer neste feed sob nenhuma circunstÃ¢ncia.

### Issue #7: Sistema de Favoritos e Seguidores (A Fazer)
**DescriÃ§Ã£o:** Permitir que desenvolvedores construam curadorias favoritando tÃ³picos de outros e seguindo perfis.
**CritÃ©rios de Aceite:**
- [x] BotÃ£o de favoritar em tÃ³picos pÃºblicos do Feed da Comunidade.
- [x] PÃ¡gina de perfil pÃºblico do usuÃ¡rio com botÃ£o "Seguir" (implementado botÃ£o seguir direto no card).
- [x] Filtro no Feed da Comunidade para ver apenas tÃ³picos de "Quem eu sigo".

---

## Epic 5: Motor de Recomendações Contextuais

### Issue #8: Banco de Dados - Tabela IgnoredRecommendation
**Descrição:** Adicionar a entidade responsável por salvar as recomendações que o usuário ignorou, funcionando como uma blacklist para o LLM.
**Critérios de Aceite:**
- [x] Criar o model `IgnoredRecommendation` no `schema.prisma` com `userId`, `domain` e `topicTitle`.
- [x] O modelo deve ter relação com o `User`.
- [x] Rodar o comando de sincronização do banco de dados (ex: db push ou dev).

### Issue #9: Rota de IA - Gerador de Recomendações
**Descrição:** Criar o endpoint de backend que chama o Google Gemini, passando o contexto e a blacklist, para receber as sugestões estruturadas.
**Critérios de Aceite:**
- [x] Criar `POST /api/ai/recommend`.
- [x] Buscar no banco os tópicos do usuário para o domínio solicitado (para contexto do que ele já sabe).
- [x] Buscar no banco a lista de `IgnoredRecommendation` daquele domínio (blacklist).
- [x] Instruir o LLM via Vercel AI SDK a retornar um array de 1 a 10 sugestões (título e descrição curta).

### Issue #10: UI - Modal de Recomendações e Regra dos 3
**Descrição:** Criar o gatilho visual e a interface onde as recomendações serão exibidas, respeitando a hierarquia visual.
**Critérios de Aceite:**
- [x] Adicionar um botão de "varinha mágica" ao lado de cada Domínio no `TopicBoard`.
- [x] O clique deve abrir um Modal/Dialog com *Skeleton Loaders* enquanto a API responde.
- [x] Os 3 primeiros itens devem ter um card de destaque maior ("Highly Recommended").
- [x] Os demais itens (do 4º ao 10º) devem aparecer em uma lista compacta.
- [x] Clicar fora do modal fecha-o sem salvar estado.

### Issue #11: Ações de Conversão - Add e Ignore
**Descrição:** Ligar os botões dos cards de recomendação aos respectivos endpoints de conversão e descarte.
**Critérios de Aceite:**
- [x] Clicar em "Add" deve salvar um novo tópico como `TO_LEARN` e `PRIVATE`, fechando a recomendação e atualizando a interface.
- [x] Clicar em "Ignore" deve chamar um novo endpoint `POST /api/recommendations/ignore` para salvar no banco.
- [x] Tópicos adicionados não devem gerar reload da página inteira.
