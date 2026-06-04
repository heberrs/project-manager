package br.com.a3.projectmanager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.a3.projectmanager.dto.RelatorioDesempenhoDTO;
import br.com.a3.projectmanager.dto.RelatorioOcupacaoDTO;
import br.com.a3.projectmanager.service.RelatorioService;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/desempenho")
    public ResponseEntity<List<RelatorioDesempenhoDTO>> recuperarDesempenho() {
        return ResponseEntity.ok(relatorioService.recuperarDesempenhoProjetos());
    }

    @GetMapping("/ocupacao")
    public ResponseEntity<List<RelatorioOcupacaoDTO>> recuperarOcupacao() {
        return ResponseEntity.ok(relatorioService.recuperarOcupacaoColaboradores());
    }
}
