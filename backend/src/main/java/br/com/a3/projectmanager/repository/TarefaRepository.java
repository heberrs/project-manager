package br.com.a3.projectmanager.repository;

import br.com.a3.projectmanager.model.Tarefa;
import br.com.a3.projectmanager.model.StatusTarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByProjetoId(Long projetoId);
    List<Tarefa> findByResponsavelId(Long responsavelId);
    List<Tarefa> findByProjetoIdAndStatus(Long projetoId, StatusTarefa status);
    long countByProjetoId(Long projetoId);
    long countByProjetoIdAndStatus(Long projetoId, StatusTarefa status);
}
