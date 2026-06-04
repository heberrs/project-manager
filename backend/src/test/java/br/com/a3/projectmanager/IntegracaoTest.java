package br.com.a3.projectmanager;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.a3.projectmanager.dto.EquipeDTO;
import br.com.a3.projectmanager.dto.LoginRequest;
import br.com.a3.projectmanager.dto.ProjetoDTO;
import br.com.a3.projectmanager.dto.SalvarEquipeRequest;
import br.com.a3.projectmanager.dto.SalvarProjetoRequest;
import br.com.a3.projectmanager.dto.SalvarTarefaRequest;
import br.com.a3.projectmanager.dto.SalvarUsuarioRequest;
import br.com.a3.projectmanager.dto.TarefaDTO;
import br.com.a3.projectmanager.dto.UsuarioDTO;
import br.com.a3.projectmanager.model.Perfil;
import br.com.a3.projectmanager.model.StatusProjeto;
import br.com.a3.projectmanager.model.StatusTarefa;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class IntegracaoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void executaFluxoCompleto() throws Exception {
        // 1. Faz autenticação como Admin para obter token (poderia ser usado httpBasic diretamente nas requisições subsequentes, mas vamos testar o endpoint de login também)
        LoginRequest loginRequest = new LoginRequest("admin", "admin");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.perfil").value("ADMINISTRADOR"))
                .andReturn();

        // 2. Registra um novo usuário colaborador (Authorized as Admin)
        SalvarUsuarioRequest usuarioRequest = new SalvarUsuarioRequest();
        usuarioRequest.setNome("Novo colaborador");
        usuarioRequest.setCpf("98765432100");
        usuarioRequest.setEmail("novocolaborador@oracle.com");
        usuarioRequest.setCargo("Analista");
        usuarioRequest.setLogin("novocolaborador");
        usuarioRequest.setSenha("senha123");
        usuarioRequest.setPerfil(Perfil.COLABORADOR);

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usuarioRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Novo colaborador"))
                .andExpect(jsonPath("$.login").value("novocolaborador"))
                .andReturn();

        UsuarioDTO novoColaborador = objectMapper.readValue(regResult.getResponse().getContentAsString(), UsuarioDTO.class);

        // 3.Cria um projeto e aloca o gerente (ID 2, usuário 'gerente' do seed) como responsável. Authorized as Admin/Gerente. O projeto deve ser criado com sucesso e o gerente alocado corretamente.
        SalvarProjetoRequest projetoRequest = new SalvarProjetoRequest();
        projetoRequest.setNome("A3 Novo sistema  de Gestão de Projetos");
        projetoRequest.setDescricao("Sistema para gerenciar projetos, equipes e tarefas");
        projetoRequest.setDataInicio(LocalDate.now());
        projetoRequest.setDataTerminoPrevista(LocalDate.now().plusMonths(6));
        projetoRequest.setStatus(StatusProjeto.PLANEJADO);
        projetoRequest.setGerenteId(2L); // ID 2 is the seeded 'gerente' user

        MvcResult projResult = mockMvc.perform(post("/api/projetos")
                        .with(httpBasic("admin", "admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projetoRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("A3 Novo sistema  de Gestão de Projetos"))
                .andExpect(jsonPath("$.gerente.id").value(2L))
                .andReturn();

        ProjetoDTO project = objectMapper.readValue(projResult.getResponse().getContentAsString(), ProjetoDTO.class);

        // 4. Cria uma equipe, adiciona o colaborador registrado (novoColaborador) à equipe e aloca a equipe no projeto criado. Authorized as Admin/Gerente. A equipe deve ser criada, o colaborador adicionado e a alocação realizada com sucesso.
        SalvarEquipeRequest equipeRequest = new SalvarEquipeRequest();
        equipeRequest.setNome("Equipe A3");
        equipeRequest.setDescricao("Equipe responsável pelo desenvolvimento do sistema A3");

        MvcResult equipeResult = mockMvc.perform(post("/api/equipes")
                        .with(httpBasic("admin", "admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Equipe A3"))
                .andReturn();

        EquipeDTO equipe = objectMapper.readValue(equipeResult.getResponse().getContentAsString(), EquipeDTO.class);

        // 5. Adiciona novo colaborador à equipe
        mockMvc.perform(post("/api/equipes/" + equipe.getId() + "/membros/" + novoColaborador.getId())
                        .with(httpBasic("admin", "admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.membros[0].id").value(novoColaborador.getId()));

        // 6. Allocate the team to the project
        mockMvc.perform(post("/api/equipes/" + equipe.getId() + "/projetos/" + project.getId())
                        .with(httpBasic("admin", "admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projetos[0].id").value(project.getId()));

        // 7. Create a task in the project and assign it to the collaborator (who is on the allocated team)
        SalvarTarefaRequest tarefaRequest = new SalvarTarefaRequest();
        tarefaRequest.setTitulo("Modelagem Entidade-Relacionamento");
        tarefaRequest.setDescricao("Gerar modelo ER para o banco de dados do sistema A3");
        tarefaRequest.setPrazo(LocalDate.now().plusDays(15));
        tarefaRequest.setProjetoId(project.getId());
        tarefaRequest.setResponsavelId(novoColaborador.getId());
        tarefaRequest.setStatus(StatusTarefa.A_INICIAR);

        MvcResult tarefaResult = mockMvc.perform(post("/api/tarefas")
                        .with(httpBasic("gerente", "gerente")) // Manager can perform tasks creation
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tarefaRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Modelagem Entidade-Relacionamento"))
                .andExpect(jsonPath("$.responsavel.id").value(novoColaborador.getId()))
                .andReturn();

        TarefaDTO tarefa = objectMapper.readValue(tarefaResult.getResponse().getContentAsString(), TarefaDTO.class);

        // 8. Atualiza o status da tarefa para "CONCLUIDO" usando o usuário colaborador (que é o responsável pela tarefa). Authorized as Colaborador (responsável pela tarefa). O status deve ser atualizado com sucesso.
        mockMvc.perform(put("/api/tarefas/" + tarefa.getId() + "/status")
                        .with(httpBasic("novocolaborador", "senha123")) // usuário colaborador responsável pela tarefa
                        .param("status", "CONCLUIDO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDO"));

        // 9. Faz uma requisição para os relatórios de desempenho e ocupação usando o usuário gerente. Authorized as Gerente. Os relatórios devem refletir a tarefa concluída e a ocupação do colaborador.
        mockMvc.perform(get("/api/relatorios/desempenho")
                        .with(httpBasic("gerente", "gerente")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].percentualConcluido").value(100.0));

        mockMvc.perform(get("/api/relatorios/ocupacao")
                        .with(httpBasic("gerente", "gerente")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.colaboradorId == " + novoColaborador.getId() + ")].totalTarefasAtribuidas").value(1))
                .andExpect(jsonPath("$[?(@.colaboradorId == " + novoColaborador.getId() + ")].tarefasConcluidas").value(1));
    }
}
