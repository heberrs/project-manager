package br.com.a3.projectmanager.repository;

import br.com.a3.projectmanager.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
    boolean existsByLogin(String login);
}
