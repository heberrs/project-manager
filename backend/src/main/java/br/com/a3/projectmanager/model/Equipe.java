package br.com.a3.projectmanager.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "equipes")
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "equipe_membros",
        joinColumns = @JoinColumn(name = "equipe_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> membros = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "projeto_equipes",
        joinColumns = @JoinColumn(name = "equipe_id"),
        inverseJoinColumns = @JoinColumn(name = "projeto_id")
    )
    private List<Projeto> projetos = new ArrayList<>();

   
    public Equipe() {
    }

    public Equipe(Long id, String nome, String descricao) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<Usuario> getMembros() {
        return membros;
    }

    public void setMembros(List<Usuario> membros) {
        this.membros = membros;
    }

    public List<Projeto> getProjetos() {
        return projetos;
    }

    public void setProjetos(List<Projeto> projetos) {
        this.projetos = projetos;
    }

    // Metodos para adicionar/remover membros e projetos
    public void adicionarMembro(Usuario usuario) {
        if (usuario != null && !this.membros.contains(usuario)) {
            this.membros.add(usuario);
        }
    }

    public void removerMembro(Usuario usuario) {
        if (usuario != null) {
            this.membros.remove(usuario);
        }
    }

    public void adicionarProjeto(Projeto projeto) {
        if (projeto != null && !this.projetos.contains(projeto)) {
            this.projetos.add(projeto);
        }
    }

    public void removerProjeto(Projeto projeto) {
        if (projeto != null) {
            this.projetos.remove(projeto);
        }
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Equipe equipe = (Equipe) o;
        return Objects.equals(id, equipe.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Equipe{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", descricao='" + descricao + '\'' +
                '}';
    }
}
