# 🐾 Adote um Amigo: API REST e site de adoção de animais

## O que é esta aplicação

É uma API REST com um site web para **adoção de animais**. ONGs cadastram animais. Quem quer adotar se cadastra, faz login, filtra os animais por **porte, idade e cidade** e envia um **pedido de adoção**. A ONG então aprova ou recusa o pedido.

A aplicação tem quatro funcionalidades principais:

| Funcionalidade | Site | API |
| --- | --- | --- |
| Cadastro | `/cadastro.html` | `POST /api/auth/cadastro` |
| Login | `/index.html` | `POST /api/auth/login` |
| Seleção de animais | `/animais.html` | `GET /api/animais`, `GET /api/animais/{id}` |
| Finalização do pedido de adoção | `/pedido.html` | `POST /api/pedidos` |

Também há rotas de apoio. Pelo site ou pela API, a ONG cadastra animais (`POST /api/animais`) e responde aos pedidos (`PATCH /api/pedidos/{id}`). Qualquer usuário logado lista seus pedidos (`GET /api/pedidos`).

**Tecnologias:** Node.js, Express, Mongoose, [mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server) (banco MongoDB em memória), JWT, bcryptjs, Swagger UI e HTML/CSS/JS puro no front-end.

> Os dados ficam só em memória. Ao reiniciar o servidor, o banco é recriado do zero com os dados de teste.

## Como instalar

Pré-requisitos: **Node.js 18+** e npm.

```bash
git clone <url-do-repositorio>
cd adocao-animais
npm install
```

Na primeira execução, o `mongodb-memory-server` baixa automaticamente um binário do MongoDB (cerca de 100 MB) e o guarda em cache. Por isso o primeiro start pode demorar um pouco e precisa de internet.

## Como executar

```bash
npm start          # inicia em http://localhost:3000
npm run dev        # modo desenvolvimento (reinicia ao salvar arquivos)
```

Variáveis de ambiente opcionais:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP |
| `JWT_SECRET` | `segredo-dev-adocao` | Segredo de assinatura dos tokens (troque fora do ambiente de desenvolvimento) |

## Quais dados de teste estão incluídos

São criados automaticamente a cada inicialização.

**Usuários** (todos com a senha `123456`):

| Nome | E-mail | Tipo | Cidade | Observação |
| --- | --- | --- | --- | --- |
| ONG Patas Amigas | `ong@patasamigas.org` | ONG | São Paulo | Responsável pelos 3 animais |
| Maria Silva | `maria@email.com` | Adotante | São Paulo | Sem pedidos: pode enviar um pedido |
| João Souza | `joao@email.com` | Adotante | Rio de Janeiro | Já tem um pedido **pendente** para a Mia (demonstra a regra 3) |

**Animais:**

| Nome | Espécie | Porte | Idade | Cidade |
| --- | --- | --- | --- | --- |
| Rex | Cachorro | Grande | 5 anos | São Paulo |
| Mia | Gato | Pequeno | 2 anos | Rio de Janeiro |
| Thor | Cachorro | Médio | 1 ano | São Paulo |

## Quais são as regras de negócio

1. **Só seleciona animais quem está logado.** Todas as rotas `/api/animais` exigem o cabeçalho `Authorization: Bearer <token>`; sem ele, a resposta é `401`. No site, as páginas de animais e de pedido redirecionam para o login.
2. **Para estar logado, é preciso ter cadastro.** O login com um e-mail não cadastrado retorna `404` com a mensagem *"Usuário não cadastrado"*. E-mails são únicos (cadastro duplicado retorna `409`).
3. **Só envia pedido quem não tem outro pendente.** `POST /api/pedidos` retorna `409` se o usuário já tiver um pedido com status `pendente`. Ele volta a poder pedir quando a ONG aprovar ou recusar o pedido atual.

Regras complementares:

- Apenas usuários do tipo **ONG** cadastram animais e respondem pedidos. Apenas **adotantes** enviam pedidos (caso contrário, `403`).
- Só é possível pedir animais com status `disponivel` (caso contrário, `422`). A listagem mostra apenas animais disponíveis.
- Quando a ONG aprova um pedido, o animal passa a `adotado` e os outros pedidos pendentes para ele são recusados automaticamente.

### Filtros da seleção de animais

`GET /api/animais?porte=medio&idadeMin=0&idadeMax=3&cidade=São Paulo`

