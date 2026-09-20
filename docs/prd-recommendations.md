# Product Requirements Document (PRD) - Motor de Recomendações Contextuais

## 1. Visão Geral e Objetivos
O **Motor de Recomendações** é uma funcionalidade baseada em IA projetada para resolver a inércia no planejamento de carreira do desenvolvedor. Quando um usuário não sabe qual deve ser seu próximo passo de estudo, ele pode acionar a IA "sob demanda" dentro de um domínio específico. O sistema analisará o contexto atual do usuário (o que ele já estuda e o que ele já descartou) e sugerirá de 1 a 10 novos assuntos altamente relevantes, permitindo a descoberta ativa e a adição com um único clique.

## 2. Módulos Afetados

### 2.1 Banco de Dados
- Criação de uma nova tabela/modelo `IgnoredRecommendation` para armazenar o histórico de tópicos rejeitados (relacionando `userId`, `domain` e o título do tópico).

### 2.2 Backend / Motor de IA
- Criação de um endpoint `POST /api/ai/recommend`.
- O prompt do LLM (Google Gemini) deve atuar como um mentor técnico focado em um único Domínio de cada vez (ex: "Frontend").
- A requisição para a IA deve receber:
  - Os tópicos atuais do usuário naquele domínio.
  - A *blacklist* de tópicos (buscados da tabela `IgnoredRecommendation`) para garantir que a IA não seja redundante.

### 2.3 Frontend / Interface do Usuário (UI)
- Inserção de um botão com ícone de "varinha mágica" no cabeçalho de cada Domínio no `TopicBoard`.
- Criação de um componente de `Modal/Dialog` para abrigar a experiência de recomendação.
- Implementação de um *Skeleton Loader* animado para cobrir a latência da IA.
- Layout de exibição condicional das sugestões (Top 3 em destaque vs. Lista Compacta para os restantes).

## 3. Histórias de Usuário (User Stories)

- **US01:** Como usuário, quero clicar em um ícone de varinha mágica ao lado de um domínio específico, para que a IA analise meu conhecimento atual apenas daquele domínio e sugira próximos passos coerentes.
- **US02:** Como usuário, quero ver um indicativo de carregamento (skeleton loader) caso a IA demore a responder, para saber que minha solicitação está sendo processada.
- **US03:** Como usuário, quero poder fechar a janela de recomendações a qualquer momento, cancelando a operação de espera.
- **US04:** Como usuário, quero ver os 3 assuntos mais recomendados destacados no topo (com uma UI diferenciada e atraente), e opções menos urgentes listadas de forma compacta abaixo.
- **US05:** Como usuário, quero adicionar uma recomendação ao meu quadro com um único clique, sem precisar preencher formulários adicionais.
- **US06:** Como usuário, quero poder "Ignorar" ou "Descartar" uma recomendação irrelevante, com a garantia de que a IA nunca mais a sugerirá no futuro.

## 4. Critérios de Aceite (Acceptance Criteria)

### Escopo e Economia de Contexto
- [ ] A chamada para a IA deve enviar estritamente os tópicos e os descartes do domínio acionado, isolando o contexto.

### Tratamento de Rejeições (Blacklist)
- [ ] Ao clicar em "Ignorar" em um card de recomendação, um registro deve ser criado em `IgnoredRecommendation`.
- [ ] A IA deve ser instruída no prompt a não recomendar nenhum dos itens presentes na blacklist enviada.

### UX de Latência e Aborto
- [ ] O clique na varinha mágica abre imediatamente o Modal, apresentando o esqueleto de carregamento.
- [ ] Um clique no overlay ou no "X" fecha o Modal e não gera alterações de estado.

### Hierarquia Visual (Regra dos 3)
- [ ] O JSON de resposta da IA deve garantir o ranqueamento por ordem de relevância.
- [ ] A UI deve renderizar os índices `0`, `1` e `2` (Top 3) com estilo visual premium (tamanho maior, borda distinta indicando "Highly Recommended").
- [ ] Os índices `3` ao `9` (até o limite de 10) devem ser renderizados de forma limpa como uma lista de itens menores.

### Fricção Zero na Conversão
- [ ] Quando um tópico recomendado é aceito ("Add"), ele deve ser registrado na tabela `Topic` com o status padrão **TO_LEARN** e visibilidade **PRIVATE**.
- [ ] A inserção no banco não deve recarregar a página, devendo atualizar o Kanban via refetch silencioso ou otimista.
