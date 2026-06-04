# Gerenciador de Projetos e Equipes

Este repositório contém uma solução completa (Monorepo/Multirepo) para Gestão de Projetos, Equipes e Tarefas, contendo um backend em Spring Boot (Java) e um frontend moderno com Next.js (TypeScript), Tailwind CSS e suporte a PWA (instalável em dispositivos móveis).

---

## 📂 Estrutura do Repositório

- **[backend/](file:///home/heber/projetos/project-manager/backend)**: API REST desenvolvida em Java 21 utilizando o framework Spring Boot.
- **[frontend/](file:///home/heber/projetos/project-manager/frontend)**: Aplicação web interativa desenvolvida com Next.js 15, Tailwind CSS e PWA.

---

## 🔑 Credenciais e Perfis de Acesso (Demonstração)

Para acessar o painel do frontend (`http://localhost:3000`), utilize um dos usuários abaixo de acordo com o nível de acesso desejado:

| Perfil | Usuário (Login) | Senha | Nome Completo / Função |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin` | System Admin (Acesso completo, CRUD de usuários) |
| **Gerente** | `gerente` | `senha123` | Diego Martins Moreira (Gerente de Projetos) |
| **Colaborador** | `heber` | `senha123` | Heber (Desenvolvedor Pleno) |
| **Colaborador** | `joao` | `senha123` | João (Desenvolvedor Pleno) |
| **Colaborador** | `lisi` | `senha123` | Lisiane (Analista de Software) |

---

## 🚀 Como Executar o Projeto

Para testar a aplicação completa, você precisará iniciar o backend e, em seguida, o frontend.

### 1. Executar o Backend
O backend gerencia as regras de negócio e utiliza um banco de dados em memória H2.

1. Navegue até a pasta do backend:

   ```bash
   cd backend
   ```

2. Execute a aplicação:

   ```bash
   ./mvnw spring-boot:run
   ```

   *(No Windows, utilize `mvnw.cmd spring-boot:run`)*

A API estará disponível em `http://localhost:8080`. Para detalhes do console de banco de dados, consulte o [README do Backend](file:///home/heber/projetos/project-manager/backend/README.md).

### 2. Executar o Frontend

O frontend fornece a interface do usuário e se integra com o backend.

1. Abra um novo terminal e navegue até a pasta do frontend:

   ```bash
   cd frontend
   ```

2. Instale as dependências (caso não estejam instaladas):

   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

A aplicação estará disponível no seu navegador em `http://localhost:3000`.

---

## 🧪 Como Executar os Testes no Backend

Para rodar os testes unitários e de integração do backend:

1. Vá até a pasta do backend:

   ```bash
   cd backend
   ```

2. Execute o comando Maven:

   ```bash
   ./mvnw test
   ```

---

## 📱 PWA (Progressive Web App)

O frontend foi desenvolvido com abordagem **Mobile-First** e suporte a **PWA**. Ele pode ser instalado diretamente na tela inicial do seu celular ou no seu computador:

1. Abra a aplicação em `http://localhost:3000`.
2. No navegador (ex: Chrome ou Safari), selecione a opção **"Instalar Aplicativo"** ou **"Adicionar à Tela de Início"**.
