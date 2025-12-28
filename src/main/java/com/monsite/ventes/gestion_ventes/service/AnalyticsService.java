package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.analytics.*;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service d'analyse des données commerciales
 * Fournit les KPIs, tendances, analyses par produit/catégorie et recommandations
 * Gère les accès selon le rôle (ADMIN/VENDEUR)
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    private final CommandeRepository commandeRepository;
    private final VendeurProduitRepository vendeurProduitRepository;
    private final AvisRepository avisRepository;
    private final CategorieRepository categorieRepository;
    private final VendeurRepository vendeurRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final ProduitRepository produitRepository;

    public AnalyticsService(CommandeRepository commandeRepository,
                           VendeurProduitRepository vendeurProduitRepository,
                           AvisRepository avisRepository,
                           CategorieRepository categorieRepository,
                           VendeurRepository vendeurRepository,
                           LigneCommandeRepository ligneCommandeRepository,
                           ProduitRepository produitRepository) {
        this.commandeRepository = commandeRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
        this.avisRepository = avisRepository;
        this.categorieRepository = categorieRepository;
        this.vendeurRepository = vendeurRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
        this.produitRepository = produitRepository;
    }

    // ==================== KPI DASHBOARD ====================

    /**
     * Récupère les KPIs globaux pour l'ADMIN
     */
    public DashboardKPIResponse getKPIsAdmin(AnalyticsFilterRequest filter) {
        logger.info("Calcul des KPIs Admin avec filtres: {}", filter);
        return calculateKPIs(null, filter);
    }

    /**
     * Récupère les KPIs personnalisés pour un VENDEUR
     */
    public DashboardKPIResponse getKPIsVendeur(Long vendeurId, AnalyticsFilterRequest filter) {
        logger.info("Calcul des KPIs pour vendeur ID: {} avec filtres: {}", vendeurId, filter);
        return calculateKPIs(vendeurId, filter);
    }

    /**
     * Calcule les KPIs selon le contexte (global ou vendeur spécifique)
     * Le CA est calculé uniquement sur les commandes LIVREES
     */
    private DashboardKPIResponse calculateKPIs(Long vendeurId, AnalyticsFilterRequest filter) {
        // Récupérer toutes les commandes avec détails
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        
        // Appliquer les filtres de date
        LocalDate dateDebut = filter != null && filter.getDateDebut() != null 
            ? filter.getDateDebut() 
            : LocalDate.now().minusMonths(1);
        LocalDate dateFin = filter != null && filter.getDateFin() != null 
            ? filter.getDateFin() 
            : LocalDate.now();
        
        // Filtrer les commandes par date (exclure les annulées)
        List<Commande> commandesFiltrees = commandes.stream()
            .filter(c -> c.getStatut() != Commande.StatutCommande.ANNULEE)
            .filter(c -> !c.getDateCommande().toLocalDate().isBefore(dateDebut))
            .filter(c -> !c.getDateCommande().toLocalDate().isAfter(dateFin))
            .collect(Collectors.toList());

        // Filtrer seulement les commandes LIVREES pour le CA
        List<Commande> commandesLivrees = commandesFiltrees.stream()
            .filter(c -> c.getStatut() == Commande.StatutCommande.LIVREE)
            .collect(Collectors.toList());

        // Filtrer les lignes de commande pour toutes les commandes (stats)
        List<LigneCommande> lignesFiltrees = new ArrayList<>();
        for (Commande commande : commandesFiltrees) {
            for (LigneCommande ligne : commande.getLignesCommande()) {
                boolean inclure = true;
                
                // Filtre par vendeur
                if (vendeurId != null && !ligne.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
                    inclure = false;
                }
                
                // Filtre par catégorie
                if (filter != null && filter.getCategorieId() != null) {
                    Categorie cat = ligne.getVendeurProduit().getProduit().getCategorie();
                    if (cat == null || !cat.getId().equals(filter.getCategorieId())) {
                        inclure = false;
                    }
                }
                
                if (inclure) {
                    lignesFiltrees.add(ligne);
                }
            }
        }

        // Filtrer les lignes de commande pour les commandes LIVREES uniquement (pour le CA)
        List<LigneCommande> lignesLivrees = new ArrayList<>();
        for (Commande commande : commandesLivrees) {
            for (LigneCommande ligne : commande.getLignesCommande()) {
                boolean inclure = true;
                
                // Filtre par vendeur
                if (vendeurId != null && !ligne.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
                    inclure = false;
                }
                
                // Filtre par catégorie
                if (filter != null && filter.getCategorieId() != null) {
                    Categorie cat = ligne.getVendeurProduit().getProduit().getCategorie();
                    if (cat == null || !cat.getId().equals(filter.getCategorieId())) {
                        inclure = false;
                    }
                }
                
                if (inclure) {
                    lignesLivrees.add(ligne);
                }
            }
        }

        // Calcul du CA total (seulement commandes LIVREES)
        BigDecimal chiffreAffairesTotal = lignesLivrees.stream()
            .map(LigneCommande::getSousTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Nombre de ventes (commandes uniques - toutes sauf annulées)
        long nombreVentes = commandesFiltrees.stream()
            .filter(c -> c.getLignesCommande().stream()
                .anyMatch(l -> vendeurId == null || l.getVendeurProduit().getVendeur().getId().equals(vendeurId)))
            .count();

        // Nombre de produits vendus (toutes commandes)
        long nombreProduitsVendus = lignesFiltrees.stream()
            .mapToLong(LigneCommande::getQuantite)
            .sum();

        // Prix moyen par commande (basé sur commandes livrées)
        long nombreCommandesLivrees = commandesLivrees.stream()
            .filter(c -> c.getLignesCommande().stream()
                .anyMatch(l -> vendeurId == null || l.getVendeurProduit().getVendeur().getId().equals(vendeurId)))
            .count();
        BigDecimal prixMoyenCommande = nombreCommandesLivrees > 0 
            ? chiffreAffairesTotal.divide(BigDecimal.valueOf(nombreCommandesLivrees), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Produit le plus vendu
        Map<Long, Long> ventesParProduit = lignesFiltrees.stream()
            .collect(Collectors.groupingBy(
                l -> l.getVendeurProduit().getId(),
                Collectors.summingLong(LigneCommande::getQuantite)
            ));
        
        DashboardKPIResponse.ProduitPerformance produitPlusVendu = null;
        if (!ventesParProduit.isEmpty()) {
            Long produitIdPlusVendu = Collections.max(ventesParProduit.entrySet(), Map.Entry.comparingByValue()).getKey();
            produitPlusVendu = buildProduitPerformance(produitIdPlusVendu, lignesFiltrees);
        }

        // Produit le mieux noté
        DashboardKPIResponse.ProduitPerformance produitMieuxNote = findProduitMieuxNote(vendeurId, filter);

        // Calcul du taux de croissance
        LocalDate dateDebutPrecedente = dateDebut.minusDays(ChronoUnit.DAYS.between(dateDebut, dateFin));
        Double tauxCroissance = calculateTauxCroissance(dateDebutPrecedente, dateDebut.minusDays(1), dateDebut, dateFin, vendeurId);

        // Nombre de reviews
        long nombreReviews = countReviews(vendeurId);

        // Note moyenne globale
        Double noteMoyenne = calculateNoteMoyenneGlobale(vendeurId);

        // Commandes par statut
        Map<Commande.StatutCommande, Long> commandesParStatut = commandesFiltrees.stream()
            .collect(Collectors.groupingBy(Commande::getStatut, Collectors.counting()));

        // CA période précédente pour comparaison
        BigDecimal caPrecedent = calculateCAPeriode(dateDebutPrecedente, dateDebut.minusDays(1), vendeurId, filter);
        long nombreVentesPrecedentes = calculateNombreVentesPeriode(dateDebutPrecedente, dateDebut.minusDays(1), vendeurId);

        return DashboardKPIResponse.builder()
            .chiffreAffairesTotal(chiffreAffairesTotal)
            .nombreTotalVentes(nombreVentes)
            .nombreProduitsVendus(nombreProduitsVendus)
            .prixMoyenCommande(prixMoyenCommande)
            .produitPlusVendu(produitPlusVendu)
            .produitMieuxNote(produitMieuxNote)
            .tauxCroissanceVentes(tauxCroissance)
            .nombreTotalReviews(nombreReviews)
            .noteMoyenneGlobale(noteMoyenne)
            .commandesEnAttente(commandesParStatut.getOrDefault(Commande.StatutCommande.EN_ATTENTE, 0L))
            .commandesConfirmees(commandesParStatut.getOrDefault(Commande.StatutCommande.CONFIRMEE, 0L))
            .commandesLivrees(commandesParStatut.getOrDefault(Commande.StatutCommande.LIVREE, 0L))
            .commandesAnnulees(commandesParStatut.getOrDefault(Commande.StatutCommande.ANNULEE, 0L))
            .chiffreAffairesPeriodePrecedente(caPrecedent)
            .nombreVentesPeriodePrecedente(nombreVentesPrecedentes)
            .build();
    }

    // ==================== TENDANCES DE VENTES ====================

    /**
     * Récupère les tendances de ventes dans le temps
     */
    public VentesTendanceResponse getTendancesVentes(Long vendeurId, AnalyticsFilterRequest filter) {
        LocalDate dateDebut = filter != null && filter.getDateDebut() != null 
            ? filter.getDateDebut() 
            : LocalDate.now().minusMonths(1);
        LocalDate dateFin = filter != null && filter.getDateFin() != null 
            ? filter.getDateFin() 
            : LocalDate.now();
        String typePeriode = filter != null && filter.getTypePeriode() != null 
            ? filter.getTypePeriode() 
            : "JOUR";

        List<Commande> commandes = commandeRepository.findAllWithDetails();
        
        // Filtrer par date et vendeur
        List<LigneCommande> lignesFiltrees = new ArrayList<>();
        for (Commande commande : commandes) {
            if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
            if (commande.getDateCommande().toLocalDate().isBefore(dateDebut)) continue;
            if (commande.getDateCommande().toLocalDate().isAfter(dateFin)) continue;
            
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (vendeurId == null || ligne.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
                    lignesFiltrees.add(ligne);
                }
            }
        }

        // Grouper par période
        Map<String, List<LigneCommande>> lignesParPeriode = groupByPeriode(lignesFiltrees, typePeriode, commandes);
        
        List<VentesTendanceResponse.PointVente> points = new ArrayList<>();
        BigDecimal totalVentes = BigDecimal.ZERO;
        long nombreCommandes = 0;

        List<String> periodesSorted = new ArrayList<>(lignesParPeriode.keySet());
        Collections.sort(periodesSorted);

        for (String periode : periodesSorted) {
            List<LigneCommande> lignes = lignesParPeriode.get(periode);
            BigDecimal ca = lignes.stream()
                .map(LigneCommande::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            long nbProduits = lignes.stream().mapToLong(LigneCommande::getQuantite).sum();
            long nbVentes = lignes.stream()
                .map(l -> l.getCommande().getId())
                .distinct()
                .count();
            
            points.add(VentesTendanceResponse.PointVente.builder()
                .periode(periode)
                .chiffreAffaires(ca)
                .nombreVentes(nbVentes)
                .nombreProduits(nbProduits)
                .build());
            
            totalVentes = totalVentes.add(ca);
            nombreCommandes += nbVentes;
        }

        BigDecimal moyenneParPeriode = !points.isEmpty() 
            ? totalVentes.divide(BigDecimal.valueOf(points.size()), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Données de comparaison (période précédente)
        long joursDiff = ChronoUnit.DAYS.between(dateDebut, dateFin);
        LocalDate dateDebutPrec = dateDebut.minusDays(joursDiff);
        LocalDate dateFinPrec = dateDebut.minusDays(1);
        
        List<VentesTendanceResponse.PointVente> pointsComparaison = 
            getPointsComparaison(vendeurId, dateDebutPrec, dateFinPrec, typePeriode, commandes);

        return VentesTendanceResponse.builder()
            .pointsVente(points)
            .pointsVenteComparaison(pointsComparaison)
            .totalVentes(totalVentes)
            .nombreCommandes(nombreCommandes)
            .moyenneParPeriode(moyenneParPeriode)
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .typePeriode(typePeriode)
            .build();
    }

    // ==================== ANALYSE PRODUITS ====================

    /**
     * Récupère les analyses détaillées des produits
     */
    public ProduitAnalyticsResponse getAnalyseProduits(Long vendeurId, AnalyticsFilterRequest filter) {
        List<VendeurProduit> produits;
        
        if (vendeurId != null) {
            produits = vendeurProduitRepository.findByVendeurId(vendeurId);
        } else {
            produits = vendeurProduitRepository.findAll();
        }

        // Appliquer les filtres
        if (filter != null) {
            if (filter.getCategorieId() != null) {
                produits = produits.stream()
                    .filter(p -> p.getProduit().getCategorie() != null 
                        && p.getProduit().getCategorie().getId().equals(filter.getCategorieId()))
                    .collect(Collectors.toList());
            }
            if (filter.getPrixMin() != null) {
                produits = produits.stream()
                    .filter(p -> p.getPrixVendeur().compareTo(filter.getPrixMin()) >= 0)
                    .collect(Collectors.toList());
            }
            if (filter.getPrixMax() != null) {
                produits = produits.stream()
                    .filter(p -> p.getPrixVendeur().compareTo(filter.getPrixMax()) <= 0)
                    .collect(Collectors.toList());
            }
            if (filter.getEstApprouve() != null) {
                produits = produits.stream()
                    .filter(p -> p.isEstApprouve() == filter.getEstApprouve())
                    .collect(Collectors.toList());
            }
        }

        // Calculer les stats pour chaque produit
        List<ProduitAnalyticsResponse.ProduitStats> tousLesProduits = new ArrayList<>();
        for (VendeurProduit vp : produits) {
            ProduitAnalyticsResponse.ProduitStats stats = buildProduitStats(vp, filter);
            tousLesProduits.add(stats);
        }

        // Filtrer par note si nécessaire
        if (filter != null && filter.getNoteMinimale() != null) {
            tousLesProduits = tousLesProduits.stream()
                .filter(p -> p.getNoteMoyenne() != null && p.getNoteMoyenne() >= filter.getNoteMinimale())
                .collect(Collectors.toList());
        }

        // Top 10 par ventes
        List<ProduitAnalyticsResponse.ProduitStats> top10ParVentes = tousLesProduits.stream()
            .sorted(Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getNombreVentes, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(10)
            .collect(Collectors.toList());

        // Top 10 par CA
        List<ProduitAnalyticsResponse.ProduitStats> top10ParCA = tousLesProduits.stream()
            .sorted(Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getChiffreAffaires, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(10)
            .collect(Collectors.toList());

        // Top 10 par note
        List<ProduitAnalyticsResponse.ProduitStats> top10ParNote = tousLesProduits.stream()
            .filter(p -> p.getNoteMoyenne() != null && p.getNombreReviews() > 0)
            .sorted(Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getNoteMoyenne, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(10)
            .collect(Collectors.toList());

        // Appliquer le tri demandé
        if (filter != null && filter.getTriPar() != null) {
            Comparator<ProduitAnalyticsResponse.ProduitStats> comparator = getComparatorForProduits(filter.getTriPar());
            if (filter.getOrdreTriger() != null && filter.getOrdreTriger().equals("ASC")) {
                comparator = comparator.reversed();
            }
            tousLesProduits.sort(comparator);
        }

        return ProduitAnalyticsResponse.builder()
            .top10ParVentes(top10ParVentes)
            .top10ParCA(top10ParCA)
            .top10ParNote(top10ParNote)
            .tousLesProduits(tousLesProduits)
            .nombreTotalProduits((long) tousLesProduits.size())
            .build();
    }

    // ==================== ANALYSE CATEGORIES ====================

    /**
     * Récupère les analyses par catégorie
     */
    public CategorieAnalyticsResponse getAnalyseCategories(Long vendeurId, AnalyticsFilterRequest filter) {
        List<Categorie> categories = categorieRepository.findAll();
        List<Commande> commandes = commandeRepository.findAllWithDetails();

        // Filtrer par date
        LocalDate dateDebut = filter != null && filter.getDateDebut() != null 
            ? filter.getDateDebut() 
            : LocalDate.now().minusMonths(1);
        LocalDate dateFin = filter != null && filter.getDateFin() != null 
            ? filter.getDateFin() 
            : LocalDate.now();

        List<LigneCommande> lignesFiltrees = new ArrayList<>();
        for (Commande commande : commandes) {
            if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
            if (commande.getDateCommande().toLocalDate().isBefore(dateDebut)) continue;
            if (commande.getDateCommande().toLocalDate().isAfter(dateFin)) continue;
            
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (vendeurId == null || ligne.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
                    lignesFiltrees.add(ligne);
                }
            }
        }

        // Calculer CA total et ventes totales
        BigDecimal caTotal = lignesFiltrees.stream()
            .map(LigneCommande::getSousTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        long ventesTotales = lignesFiltrees.stream()
            .mapToLong(LigneCommande::getQuantite)
            .sum();

        // Stats par catégorie
        List<CategorieAnalyticsResponse.CategorieStats> categoriesStats = new ArrayList<>();
        
        for (Categorie categorie : categories) {
            List<LigneCommande> lignesCategorie = lignesFiltrees.stream()
                .filter(l -> l.getVendeurProduit().getProduit().getCategorie() != null 
                    && l.getVendeurProduit().getProduit().getCategorie().getId().equals(categorie.getId()))
                .collect(Collectors.toList());

            BigDecimal caCategorie = lignesCategorie.stream()
                .map(LigneCommande::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long ventesCategorie = lignesCategorie.stream()
                .mapToLong(LigneCommande::getQuantite)
                .sum();

            // Nombre de produits dans la catégorie
            long nbProduits;
            if (vendeurId != null) {
                nbProduits = vendeurProduitRepository.findByVendeurId(vendeurId).stream()
                    .filter(vp -> vp.getProduit().getCategorie() != null 
                        && vp.getProduit().getCategorie().getId().equals(categorie.getId()))
                    .count();
            } else {
                nbProduits = categorie.getProduits().size();
            }

            // Prix moyen
            BigDecimal prixMoyen = lignesCategorie.isEmpty() ? BigDecimal.ZERO :
                lignesCategorie.stream()
                    .map(l -> l.getVendeurProduit().getPrixVendeur())
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(lignesCategorie.size()), 2, RoundingMode.HALF_UP);

            // Note moyenne (calculée sur les produits de la catégorie)
            Double noteMoyenne = calculateNoteMoyenneCategorie(categorie.getId(), vendeurId);

            // Pourcentages
            double pourcentageCA = caTotal.compareTo(BigDecimal.ZERO) > 0 
                ? caCategorie.multiply(BigDecimal.valueOf(100)).divide(caTotal, 2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
            double pourcentageVentes = ventesTotales > 0 
                ? (ventesCategorie * 100.0) / ventesTotales 
                : 0.0;

            // Déterminer la performance
            String performance = determinePerformanceCategorie(pourcentageCA, noteMoyenne, ventesCategorie);

            categoriesStats.add(CategorieAnalyticsResponse.CategorieStats.builder()
                .categorieId(categorie.getId())
                .categorieNom(categorie.getNom())
                .image(categorie.getImage())
                .chiffreAffaires(caCategorie)
                .nombreVentes(ventesCategorie)
                .nombreProduits(nbProduits)
                .prixMoyen(prixMoyen)
                .noteMoyenne(noteMoyenne)
                .pourcentageCA(pourcentageCA)
                .pourcentageVentes(pourcentageVentes)
                .performance(performance)
                .build());
        }

        // Trier par CA décroissant
        categoriesStats.sort(Comparator.comparing(CategorieAnalyticsResponse.CategorieStats::getChiffreAffaires, Comparator.reverseOrder()));

        return CategorieAnalyticsResponse.builder()
            .categories(categoriesStats)
            .chiffreAffairesTotal(caTotal)
            .nombreTotalVentes(ventesTotales)
            .build();
    }

    // ==================== ANALYSE VENDEURS (ADMIN) ====================

    /**
     * Récupère les analyses des vendeurs (ADMIN uniquement)
     */
    public VendeurAnalyticsResponse getAnalyseVendeurs(AnalyticsFilterRequest filter) {
        List<Vendeur> vendeurs = vendeurRepository.findAll();
        List<Commande> commandes = commandeRepository.findAllWithDetails();

        // Filtrer par date
        LocalDate dateDebut = filter != null && filter.getDateDebut() != null 
            ? filter.getDateDebut() 
            : LocalDate.now().minusMonths(1);
        LocalDate dateFin = filter != null && filter.getDateFin() != null 
            ? filter.getDateFin() 
            : LocalDate.now();

        List<VendeurAnalyticsResponse.VendeurStats> vendeursStats = new ArrayList<>();

        for (Vendeur vendeur : vendeurs) {
            if (!vendeur.isEstApprouve()) continue;

            // Lignes de commande du vendeur
            List<LigneCommande> lignesVendeur = new ArrayList<>();
            for (Commande commande : commandes) {
                if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
                if (commande.getDateCommande().toLocalDate().isBefore(dateDebut)) continue;
                if (commande.getDateCommande().toLocalDate().isAfter(dateFin)) continue;
                
                for (LigneCommande ligne : commande.getLignesCommande()) {
                    if (ligne.getVendeurProduit().getVendeur().getId().equals(vendeur.getId())) {
                        lignesVendeur.add(ligne);
                    }
                }
            }

            BigDecimal ca = lignesVendeur.stream()
                .map(LigneCommande::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long nbVentes = lignesVendeur.stream()
                .mapToLong(LigneCommande::getQuantite)
                .sum();

            List<VendeurProduit> produitsVendeur = vendeurProduitRepository.findByVendeurId(vendeur.getId());
            long nbProduits = produitsVendeur.size();
            long nbProduitsApprouves = produitsVendeur.stream().filter(VendeurProduit::isEstApprouve).count();

            // Note moyenne
            Double noteMoyenne = calculateNoteMoyenneVendeur(vendeur.getId());
            long nbReviews = countReviewsVendeur(vendeur.getId());

            // Performance
            String performance = determinePerformanceVendeur(ca, nbVentes, noteMoyenne);

            vendeursStats.add(VendeurAnalyticsResponse.VendeurStats.builder()
                .vendeurId(vendeur.getId())
                .vendeurNom(vendeur.getNom())
                .email(vendeur.getEmail())
                .chiffreAffaires(ca)
                .nombreVentes(nbVentes)
                .nombreProduits(nbProduits)
                .nombreProduitsApprouves(nbProduitsApprouves)
                .noteMoyenne(noteMoyenne)
                .nombreReviews(nbReviews)
                .performance(performance)
                .build());
        }

        // Trier par CA
        vendeursStats.sort(Comparator.comparing(VendeurAnalyticsResponse.VendeurStats::getChiffreAffaires, Comparator.reverseOrder()));

        // Top 5 vendeurs
        List<VendeurAnalyticsResponse.VendeurStats> topVendeurs = vendeursStats.stream()
            .limit(5)
            .collect(Collectors.toList());

        long nbVendeursActifs = vendeurs.stream().filter(Vendeur::isEstApprouve).count();

        return VendeurAnalyticsResponse.builder()
            .vendeurs(vendeursStats)
            .topVendeurs(topVendeurs)
            .nombreVendeursActifs(nbVendeursActifs)
            .build();
    }

    // ==================== RECOMMANDATIONS ====================

    /**
     * Génère les recommandations intelligentes pour un vendeur
     * Inclut: nouveaux produits à vendre, ajustement de prix, opportunités d'inscription
     */
    public RecommandationsResponse getRecommandationsVendeur(Long vendeurId) {
        List<RecommandationsResponse.Insight> insights = new ArrayList<>();
        List<RecommandationsResponse.Opportunite> opportunites = new ArrayList<>();
        List<RecommandationsResponse.Alerte> alertes = new ArrayList<>();
        List<RecommandationsResponse.ProduitPotentiel> produitsPotentiel = new ArrayList<>();
        List<RecommandationsResponse.ProduitAmeliorer> produitsAmeliorer = new ArrayList<>();
        List<RecommandationsResponse.CategorieTendance> categoriesTendance = new ArrayList<>();

        // Récupérer les produits du vendeur
        List<VendeurProduit> produitsVendeur = vendeurProduitRepository.findByVendeurId(vendeurId);
        Set<Long> produitsIdsVendeur = produitsVendeur.stream()
            .map(vp -> vp.getProduit().getId())
            .collect(Collectors.toSet());
        
        // ========== 1. RECOMMANDER DE NOUVEAUX PRODUITS (non vendus par ce vendeur) ==========
        List<Produit> tousLesProduits = produitRepository.findAll();
        
        // Trouver les produits les plus vendus par d'autres vendeurs
        Map<Long, Long> ventesParProduit = new HashMap<>();
        Map<Long, BigDecimal> prixMoyenParProduit = new HashMap<>();
        Map<Long, List<BigDecimal>> prixParProduit = new HashMap<>();
        
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        for (Commande commande : commandes) {
            if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
            for (LigneCommande ligne : commande.getLignesCommande()) {
                Long produitId = ligne.getVendeurProduit().getProduit().getId();
                ventesParProduit.merge(produitId, (long) ligne.getQuantite(), Long::sum);
                prixParProduit.computeIfAbsent(produitId, k -> new ArrayList<>())
                    .add(ligne.getVendeurProduit().getPrixVendeur());
            }
        }
        
        // Calculer le prix moyen par produit
        for (Map.Entry<Long, List<BigDecimal>> entry : prixParProduit.entrySet()) {
            BigDecimal somme = entry.getValue().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            prixMoyenParProduit.put(entry.getKey(), somme.divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP));
        }
        
        // Recommander des produits que le vendeur ne vend pas encore mais qui se vendent bien
        for (Produit produit : tousLesProduits) {
            if (!produitsIdsVendeur.contains(produit.getId())) {
                Long ventes = ventesParProduit.getOrDefault(produit.getId(), 0L);
                if (ventes >= 5) { // Produit populaire
                    BigDecimal prixMoyen = prixMoyenParProduit.get(produit.getId());
                    String categorie = produit.getCategorie() != null ? produit.getCategorie().getNom() : "Non catégorisé";
                    
                    produitsPotentiel.add(RecommandationsResponse.ProduitPotentiel.builder()
                        .vendeurProduitId(produit.getId())
                        .nomProduit(produit.getNom())
                        .categorie(categorie)
                        .nombreVentes(ventes)
                        .raison("Produit populaire (" + ventes + " ventes) que vous ne vendez pas encore")
                        .suggestion("Inscrivez-vous pour vendre ce produit. Prix moyen recommandé: " + 
                            (prixMoyen != null ? prixMoyen.toString() + " DH" : produit.getPrix().toString() + " DH"))
                        .build());
                }
            }
        }
        
        // Trier par nombre de ventes décroissant et limiter
        produitsPotentiel.sort((a, b) -> Long.compare(b.getNombreVentes(), a.getNombreVentes()));
        if (produitsPotentiel.size() > 5) {
            produitsPotentiel = new ArrayList<>(produitsPotentiel.subList(0, 5));
        }

        // ========== 2. ANALYSE DES PRODUITS ACTUELS DU VENDEUR ==========
        for (VendeurProduit vp : produitsVendeur) {
            Double noteMoyenne = avisRepository.getAverageNoteByVendeurProduitId(vp.getId());
            Long nbReviews = avisRepository.countByVendeurProduitId(vp.getId());
            long nbVentes = countVentesProduit(vp.getId());

            // ========== 3. RECOMMANDATION DE PRIX OPTIMAL ==========
            BigDecimal prixActuel = vp.getPrixVendeur();
            Long produitId = vp.getProduit().getId();
            
            // Trouver les prix des autres vendeurs pour le même produit
            List<VendeurProduit> autresVendeurs = vendeurProduitRepository.findByProduitId(produitId).stream()
                .filter(v -> !v.getVendeur().getId().equals(vendeurId) && v.isEstApprouve())
                .collect(Collectors.toList());
            
            if (!autresVendeurs.isEmpty()) {
                BigDecimal prixMin = autresVendeurs.stream()
                    .map(VendeurProduit::getPrixVendeur)
                    .min(BigDecimal::compareTo).orElse(prixActuel);
                BigDecimal prixMax = autresVendeurs.stream()
                    .map(VendeurProduit::getPrixVendeur)
                    .max(BigDecimal::compareTo).orElse(prixActuel);
                BigDecimal prixMoyenConcurrence = autresVendeurs.stream()
                    .map(VendeurProduit::getPrixVendeur)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(autresVendeurs.size()), 2, RoundingMode.HALF_UP);
                
                // Si le prix est trop élevé et les ventes sont faibles
                if (prixActuel.compareTo(prixMoyenConcurrence.multiply(BigDecimal.valueOf(1.2))) > 0 && nbVentes < 3) {
                    insights.add(RecommandationsResponse.Insight.builder()
                        .type("WARNING")
                        .titre("Prix élevé: " + vp.getTitre())
                        .message("Votre prix (" + prixActuel + " DH) est supérieur à la moyenne du marché (" + 
                            prixMoyenConcurrence + " DH). Envisagez de baisser à environ " + 
                            prixMoyenConcurrence.multiply(BigDecimal.valueOf(0.95)).setScale(2, RoundingMode.HALF_UP) + " DH")
                        .icone("price_tag")
                        .action("Ajuster le prix pour être plus compétitif")
                        .build());
                }
                
                // Si le prix est très bas mais bonnes ventes - opportunité d'augmenter
                if (prixActuel.compareTo(prixMoyenConcurrence.multiply(BigDecimal.valueOf(0.8))) < 0 && nbVentes > 10) {
                    BigDecimal prixRecommande = prixMoyenConcurrence.multiply(BigDecimal.valueOf(0.95)).setScale(2, RoundingMode.HALF_UP);
                    insights.add(RecommandationsResponse.Insight.builder()
                        .type("OPPORTUNITY")
                        .titre("Opportunité de marge: " + vp.getTitre())
                        .message("Vous vendez bien à " + prixActuel + " DH alors que le marché est à " + 
                            prixMoyenConcurrence + " DH. Vous pourriez augmenter à " + prixRecommande + " DH")
                        .icone("trending_up")
                        .action("Augmenter le prix pour améliorer votre marge")
                        .build());
                }
            }

            // ========== 4. PRODUITS À FORT POTENTIEL (bien notés mais peu vendus) ==========
            if (noteMoyenne != null && noteMoyenne >= 4.0 && nbReviews >= 3 && nbVentes < 5) {
                produitsAmeliorer.add(RecommandationsResponse.ProduitAmeliorer.builder()
                    .vendeurProduitId(vp.getId())
                    .nomProduit(vp.getTitre())
                    .categorie(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getNom() : "N/A")
                    .noteMoyenne(noteMoyenne)
                    .nombreVentes(nbVentes)
                    .probleme("Produit très bien noté (" + String.format("%.1f", noteMoyenne) + "/5) mais peu vendu")
                    .suggestion("Investissez dans le marketing: promotions, réseaux sociaux, mise en avant")
                    .build());
            }

            // ========== 5. PRODUITS POPULAIRES - OPPORTUNITÉ D'EXPANSION ==========
            if (nbVentes >= 15 && vp.isEstApprouve()) {
                // Ce vendeur a du succès avec ce produit, recommander des produits similaires
                Categorie categorie = vp.getProduit().getCategorie();
                if (categorie != null) {
                    List<Produit> produitsMemeCategorie = produitRepository.findByCategorieId(categorie.getId());
                    for (Produit produitSimilaire : produitsMemeCategorie) {
                        if (!produitsIdsVendeur.contains(produitSimilaire.getId())) {
                            opportunites.add(RecommandationsResponse.Opportunite.builder()
                                .type("NOUVEAU_PRODUIT")
                                .titre("Étendez votre gamme: " + produitSimilaire.getNom())
                                .description("Vous vendez bien '" + vp.getTitre() + "' (" + nbVentes + " ventes). " +
                                    "Le produit '" + produitSimilaire.getNom() + "' est dans la même catégorie et pourrait bien se vendre pour vous aussi.")
                                .potentielEstime(vp.getPrixVendeur().multiply(BigDecimal.valueOf(nbVentes * 0.3)))
                                .priorite("HAUTE")
                                .produitsIds(Collections.singletonList(produitSimilaire.getId()))
                                .build());
                            break; // Une seule recommandation par produit réussi
                        }
                    }
                }
            }

            // Stock faible
            if (vp.getProduit().getQuantite() < 5 && vp.isEstApprouve()) {
                alertes.add(RecommandationsResponse.Alerte.builder()
                    .type("STOCK_FAIBLE")
                    .titre("Stock faible")
                    .message("Le produit '" + vp.getTitre() + "' a un stock de " + vp.getProduit().getQuantite() + " unités")
                    .severite("AVERTISSEMENT")
                    .elementId(vp.getId())
                    .elementType("PRODUIT")
                    .build());
            }
            
            // Produit mal noté
            if (noteMoyenne != null && noteMoyenne < 3.0 && nbReviews >= 3) {
                alertes.add(RecommandationsResponse.Alerte.builder()
                    .type("MAUVAISES_NOTES")
                    .titre("Note faible")
                    .message("Le produit '" + vp.getTitre() + "' a une note de " + String.format("%.1f", noteMoyenne) + "/5. Vérifiez les avis clients.")
                    .severite("AVERTISSEMENT")
                    .elementId(vp.getId())
                    .elementType("PRODUIT")
                    .build());
            }
        }

        // ========== 6. INSIGHTS GLOBAUX ==========
        DashboardKPIResponse kpis = getKPIsVendeur(vendeurId, null);
        
        if (kpis.getTauxCroissanceVentes() != null && kpis.getTauxCroissanceVentes() > 20) {
            insights.add(RecommandationsResponse.Insight.builder()
                .type("SUCCESS")
                .titre("Excellente croissance!")
                .message("Vos ventes ont augmenté de " + String.format("%.1f", kpis.getTauxCroissanceVentes()) + "% ce mois-ci. Continuez ainsi!")
                .icone("trending_up")
                .build());
        } else if (kpis.getTauxCroissanceVentes() != null && kpis.getTauxCroissanceVentes() < -10) {
            insights.add(RecommandationsResponse.Insight.builder()
                .type("WARNING")
                .titre("Baisse des ventes")
                .message("Vos ventes ont diminué de " + String.format("%.1f", Math.abs(kpis.getTauxCroissanceVentes())) + "% ce mois-ci")
                .icone("trending_down")
                .action("Revoir votre stratégie de prix et de promotion")
                .build());
        }

        // ========== 7. CATÉGORIES TENDANCE ==========
        CategorieAnalyticsResponse categoriesAnalysis = getAnalyseCategories(vendeurId, null);
        for (CategorieAnalyticsResponse.CategorieStats cat : categoriesAnalysis.getCategories()) {
            String tendance = cat.getPourcentageCA() > 30 ? "EN_HAUSSE" : 
                              cat.getPourcentageCA() > 15 ? "STABLE" : "EN_BAISSE";
            
            categoriesTendance.add(RecommandationsResponse.CategorieTendance.builder()
                .categorieId(cat.getCategorieId())
                .categorieNom(cat.getCategorieNom())
                .tauxCroissance(cat.getPourcentageCA())
                .tendance(tendance)
                .opportunite(tendance.equals("EN_HAUSSE") ? 
                    "Cette catégorie représente " + String.format("%.1f", cat.getPourcentageCA()) + "% de votre CA. Excellent!" :
                    tendance.equals("EN_BAISSE") ?
                    "Cette catégorie est sous-exploitée. Envisagez d'ajouter plus de produits." :
                    "Catégorie stable. Continuez à la développer.")
                .build());
        }

        // Limiter les opportunités
        if (opportunites.size() > 3) {
            opportunites = new ArrayList<>(opportunites.subList(0, 3));
        }

        return RecommandationsResponse.builder()
            .insights(insights)
            .opportunites(opportunites)
            .alertes(alertes)
            .produitsFortPotentiel(produitsPotentiel)
            .produitsAAmeliorer(produitsAmeliorer)
            .categoriesTendance(categoriesTendance)
            .build();
    }

    /**
     * Génère les recommandations pour l'admin
     * Analyse globale: vendeurs, catégories, produits best-sellers, alertes
     */
    public RecommandationsResponse getRecommandationsAdmin() {
        List<RecommandationsResponse.Insight> insights = new ArrayList<>();
        List<RecommandationsResponse.Alerte> alertes = new ArrayList<>();
        List<RecommandationsResponse.Opportunite> opportunites = new ArrayList<>();
        List<RecommandationsResponse.ProduitPotentiel> produitsBestSeller = new ArrayList<>();
        List<RecommandationsResponse.ProduitAmeliorer> produitsProblematiques = new ArrayList<>();
        List<RecommandationsResponse.CategorieTendance> categoriesTendance = new ArrayList<>();
        
        // ========== 1. ANALYSE DES VENDEURS ==========
        VendeurAnalyticsResponse vendeursAnalysis = getAnalyseVendeurs(null);
        
        int topPerformers = 0;
        int vendeursEnDifficulte = 0;
        
        for (VendeurAnalyticsResponse.VendeurStats vendeur : vendeursAnalysis.getVendeurs()) {
            if ("TOP_PERFORMER".equals(vendeur.getPerformance())) {
                topPerformers++;
                if (topPerformers <= 3) {
                    insights.add(RecommandationsResponse.Insight.builder()
                        .type("SUCCESS")
                        .titre("Top vendeur: " + vendeur.getVendeurNom())
                        .message("CA de " + vendeur.getChiffreAffaires() + " DH avec " + vendeur.getNombreVentes() + " ventes. " +
                            (vendeur.getNoteMoyenne() != null ? "Note: " + String.format("%.1f", vendeur.getNoteMoyenne()) + "/5" : ""))
                        .icone("star")
                        .build());
                }
            } else if ("A_AMELIORER".equals(vendeur.getPerformance())) {
                vendeursEnDifficulte++;
                if (vendeur.getNombreVentes() < 5 && vendeur.getNombreProduits() > 3) {
                    alertes.add(RecommandationsResponse.Alerte.builder()
                        .type("PERFORMANCE")
                        .titre("Vendeur en difficulté: " + vendeur.getVendeurNom())
                        .message("Seulement " + vendeur.getNombreVentes() + " ventes malgré " + vendeur.getNombreProduits() + " produits. Proposer un accompagnement.")
                        .severite("AVERTISSEMENT")
                        .elementId(vendeur.getVendeurId())
                        .elementType("VENDEUR")
                        .build());
                }
            }
            
            // Vendeur avec croissance exceptionnelle
            if (vendeur.getTauxCroissance() != null && vendeur.getTauxCroissance() > 50) {
                insights.add(RecommandationsResponse.Insight.builder()
                    .type("SUCCESS")
                    .titre("Croissance exceptionnelle")
                    .message(vendeur.getVendeurNom() + " a une croissance de +" + String.format("%.1f", vendeur.getTauxCroissance()) + "%!")
                    .icone("rocket")
                    .build());
            }
        }

        // ========== 2. ANALYSE DES KPIs GLOBAUX ==========
        DashboardKPIResponse kpis = getKPIsAdmin(null);
        
        if (kpis.getCommandesEnAttente() > 10) {
            alertes.add(RecommandationsResponse.Alerte.builder()
                .type("PERFORMANCE")
                .titre("Commandes en attente")
                .message(kpis.getCommandesEnAttente() + " commandes sont en attente de traitement")
                .severite("AVERTISSEMENT")
                .build());
        }
        
        if (kpis.getTauxCroissanceVentes() != null) {
            if (kpis.getTauxCroissanceVentes() > 20) {
                insights.add(RecommandationsResponse.Insight.builder()
                    .type("SUCCESS")
                    .titre("Croissance globale excellente")
                    .message("La plateforme affiche une croissance de +" + String.format("%.1f", kpis.getTauxCroissanceVentes()) + "% ce mois!")
                    .icone("trending_up")
                    .build());
            } else if (kpis.getTauxCroissanceVentes() < -15) {
                alertes.add(RecommandationsResponse.Alerte.builder()
                    .type("BAISSE_VENTES")
                    .titre("Baisse des ventes significative")
                    .message("Les ventes ont diminué de " + String.format("%.1f", Math.abs(kpis.getTauxCroissanceVentes())) + "%. Actions marketing recommandées.")
                    .severite("CRITIQUE")
                    .build());
            }
        }

        // ========== 3. PRODUITS BEST-SELLERS CANDIDATS ==========
        ProduitAnalyticsResponse produitsAnalysis = getAnalyseProduits(null, null);
        
        if (produitsAnalysis.getTop10ParVentes() != null) {
            for (ProduitAnalyticsResponse.ProduitStats produit : produitsAnalysis.getTop10ParVentes().subList(0, Math.min(5, produitsAnalysis.getTop10ParVentes().size()))) {
                if (produit.getNombreVentes() >= 20 && produit.getNoteMoyenne() != null && produit.getNoteMoyenne() >= 4.0) {
                    produitsBestSeller.add(RecommandationsResponse.ProduitPotentiel.builder()
                        .vendeurProduitId(produit.getVendeurProduitId())
                        .nomProduit(produit.getTitre())
                        .categorie(produit.getCategorieNom())
                        .noteMoyenne(produit.getNoteMoyenne())
                        .nombreReviews(produit.getNombreReviews())
                        .nombreVentes(produit.getNombreVentes())
                        .raison("Best-seller potentiel: " + produit.getNombreVentes() + " ventes, note " + String.format("%.1f", produit.getNoteMoyenne()) + "/5")
                        .suggestion("Mettre en avant ce produit sur la page d'accueil et dans les campagnes marketing")
                        .build());
                }
            }
        }
        
        // Produits avec problèmes
        if (produitsAnalysis.getTousLesProduits() != null) {
            for (ProduitAnalyticsResponse.ProduitStats produit : produitsAnalysis.getTousLesProduits()) {
                if (produit.getNoteMoyenne() != null && produit.getNoteMoyenne() < 2.5 && produit.getNombreReviews() >= 5) {
                    produitsProblematiques.add(RecommandationsResponse.ProduitAmeliorer.builder()
                        .vendeurProduitId(produit.getVendeurProduitId())
                        .nomProduit(produit.getTitre())
                        .categorie(produit.getCategorieNom())
                        .noteMoyenne(produit.getNoteMoyenne())
                        .nombreVentes(produit.getNombreVentes())
                        .probleme("Note très basse (" + String.format("%.1f", produit.getNoteMoyenne()) + "/5) avec " + produit.getNombreReviews() + " avis")
                        .suggestion("Contacter le vendeur " + produit.getVendeurNom() + " pour améliorer le produit ou le retirer")
                        .build());
                }
            }
        }
        
        // Limiter les produits problématiques
        if (produitsProblematiques.size() > 5) {
            produitsProblematiques = new ArrayList<>(produitsProblematiques.subList(0, 5));
        }

        // ========== 4. ANALYSE DES CATÉGORIES ==========
        CategorieAnalyticsResponse categoriesAnalysis = getAnalyseCategories(null, null);
        
        for (CategorieAnalyticsResponse.CategorieStats cat : categoriesAnalysis.getCategories()) {
            String tendance;
            String opportunite;
            
            if (cat.getPourcentageCA() > 25) {
                tendance = "EN_HAUSSE";
                opportunite = "Catégorie dominante avec " + String.format("%.1f", cat.getPourcentageCA()) + "% du CA. Excellente performance!";
            } else if (cat.getPourcentageCA() < 5 && cat.getNombreProduits() > 10) {
                tendance = "EN_BAISSE";
                opportunite = "Catégorie sous-performante malgré " + cat.getNombreProduits() + " produits. Analyser les prix et la visibilité.";
                
                opportunites.add(RecommandationsResponse.Opportunite.builder()
                    .type("CATEGORIE")
                    .titre("Développer la catégorie " + cat.getCategorieNom())
                    .description("Cette catégorie ne représente que " + String.format("%.1f", cat.getPourcentageCA()) + "% du CA. Potentiel d'amélioration.")
                    .priorite("MOYENNE")
                    .build());
            } else {
                tendance = "STABLE";
                opportunite = "Catégorie stable avec " + String.format("%.1f", cat.getPourcentageCA()) + "% du CA.";
            }
            
            categoriesTendance.add(RecommandationsResponse.CategorieTendance.builder()
                .categorieId(cat.getCategorieId())
                .categorieNom(cat.getCategorieNom())
                .tauxCroissance(cat.getPourcentageCA())
                .tendance(tendance)
                .opportunite(opportunite)
                .build());
        }

        // ========== 5. OPPORTUNITÉS GLOBALES ==========
        if (vendeursEnDifficulte > 3) {
            opportunites.add(RecommandationsResponse.Opportunite.builder()
                .type("FORMATION")
                .titre("Programme d'accompagnement vendeurs")
                .description(vendeursEnDifficulte + " vendeurs ont des performances faibles. Proposer des formations ou du support.")
                .priorite("HAUTE")
                .build());
        }
        
        long totalVendeurs = vendeursAnalysis.getNombreVendeursActifs();
        if (totalVendeurs < 10) {
            opportunites.add(RecommandationsResponse.Opportunite.builder()
                .type("RECRUTEMENT")
                .titre("Recruter plus de vendeurs")
                .description("Seulement " + totalVendeurs + " vendeurs actifs. Augmenter la base pour diversifier l'offre.")
                .priorite("MOYENNE")
                .build());
        }

        return RecommandationsResponse.builder()
            .insights(insights)
            .alertes(alertes)
            .opportunites(opportunites)
            .produitsFortPotentiel(produitsBestSeller)
            .produitsAAmeliorer(produitsProblematiques)
            .categoriesTendance(categoriesTendance)
            .build();
    }

    // ==================== COMMANDES VENDEUR ====================

    /**
     * Récupère les commandes contenant les produits du vendeur
     * La part du vendeur = prix vendeur - prix original du produit (marge)
     * Le CA total = seulement les commandes LIVREES
     */
    public Map<String, Object> getCommandesVendeur(Long vendeurId, String statut, LocalDate dateDebut, LocalDate dateFin) {
        List<Commande> toutesLesCommandes = commandeRepository.findAllWithDetails();
        
        // Récupérer les VendeurProduits du vendeur avec leurs prix originaux
        Map<Long, VendeurProduit> vendeurProduitsMap = vendeurProduitRepository.findByVendeurId(vendeurId).stream()
            .collect(Collectors.toMap(VendeurProduit::getId, vp -> vp));
        Set<Long> vendeurProduitsIds = vendeurProduitsMap.keySet();
        
        List<Map<String, Object>> commandesVendeur = new ArrayList<>();
        BigDecimal totalCALivrees = BigDecimal.ZERO; // CA seulement pour les commandes livrées
        long totalProduits = 0;
        
        // Compteurs pour les statistiques (avant filtrage par statut)
        long enAttenteCount = 0;
        long confirmeesCount = 0;
        long livreesCount = 0;
        long annuleesCount = 0;
        
        for (Commande commande : toutesLesCommandes) {
            // Filtrer par date si spécifié
            if (dateDebut != null && commande.getDateCommande().toLocalDate().isBefore(dateDebut)) continue;
            if (dateFin != null && commande.getDateCommande().toLocalDate().isAfter(dateFin)) continue;
            
            // Trouver les lignes de commande du vendeur
            List<Map<String, Object>> lignesVendeur = new ArrayList<>();
            BigDecimal montantVendu = BigDecimal.ZERO; // Ce que le client a payé pour les produits du vendeur
            BigDecimal margeVendeur = BigDecimal.ZERO; // La part du vendeur (marge)
            
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (vendeurProduitsIds.contains(ligne.getVendeurProduit().getId())) {
                    VendeurProduit vp = vendeurProduitsMap.get(ligne.getVendeurProduit().getId());
                    BigDecimal prixOriginal = vp.getProduit().getPrix();
                    BigDecimal prixVendeur = ligne.getPrixUnitaire();
                    
                    // Marge par unité = prix vendeur - prix original
                    BigDecimal margeUnitaire = prixVendeur.subtract(prixOriginal);
                    BigDecimal margeLigne = margeUnitaire.multiply(BigDecimal.valueOf(ligne.getQuantite()));
                    
                    Map<String, Object> ligneMap = new HashMap<>();
                    ligneMap.put("id", ligne.getId());
                    ligneMap.put("produitNom", ligne.getVendeurProduit().getTitre());
                    ligneMap.put("produitImage", ligne.getVendeurProduit().getImage());
                    ligneMap.put("quantite", ligne.getQuantite());
                    ligneMap.put("prixOriginal", prixOriginal);
                    ligneMap.put("prixVendeur", prixVendeur);
                    ligneMap.put("margeUnitaire", margeUnitaire);
                    ligneMap.put("sousTotal", ligne.getSousTotal());
                    ligneMap.put("margeLigne", margeLigne);
                    
                    lignesVendeur.add(ligneMap);
                    montantVendu = montantVendu.add(ligne.getSousTotal());
                    margeVendeur = margeVendeur.add(margeLigne);
                    totalProduits += ligne.getQuantite();
                }
            }
            
            // Si cette commande contient des produits du vendeur
            if (!lignesVendeur.isEmpty()) {
                // Compter les statistiques (avant filtrage par statut URL)
                switch (commande.getStatut()) {
                    case EN_ATTENTE: enAttenteCount++; break;
                    case CONFIRMEE: confirmeesCount++; break;
                    case LIVREE: 
                        livreesCount++; 
                        // CA seulement pour les commandes livrées
                        totalCALivrees = totalCALivrees.add(margeVendeur);
                        break;
                    case ANNULEE: annuleesCount++; break;
                }
                
                // Appliquer le filtre par statut pour l'affichage
                if (statut != null && !statut.isEmpty()) {
                    try {
                        Commande.StatutCommande statutEnum = Commande.StatutCommande.valueOf(statut);
                        if (commande.getStatut() != statutEnum) continue;
                    } catch (IllegalArgumentException e) {
                        // Ignorer le filtre si statut invalide
                    }
                }
                
                Map<String, Object> commandeMap = new HashMap<>();
                commandeMap.put("id", commande.getId());
                commandeMap.put("clientNom", commande.getClient().getNom());
                commandeMap.put("clientEmail", commande.getClient().getEmail());
                commandeMap.put("adresseLivraison", commande.getClient().getAdresseLivraison());
                commandeMap.put("dateCommande", commande.getDateCommande());
                commandeMap.put("statut", commande.getStatut().name());
                commandeMap.put("montantVendu", montantVendu); // Ce que le client a payé
                commandeMap.put("margeVendeur", margeVendeur); // La part du vendeur (marge)
                commandeMap.put("montantTotal", commande.getMontantTotal());
                commandeMap.put("lignesCommande", lignesVendeur);
                commandeMap.put("nombreProduits", lignesVendeur.size());
                
                commandesVendeur.add(commandeMap);
            }
        }
        
        // Trier par date décroissante
        commandesVendeur.sort((a, b) -> {
            LocalDateTime dateA = (LocalDateTime) a.get("dateCommande");
            LocalDateTime dateB = (LocalDateTime) b.get("dateCommande");
            return dateB.compareTo(dateA);
        });
        
        Map<String, Object> result = new HashMap<>();
        result.put("commandes", commandesVendeur);
        result.put("totalCommandes", enAttenteCount + confirmeesCount + livreesCount + annuleesCount);
        result.put("totalCA", totalCALivrees); // CA = seulement commandes livrées
        result.put("totalProduits", totalProduits);
        result.put("enAttente", enAttenteCount);
        result.put("confirmees", confirmeesCount);
        result.put("livrees", livreesCount);
        result.put("annulees", annuleesCount);
        
        return result;
    }

    // ==================== EXPORT ====================

    /**
     * Prépare les données pour l'export
     */
    public ExportDataResponse prepareExport(Long vendeurId, AnalyticsFilterRequest filter) {
        DashboardKPIResponse kpis = vendeurId != null 
            ? getKPIsVendeur(vendeurId, filter) 
            : getKPIsAdmin(filter);
        
        ProduitAnalyticsResponse produits = getAnalyseProduits(vendeurId, filter);
        CategorieAnalyticsResponse categories = getAnalyseCategories(vendeurId, filter);

        // Générer un résumé analytique
        StringBuilder resume = new StringBuilder();
        resume.append("Rapport analytique généré le ").append(LocalDateTime.now()).append("\n\n");
        resume.append("RÉSUMÉ DES PERFORMANCES\n");
        resume.append("=======================\n");
        resume.append("Chiffre d'affaires total: ").append(kpis.getChiffreAffairesTotal()).append(" DH\n");
        resume.append("Nombre de ventes: ").append(kpis.getNombreTotalVentes()).append("\n");
        resume.append("Produits vendus: ").append(kpis.getNombreProduitsVendus()).append("\n");
        resume.append("Note moyenne: ").append(kpis.getNoteMoyenneGlobale() != null ? String.format("%.2f", kpis.getNoteMoyenneGlobale()) : "N/A").append("/5\n");
        
        if (kpis.getTauxCroissanceVentes() != null) {
            resume.append("Croissance: ").append(kpis.getTauxCroissanceVentes() >= 0 ? "+" : "")
                .append(String.format("%.1f", kpis.getTauxCroissanceVentes())).append("%\n");
        }

        return ExportDataResponse.builder()
            .dateExport(LocalDateTime.now())
            .roleUtilisateur(vendeurId != null ? "VENDEUR" : "ADMIN")
            .utilisateurId(vendeurId)
            .filtresAppliques(filter)
            .kpis(kpis)
            .produits(produits.getTousLesProduits())
            .categories(categories.getCategories())
            .resumeAnalytique(resume.toString())
            .build();
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private DashboardKPIResponse.ProduitPerformance buildProduitPerformance(Long vendeurProduitId, List<LigneCommande> lignes) {
        VendeurProduit vp = vendeurProduitRepository.findById(vendeurProduitId).orElse(null);
        if (vp == null) return null;

        long nbVentes = lignes.stream()
            .filter(l -> l.getVendeurProduit().getId().equals(vendeurProduitId))
            .mapToLong(LigneCommande::getQuantite)
            .sum();
        
        BigDecimal ca = lignes.stream()
            .filter(l -> l.getVendeurProduit().getId().equals(vendeurProduitId))
            .map(LigneCommande::getSousTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double noteMoyenne = avisRepository.getAverageNoteByVendeurProduitId(vendeurProduitId);
        Long nbReviews = avisRepository.countByVendeurProduitId(vendeurProduitId);

        return DashboardKPIResponse.ProduitPerformance.builder()
            .vendeurProduitId(vendeurProduitId)
            .nomProduit(vp.getTitre())
            .categorie(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getNom() : "N/A")
            .nombreVentes(nbVentes)
            .chiffreAffaires(ca)
            .noteMoyenne(noteMoyenne)
            .nombreReviews(nbReviews != null ? nbReviews : 0L)
            .image(vp.getImage())
            .vendeurNom(vp.getVendeur().getNom())
            .build();
    }

    private DashboardKPIResponse.ProduitPerformance findProduitMieuxNote(Long vendeurId, AnalyticsFilterRequest filter) {
        List<VendeurProduit> produits = vendeurId != null 
            ? vendeurProduitRepository.findByVendeurId(vendeurId)
            : vendeurProduitRepository.findAll();

        VendeurProduit meilleur = null;
        Double meilleureNote = 0.0;
        Long nbReviewsMeilleur = 0L;

        for (VendeurProduit vp : produits) {
            Double note = avisRepository.getAverageNoteByVendeurProduitId(vp.getId());
            Long nbReviews = avisRepository.countByVendeurProduitId(vp.getId());
            
            if (note != null && nbReviews != null && nbReviews >= 1) {
                // Score pondéré: note * log(nbReviews + 1)
                double scoreActuel = note * Math.log(nbReviews + 1);
                double scoreMeilleur = meilleureNote * Math.log(nbReviewsMeilleur + 1);
                
                if (scoreActuel > scoreMeilleur) {
                    meilleur = vp;
                    meilleureNote = note;
                    nbReviewsMeilleur = nbReviews;
                }
            }
        }

        if (meilleur == null) return null;

        return DashboardKPIResponse.ProduitPerformance.builder()
            .vendeurProduitId(meilleur.getId())
            .nomProduit(meilleur.getTitre())
            .categorie(meilleur.getProduit().getCategorie() != null ? meilleur.getProduit().getCategorie().getNom() : "N/A")
            .noteMoyenne(meilleureNote)
            .nombreReviews(nbReviewsMeilleur)
            .image(meilleur.getImage())
            .vendeurNom(meilleur.getVendeur().getNom())
            .build();
    }

    private Double calculateTauxCroissance(LocalDate debutPrec, LocalDate finPrec, LocalDate debut, LocalDate fin, Long vendeurId) {
        BigDecimal caPrecedent = calculateCAPeriode(debutPrec, finPrec, vendeurId, null);
        BigDecimal caActuel = calculateCAPeriode(debut, fin, vendeurId, null);

        if (caPrecedent.compareTo(BigDecimal.ZERO) == 0) {
            return caActuel.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        return caActuel.subtract(caPrecedent)
            .multiply(BigDecimal.valueOf(100))
            .divide(caPrecedent, 2, RoundingMode.HALF_UP)
            .doubleValue();
    }

    private BigDecimal calculateCAPeriode(LocalDate debut, LocalDate fin, Long vendeurId, AnalyticsFilterRequest filter) {
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        
        BigDecimal total = BigDecimal.ZERO;
        for (Commande commande : commandes) {
            if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
            if (commande.getDateCommande().toLocalDate().isBefore(debut)) continue;
            if (commande.getDateCommande().toLocalDate().isAfter(fin)) continue;
            
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (vendeurId == null || ligne.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
                    total = total.add(ligne.getSousTotal());
                }
            }
        }
        return total;
    }

    private long calculateNombreVentesPeriode(LocalDate debut, LocalDate fin, Long vendeurId) {
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        
        return commandes.stream()
            .filter(c -> c.getStatut() != Commande.StatutCommande.ANNULEE)
            .filter(c -> !c.getDateCommande().toLocalDate().isBefore(debut))
            .filter(c -> !c.getDateCommande().toLocalDate().isAfter(fin))
            .filter(c -> vendeurId == null || c.getLignesCommande().stream()
                .anyMatch(l -> l.getVendeurProduit().getVendeur().getId().equals(vendeurId)))
            .count();
    }

    private long countReviews(Long vendeurId) {
        if (vendeurId != null) {
            return avisRepository.findByVendeurId(vendeurId).size();
        }
        return avisRepository.count();
    }

    private long countReviewsVendeur(Long vendeurId) {
        return avisRepository.findByVendeurId(vendeurId).size();
    }

    private Double calculateNoteMoyenneGlobale(Long vendeurId) {
        List<VendeurProduit> produits = vendeurId != null 
            ? vendeurProduitRepository.findByVendeurId(vendeurId)
            : vendeurProduitRepository.findAll();

        double totalNotes = 0;
        long totalReviews = 0;

        for (VendeurProduit vp : produits) {
            Double note = avisRepository.getAverageNoteByVendeurProduitId(vp.getId());
            Long nbReviews = avisRepository.countByVendeurProduitId(vp.getId());
            
            if (note != null && nbReviews != null && nbReviews > 0) {
                totalNotes += note * nbReviews;
                totalReviews += nbReviews;
            }
        }

        return totalReviews > 0 ? totalNotes / totalReviews : null;
    }

    private Double calculateNoteMoyenneCategorie(Long categorieId, Long vendeurId) {
        List<VendeurProduit> produits = vendeurId != null 
            ? vendeurProduitRepository.findByVendeurId(vendeurId)
            : vendeurProduitRepository.findAll();

        double totalNotes = 0;
        long totalReviews = 0;

        for (VendeurProduit vp : produits) {
            if (vp.getProduit().getCategorie() == null || !vp.getProduit().getCategorie().getId().equals(categorieId)) {
                continue;
            }
            
            Double note = avisRepository.getAverageNoteByVendeurProduitId(vp.getId());
            Long nbReviews = avisRepository.countByVendeurProduitId(vp.getId());
            
            if (note != null && nbReviews != null && nbReviews > 0) {
                totalNotes += note * nbReviews;
                totalReviews += nbReviews;
            }
        }

        return totalReviews > 0 ? totalNotes / totalReviews : null;
    }

    private Double calculateNoteMoyenneVendeur(Long vendeurId) {
        return calculateNoteMoyenneGlobale(vendeurId);
    }

    private long countVentesProduit(Long vendeurProduitId) {
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        
        return commandes.stream()
            .filter(c -> c.getStatut() != Commande.StatutCommande.ANNULEE)
            .flatMap(c -> c.getLignesCommande().stream())
            .filter(l -> l.getVendeurProduit().getId().equals(vendeurProduitId))
            .mapToLong(LigneCommande::getQuantite)
            .sum();
    }

    private Map<String, List<LigneCommande>> groupByPeriode(List<LigneCommande> lignes, String typePeriode, List<Commande> commandes) {
        Map<String, List<LigneCommande>> result = new HashMap<>();
        
        // Créer une map des commandes par ID pour accès rapide
        Map<Long, Commande> commandesMap = commandes.stream()
            .collect(Collectors.toMap(Commande::getId, c -> c));

        for (LigneCommande ligne : lignes) {
            Commande commande = commandesMap.get(ligne.getCommande().getId());
            if (commande == null) continue;
            
            LocalDateTime date = commande.getDateCommande();
            String key;
            
            switch (typePeriode) {
                case "SEMAINE":
                    int week = date.get(WeekFields.ISO.weekOfWeekBasedYear());
                    key = "S" + week + " " + date.getYear();
                    break;
                case "MOIS":
                    key = date.getMonth().toString().substring(0, 3) + " " + date.getYear();
                    break;
                default: // JOUR
                    key = date.toLocalDate().toString();
            }
            
            result.computeIfAbsent(key, k -> new ArrayList<>()).add(ligne);
        }
        
        return result;
    }

    private List<VentesTendanceResponse.PointVente> getPointsComparaison(Long vendeurId, LocalDate debut, LocalDate fin, String typePeriode, List<Commande> commandes) {
        List<LigneCommande> lignesFiltrees = new ArrayList<>();
        
        for (Commande commande : commandes) {
            if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
            if (commande.getDateCommande().toLocalDate().isBefore(debut)) continue;
            if (commande.getDateCommande().toLocalDate().isAfter(fin)) continue;
            
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (vendeurId == null || ligne.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
                    lignesFiltrees.add(ligne);
                }
            }
        }

        Map<String, List<LigneCommande>> lignesParPeriode = groupByPeriode(lignesFiltrees, typePeriode, commandes);
        List<VentesTendanceResponse.PointVente> points = new ArrayList<>();

        for (Map.Entry<String, List<LigneCommande>> entry : lignesParPeriode.entrySet()) {
            List<LigneCommande> lignes = entry.getValue();
            BigDecimal ca = lignes.stream()
                .map(LigneCommande::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            long nbProduits = lignes.stream().mapToLong(LigneCommande::getQuantite).sum();
            long nbVentes = lignes.stream().map(l -> l.getCommande().getId()).distinct().count();
            
            points.add(VentesTendanceResponse.PointVente.builder()
                .periode(entry.getKey())
                .chiffreAffaires(ca)
                .nombreVentes(nbVentes)
                .nombreProduits(nbProduits)
                .build());
        }

        return points;
    }

    private ProduitAnalyticsResponse.ProduitStats buildProduitStats(VendeurProduit vp, AnalyticsFilterRequest filter) {
        Double noteMoyenne = avisRepository.getAverageNoteByVendeurProduitId(vp.getId());
        Long nbReviews = avisRepository.countByVendeurProduitId(vp.getId());
        long nbVentes = countVentesProduit(vp.getId());
        
        // Calculer le CA du produit
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        BigDecimal ca = BigDecimal.ZERO;
        
        for (Commande commande : commandes) {
            if (commande.getStatut() == Commande.StatutCommande.ANNULEE) continue;
            
            // Appliquer filtre de date si présent
            if (filter != null && filter.getDateDebut() != null && commande.getDateCommande().toLocalDate().isBefore(filter.getDateDebut())) {
                continue;
            }
            if (filter != null && filter.getDateFin() != null && commande.getDateCommande().toLocalDate().isAfter(filter.getDateFin())) {
                continue;
            }
            
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (ligne.getVendeurProduit().getId().equals(vp.getId())) {
                    ca = ca.add(ligne.getSousTotal());
                }
            }
        }

        // Déterminer le statut de croissance
        String statut = "STABLE";
        Double tauxCroissance = 0.0;

        return ProduitAnalyticsResponse.ProduitStats.builder()
            .vendeurProduitId(vp.getId())
            .nomProduit(vp.getProduit().getNom())
            .titre(vp.getTitre())
            .image(vp.getImage())
            .categorieId(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getId() : null)
            .categorieNom(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getNom() : "N/A")
            .vendeurId(vp.getVendeur().getId())
            .vendeurNom(vp.getVendeur().getNom())
            .prixVendeur(vp.getPrixVendeur())
            .prixOriginal(vp.getProduit().getPrix())
            .nombreVentes(nbVentes)
            .chiffreAffaires(ca)
            .noteMoyenne(noteMoyenne)
            .nombreReviews(nbReviews != null ? nbReviews : 0L)
            .quantiteStock(vp.getProduit().getQuantite())
            .statut(statut)
            .tauxCroissance(tauxCroissance)
            .estApprouve(vp.isEstApprouve())
            .build();
    }

    private Comparator<ProduitAnalyticsResponse.ProduitStats> getComparatorForProduits(String triPar) {
        switch (triPar) {
            case "CA":
                return Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getChiffreAffaires, Comparator.nullsLast(Comparator.reverseOrder()));
            case "NOTE":
                return Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getNoteMoyenne, Comparator.nullsLast(Comparator.reverseOrder()));
            case "PRIX":
                return Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getPrixVendeur, Comparator.nullsLast(Comparator.reverseOrder()));
            case "NOM":
                return Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getNomProduit, Comparator.nullsLast(Comparator.naturalOrder()));
            default: // VENTES
                return Comparator.comparing(ProduitAnalyticsResponse.ProduitStats::getNombreVentes, Comparator.nullsLast(Comparator.reverseOrder()));
        }
    }

    private String determinePerformanceCategorie(double pourcentageCA, Double noteMoyenne, long ventes) {
        if (pourcentageCA >= 20 && (noteMoyenne == null || noteMoyenne >= 4.0)) {
            return "PERFORMANT";
        } else if (noteMoyenne != null && noteMoyenne >= 4.0 && pourcentageCA < 10) {
            return "FORT_POTENTIEL";
        } else if (pourcentageCA < 5 && ventes < 10) {
            return "SOUS_EXPLOITE";
        }
        return "STABLE";
    }

    private String determinePerformanceVendeur(BigDecimal ca, long ventes, Double noteMoyenne) {
        if (ca.compareTo(BigDecimal.valueOf(10000)) >= 0 && (noteMoyenne == null || noteMoyenne >= 4.0)) {
            return "TOP_PERFORMER";
        } else if (ca.compareTo(BigDecimal.valueOf(5000)) >= 0) {
            return "PERFORMANT";
        } else if (ca.compareTo(BigDecimal.valueOf(1000)) >= 0) {
            return "MOYEN";
        }
        return "A_AMELIORER";
    }
}
