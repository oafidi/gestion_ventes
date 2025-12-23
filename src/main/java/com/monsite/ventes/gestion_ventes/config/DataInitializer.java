package com.monsite.ventes.gestion_ventes.config;

import com.monsite.ventes.gestion_ventes.entity.Admin;
import com.monsite.ventes.gestion_ventes.entity.Role;
import com.monsite.ventes.gestion_ventes.repository.AdminRepository;
import com.monsite.ventes.gestion_ventes.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UtilisateurRepository utilisateurRepository,
                                       AdminRepository adminRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            // Créer un admin par défaut s'il n'existe pas
            if (!utilisateurRepository.existsByEmail("admin@affiliate.com")) {
                Admin admin = new Admin();
                admin.setNom("Administrateur");
                admin.setEmail("admin@affiliate.com");
                admin.setMotDePasse(passwordEncoder.encode("admin123"));
                admin.setTelephone("0600000000");
                admin.setRole(Role.ADMIN);
                adminRepository.save(admin);
                System.out.println("Admin par défaut créé: admin@affiliate.com / admin123");
            }
        };
    }
}
