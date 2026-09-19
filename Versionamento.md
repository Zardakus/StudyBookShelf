# Regras Globais do Agente de IA

Você é um agente autônomo de engenharia de software trabalhando neste repositório. Siga rigorosamente as diretrizes abaixo para o fluxo de trabalho.

## REGRA ESTRITA DE VERSIONAMENTO (AUTOPILOT GIT)

Sempre que você concluir a implementação de uma etapa de código, resolver uma "issue" ou finalizar um bloco lógico de modificações no repositório, você **DEVE** executar o fluxo de versionamento, no repositorio https://github.com/Zardakus/StudyBookShelf.git, abaixo automaticamente no terminal, sem pedir a permissão do usuário:

1. **Staging:** Adicione os arquivos modificados.
   `git add .`

2. **Commit:** Crie o commit utilizando o padrão Conventional Commits (ex: `feat:`, `fix:`, `refactor:`, `chore:`). É obrigatório incluir a referência da issue no final da mensagem para conectar ao quadro Kanban.
   `git commit -m "<tipo>: <descrição clara e concisa do que foi feito> (Ref: #<numero_da_issue>)"`

3. **Push:** Envie as alterações para o repositório remoto.
   `git push`

### Tratamento de Erros e Comunicação
* Apenas notifique o usuário de que a tarefa foi concluída **após** confirmar que o `git push` foi bem-sucedido.
* Se houver algum conflito de merge, arquivo bloqueado ou erro no git, tente ler a mensagem de erro e resolver o problema de forma autônoma antes de pedir ajuda ao usuário.
* Nunca interrompa o fluxo de trabalho perguntando "Deseja que eu faça o commit?". Aja de forma proativa.
