package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.AuthResponse;
import com.monsite.ventes.gestion_ventes.dto.LoginRequest;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.SignupRequest;
import com.monsite.ventes.gestion_ventes.entity.Utilisateur;
import com.monsite.ventes.gestion_ventes.security.JwtTokenProvider;
import com.monsite.ventes.gestion_ventes.service.AuthService;
import com.monsite.ventes.gestion_ventes.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider, CustomUserDetailsService userDetailsService) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
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

    @GetMapping("/debug")
    public ResponseEntity<?> debug(@AuthenticationPrincipal Utilisateur utilisateur) {
        java.util.Map<String, Object> debugInfo = new java.util.HashMap<>();
        debugInfo.put("utilisateurPresent", utilisateur != null);
        if (utilisateur != null) {
            debugInfo.put("id", utilisateur.getId());
            debugInfo.put("email", utilisateur.getEmail());
            debugInfo.put("role", utilisateur.getRole());
            debugInfo.put("authorities", utilisateur.getAuthorities().toString());
            debugInfo.put("class", utilisateur.getClass().getSimpleName());
        }
        return ResponseEntity.ok(debugInfo);
    }

    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(HttpServletRequest request) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        
        String authHeader = request.getHeader("Authorization");
        result.put("authHeaderPresent", authHeader != null);
        result.put("authHeader", authHeader);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            result.put("tokenExtracted", true);
            result.put("tokenLength", token.length());
            
            try {
                boolean isValid = jwtTokenProvider.validateToken(token);
                result.put("tokenValid", isValid);
                
                if (isValid) {
                    String email = jwtTokenProvider.getEmailFromToken(token);
                    result.put("emailFromToken", email);
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    result.put("userLoaded", true);
                    result.put("userEmail", userDetails.getUsername());
                    result.put("authorities", userDetails.getAuthorities().toString());
                }
            } catch (Exception e) {
                result.put("error", e.getMessage());
                result.put("errorClass", e.getClass().getSimpleName());
            }
        } else {
            result.put("tokenExtracted", false);
        }
        
        return ResponseEntity.ok(result);
    }
}
