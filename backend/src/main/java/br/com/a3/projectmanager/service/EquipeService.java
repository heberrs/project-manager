package br.com.a3.projectmanager.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.a3.projectmanager.dto.EquipeDTO;
import br.com.a3.projectmanager.dto.SalvarEquipeRequest;
import br.com.a3.projectmanager.exception.RecursoNaoEncontradoException;
import br.com.a3.projectmanager.model.Equipe;
import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.EquipeRepository;

@Service
public class EquipeService {

    private final EquipeRepository equipeRepository;
    private final UsuarioService usuarioService;
    private final ProjetoService projetoService;

    public EquipeService(EquipeRepository equipeRepository, UsuarioService usuarioService, ProjetoService projetoService) {
        this.equipeRepository = equipeRepository;
        this.usuarioService = usuarioService;
        this.projetoService = projetoService;
    }

    @Transactional(readOnly = true)
    public List<EquipeDTO> listarTodos() {
        return equipeRepository.findAll().stream()
                .map(EquipeDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipeDTO localizarPorId(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Equipe não encontrada com o ID: " + id));
        return new EquipeDTO(equipe);
    }

    @Transactional(readOnly = true)
    public Equipe recuperarEquipe(Long id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Equipe não encontrada com o ID: " + id));
    }

    @Transactional
    public EquipeDTO criar(SalvarEquipeRequest request) {
        Equipe equipe = new Equipe();
        equipe.setNome(request.getNome());
        equipe.setDescricao(request.getDescricao());
        Equipe equipeSalva = equipeRepository.save(equipe);
        return new EquipeDTO(equipeSalva);
    }

    @Transactional
    public EquipeDTO atualizar(Long id, SalvarEquipeRequest request) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Equipe não encontrada com o ID: " + id));

        equipe.setNome(request.getNome());
        equipe.setDescricao(request.getDescricao());

        Equipe equipeSalva = equipeRepository.save(equipe);
        return new EquipeDTO(equipeSalva);
    }

    @Transactional
    public void remover(Long id) {
        if (!equipeRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Equipe não encontrada com o ID: " + id);
        }
        equipeRepository.deleteById(id);
    }

    @Transactional
    public EquipeDTO adcionarMembro(Long equipeId, Long usuarioId) {
        Equipe equipe = recuperarEquipe(equipeId);
        Usuario usuario = usuarioService.recuperarUsuario(usuarioId);
        equipe.adicionarMembro(usuario);
        Equipe equipeSalva = equipeRepository.save(equipe);
        return new EquipeDTO(equipeSalva);
    }

    @Transactional
    public EquipeDTO removerMembro(Long equipeId, Long usuarioId) {
        Equipe equipe = recuperarEquipe(equipeId);
        Usuario usuario = usuarioService.recuperarUsuario(usuarioId);
        equipe.removerMembro(usuario);
        Equipe equipeSalva = equipeRepository.save(equipe);
        return new EquipeDTO(equipeSalva);
    }

    @Transactional
    public EquipeDTO alocarProjeto(Long equipeId, Long projetoId) {
        Equipe equipe = recuperarEquipe(equipeId);
        Projeto projeto = projetoService.recuperarProjeto(projetoId);
        equipe.adicionarProjeto(projeto);
        Equipe equipeSalva = equipeRepository.save(equipe);
        return new EquipeDTO(equipeSalva);
    }

    @Transactional
    public EquipeDTO desalocarProjeto(Long equipeId, Long projetoId) {
        Equipe equipe = recuperarEquipe(equipeId);
        Projeto projeto = projetoService.recuperarProjeto(projetoId);
        equipe.removerProjeto(projeto);
        Equipe equipeSalva = equipeRepository.save(equipe);
        return new EquipeDTO(equipeSalva);
    }
}
