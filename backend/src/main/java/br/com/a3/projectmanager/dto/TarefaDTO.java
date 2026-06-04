package br.com.a3.projectmanager.dto;

import br.com.a3.projectmanager.model.Tarefa;
import br.com.a3.projectmanager.model.StatusTarefa;
import java.time.LocalDate;

public class TarefaDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private LocalDate prazo;
    private StatusTarefa status;
    private UsuarioDTO responsavel;
    private Long projetoId;
    private String projetoNome;

    public TarefaDTO() {
    }

    public TarefaDTO(Tarefa tarefa) {
        this.id = tarefa.getId();
        this.titulo = tarefa.getTitulo();
        this.descricao = tarefa.getDescricao();
        this.prazo = tarefa.getPrazo();
        this.status = tarefa.getStatus();
        if (tarefa.getResponsavel() != null) {
            this.responsavel = new UsuarioDTO(tarefa.getResponsavel());
        }
        if (tarefa.getProjeto() != null) {
            this.projetoId = tarefa.getProjeto().getId();
            this.projetoNome = tarefa.getProjeto().getNome();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public void setPrazo(LocalDate prazo) {
        this.prazo = prazo;
    }

    public StatusTarefa getStatus() {
        return status;
    }

    public void setStatus(StatusTarefa status) {
        this.status = status;
    }

    public UsuarioDTO getResponsavel() {
        return responsavel;
    }

    public void setResponsavel(UsuarioDTO responsavel) {
        this.responsavel = responsavel;
    }

    public Long getProjetoId() {
        return projetoId;
    }

    public void setProjetoId(Long projetoId) {
        this.projetoId = projetoId;
    }

    public String getProjetoNome() {
        return projetoNome;
    }

    public void setProjetoNome(String projetoNome) {
        this.projetoNome = projetoNome;
    }
}
