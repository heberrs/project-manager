package br.com.a3.projectmanager.repository;

import br.com.a3.projectmanager.model.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {
    List<Equipe> findByMembrosId(Long usuarioId);
    List<Equipe> findByProjetosId(Long projetoId);
}
