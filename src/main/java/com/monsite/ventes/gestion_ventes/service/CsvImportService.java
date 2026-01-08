package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.CsvImportResult;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CsvImportService {

    private final CommandeRepository commandeRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final ClientRepository clientRepository;
    private final VendeurProduitRepository vendeurProduitRepository;

    // Formats de date supportés
    private static final List<DateTimeFormatter> DATE_FORMATTERS = Arrays.asList(
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy")
    );

    public CsvImportService(CommandeRepository commandeRepository,
                           LigneCommandeRepository ligneCommandeRepository,
                           ClientRepository clientRepository,
                           VendeurProduitRepository vendeurProduitRepository) {
        this.commandeRepository = commandeRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
        this.clientRepository = clientRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
    }

    /**
     * Importe les commandes depuis un fichier CSV
     * Format attendu: commande_id,client_id,date_commande,statut,vendeur_produit_id,quantite,prix_unitaire
     */
    @Transactional
    public CsvImportResult importerCommandes(MultipartFile file) {
        CsvImportResult.CsvImportResultBuilder resultBuilder = CsvImportResult.builder()
                .success(false)
                .commandesDetails(new ArrayList<>())
                .erreurs(new ArrayList<>())
                .avertissements(new ArrayList<>());

        List<String> erreurs = new ArrayList<>();
        List<String> avertissements = new ArrayList<>();
        List<CsvImportResult.CommandeImportee> commandesDetails = new ArrayList<>();

        try {
            // Lire et parser le fichier CSV
            List<String[]> lignes = lireCsv(file);
            
            if (lignes.isEmpty()) {
                return resultBuilder
                        .message("Le fichier CSV est vide")
                        .erreurs(erreurs)
                        .build();
            }

            resultBuilder.totalLignes(lignes.size());

            // Valider et regrouper les données par commande
            Map<String, List<LigneCommandeData>> commandesMap = new LinkedHashMap<>();
            Set<String> lignesUniques = new HashSet<>();
            int doublonsIgnores = 0;
            int erreursCorrigees = 0;

            for (int i = 0; i < lignes.size(); i++) {
                String[] cols = lignes.get(i);
                int numLigne = i + 2; // +2 car ligne 1 = header, index 0 = première donnée

                try {
                    // Vérifier le nombre de colonnes
                    if (cols.length < 7) {
                        erreurs.add("Ligne " + numLigne + ": Nombre de colonnes insuffisant (attendu: 7, reçu: " + cols.length + ")");
                        continue;
                    }

                    // Parser les données
                    String commandeRef = cols[0].trim();
                    String clientIdStr = cols[1].trim();
                    String dateStr = cols[2].trim();
                    String statutStr = cols[3].trim();
                    String vendeurProduitIdStr = cols[4].trim();
                    String quantiteStr = cols[5].trim();
                    String prixUnitaireStr = cols[6].trim();

                    // Créer une clé unique pour détecter les doublons
                    String cleUnique = commandeRef + "|" + vendeurProduitIdStr + "|" + quantiteStr;
                    if (lignesUniques.contains(cleUnique)) {
                        doublonsIgnores++;
                        avertissements.add("Ligne " + numLigne + ": Doublon ignoré (commande=" + commandeRef + ", produit=" + vendeurProduitIdStr + ")");
                        continue;
                    }
                    lignesUniques.add(cleUnique);

                    // Valider et corriger les données
                    Long clientId = parseLong(clientIdStr, "client_id", numLigne, erreurs);
                    if (clientId == null) continue;

                    // Vérifier que le client existe
                    if (!clientRepository.existsById(clientId)) {
                        erreurs.add("Ligne " + numLigne + ": Client avec ID " + clientId + " n'existe pas");
                        continue;
                    }

                    LocalDateTime dateCommande = parseDate(dateStr, numLigne, avertissements);
                    if (dateCommande == null) {
                        dateCommande = LocalDateTime.now();
                        erreursCorrigees++;
                        avertissements.add("Ligne " + numLigne + ": Date invalide, utilisation de la date actuelle");
                    }

                    Commande.StatutCommande statut = parseStatut(statutStr, numLigne, avertissements);
                    if (statut == null) {
                        statut = Commande.StatutCommande.EN_ATTENTE;
                        erreursCorrigees++;
                    }

                    Long vendeurProduitId = parseLong(vendeurProduitIdStr, "vendeur_produit_id", numLigne, erreurs);
                    if (vendeurProduitId == null) continue;

                    // Vérifier que le vendeur produit existe
                    if (!vendeurProduitRepository.existsById(vendeurProduitId)) {
                        erreurs.add("Ligne " + numLigne + ": VendeurProduit avec ID " + vendeurProduitId + " n'existe pas");
                        continue;
                    }

                    Integer quantite = parseInteger(quantiteStr, "quantite", numLigne, erreurs);
                    if (quantite == null || quantite <= 0) {
                        if (quantite != null && quantite <= 0) {
                            erreurs.add("Ligne " + numLigne + ": Quantité doit être positive");
                        }
                        continue;
                    }

                    BigDecimal prixUnitaire = parseBigDecimal(prixUnitaireStr, "prix_unitaire", numLigne, erreurs);
                    if (prixUnitaire == null || prixUnitaire.compareTo(BigDecimal.ZERO) <= 0) {
                        if (prixUnitaire != null && prixUnitaire.compareTo(BigDecimal.ZERO) <= 0) {
                            erreurs.add("Ligne " + numLigne + ": Prix unitaire doit être positif");
                        }
                        continue;
                    }

                    // Créer la donnée de ligne commande
                    LigneCommandeData ligneData = new LigneCommandeData();
                    ligneData.clientId = clientId;
                    ligneData.dateCommande = dateCommande;
                    ligneData.statut = statut;
                    ligneData.vendeurProduitId = vendeurProduitId;
                    ligneData.quantite = quantite;
                    ligneData.prixUnitaire = prixUnitaire;

                    // Regrouper par référence de commande
                    commandesMap.computeIfAbsent(commandeRef, k -> new ArrayList<>()).add(ligneData);

                } catch (Exception e) {
                    erreurs.add("Ligne " + numLigne + ": Erreur inattendue - " + e.getMessage());
                }
            }

            // Vérifier s'il y a des commandes valides à importer
            if (commandesMap.isEmpty()) {
                return resultBuilder
                        .message("Aucune commande valide à importer")
                        .erreurs(erreurs)
                        .avertissements(avertissements)
                        .doublonsIgnores(doublonsIgnores)
                        .erreursCorrigees(erreursCorrigees)
                        .build();
            }

            // Insérer les commandes dans la base de données
            int commandesImportees = 0;
            int lignesCommandeImportees = 0;

            for (Map.Entry<String, List<LigneCommandeData>> entry : commandesMap.entrySet()) {
                String commandeRef = entry.getKey();
                List<LigneCommandeData> lignesData = entry.getValue();

                try {
                    // Utiliser les données de la première ligne pour la commande
                    LigneCommandeData premiereLigne = lignesData.get(0);
                    
                    // Récupérer le client
                    Client client = clientRepository.findById(premiereLigne.clientId)
                            .orElseThrow(() -> new RuntimeException("Client non trouvé"));

                    // Calculer le montant total
                    BigDecimal montantTotal = lignesData.stream()
                            .map(l -> l.prixUnitaire.multiply(BigDecimal.valueOf(l.quantite)))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    // Créer la commande
                    Commande commande = new Commande();
                    commande.setClient(client);
                    commande.setDateCommande(premiereLigne.dateCommande);
                    commande.setStatut(premiereLigne.statut);
                    commande.setMontantTotal(montantTotal.setScale(2, RoundingMode.HALF_UP));

                    commande = commandeRepository.save(commande);

                    // Créer les lignes de commande
                    for (LigneCommandeData ligneData : lignesData) {
                        VendeurProduit vendeurProduit = vendeurProduitRepository.findById(ligneData.vendeurProduitId)
                                .orElseThrow(() -> new RuntimeException("VendeurProduit non trouvé"));

                        LigneCommande ligneCommande = new LigneCommande();
                        ligneCommande.setCommande(commande);
                        ligneCommande.setVendeurProduit(vendeurProduit);
                        ligneCommande.setQuantite(ligneData.quantite);
                        ligneCommande.setPrixUnitaire(ligneData.prixUnitaire.setScale(2, RoundingMode.HALF_UP));
                        ligneCommande.setSousTotal(ligneData.prixUnitaire
                                .multiply(BigDecimal.valueOf(ligneData.quantite))
                                .setScale(2, RoundingMode.HALF_UP));

                        ligneCommandeRepository.save(ligneCommande);
                        lignesCommandeImportees++;
                    }

                    commandesImportees++;

                    // Ajouter aux détails
                    commandesDetails.add(CsvImportResult.CommandeImportee.builder()
                            .commandeId(commande.getId())
                            .clientId(client.getId())
                            .clientEmail(client.getEmail())
                            .nbLignes(lignesData.size())
                            .montantTotal(montantTotal.setScale(2, RoundingMode.HALF_UP).toString() + " DH")
                            .statut(commande.getStatut().name())
                            .build());

                } catch (Exception e) {
                    erreurs.add("Erreur lors de l'insertion de la commande '" + commandeRef + "': " + e.getMessage());
                }
            }

            return resultBuilder
                    .success(commandesImportees > 0)
                    .message("Import terminé: " + commandesImportees + " commande(s) et " + lignesCommandeImportees + " ligne(s) importée(s)")
                    .commandesImportees(commandesImportees)
                    .lignesCommandeImportees(lignesCommandeImportees)
                    .doublonsIgnores(doublonsIgnores)
                    .erreursCorrigees(erreursCorrigees)
                    .erreurs(erreurs)
                    .avertissements(avertissements)
                    .commandesDetails(commandesDetails)
                    .build();

        } catch (Exception e) {
            erreurs.add("Erreur lors de la lecture du fichier: " + e.getMessage());
            return resultBuilder
                    .message("Erreur lors de l'import du fichier CSV")
                    .erreurs(erreurs)
                    .build();
        }
    }

    /**
     * Valide le fichier CSV sans l'importer
     */
    public CsvImportResult validerCsv(MultipartFile file) {
        CsvImportResult.CsvImportResultBuilder resultBuilder = CsvImportResult.builder()
                .success(false)
                .erreurs(new ArrayList<>())
                .avertissements(new ArrayList<>());

        List<String> erreurs = new ArrayList<>();
        List<String> avertissements = new ArrayList<>();

        try {
            List<String[]> lignes = lireCsv(file);
            
            if (lignes.isEmpty()) {
                return resultBuilder
                        .message("Le fichier CSV est vide")
                        .erreurs(erreurs)
                        .build();
            }

            resultBuilder.totalLignes(lignes.size());

            Set<String> lignesUniques = new HashSet<>();
            int doublonsDetectes = 0;
            int erreursDetectees = 0;
            int commandesValides = 0;
            Set<String> commandesRefs = new HashSet<>();

            for (int i = 0; i < lignes.size(); i++) {
                String[] cols = lignes.get(i);
                int numLigne = i + 2;

                if (cols.length < 7) {
                    erreurs.add("Ligne " + numLigne + ": Nombre de colonnes insuffisant");
                    erreursDetectees++;
                    continue;
                }

                String commandeRef = cols[0].trim();
                String cleUnique = commandeRef + "|" + cols[4].trim() + "|" + cols[5].trim();
                
                if (lignesUniques.contains(cleUnique)) {
                    doublonsDetectes++;
                    avertissements.add("Ligne " + numLigne + ": Doublon détecté");
                } else {
                    lignesUniques.add(cleUnique);
                    commandesRefs.add(commandeRef);
                }

                // Valider les IDs
                try {
                    Long clientId = Long.parseLong(cols[1].trim());
                    if (!clientRepository.existsById(clientId)) {
                        erreurs.add("Ligne " + numLigne + ": Client ID " + clientId + " n'existe pas");
                        erreursDetectees++;
                    }
                } catch (NumberFormatException e) {
                    erreurs.add("Ligne " + numLigne + ": Client ID invalide");
                    erreursDetectees++;
                }

                try {
                    Long vpId = Long.parseLong(cols[4].trim());
                    if (!vendeurProduitRepository.existsById(vpId)) {
                        erreurs.add("Ligne " + numLigne + ": VendeurProduit ID " + vpId + " n'existe pas");
                        erreursDetectees++;
                    }
                } catch (NumberFormatException e) {
                    erreurs.add("Ligne " + numLigne + ": VendeurProduit ID invalide");
                    erreursDetectees++;
                }
            }

            commandesValides = commandesRefs.size();

            boolean isValid = erreursDetectees == 0;
            return resultBuilder
                    .success(isValid)
                    .message(isValid 
                        ? "Fichier valide: " + commandesValides + " commande(s) prêtes à importer"
                        : "Fichier contient des erreurs")
                    .commandesImportees(commandesValides)
                    .doublonsIgnores(doublonsDetectes)
                    .erreurs(erreurs)
                    .avertissements(avertissements)
                    .build();

        } catch (Exception e) {
            erreurs.add("Erreur lors de la lecture: " + e.getMessage());
            return resultBuilder
                    .message("Erreur lors de la validation")
                    .erreurs(erreurs)
                    .build();
        }
    }

    /**
     * Génère un exemple de fichier CSV
     */
    public String genererExempleCsv() {
        StringBuilder sb = new StringBuilder();
        
        // Header
        sb.append("commande_ref,client_id,date_commande,statut,vendeur_produit_id,quantite,prix_unitaire\n");
        
        // Récupérer quelques données réelles pour l'exemple
        List<Client> clients = clientRepository.findAll();
        List<VendeurProduit> vendeurProduits = vendeurProduitRepository.findByEstApprouve(true);
        
        if (clients.isEmpty() || vendeurProduits.isEmpty()) {
            // Données d'exemple génériques si pas de données en base
            sb.append("CMD001,1,2026-01-08 10:30:00,EN_ATTENTE,1,2,150.00\n");
            sb.append("CMD001,1,2026-01-08 10:30:00,EN_ATTENTE,2,1,75.50\n");
            sb.append("CMD002,1,2026-01-08 11:00:00,CONFIRMEE,3,3,200.00\n");
            sb.append("CMD003,2,2026-01-08 12:00:00,EN_COURS_LIVRAISON,1,1,150.00\n");
        } else {
            // Utiliser des données réelles
            Random random = new Random();
            String[] statuts = {"EN_ATTENTE", "CONFIRMEE", "EN_COURS_LIVRAISON", "LIVREE"};
            
            int nbCommandes = Math.min(3, clients.size());
            int commandeNum = 1;
            
            for (int i = 0; i < nbCommandes; i++) {
                Client client = clients.get(i % clients.size());
                String commandeRef = String.format("CMD%03d", commandeNum);
                String date = LocalDateTime.now().minusDays(random.nextInt(30))
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                String statut = statuts[random.nextInt(statuts.length)];
                
                // Ajouter 1-3 lignes par commande
                int nbLignes = 1 + random.nextInt(Math.min(3, vendeurProduits.size()));
                Set<Long> produitsUtilises = new HashSet<>();
                
                for (int j = 0; j < nbLignes && j < vendeurProduits.size(); j++) {
                    VendeurProduit vp = vendeurProduits.get(j % vendeurProduits.size());
                    if (produitsUtilises.contains(vp.getId())) continue;
                    produitsUtilises.add(vp.getId());
                    
                    int quantite = 1 + random.nextInt(5);
                    BigDecimal prix = vp.getPrixVendeur();
                    
                    sb.append(String.format("%s,%d,%s,%s,%d,%d,%.2f\n",
                            commandeRef,
                            client.getId(),
                            date,
                            statut,
                            vp.getId(),
                            quantite,
                            prix));
                }
                
                commandeNum++;
            }
        }
        
        return sb.toString();
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private List<String[]> lireCsv(MultipartFile file) throws Exception {
        List<String[]> lignes = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String line;
            boolean isHeader = true;
            
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                
                // Ignorer le header
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                
                // Parser la ligne (supporter , et ;)
                String[] cols = line.contains(";") ? line.split(";") : line.split(",");
                lignes.add(cols);
            }
        }
        
        return lignes;
    }

    private Long parseLong(String value, String fieldName, int ligne, List<String> erreurs) {
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            erreurs.add("Ligne " + ligne + ": " + fieldName + " invalide '" + value + "'");
            return null;
        }
    }

    private Integer parseInteger(String value, String fieldName, int ligne, List<String> erreurs) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            erreurs.add("Ligne " + ligne + ": " + fieldName + " invalide '" + value + "'");
            return null;
        }
    }

    private BigDecimal parseBigDecimal(String value, String fieldName, int ligne, List<String> erreurs) {
        try {
            // Supporter les formats avec virgule ou point
            value = value.trim().replace(",", ".");
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            erreurs.add("Ligne " + ligne + ": " + fieldName + " invalide '" + value + "'");
            return null;
        }
    }

    private LocalDateTime parseDate(String value, int ligne, List<String> avertissements) {
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                // Si le format ne contient pas d'heure, ajouter minuit
                if (!value.contains(":")) {
                    return java.time.LocalDate.parse(value.trim(), formatter).atStartOfDay();
                }
                return LocalDateTime.parse(value.trim(), formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    private Commande.StatutCommande parseStatut(String value, int ligne, List<String> avertissements) {
        try {
            return Commande.StatutCommande.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            avertissements.add("Ligne " + ligne + ": Statut invalide '" + value + "', utilisation de EN_ATTENTE");
            return null;
        }
    }

    // Classe interne pour stocker les données temporaires
    private static class LigneCommandeData {
        Long clientId;
        LocalDateTime dateCommande;
        Commande.StatutCommande statut;
        Long vendeurProduitId;
        Integer quantite;
        BigDecimal prixUnitaire;
    }
}
