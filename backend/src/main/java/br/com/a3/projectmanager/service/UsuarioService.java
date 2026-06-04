package br.com.a3.projectmanager.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.a3.projectmanager.dto.SalvarUsuarioRequest;
import br.com.a3.projectmanager.dto.UsuarioDTO;
import br.com.a3.projectmanager.exception.BusinessRuleException;
import br.com.a3.projectmanager.exception.RecursoNaoEncontradoException;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioDTO localizarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com o ID: " + id));
        return new UsuarioDTO(usuario);
    }

    @Transactional(readOnly = true)
    public Usuario recuperarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com o ID: " + id));
    }

    @Transactional
    public UsuarioDTO criar(SalvarUsuarioRequest request) {
        validarCamposUnicos(request.getCpf(), request.getEmail(), request.getLogin(), null);
        validarCpf(request.getCpf());

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setCpf(request.getCpf());
        usuario.setEmail(request.getEmail());
        usuario.setCargo(request.getCargo());
        usuario.setLogin(request.getLogin());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setPerfil(request.getPerfil());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return new UsuarioDTO(usuarioSalvo);
    }

    @Transactional
    public UsuarioDTO atualizar(Long id, SalvarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com o ID: " + id));

        validarCamposUnicos(request.getCpf(), request.getEmail(), request.getLogin(), id);
        validarCpf(request.getCpf());

        usuario.setNome(request.getNome());
        usuario.setCpf(request.getCpf());
        usuario.setEmail(request.getEmail());
        usuario.setCargo(request.getCargo());
        usuario.setLogin(request.getLogin());
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }
        usuario.setPerfil(request.getPerfil());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return new UsuarioDTO(usuarioSalvo);
    }

    @Transactional
    public void remover(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado com o ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private void validarCamposUnicos(String cpf, String email, String login, Long currentId) {
        if (currentId == null) {
            if (usuarioRepository.existsByCpf(cpf)) {
                throw new BusinessRuleException("CPF já cadastrado no sistema.");
            }
            if (usuarioRepository.existsByEmail(email)) {
                throw new BusinessRuleException("E-mail já cadastrado no sistema.");
            }
            if (usuarioRepository.existsByLogin(login)) {
                throw new BusinessRuleException("Login já cadastrado no sistema.");
            }
        } else {
            // Validação para atualização 
            Usuario current = usuarioRepository.findById(currentId)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

            if (!current.getCpf().equals(cpf) && usuarioRepository.existsByCpf(cpf)) {
                throw new BusinessRuleException("CPF já cadastrado no sistema.");
            }
            if (!current.getEmail().equals(email) && usuarioRepository.existsByEmail(email)) {
                throw new BusinessRuleException("E-mail já cadastrado no sistema.");
            }
            if (!current.getLogin().equals(login) && usuarioRepository.existsByLogin(login)) {
                throw new BusinessRuleException("Login já cadastrado no sistema.");
            }
        }
    }

    private void validarCpf(String cpf) {
        if (cpf == null) {
            throw new BusinessRuleException("CPF não pode ser nulo.");
        }
        //Remove caracteres não numéricos para validação
        String cleanCpf = cpf.replaceAll("\\D", "");
        if (cleanCpf.length() != 11) {
            throw new BusinessRuleException("CPF deve conter 11 dígitos numéricos.");
        }
       //Validação básica, evitar CPFs com todos os dígitos iguais (ex: 111.111.111-11)
        if (cleanCpf.matches("(\\d)\\1{10}")) {
            throw new BusinessRuleException("CPF inválido.");
        }
    }
}
