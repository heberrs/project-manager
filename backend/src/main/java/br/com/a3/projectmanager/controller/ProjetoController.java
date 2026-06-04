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

import br.com.a3.projectmanager.dto.ProjetoDTO;
import br.com.a3.projectmanager.dto.SalvarProjetoRequest;
import br.com.a3.projectmanager.model.StatusProjeto;
import br.com.a3.projectmanager.service.ProjetoService;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    private final ProjetoService projetoService;

    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @GetMapping
    public ResponseEntity<List<ProjetoDTO>> listarProjetos(
            @RequestParam(required = false) Long gerenteId,
            @RequestParam(required = false) StatusProjeto status) {
        if (gerenteId != null || status != null) {
            return ResponseEntity.ok(projetoService.filtrarPorGerenteIdStatusProjeto(gerenteId, status));
        }
        return ResponseEntity.ok(projetoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetoDTO> recuperarProjetoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(projetoService.localizarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProjetoDTO> criar(@RequestBody SalvarProjetoRequest request) {
        ProjetoDTO created = projetoService.criar(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjetoDTO> atualizar(@PathVariable Long id, @RequestBody SalvarProjetoRequest request) {
        ProjetoDTO updated = projetoService.atualizar(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        projetoService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
