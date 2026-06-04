package br.com.a3.projectmanager.dto;

public class RelatorioDesempenhoDTO {
    private Long projetoId;
    private String projetoNome;
    private long totalTarefas;
    private long tarefasConcluidas;
    private double percentualConcluido;

    public RelatorioDesempenhoDTO() {
    }

    public RelatorioDesempenhoDTO(Long projetoId, String projetoNome, long totalTarefas, long tarefasConcluidas) {
        this.projetoId = projetoId;
        this.projetoNome = projetoNome;
        this.totalTarefas = totalTarefas;
        this.tarefasConcluidas = tarefasConcluidas;
        this.percentualConcluido = totalTarefas > 0 ? ((double) tarefasConcluidas / totalTarefas) * 100.0 : 0.0;
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

    public long getTotalTarefas() {
        return totalTarefas;
    }

    public void setTotalTarefas(long totalTarefas) {
        this.totalTarefas = totalTarefas;
        updatePercentual();
    }

    public long getTarefasConcluidas() {
        return tarefasConcluidas;
    }

    public void setTarefasConcluidas(long tarefasConcluidas) {
        this.tarefasConcluidas = tarefasConcluidas;
        updatePercentual();
    }

    public double getPercentualConcluido() {
        return percentualConcluido;
    }

    public void setPercentualConcluido(double percentualConcluido) {
        this.percentualConcluido = percentualConcluido;
    }

    private void updatePercentual() {
        this.percentualConcluido = this.totalTarefas > 0 ? ((double) this.tarefasConcluidas / this.totalTarefas) * 100.0 : 0.0;
    }
}
