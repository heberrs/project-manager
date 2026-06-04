package br.com.a3.projectmanager.repository;

import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusProjeto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
    List<Projeto> findByStatus(StatusProjeto status);
    List<Projeto> findByGerenteId(Long gerenteId);
    List<Projeto> findByGerenteIdAndStatus(Long gerenteId, StatusProjeto status);
}
