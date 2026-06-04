package br.com.a3.projectmanager.dto;

import br.com.a3.projectmanager.model.Projeto;
import br.com.a3.projectmanager.model.StatusProjeto;
import java.time.LocalDate;

public class ProjetoDTO {
    private Long id;
    private String nome;
    private String descricao;
    private LocalDate dataInicio;
    private LocalDate dataTerminoPrevista;
    private StatusProjeto status;
    private UsuarioDTO gerente;

    public ProjetoDTO() {
    }

    public ProjetoDTO(Projeto projeto) {
        this.id = projeto.getId();
        this.nome = projeto.getNome();
        this.descricao = projeto.getDescricao();
        this.dataInicio = projeto.getDataInicio();
        this.dataTerminoPrevista = projeto.getDataTerminoPrevista();
        this.status = projeto.getStatus();
        if (projeto.getGerente() != null) {
            this.gerente = new UsuarioDTO(projeto.getGerente());
        }
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

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataTerminoPrevista() {
        return dataTerminoPrevista;
    }

    public void setDataTerminoPrevista(LocalDate dataTerminoPrevista) {
        this.dataTerminoPrevista = dataTerminoPrevista;
    }

    public StatusProjeto getStatus() {
        return status;
    }

    public void setStatus(StatusProjeto status) {
        this.status = status;
    }

    public UsuarioDTO getGerente() {
        return gerente;
    }

    public void setGerente(UsuarioDTO gerente) {
        this.gerente = gerente;
    }
}
