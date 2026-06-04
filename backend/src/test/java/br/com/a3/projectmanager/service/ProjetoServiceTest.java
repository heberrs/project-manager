package br.com.a3.projectmanager.service;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

import br.com.a3.projectmanager.dto.ProjetoDTO;
import br.com.a3.projectmanager.dto.SalvarProjetoRequest;
import br.com.a3.projectmanager.exception.BusinessRuleException;
import br.com.a3.projectmanager.model.Perfil;
import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusProjeto;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.ProjetoRepository;

@ExtendWith(MockitoExtension.class)
class ProjetoServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private UsuarioService usuarioService;

    private ProjetoService projetoService;

    @BeforeEach
    void setUp() {
        projetoService = new ProjetoService(projetoRepository, usuarioService);
    }

    @Test
    void criarProjeto_QuandoDadosValidos() {
        
        SalvarProjetoRequest request = new SalvarProjetoRequest();
        request.setNome("Projeto X");
        request.setDescricao("Escopo do projeto X");
        request.setDataInicio(LocalDate.now());
        request.setDataTerminoPrevista(LocalDate.now().plusDays(10));
        request.setStatus(StatusProjeto.PLANEJADO);
        request.setGerenteId(1L);

        Usuario gerente = new Usuario(1L, "Gerente User", "11111111111", "gerente@test.com", "Gerente", "gerente", "senha", Perfil.GERENTE);
        when(usuarioService.recuperarUsuario(1L)).thenReturn(gerente);

        Projeto expected = new Projeto(1L, request.getNome(), request.getDescricao(), request.getDataInicio(),
                request.getDataTerminoPrevista(), request.getStatus(), gerente);
        when(projetoRepository.save(any(Projeto.class))).thenReturn(expected);
       
        ProjetoDTO result = projetoService.criar(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Projeto X", result.getNome());
        assertEquals("Gerente User", result.getGerente().getNome());
        verify(projetoRepository, times(1)).save(any(Projeto.class));
    }

    @Test
    void criarProjeto_QuandoGerenteNaoEhColaborador() {

        SalvarProjetoRequest request = new SalvarProjetoRequest();
        request.setNome("Projeto X");
        request.setDataInicio(LocalDate.now());
        request.setDataTerminoPrevista(LocalDate.now().plusDays(10));
        request.setGerenteId(1L);

        Usuario colaborador = new Usuario(1L, "Colab User", "11111111111", "colab@test.com", "Colab", "colab", "senha", Perfil.COLABORADOR);
        when(usuarioService.recuperarUsuario(1L)).thenReturn(colaborador);

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> projetoService.criar(request));
        assertEquals("Um colaborador não pode ser gerente de um projeto.", exception.getMessage());
        verify(projetoRepository, never()).save(any(Projeto.class));
    }

    @Test
    void criarProjeto_QuandoDataTerminoAnteriorDataInicio() {
        SalvarProjetoRequest request = new SalvarProjetoRequest();
        request.setNome("Projeto X");
        request.setDataInicio(LocalDate.now().plusDays(10));
        request.setDataTerminoPrevista(LocalDate.now());
        request.setGerenteId(1L);

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> projetoService.criar(request));
        assertEquals("A data de término prevista não pode ser anterior à data de início.", exception.getMessage());
        verify(projetoRepository, never()).save(any(Projeto.class));
    }
}
