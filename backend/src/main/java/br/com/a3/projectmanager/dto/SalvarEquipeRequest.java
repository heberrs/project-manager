package br.com.a3.projectmanager.dto;

public class SalvarEquipeRequest {
    private String nome;
    private String descricao;

    public SalvarEquipeRequest() {
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
}
