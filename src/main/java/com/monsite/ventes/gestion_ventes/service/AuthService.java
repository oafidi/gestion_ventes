package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.AuthResponse;
import com.monsite.ventes.gestion_ventes.dto.LoginRequest;
import com.monsite.ventes.gestion_ventes.dto.SignupRequest;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.AdminRepository;
import com.monsite.ventes.gestion_ventes.repository.ClientRepository;
import com.monsite.ventes.gestion_ventes.repository.UtilisateurRepository;
import com.monsite.ventes.gestion_ventes.repository.VendeurRepository;
import com.monsite.ventes.gestion_ventes.security.CookieUtil;
import com.monsite.ventes.gestion_ventes.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final AdminRepository adminRepository;
    private final VendeurRepository vendeurRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CookieUtil cookieUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       UtilisateurRepository utilisateurRepository,
                       AdminRepository adminRepository,
                       VendeurRepository vendeurRepository,
                       ClientRepository clientRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       CookieUtil cookieUtil) {
        this.authenticationManager = authenticationManager;
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.vendeurRepository = vendeurRepository;
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.cookieUtil = cookieUtil;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Cet email est déjà utilisé")
                    .build();
        }

        String encodedPassword = passwordEncoder.encode(request.getMotDePasse());

        switch (request.getRole()) {
            case ADMIN:
                Admin admin = new Admin();
                admin.setNom(request.getNom());
                admin.setEmail(request.getEmail());
                admin.setMotDePasse(encodedPassword);
                admin.setTelephone(request.getTelephone());
                admin.setRole(Role.ADMIN);
                adminRepository.save(admin);
                return buildAuthResponse(admin, "Admin créé avec succès");

            case VENDEUR:
                Vendeur vendeur = new Vendeur();
                vendeur.setNom(request.getNom());
                vendeur.setEmail(request.getEmail());
                vendeur.setMotDePasse(encodedPassword);
                vendeur.setTelephone(request.getTelephone());
                vendeur.setRole(Role.VENDEUR);
                vendeur.setEstApprouve(false); // En attente d'approbation
                vendeurRepository.save(vendeur);
                return AuthResponse.builder()
                        .id(vendeur.getId())
                        .nom(vendeur.getNom())
                        .email(vendeur.getEmail())
                        .telephone(vendeur.getTelephone())
                        .role(vendeur.getRole())
                        .estApprouve(vendeur.isEstApprouve())
                        .success(true)
                        .message("Inscription réussie. Votre compte vendeur est en attente d'approbation par l'administrateur.")
                        .build();

            case CLIENT:
            default:
                Client client = new Client();
                client.setNom(request.getNom());
                client.setEmail(request.getEmail());
                client.setMotDePasse(encodedPassword);
                client.setTelephone(request.getTelephone());
                client.setRole(Role.CLIENT);
                client.setAdresseLivraison(request.getAdresseLivraison() != null ? request.getAdresseLivraison() : "");
                clientRepository.save(client);
                return buildAuthResponse(client, "Client créé avec succès");
        }
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        try {
            // Vérifier d'abord si l'utilisateur existe
            Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                    .orElse(null);

            if (utilisateur == null) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Email ou mot de passe incorrect")
                        .build();
            }

            // Vérifier si c'est un vendeur non approuvé
            if (utilisateur instanceof Vendeur vendeur && !vendeur.isEstApprouve()) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Votre compte vendeur n'est pas encore approuvé par l'administrateur")
                        .estApprouve(false)
                        .build();
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getMotDePasse()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            cookieUtil.createJwtCookie(response, jwt);

            return buildAuthResponse(utilisateur, "Connexion réussie");

        } catch (Exception e) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email ou mot de passe incorrect")
                    .build();
        }
    }

    public void logout(HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        cookieUtil.clearJwtCookie(response);
    }

    private AuthResponse buildAuthResponse(Utilisateur utilisateur, String message) {
        AuthResponse.AuthResponseBuilder builder = AuthResponse.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .email(utilisateur.getEmail())
                .telephone(utilisateur.getTelephone())
                .role(utilisateur.getRole())
                .success(true)
                .message(message);

        if (utilisateur instanceof Vendeur vendeur) {
            builder.estApprouve(vendeur.isEstApprouve());
        } else if (utilisateur instanceof Client client) {
            builder.adresseLivraison(client.getAdresseLivraison());
        }

        return builder.build();
    }
}
