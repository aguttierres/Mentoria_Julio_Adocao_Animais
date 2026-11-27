## feat: API REST e site de adoção de animais

### Resumo
Este PR adiciona a aplicação completa de adoção de animais. ONGs cadastram animais, e os interessados filtram por **porte, idade e cidade** e enviam pedidos de adoção.

### O que foi feito
- **API REST** (Express + Mongoose) sobre **mongodb-memory-server** (banco em memória)
  - `POST /api/auth/cadastro`, `POST /api/auth/login` (JWT), `GET /api/auth/me`
  - `GET /api/animais` com filtros `porte`, `idadeMin`, `idadeMax`, `cidade`, `especie`; `GET /api/animais/{id}`; `POST /api/animais` (ONG)
  - `POST /api/pedidos` (adotante), `GET /api/pedidos`, `PATCH /api/pedidos/{id}` (ONG aprova/recusa)
- **Swagger**: `docs/swagger.yaml` (OpenAPI 3.0.3), com a UI em `/api-docs` e o YAML bruto em `/api-docs/swagger.yaml`
- **Site** (HTML/CSS/JS puro): login, cadastro, seleção de animais com filtros e finalização do pedido, além de "Meus pedidos" e telas da ONG
- **Dados de teste**: 3 usuários (1 ONG e 2 adotantes, senha `123456`), 3 animais e 1 pedido pendente do João para demonstrar a regra 3
- **README** com descrição, instalação, execução, dados de teste, regras de negócio e URLs

### Regras de negócio
1. Selecionar animais exige login (`401` sem token)
2. Login exige cadastro prévio (`404` para e-mail não cadastrado)
3. Só é possível enviar um pedido sem outro pendente (`409`)

### Como testar
```bash
npm install && npm start
```
1. Abra http://localhost:3000 e entre com `maria@email.com` / `123456`
2. Filtre os animais (ex.: porte Médio, cidade São Paulo), clique em **Quero adotar** e envie o pedido
3. Tente enviar outro pedido: a aplicação bloqueia (regra 3). Entrar com `joao@email.com` também mostra o bloqueio
4. Entre como `ong@patasamigas.org` para aprovar ou recusar pedidos e cadastrar animais
5. Explore a API em http://localhost:3000/api-docs

### Fora do escopo
- Testes automatizados (não solicitados)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01RLbAaGtT3MvoYHhHBSgycK
