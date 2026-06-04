package br.com.a3.projectmanager.service;

import java.util.Optional;

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
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.a3.projectmanager.dto.SalvarUsuarioRequest;
import br.com.a3.projectmanager.dto.UsuarioDTO;
import br.com.a3.projectmanager.exception.BusinessRuleException;
import br.com.a3.projectmanager.exception.RecursoNaoEncontradoException;
import br.com.a3.projectmanager.model.Perfil;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(usuarioRepository, passwordEncoder);
    }

    @Test
    void criarUsuario_QuandoDadosValidos() {
        
        SalvarUsuarioRequest request = new SalvarUsuarioRequest();
        request.setNome("Usuário Teste");
        request.setCpf("12345678909");
        request.setEmail("teste@teste.com");
        request.setCargo("Desenvolvedor");
        request.setLogin("teste");
        request.setSenha("teste123");
        request.setPerfil(Perfil.COLABORADOR);

        when(usuarioRepository.existsByCpf(request.getCpf())).thenReturn(false);
        when(usuarioRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(usuarioRepository.existsByLogin(request.getLogin())).thenReturn(false);
        when(passwordEncoder.encode(request.getSenha())).thenReturn("encodedPassword");

        Usuario usuario = new Usuario(1L, request.getNome(), request.getCpf(), request.getEmail(),
                request.getCargo(), request.getLogin(), "encodedPassword", request.getPerfil());
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioDTO result = usuarioService.criar(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Usuário Teste", result.getNome());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void criarUsuario_QuandoCpfJaExiste() {
        
        SalvarUsuarioRequest request = new SalvarUsuarioRequest();
        request.setCpf("12345678909");
        when(usuarioRepository.existsByCpf(request.getCpf())).thenReturn(true);

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> usuarioService.criar(request));
        assertEquals("CPF já cadastrado no sistema.", exception.getMessage());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void criarUsuario_QuandoCpfInvalido() {
       
        SalvarUsuarioRequest request = new SalvarUsuarioRequest();
        request.setCpf("123");
        request.setEmail("test@test.com");
        request.setLogin("testuser");

        when(usuarioRepository.existsByCpf(request.getCpf())).thenReturn(false);
        when(usuarioRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(usuarioRepository.existsByLogin(request.getLogin())).thenReturn(false);

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> usuarioService.criar(request));
        assertEquals("CPF deve conter 11 dígitos numéricos.", exception.getMessage());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void localizarPorId_QuandoUsuarioNaoExiste() {
        
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        RecursoNaoEncontradoException exception = assertThrows(RecursoNaoEncontradoException.class, () -> usuarioService.localizarPorId(99L));
        assertEquals("Usuário não encontrado com o ID: 99", exception.getMessage());
    }
}
