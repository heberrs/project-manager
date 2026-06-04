package br.com.a3.projectmanager.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.a3.projectmanager.dto.RelatorioDesempenhoDTO;
import br.com.a3.projectmanager.dto.RelatorioOcupacaoDTO;
import br.com.a3.projectmanager.model.Perfil;
import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusTarefa;
import br.com.a3.projectmanager.model.Tarefa;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.ProjetoRepository;
import br.com.a3.projectmanager.repository.TarefaRepository;
import br.com.a3.projectmanager.repository.UsuarioRepository;

@Service
public class RelatorioService {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;
    private final UsuarioRepository usuarioRepository;

    public RelatorioService(ProjetoRepository projetoRepository, TarefaRepository tarefaRepository, UsuarioRepository usuarioRepository) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<RelatorioDesempenhoDTO> recuperarDesempenhoProjetos() {
        List<Projeto> projetos = projetoRepository.findAll();
        List<RelatorioDesempenhoDTO> relatorio = new ArrayList<>();

        for (Projeto p : projetos) {
            long total = tarefaRepository.countByProjetoId(p.getId());
            long concluidas = tarefaRepository.countByProjetoIdAndStatus(p.getId(), StatusTarefa.CONCLUIDO);
            relatorio.add(new RelatorioDesempenhoDTO(p.getId(), p.getNome(), total, concluidas));
        }

        return relatorio;
    }

    @Transactional(readOnly = true)
    public List<RelatorioOcupacaoDTO> recuperarOcupacaoColaboradores() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<RelatorioOcupacaoDTO> relatorio = new ArrayList<>();

        for (Usuario u : usuarios) {
            // Considerar apenas colaboradores e gerentes para este relatório
            if (u.getPerfil() == Perfil.COLABORADOR || u.getPerfil() == Perfil.GERENTE) {
                List<Tarefa> tarefas = tarefaRepository.findByResponsavelId(u.getId());
                long total = tarefas.size();
                long concluidas = tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.CONCLUIDO).count();
                long pendentes = total - concluidas;

                relatorio.add(new RelatorioOcupacaoDTO(u.getId(), u.getNome(), total, pendentes, concluidas));
            }
        }

        return relatorio;
    }
}
