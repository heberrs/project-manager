package br.com.a3.projectmanager.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.a3.projectmanager.dto.SalvarTarefaRequest;
import br.com.a3.projectmanager.dto.TarefaDTO;
import br.com.a3.projectmanager.exception.BusinessRuleException;
import br.com.a3.projectmanager.exception.RecursoNaoEncontradoException;
import br.com.a3.projectmanager.model.Equipe;
import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusTarefa;
import br.com.a3.projectmanager.model.Tarefa;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.EquipeRepository;
import br.com.a3.projectmanager.repository.TarefaRepository;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final ProjetoService projetoService;
    private final UsuarioService usuarioService;
    private final EquipeRepository equipeRepository;

    public TarefaService(TarefaRepository tarefaRepository, ProjetoService projetoService, UsuarioService usuarioService, EquipeRepository equipeRepository) {
        this.tarefaRepository = tarefaRepository;
        this.projetoService = projetoService;
        this.usuarioService = usuarioService;
        this.equipeRepository = equipeRepository;
    }

    @Transactional(readOnly = true)
    public List<TarefaDTO> listarTodos() {
        return tarefaRepository.findAll().stream()
                .map(TarefaDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TarefaDTO localizarPorId(Long id) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada com o ID: " + id));
        return new TarefaDTO(tarefa);
    }

    @Transactional(readOnly = true)
    public List<TarefaDTO> localizarPorProjetoId(Long projetoId) {
        return tarefaRepository.findByProjetoId(projetoId).stream()
                .map(TarefaDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TarefaDTO criar(SalvarTarefaRequest request) {
        Projeto projeto = projetoService.recuperarProjeto(request.getProjetoId());
        Usuario responsavel = null;

        if (request.getResponsavelId() != null) {
            responsavel = usuarioService.recuperarUsuario(request.getResponsavelId());
            validarResponsavelAlocado(projeto.getId(), responsavel);
        }

        Tarefa tarefa = new Tarefa();
        tarefa.setTitulo(request.getTitulo());
        tarefa.setDescricao(request.getDescricao());
        tarefa.setPrazo(request.getPrazo());
        tarefa.setStatus(request.getStatus() != null ? request.getStatus() : StatusTarefa.A_INICIAR);
        tarefa.setProjeto(projeto);
        tarefa.setResponsavel(responsavel);

        Tarefa tarefaSalva = tarefaRepository.save(tarefa);
        return new TarefaDTO(tarefaSalva);
    }

    @Transactional
    public TarefaDTO atualizar(Long id, SalvarTarefaRequest request) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada com o ID: " + id));

        Projeto projeto = projetoService.recuperarProjeto(request.getProjetoId());
        Usuario responsavel = null;

        if (request.getResponsavelId() != null) {
            responsavel = usuarioService.recuperarUsuario(request.getResponsavelId());
            validarResponsavelAlocado(projeto.getId(), responsavel);
        }

        tarefa.setTitulo(request.getTitulo());
        tarefa.setDescricao(request.getDescricao());
        tarefa.setPrazo(request.getPrazo());
        if (request.getStatus() != null) {
            tarefa.setStatus(request.getStatus());
        }
        tarefa.setProjeto(projeto);
        tarefa.setResponsavel(responsavel);

        Tarefa tarefaSalva = tarefaRepository.save(tarefa);
        return new TarefaDTO(tarefaSalva);
    }

    @Transactional
    public void remover(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Tarefa não encontrada com o ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    @Transactional
    public TarefaDTO atualizarStatus(Long id, StatusTarefa status) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada com o ID: " + id));
        tarefa.setStatus(status);
        Tarefa tarefaSalva = tarefaRepository.save(tarefa);
        return new TarefaDTO(tarefaSalva);
    }

    @Transactional
    public TarefaDTO atribuirResponsavel(Long id, Long responsavelId) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada com o ID: " + id));

        Usuario responsavel = usuarioService.recuperarUsuario(responsavelId);
        validarResponsavelAlocado(tarefa.getProjeto().getId(), responsavel);

        tarefa.setResponsavel(responsavel);
        Tarefa tarefaSalva = tarefaRepository.save(tarefa);
        return new TarefaDTO(tarefaSalva);
    }

    private void validarResponsavelAlocado(Long projetoId, Usuario responsavel) {
        List<Equipe> equipes = equipeRepository.findByProjetosId(projetoId);
        
        boolean isMember = equipes.stream()
                .anyMatch(equipe -> equipe.getMembros().contains(responsavel));

        if (!isMember) {
            throw new BusinessRuleException("O usuário responsável " + responsavel.getNome() + 
                    " deve ser membro de uma equipe alocada no projeto de ID " + projetoId + ".");
        }
    }
}