- `porte`: `pequeno`, `medio` ou `grande`
- `idadeMin` / `idadeMax`: idade em anos (intervalo inclusivo)
- `cidade`: nome exato da cidade, sem diferenciar maiúsculas de minúsculas
- `especie` (opcional): `cachorro`, `gato` ou `outro`

## Quais são as URLs importantes para acessar a aplicação

| URL | O que é |
| --- | --- |
| http://localhost:3000 | Site (login) |
| http://localhost:3000/cadastro.html | Cadastro |
| http://localhost:3000/animais.html | Seleção de animais (requer login) |
| http://localhost:3000/pedido.html | Finalização do pedido e "Meus pedidos" (requer login) |
| http://localhost:3000/api | Base da API REST (lista as rotas disponíveis) |
| http://localhost:3000/api/health | Verificação de saúde |
| http://localhost:3000/api-docs | Documentação Swagger renderizada |
| http://localhost:3000/api-docs/swagger.yaml | Arquivo YAML da especificação |

### Exemplo rápido com curl

```bash
# login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"123456"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# animais de porte médio em São Paulo
curl -s "http://localhost:3000/api/animais?porte=medio&cidade=S%C3%A3o%20Paulo" -H "Authorization: Bearer $TOKEN"

# pedido de adoção (troque <ID_DO_ANIMAL>)
curl -s -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"animalId":"<ID_DO_ANIMAL>","mensagem":"Tenho quintal e tempo para passear."}'
```

## Imagens

O site usa ilustrações próprias em SVG, guardadas em `public/img/`:

- `fundo.svg`: padrão de fundo com patinhas e carinhas de gatos e cachorros
- `rex.svg`, `mia.svg` e `thor.svg`: imagens dos animais de teste
- `cachorro.svg`, `gato.svg` e `outro.svg`: imagens padrão, usadas quando um animal não tem foto ou quando o link da foto falha

Para usar fotos reais, faça uma destas duas coisas:

- Coloque as fotos em `public/img/` e ajuste o campo `fotoUrl` em `src/seed.js` (por exemplo, `/img/rex.jpg`).
- Ao cadastrar um animal como ONG, informe a URL de uma foto no campo **URL da foto**.

## Testes automatizados

Os testes cobrem as condições de teste da US01 (documento na Wiki), uma por regra de negócio:

| ID | Condição de teste | API (Mocha + Chai + Supertest) | Web (Cypress) |
| --- | --- | --- | --- |
| CT-01 | Listar animais sem estar autenticado | `test/api/condicoes-us01.test.js` | `cypress/e2e/condicoes-us01.cy.js` |
| CT-02 | Tentar fazer login sem o e-mail estar cadastrado | `test/api/condicoes-us01.test.js` | `cypress/e2e/condicoes-us01.cy.js` |
| CT-03 | Fazer um segundo pedido de adoção tendo um outro pendente | `test/api/condicoes-us01.test.js` | `cypress/e2e/condicoes-us01.cy.js` |

O CT-03 cadastra um adotante novo a cada execução, então os testes podem rodar várias vezes sem reiniciar o servidor.

```bash
npm install          # instala também Mocha, Chai, Supertest e Cypress
npm test             # sobe a aplicação, roda os testes de API e os do Cypress e encerra
```

Para rodar separadamente, deixe a aplicação no ar com `npm start` e, em outro terminal:

```bash
npm run test:api     # testes de API
npm run cy:open      # abre a interface do Cypress
npm run cy:run       # roda o Cypress sem interface
```

## Estrutura do projeto

```
├── docs/swagger.yaml        # Especificação OpenAPI 3
├── public/                  # Site (HTML, CSS e JS)
│   ├── index.html           # Login
│   ├── cadastro.html        # Cadastro
│   ├── animais.html         # Seleção de animais (+ cadastro de animal pela ONG)
│   ├── pedido.html          # Finalização do pedido / pedidos
│   ├── img/                 # Ilustrações (fundo e animais)
│   ├── app.js
│   └── style.css
├── test/api/                # Testes de API (Mocha + Chai + Supertest)
├── cypress/                 # Testes web (Cypress)
├── cypress.config.js
└── src/
    ├── server.js            # Inicia banco em memória, seed e servidor HTTP
    ├── app.js               # Configuração do Express e rotas
    ├── seed.js              # Dados de teste
    ├── config/database.js   # mongodb-memory-server + mongoose
    ├── middleware/          # Autenticação JWT e tratamento de async
    ├── models/              # Usuario, Animal, Pedido
    └── routes/              # auth, animais, pedidos
```
