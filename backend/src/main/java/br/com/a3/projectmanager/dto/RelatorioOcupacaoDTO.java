package br.com.a3.projectmanager.dto;

public class RelatorioOcupacaoDTO {
    private Long colaboradorId;
    private String colaboradorNome;
    private long totalTarefasAtribuidas;
    private long tarefasPendentes;
    private long tarefasConcluidas;

    public RelatorioOcupacaoDTO() {
    }

    public RelatorioOcupacaoDTO(Long colaboradorId, String colaboradorNome, long totalTarefasAtribuidas, long tarefasPendentes, long tarefasConcluidas) {
        this.colaboradorId = colaboradorId;
        this.colaboradorNome = colaboradorNome;
        this.totalTarefasAtribuidas = totalTarefasAtribuidas;
        this.tarefasPendentes = tarefasPendentes;
        this.tarefasConcluidas = tarefasConcluidas;
    }

    public Long getColaboradorId() {
        return colaboradorId;
    }

    public void setColaboradorId(Long colaboradorId) {
        this.colaboradorId = colaboradorId;
    }

    public String getColaboradorNome() {
        return colaboradorNome;
    }

    public void setColaboradorNome(String colaboradorNome) {
        this.colaboradorNome = colaboradorNome;
    }

    public long getTotalTarefasAtribuidas() {
        return totalTarefasAtribuidas;
    }

    public void setTotalTarefasAtribuidas(long totalTarefasAtribuidas) {
        this.totalTarefasAtribuidas = totalTarefasAtribuidas;
    }

    public long getTarefasPendentes() {
        return tarefasPendentes;
    }

    public void setTarefasPendentes(long tarefasPendentes) {
        this.tarefasPendentes = tarefasPendentes;
    }

    public long getTarefasConcluidas() {
        return tarefasConcluidas;
    }

    public void setTarefasConcluidas(long tarefasConcluidas) {
        this.tarefasConcluidas = tarefasConcluidas;
    }
}
