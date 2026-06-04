package br.com.a3.projectmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable()) // disable csrf for REST APIs and H2 console
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin())) // allow H2 console frame layout
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                
                //Gestão de usuários: Restrito a Admin, Gerente pode ler, Colaborador sem acesso
                .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                
                //Projetos: Admin/Gerente podem escrever, Colaborador pode ler
                .requestMatchers(HttpMethod.POST, "/api/projetos/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.PUT, "/api/projetos/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/projetos/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.GET, "/api/projetos/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "COLABORADOR")

                // Equipes: Admin/Gerente podem escrever, Colaborador pode ler
                .requestMatchers(HttpMethod.POST, "/api/equipes/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.PUT, "/api/equipes/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/equipes/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.GET, "/api/equipes/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "COLABORADOR")

                // Tarefas: Admin/Gerente podem criar/editar/excluir, Colaborador pode atualizar status e ler
                .requestMatchers(HttpMethod.POST, "/api/tarefas/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/tarefas/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.PUT, "/api/tarefas/*/responsavel/*").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.PUT, "/api/tarefas/*/status").hasAnyRole("ADMINISTRADOR", "GERENTE", "COLABORADOR")
                .requestMatchers(HttpMethod.PUT, "/api/tarefas/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                .requestMatchers(HttpMethod.GET, "/api/tarefas/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "COLABORADOR")

                // Relatórios: Restrito a Admin e Gerente
                .requestMatchers("/api/relatorios/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults()); // Usar autenticação HTTP Basic 

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
