package com.monsite.ventes.gestion_ventes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"commandes", "avis", "hibernateLazyInitializer", "handler", "motDePasse", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired"})
    private Client client;

    @Column(nullable = false)
    private LocalDateTime dateCommande = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTotal;

    @JsonIgnore
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LigneCommande> lignesCommande = new ArrayList<>();

    public enum StatutCommande {
        EN_ATTENTE,
        CONFIRMEE,
        EN_COURS_LIVRAISON,
        LIVREE,
        ANNULEE
    }
}
