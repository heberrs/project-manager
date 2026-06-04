package br.com.a3.projectmanager.dto;

import br.com.a3.projectmanager.model.Equipe;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class EquipeDTO {
    private Long id;
    private String nome;
    private String descricao;
    private List<UsuarioDTO> membros = new ArrayList<>();
    private List<ProjetoDTO> projetos = new ArrayList<>();

    public EquipeDTO() {
    }

    public EquipeDTO(Equipe equipe) {
        this.id = equipe.getId();
        this.nome = equipe.getNome();
        this.descricao = equipe.getDescricao();
        if (equipe.getMembros() != null) {
            this.membros = equipe.getMembros().stream()
                    .map(UsuarioDTO::new)
                    .collect(Collectors.toList());
        }
        if (equipe.getProjetos() != null) {
            this.projetos = equipe.getProjetos().stream()
                    .map(ProjetoDTO::new)
                    .collect(Collectors.toList());
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

    public List<UsuarioDTO> getMembros() {
        return membros;
    }

    public void setMembros(List<UsuarioDTO> membros) {
        this.membros = membros;
    }

    public List<ProjetoDTO> getProjetos() {
        return projetos;
    }

    public void setProjetos(List<ProjetoDTO> projetos) {
        this.projetos = projetos;
    }
}
