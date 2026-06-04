package br.com.a3.projectmanager.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.a3.projectmanager.dto.ProjetoDTO;
import br.com.a3.projectmanager.dto.SalvarProjetoRequest;
import br.com.a3.projectmanager.exception.BusinessRuleException;
import br.com.a3.projectmanager.exception.RecursoNaoEncontradoException;
import br.com.a3.projectmanager.model.Perfil;
import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusProjeto;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.ProjetoRepository;

@Service
public class ProjetoService {

    private final ProjetoRepository projetoRepository;
    private final UsuarioService usuarioService;

    public ProjetoService(ProjetoRepository projetoRepository, UsuarioService usuarioService) {
        this.projetoRepository = projetoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<ProjetoDTO> listarTodos() {
        return projetoRepository.findAll().stream()
                .map(ProjetoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjetoDTO localizarPorId(Long id) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado com o ID: " + id));
        return new ProjetoDTO(projeto);
    }

    @Transactional(readOnly = true)
    public Projeto recuperarProjeto(Long id) {
        return projetoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado com o ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<ProjetoDTO> filtrarPorGerenteIdStatusProjeto(Long gerenteId, StatusProjeto status) {
        if (gerenteId != null && status != null) {
            return projetoRepository.findByGerenteIdAndStatus(gerenteId, status).stream()
                    .map(ProjetoDTO::new)
                    .collect(Collectors.toList());
        } else if (gerenteId != null) {
            return projetoRepository.findByGerenteId(gerenteId).stream()
                    .map(ProjetoDTO::new)
                    .collect(Collectors.toList());
        } else if (status != null) {
            return projetoRepository.findByStatus(status).stream()
                    .map(ProjetoDTO::new)
                    .collect(Collectors.toList());
        }
        return listarTodos();
    }

    @Transactional
    public ProjetoDTO criar(SalvarProjetoRequest request) {
        validateDates(request);
        Usuario gerente = usuarioService.recuperarUsuario(request.getGerenteId());
        
        // Regra: Apenas gerentes ou administradores podem criar projetos
        if (gerente.getPerfil() == Perfil.COLABORADOR) {
            throw new BusinessRuleException("Um colaborador não pode ser gerente de um projeto.");
        }

        Projeto projeto = new Projeto();
        projeto.setNome(request.getNome());
        projeto.setDescricao(request.getDescricao());
        projeto.setDataInicio(request.getDataInicio());
        projeto.setDataTerminoPrevista(request.getDataTerminoPrevista());
        projeto.setStatus(request.getStatus() != null ? request.getStatus() : StatusProjeto.PLANEJADO);
        projeto.setGerente(gerente);

        Projeto projetoSalvo = projetoRepository.save(projeto);
        return new ProjetoDTO(projetoSalvo);
    }

    @Transactional
    public ProjetoDTO atualizar(Long id, SalvarProjetoRequest request) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Projeto não encontrado com o ID: " + id));

        validateDates(request);
        Usuario gerente = usuarioService.recuperarUsuario(request.getGerenteId());

        if (gerente.getPerfil() == Perfil.COLABORADOR) {
            throw new BusinessRuleException("Um colaborador não pode ser gerente de um projeto.");
        }

        projeto.setNome(request.getNome());
        projeto.setDescricao(request.getDescricao());
        projeto.setDataInicio(request.getDataInicio());
        projeto.setDataTerminoPrevista(request.getDataTerminoPrevista());
        if (request.getStatus() != null) {
            projeto.setStatus(request.getStatus());
        }
        projeto.setGerente(gerente);

        Projeto projetoSalvo = projetoRepository.save(projeto);
        return new ProjetoDTO(projetoSalvo);
    }

    @Transactional
    public void remover(Long id) {
        if (!projetoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Projeto não encontrado com o ID: " + id);
        }
        projetoRepository.deleteById(id);
    }

    private void validateDates(SalvarProjetoRequest request) {
        if (request.getDataInicio() == null || request.getDataTerminoPrevista() == null) {
            throw new BusinessRuleException("As datas de início e término prevista são obrigatórias.");
        }
        if (request.getDataTerminoPrevista().isBefore(request.getDataInicio())) {
            throw new BusinessRuleException("A data de término prevista não pode ser anterior à data de início.");
        }
    }
}
