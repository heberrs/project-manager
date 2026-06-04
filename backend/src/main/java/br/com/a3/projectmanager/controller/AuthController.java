package br.com.a3.projectmanager.controller;

import java.util.Base64;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.a3.projectmanager.dto.LoginRequest;
import br.com.a3.projectmanager.dto.LoginResponse;
import br.com.a3.projectmanager.dto.SalvarUsuarioRequest;
import br.com.a3.projectmanager.dto.UsuarioDTO;
import br.com.a3.projectmanager.model.Usuario;
import br.com.a3.projectmanager.repository.UsuarioRepository;
import br.com.a3.projectmanager.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByLogin(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

        // Gerar token simples (base64 do login:senha) , não recomendado para produção
        String credentials = request.getUsername() + ":" + request.getPassword();
        String token = Base64.getEncoder().encodeToString(credentials.getBytes());

        LoginResponse response = new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioDTO> register(@RequestBody SalvarUsuarioRequest request) {
        if (request.getPerfil() == null) {
            request.setPerfil(br.com.a3.projectmanager.model.Perfil.COLABORADOR);
        }
        UsuarioDTO created = usuarioService.criar(request);
        return ResponseEntity.ok(created);
    }
}
