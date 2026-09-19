# Product Requirements Document (PRD) - StudyBookShelf

## 1. Visão Geral do Produto
O **StudyBookShelf** é uma plataforma colaborativa e SaaS de gestão de conhecimento focada em desenvolvedores. O objetivo principal é atuar como um "segundo cérebro" assistido por Inteligência Artificial (IA) para organizar tópicos de estudo, categorizar conhecimentos e acompanhar o progresso na carreira de engenharia de software, resolvendo o problema de sobrecarga de informações.

## 2. O Problema (Mapeamento da Dor)
Desenvolvedores lidam diariamente com um volume massivo de informações, frameworks, linguagens e conceitos. Durante o processo de progressão de carreira, enfrentam:
- **Sobrecarga de Informações:** Infinitos assuntos, artigos e tutoriais salvos sem organização ("a síndrome de um milhão de abas abertas").
- **Falta de Rastreabilidade:** Perda de controle sobre o que já foi estudado, o que é dominado apenas superficialmente e o que ainda precisa ser aprendido.

## 3. A Solução
Uma plataforma web contínua, onde o desenvolvedor insere comandos em linguagem natural (ex: "Preciso estudar React Server Components") e um agente de IA processa, estrutura e categoriza esse tópico em quadrantes organizados por domínio tecnológico (ex: Frontend, DevOps, Backend) e por status de aprendizado (A Aprender, Estudando, Dominado).

## 4. Público-Alvo
- Desenvolvedores de Software (Júnior a Staff/Principal).
- Estudantes de Tecnologia.
- Entusiastas de TI buscando estruturar trilhas de conhecimento.

## 5. Principais Funcionalidades (MVP)

### 5.1. Processamento de Linguagem Natural (IA)
- Input de texto livre pelo usuário.
- O Agente de IA (Google Gemini) processa o input e extrai: `Título do Tópico`, `Descrição Curta` e `Domínio/Área` (ex: Backend, Data Science).

### 5.2. Gestão de Tópicos (Quadrantes)
- Visualização Kanban-style dividida por **Domínios**.
- Arrastar e soltar (ou selecionar) o status do tópico: `TO_LEARN` (A Aprender), `LEARNING` (Estudando) e `MASTERED` (Dominado).

### 5.3. Controle de Visibilidade
- Todos os tópicos nascem como **Privados** por padrão (foco na segurança psicológica e organização pessoal).
- Usuários podem alterar a visibilidade de um tópico para **Público**, compartilhando seu progresso e anotações com a comunidade.

### 5.4. Feed da Comunidade e Interações (Social)
- **Feed Público:** Uma aba onde é possível visualizar todos os tópicos públicos da plataforma.
- **Favoritos e Seguidores:** Capacidade de favoritar (`Bookmark`) tópicos de terceiros e seguir perfis relevantes para criar uma curadoria de conhecimento colaborativa.

## 6. Arquitetura Técnica

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.
- **Backend/API:** Next.js API Routes (Serverless).
- **Banco de Dados:** PostgreSQL (ex: Neon ou Supabase).
- **ORM:** Prisma ORM.
- **Autenticação:** NextAuth.js (Auth.js) utilizando OAuth (GitHub).
- **Inteligência Artificial:** Vercel AI SDK integrado com Google Gemini API.
- **Deploy:** Vercel.

## 7. Modelagem de Dados Resumida
- **User:** Contas de usuários (integradas via GitHub).
- **Topic:** Armazena o título, descrição, domínio, status e visibilidade.
- **Follow:** Tabela de relacionamento para usuários seguindo usuários.
- **Favorite:** Tabela de relacionamento para usuários favoritando tópicos.

## 8. Próximos Passos (V2 e Evolução)
- Geração de trilhas de estudo automáticas via IA baseadas nos objetivos de carreira.
- Integração com plataformas externas (GitHub repos, links do Notion, artigos do Medium) como anexos nos tópicos.
- Lembretes espaçados (Spaced Repetition) para revisão de tópicos em status `LEARNING` e `MASTERED`.
