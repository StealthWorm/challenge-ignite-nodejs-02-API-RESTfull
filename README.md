02-api-rest-nodejs

Requisitos Funcionais(RF)
  [x] Deve ser possível criar um usuário;
  [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta
  [x] Deve ser possível listar todas as refeições de um usuário;
  [x] Deve ser possível visualizar uma única refeição;
  [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima;
  [x] Deve ser possível apagar uma refeição;
  [x] Deve ser possível recuperar as métricas de um usuário
    - Quantidade total de refeições registradas
    - Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência por dia de refeições dentro da dieta
Regras de Negócios(RN)
  [x] Deve ser possível identificar o usuário entre as requisições;
  [x] As refeições devem ser relacionadas a um usuário;
  [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou;
Regras Não Funcionais(RNF)
  <!-- [] Será criado ao longo da aplicação; -->
