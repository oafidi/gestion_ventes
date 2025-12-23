package com.monsite.ventes.gestion_ventes.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.*;

@RestController
@RequestMapping("/api/client")
@PreAuthorize("hasRole('CLIENT')")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @GetMapping("/profil")
    public ResponseEntity<Client> getMonProfil(@AuthenticationPrincipal Client client) {
        return ResponseEntity.ok(client);
    }

    @PutMapping("/profil")
    public ResponseEntity<MessageResponse> updateProfil(
            @AuthenticationPrincipal Client client,
            @RequestBody Client clientDetails) {
        
        client.setNom(clientDetails.getNom());
        client.setTelephone(clientDetails.getTelephone());
        client.setAdresseLivraison(clientDetails.getAdresseLivraison());
        clientRepository.save(client);
        
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Profil mis à jour avec succès")
                .build());
    }
}