# Backlog de Issues - StudyBookShelf

Abaixo est√° o detalhamento do Product Requirements Document (PRD) quebrado em Issues acion√°veis para o Kanban.

---

## Epic 1: Infraestrutura e Configura√ß√£o Inicial

### Issue #1: Setup do Projeto Next.js e Banco de Dados
**Descri√ß√£o:** Inicializar o reposit√≥rio utilizando Next.js (App Router), Tailwind CSS e shadcn/ui. Configurar o banco de dados relacional PostgreSQL (Neon/Supabase) integrando o Prisma ORM.
**Crit√©rios de Aceite:**
- [x] O projeto roda localmente sem erros (`npm run dev`).
- [x] Prisma instalado e esquema inicial gerado.
- [x] Vari√°veis de ambiente configuradas no `.env.example`.

### Issue #2: Autentica√ß√£o de Usu√°rios
**Descri√ß√£o:** Integrar o NextAuth.js (Auth.js) para permitir login e registro utilizando a conta do GitHub.
**Crit√©rios de Aceite:**
- [x] Tabelas do NextAuth criadas no Prisma (`User`, `Account`, `Session`, etc.).
- [x] Fluxo de login com GitHub funcionando na p√°gina inicial.
- [x] Prote√ß√£o de rotas para garantir que o dashboard seja privado.

---

## Epic 2: Motor de Intelig√™ncia Artificial

### Issue #3: Integra√ß√£o do Google Gemini para Categoriza√ß√£o de T√≥picos
**Descri√ß√£o:** Criar uma rota de API (`/api/ai/categorize`) utilizando o Vercel AI SDK para receber um input de texto livre e retornar um objeto JSON estruturado.
**Crit√©rios de Aceite:**
- [x] A rota recebe um `prompt` do usu√°rio (ex: "Quero aprender React").
- [x] A IA retorna um JSON contendo `title`, `description` e `domain`.
- [x] Tratamento de erros caso o LLM falhe ao estruturar os dados.

---

## Epic 3: Funcionalidades Core (Gest√£o de Conhecimento)

### Issue #4: Interface de Cria√ß√£o de T√≥picos
**Descri√ß√£o:** Desenvolver o componente do Frontend onde o desenvolvedor digita o que deseja aprender.
**Crit√©rios de Aceite:**
- [x] Input de texto com bot√£o de "Adicionar".
- [x] Feedback de carregamento (spinner) enquanto aguarda a IA processar.
- [x] Requisi√ß√£o disparada salva o resultado no banco via endpoint do backend.

### Issue #5: Kanban Board de T√≥picos (My Board)
**Descri√ß√£o:** Criar o painel onde o usu√°rio visualiza seus t√≥picos privados.
**Crit√©rios de Aceite:**
- [x] T√≥picos agrupados visualmente por `Domain` (ex: Frontend, Backend).
- [x] Organizados em colunas por `Status` (A Aprender, Estudando, Dominado).
- [x] Usu√°rio pode alterar o status de um t√≥pico atrav√©s de um Select/Drag-and-Drop.
- [x] T√≥picos podem ter a visibilidade alterada entre Privado/P√∫blico.

---

## Epic 4: Aspectos Sociais e Comunidade

### Issue #6: Feed da Comunidade (P√∫blico)
**Descri√ß√£o:** Exibir t√≥picos marcados como `PUBLIC` por todos os usu√°rios na plataforma.
**Crit√©rios de Aceite:**
- [x] Uma aba dedicada a "Community".
- [x] Exibe cart√µes de t√≥picos com informa√ß√µes resumidas e identifica√ß√£o do autor (foto, nome).
- [x] T√≥picos privados (`PRIVATE`) **n√£o** devem aparecer neste feed sob nenhuma circunst√¢ncia.

### Issue #7: Sistema de Favoritos e Seguidores (A Fazer)
**Descri√ß√£o:** Permitir que desenvolvedores construam curadorias favoritando t√≥picos de outros e seguindo perfis.
**Crit√©rios de Aceite:**
- [x] Bot√£o de favoritar em t√≥picos p√∫blicos do Feed da Comunidade.
- [x] P√°gina de perfil p√∫blico do usu√°rio com bot√£o "Seguir" (implementado bot√£o seguir direto no card).
- [x] Filtro no Feed da Comunidade para ver apenas t√≥picos de "Quem eu sigo".

---

## Epic 5: Motor de RecomendaÁıes Contextuais

### Issue #8: Banco de Dados - Tabela IgnoredRecommendation
**DescriÁ„o:** Adicionar a entidade respons·vel por salvar as recomendaÁıes que o usu·rio ignorou, funcionando como uma blacklist para o LLM.
**CritÈrios de Aceite:**
- [ ] Criar o model IgnoredRecommendation no schema.prisma com userId, domain e 	opicTitle.
- [ ] O modelo deve ter relaÁ„o com o User.
- [ ] Rodar o comando de sincronizaÁ„o do banco de dados (ex: db push ou dev).

### Issue #9: Rota de IA - Gerador de RecomendaÁıes
**DescriÁ„o:** Criar o endpoint de backend que chama o Google Gemini, passando o contexto e a blacklist, para receber as sugestıes estruturadas.
**CritÈrios de Aceite:**
- [ ] Criar POST /api/ai/recommend.
- [ ] Buscar no banco os tÛpicos do usu·rio para o domÌnio solicitado (para contexto do que ele j· sabe).
- [ ] Buscar no banco a lista de IgnoredRecommendation daquele domÌnio (blacklist).
- [ ] Instruir o LLM via Vercel AI SDK a retornar um array de 1 a 10 sugestıes (tÌtulo e descriÁ„o curta).

### Issue #10: UI - Modal de RecomendaÁıes e Regra dos 3
**DescriÁ„o:** Criar o gatilho visual e a interface onde as recomendaÁıes ser„o exibidas, respeitando a hierarquia visual.
**CritÈrios de Aceite:**
- [ ] Adicionar um bot„o de "varinha m·gica" ao lado de cada DomÌnio no TopicBoard.
- [ ] O clique deve abrir um Modal/Dialog com *Skeleton Loaders* enquanto a API responde.
- [ ] Os 3 primeiros itens devem ter um card de destaque maior ("Highly Recommended").
- [ ] Os demais itens (do 4∫ ao 10∫) devem aparecer em uma lista compacta.
- [ ] Clicar fora do modal fecha-o sem salvar estado.

### Issue #11: AÁıes de Convers„o - Add e Ignore
**DescriÁ„o:** Ligar os botıes dos cards de recomendaÁ„o aos respectivos endpoints de convers„o e descarte.
**CritÈrios de Aceite:**
- [ ] Clicar em "Add" deve salvar um novo tÛpico como TO_LEARN e PRIVATE, fechando a recomendaÁ„o e atualizando a interface.
- [ ] Clicar em "Ignore" deve chamar um novo endpoint POST /api/recommendations/ignore para salvar no banco.
- [ ] TÛpicos adicionados n„o devem gerar reload da p·gina inteira.
