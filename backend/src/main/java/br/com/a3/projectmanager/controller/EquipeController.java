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
import org.springframework.web.bind.annotation.RestController;

import br.com.a3.projectmanager.dto.EquipeDTO;
import br.com.a3.projectmanager.dto.SalvarEquipeRequest;
import br.com.a3.projectmanager.service.EquipeService;

@RestController
@RequestMapping("/api/equipes")
public class EquipeController {

    private final EquipeService equipeService;

    public EquipeController(EquipeService equipeService) {
        this.equipeService = equipeService;
    }

    @GetMapping
    public ResponseEntity<List<EquipeDTO>> listarTodos() {
        return ResponseEntity.ok(equipeService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipeDTO> recuperarId(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.localizarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EquipeDTO> criar(@RequestBody SalvarEquipeRequest request) {
        EquipeDTO equipeDTO = equipeService.criar(request);
        return new ResponseEntity<>(equipeDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipeDTO> atualizar(@PathVariable Long id, @RequestBody SalvarEquipeRequest request) {
        EquipeDTO equipeDTO = equipeService.atualizar(id, request);
        return ResponseEntity.ok(equipeDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        equipeService.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/membros/{usuarioId}")
    public ResponseEntity<EquipeDTO> adicionarMembro(@PathVariable Long id, @PathVariable Long usuarioId) {
        EquipeDTO equipeDTO = equipeService.adcionarMembro(id, usuarioId);
        return ResponseEntity.ok(equipeDTO);
    }

    @DeleteMapping("/{id}/membros/{usuarioId}")
    public ResponseEntity<EquipeDTO> removerMembro(@PathVariable Long id, @PathVariable Long usuarioId) {
        EquipeDTO equipeDTO = equipeService.removerMembro(id, usuarioId);
        return ResponseEntity.ok(equipeDTO);
    }

    @PostMapping("/{id}/projetos/{projetoId}")
    public ResponseEntity<EquipeDTO> alocarProjeto(@PathVariable Long id, @PathVariable Long projetoId) {
        EquipeDTO equipeDTO = equipeService.alocarProjeto(id, projetoId);
        return ResponseEntity.ok(equipeDTO);
    }

    @DeleteMapping("/{id}/projetos/{projetoId}")
    public ResponseEntity<EquipeDTO> desalocarProjeto(@PathVariable Long id, @PathVariable Long projetoId) {
        EquipeDTO equipeDTO = equipeService.desalocarProjeto(id, projetoId);
        return ResponseEntity.ok(equipeDTO);
    }
}
