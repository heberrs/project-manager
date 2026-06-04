package br.com.a3.projectmanager.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.a3.projectmanager.dto.SalvarTarefaRequest;
import br.com.a3.projectmanager.dto.TarefaDTO;
import br.com.a3.projectmanager.model.StatusTarefa;
import br.com.a3.projectmanager.service.TarefaService;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodos() {
        return ResponseEntity.ok(tarefaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> recuperarTarefaPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tarefaService.localizarPorId(id));
    }

    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<TarefaDTO>> listarTarefasPorProjetoId(@PathVariable Long projetoId) {
        return ResponseEntity.ok(tarefaService.localizarPorProjetoId(projetoId));
    }

    @PostMapping
    public ResponseEntity<TarefaDTO> criar(@RequestBody SalvarTarefaRequest request) {
        TarefaDTO created = tarefaService.criar(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable Long id, @RequestBody SalvarTarefaRequest request) {
        TarefaDTO updated = tarefaService.atualizar(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        tarefaService.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TarefaDTO> atualizarStatus(@PathVariable Long id, @RequestParam StatusTarefa status) {
        TarefaDTO updated = tarefaService.atualizarStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/responsavel/{usuarioId}")
    public ResponseEntity<TarefaDTO> atribuirResponsavel(@PathVariable Long id, @PathVariable Long usuarioId) {
        TarefaDTO updated = tarefaService.atribuirResponsavel(id, usuarioId);
        return ResponseEntity.ok(updated);
    }
}
