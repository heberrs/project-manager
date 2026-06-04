package br.com.a3.projectmanager.dto;

public class LoginResponse {
    private String token;
    private Long id;
    private String nome;
    private String email;
    private String perfil;

    public LoginResponse() {
    }

    public LoginResponse(String token, Long id, String nome, String email, String perfil) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.perfil = perfil;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }
}
