# Gerenciador de Projetos (Backend)

Este é o serviço de backend para a aplicação de Gerenciamento de Projetos, desenvolvido em Java utilizando o framework **Spring Boot**.

O backend fornece uma API REST para gerenciamento de usuários, equipes, projetos, tarefas e geração de relatórios de desempenho e ocupação.

---

## 🛠️ Tecnologias Utilizadas

- **Java 21**
- **Spring Boot 4.0.6**
  - **Spring WebMvc** (para criação de APIs REST)
  - **Spring Security** (autenticação e autorização)
  - **Spring Data JPA** (persistência de dados)
- **Flyway** (migrações de banco de dados)
- **H2 Database** (banco de dados em memória para desenvolvimento/testes)
- **Maven** (gerenciador de dependências e build)

---

## 📂 Estrutura de Pacotes

A estrutura principal do código-fonte está organizada da seguinte forma sob o diretório [src/main/java/br/com/a3/projectmanager](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager):

- **`config/`**: Configurações de segurança e detalhes de usuário para autenticação ([SecurityConfig](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/config/SecurityConfig.java) e [CustomUserDetailsService](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/config/CustomUserDetailsService.java)).
- **`controller/`**: Endpoints expostos pela API (ex: [ProjetoController](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/controller/ProjetoController.java), [TarefaController](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/controller/TarefaController.java), etc.).
- **`dto/`**: Objetos de transferência de dados (DTOs) para requisições e respostas.
- **`exception/`**: Tratamento global de erros e exceções personalizadas ([GlobalExceptionHandler](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/exception/GlobalExceptionHandler.java)).
- **`model/`**: Entidades JPA representadas no banco de dados (ex: [Projeto](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/model/Projeto.java), [Tarefa](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/model/Tarefa.java), etc.).
- **`service/`**: Regras de negócio da aplicação (ex: [ProjetoService](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/service/ProjetoService.java), [TarefaService](file:///home/heber/projetos/project-manager/backend/src/main/java/br/com/a3/projectmanager/service/TarefaService.java), etc.).

---

## ⚙️ Configurações e Banco de Dados (H2 Console)

O arquivo de propriedades principais da aplicação está localizado em [application.properties](file:///home/heber/projetos/project-manager/backend/src/main/resources/application.properties).

Por padrão, a aplicação utiliza o banco de dados em memória **H2**.

### Acessando o H2 Console:
1. Com a aplicação rodando (`http://localhost:8080`), abra o seu navegador e acesse:
   [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
2. Para se conectar e autenticar, utilize os seguintes dados de conexão (conforme configurado em [application.properties](file:///home/heber/projetos/project-manager/backend/src/main/resources/application.properties)):
   - **Saved Settings:** `Generic H2 (Embedded)`
   - **Setting Name:** `Generic H2 (Embedded)`
   - **Driver Class:** `org.h2.Driver`
   - **JDBC URL:** `jdbc:h2:mem:projectmanagerdb`
   - **User Name:** `sa`
   - **Password:** *(deixe em branco / vazio)*
3. Clique em **Connect** para entrar no console web e visualizar as tabelas do projeto.

---

## 🚀 Como Executar o Serviço

Para executar a aplicação backend localmente, siga os passos abaixo:

1. Certifique-se de ter o **Java 21** instalado em sua máquina.
2. Navegue até a pasta do backend no terminal:
   ```bash
   cd backend
   ```
3. Execute a aplicação utilizando o Maven Wrapper ([mvnw](file:///home/heber/projetos/project-manager/backend/mvnw)):
   ```bash
   ./mvnw spring-boot:run
   ```
   *(Caso utilize o Windows, use `mvnw.cmd spring-boot:run`)*

A API estará disponível por padrão em `http://localhost:8080`.

---

## 🧪 Como Executar os Testes

Para executar a suíte de testes automatizados do projeto:

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Execute o comando de testes utilizando o Maven Wrapper:
   ```bash
   ./mvnw test
   ```
   *(Caso utilize o Windows, use `mvnw.cmd test`)*
