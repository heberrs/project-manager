package br.com.a3.projectmanager.service;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.a3.projectmanager.dto.SalvarTarefaRequest;
import br.com.a3.projectmanager.dto.TarefaDTO;
import br.com.a3.projectmanager.exception.BusinessRuleException;
import br.com.a3.projectmanager.model.Equipe;
import br.com.a3.projectmanager.model.Perfil;
import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusProjeto;
import br.com.a3.projectmanager.model.StatusTarefa;
import br.com.a3.projectmanager.model.Tarefa;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.EquipeRepository;
import br.com.a3.projectmanager.repository.TarefaRepository;

@ExtendWith(MockitoExtension.class)
class TarefaServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private ProjetoService projetoService;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private EquipeRepository equipeRepository;

    private TarefaService tarefaService;

    @BeforeEach
    void setUp() {
        tarefaService = new TarefaService(tarefaRepository, projetoService, usuarioService, equipeRepository);
    }

    @Test
    void criarTarefa_QuandoResponsavelEstaAlocadoNoProjeto() {
        
        SalvarTarefaRequest request = new SalvarTarefaRequest();
        request.setTitulo("Tarefa 1");
        request.setDescricao("faça a tarefa 1");
        request.setPrazo(LocalDate.now().plusDays(5));
        request.setProjetoId(1L);
        request.setResponsavelId(2L);

        Projeto projeto = new Projeto(1L, "Projeto X", "Escopo do projeto X", LocalDate.now(), LocalDate.now().plusDays(10), StatusProjeto.PLANEJADO, null);
        when(projetoService.recuperarProjeto(1L)).thenReturn(projeto);

        Usuario responsavel = new Usuario(2L, "Colaborador", "22222222222", "colaborador@test.com", "Dev", "colab", "senha", Perfil.COLABORADOR);
        when(usuarioService.recuperarUsuario(2L)).thenReturn(responsavel);

        Equipe equipe = new Equipe(1L, "Team Alpha", "Description");
        equipe.adicionarMembro(responsavel);
        equipe.adicionarProjeto(projeto);

        when(equipeRepository.findByProjetosId(1L)).thenReturn(Collections.singletonList(equipe));

        Tarefa expected = new Tarefa(1L, "Tarefa 1", "faça a tarefa 1", request.getPrazo(), StatusTarefa.A_INICIAR, responsavel, projeto);
        when(tarefaRepository.save(any(Tarefa.class))).thenReturn(expected);


        TarefaDTO result = tarefaService.criar(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Tarefa 1", result.getTitulo());
        assertEquals("Colaborador", result.getResponsavel().getNome());
        verify(tarefaRepository, times(1)).save(any(Tarefa.class));
    }

    @Test
    void criarTarefa_QuandoResponsavelNaoEstaAlocadoNoProjeto() {
        
        SalvarTarefaRequest request = new SalvarTarefaRequest();
        request.setTitulo("Tarefa 1");
        request.setProjetoId(1L);
        request.setResponsavelId(2L);

        Projeto projeto = new Projeto(1L, "Projeto X", "Escopo do projeto X", LocalDate.now(), LocalDate.now().plusDays(10), StatusProjeto.PLANEJADO, null);
        when(projetoService.recuperarProjeto(1L)).thenReturn(projeto);

        Usuario responsavel = new Usuario(2L, "Colaborador", "22222222222", "colaborador@test.com", "Dev", "colab", "senha", Perfil.COLABORADOR);
        when(usuarioService.recuperarUsuario(2L)).thenReturn(responsavel);

        Equipe equipe = new Equipe(1L, "Team Alpha", "Description");
        
        when(equipeRepository.findByProjetosId(1L)).thenReturn(Collections.singletonList(equipe));

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> tarefaService.criar(request));
        assertTrue(exception.getMessage().contains("deve ser membro de uma equipe alocada no projeto"));
        verify(tarefaRepository, never()).save(any(Tarefa.class));
    }
}
