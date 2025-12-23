package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.AuthResponse;
import com.monsite.ventes.gestion_ventes.dto.LoginRequest;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.SignupRequest;
import com.monsite.ventes.gestion_ventes.entity.Utilisateur;
import com.monsite.ventes.gestion_ventes.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        if (authResponse.isSuccess()) {
            return ResponseEntity.ok(authResponse);
        }
        return ResponseEntity.badRequest().body(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Déconnexion réussie")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(@AuthenticationPrincipal Utilisateur utilisateur) {
        if (utilisateur == null) {
            return ResponseEntity.status(401).body(AuthResponse.builder()
                    .success(false)
                    .message("Non authentifié")
                    .build());
        }

        return ResponseEntity.ok(AuthResponse.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .email(utilisateur.getEmail())
                .telephone(utilisateur.getTelephone())
                .role(utilisateur.getRole())
                .success(true)
                .message("Utilisateur authentifié")
                .build());
    }
}
