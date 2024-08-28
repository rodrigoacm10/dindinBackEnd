# Projeto Integrador 

Projeto desenvolvido para a empresa Recicont

Descrição: 
Possui a opção para categorizar as fontes das receitas e a destinação dos gastos. Despesa: Nome, descrição, valor, data, categoria: alimentação, plano de saúde, etc. Receita: Idem, fonte.

## Pré-requisitos:
- NodeJS
- MySQL

## Sumário

- [Usuários](#user)
    - [Criar Usuário](#create_user)
    - [Login](#login)
    - [Obter Usuário](#get_user)
    - [Atualizar Usuário](#update_user)
    - [Deletar Usuário](#delete_user)



<h2 id="user">Usuários</h2>

<h2 id="create_user">Criar Usuário</h2>

Rota utilizada para criar um novo usuário no sistema.

POST /usuario

### Parâmetros da Solicitação
| Parâmetro       | Tipo   | Descrição            |
|-----------------|--------|----------------------|
| nome            | string | Nome do usuário      |
| email           | string | Endereço de e-mail do usuário |
| senha           | string | Senha do usuário     |
| nivel_acesso | string | Nivel de acesso do usuário (normal ou admin) | 
| categoria_conta | string | Categoria da conta do usuário (cpf ou cnpj) | 
| <s> cpf_cpnj | <s>string | <s>Número do CPF ou CNPJ (cpf ou cnpj) </s> | 



### Corpo da Solicitação Exemplo

```json
Content-Type: application/json
{ 
    "nome": "exemplo",
    "email": "exemplo@gmail.com",
    "senha": "123456",
    "categoria_conta": "cpf",
    "nivel_acesso": "normal",
    "cpf": "12345678901"
}
```

<h2 id="login">Login</h2>

Rota utilizada para fazer login no sistema.

POST /login

### Parâmetros da Solicitação
| Parâmetro       | Tipo   | Descrição            |
|-----------------|--------|----------------------|
| email           | string | Endereço de e-mail do usuário |
| senha           | string | Senha do usuário     |

### Corpo da Solicitação Exemplo

```json
Content-Type: application/json
{ 
    "email": "exemplo@gmail.com",
    "senha": "123456",
}
```

<h2 id="get_user">Obter Usuário</h2>

Rota utilizada para obter dados do usuário logado no sistema.

GET /usuario

### Parâmetros da Solicitação
| Parâmetro       | Tipo   | Descrição            |
|-----------------|--------|----------------------|
| Token           | string | Token de autenticação |


### Corpo da Solicitação

```
Content-Type: application/json
Token: #token do usuario aqui
```
<h2 id="update_user">Atualizar Usuário</h2>

Rota utilizada para atualizar um usuário no sistema.

PUT /usuario

### Parâmetros da Solicitação
| Parâmetro       | Tipo   | Descrição            |
|-----------------|--------|----------------------|
| Token           | string | Token de autenticação |

(Atributo que deseja alterar do usuario, ex: nome, senha, etc)


### Corpo da Solicitação

```
Content-Type: application/json
Token: #token do usuario aqui
{
  "nome": "teste",
}

```

<h2 id="delete_user">Deletar Usuário</h2>

Rota utilizada para deletar um usuário no sistema.

DELETE /usuario

### Parâmetros da Solicitação
| Parâmetro       | Tipo   | Descrição            |
|-----------------|--------|----------------------|
| Token           | string | Token de autenticação |


### Corpo da Solicitação

```
Content-Type: application/json
Token: #token do usuario aqui
```