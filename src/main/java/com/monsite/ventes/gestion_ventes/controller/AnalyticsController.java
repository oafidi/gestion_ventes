package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.analytics.*;
import com.monsite.ventes.gestion_ventes.entity.Admin;
import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import com.monsite.ventes.gestion_ventes.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Contrôleur REST pour les fonctionnalités d'analytics et dashboard
 * Gère les accès selon le rôle (ADMIN/VENDEUR)
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // ==================== ENDPOINTS ADMIN ====================

    /**
     * Récupère les KPIs globaux pour l'admin
     */
    @GetMapping("/admin/kpis")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardKPIResponse> getKPIsAdmin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) Long vendeurId) {
        
        logger.info("GET /api/analytics/admin/kpis - dateDebut: {}, dateFin: {}", dateDebut, dateFin);
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .categorieId(categorieId)
            .vendeurId(vendeurId)
            .build();
        
        return ResponseEntity.ok(analyticsService.getKPIsAdmin(filter));
    }

    /**
     * Récupère les tendances de ventes globales pour l'admin
     */
    @GetMapping("/admin/tendances")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VentesTendanceResponse> getTendancesAdmin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false, defaultValue = "JOUR") String typePeriode,
            @RequestParam(required = false) Long vendeurId) {
        
        logger.info("GET /api/analytics/admin/tendances - type: {}", typePeriode);
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .typePeriode(typePeriode)
            .build();
        
        return ResponseEntity.ok(analyticsService.getTendancesVentes(vendeurId, filter));
    }

    /**
     * Récupère l'analyse des produits pour l'admin
     */
    @GetMapping("/admin/produits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProduitAnalyticsResponse> getProduitsAdmin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) Long vendeurId,
            @RequestParam(required = false) BigDecimal prixMin,
            @RequestParam(required = false) BigDecimal prixMax,
            @RequestParam(required = false) Double noteMinimale,
            @RequestParam(required = false) String triPar,
            @RequestParam(required = false) String ordre,
            @RequestParam(required = false) Boolean estApprouve) {
        
        logger.info("GET /api/analytics/admin/produits");
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .categorieId(categorieId)
            .vendeurId(vendeurId)
            .prixMin(prixMin)
            .prixMax(prixMax)
            .noteMinimale(noteMinimale)
            .triPar(triPar)
            .ordreTriger(ordre)
            .estApprouve(estApprouve)
            .build();
        
        return ResponseEntity.ok(analyticsService.getAnalyseProduits(vendeurId, filter));
    }

    /**
     * Récupère l'analyse des catégories pour l'admin
     */
    @GetMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieAnalyticsResponse> getCategoriesAdmin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long vendeurId) {
        
        logger.info("GET /api/analytics/admin/categories");
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .build();
        
        return ResponseEntity.ok(analyticsService.getAnalyseCategories(vendeurId, filter));
    }

    /**
     * Récupère l'analyse des vendeurs (ADMIN uniquement)
     */
    @GetMapping("/admin/vendeurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VendeurAnalyticsResponse> getVendeursAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        logger.info("GET /api/analytics/admin/vendeurs");
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .build();
        
        return ResponseEntity.ok(analyticsService.getAnalyseVendeurs(filter));
    }

    /**
     * Récupère les recommandations pour l'admin
     */
    @GetMapping("/admin/recommandations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecommandationsResponse> getRecommandationsAdmin() {
        logger.info("GET /api/analytics/admin/recommandations");
        return ResponseEntity.ok(analyticsService.getRecommandationsAdmin());
    }

    /**
     * Prépare l'export des données pour l'admin
     */
    @GetMapping("/admin/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExportDataResponse> exportAdmin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) Long vendeurId) {
        
        logger.info("GET /api/analytics/admin/export");
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .categorieId(categorieId)
            .vendeurId(vendeurId)
            .build();
        
        return ResponseEntity.ok(analyticsService.prepareExport(vendeurId, filter));
    }

    // ==================== ENDPOINTS VENDEUR ====================

    /**
     * Récupère les KPIs personnalisés pour le vendeur connecté
     */
    @GetMapping("/vendeur/kpis")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<DashboardKPIResponse> getKPIsVendeur(
            @AuthenticationPrincipal Vendeur vendeur,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long categorieId) {
        
        logger.info("GET /api/analytics/vendeur/kpis - vendeurId: {}", vendeur.getId());
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .categorieId(categorieId)
            .build();
        
        return ResponseEntity.ok(analyticsService.getKPIsVendeur(vendeur.getId(), filter));
    }

    /**
     * Récupère les tendances de ventes pour le vendeur connecté
     */
    @GetMapping("/vendeur/tendances")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<VentesTendanceResponse> getTendancesVendeur(
            @AuthenticationPrincipal Vendeur vendeur,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false, defaultValue = "JOUR") String typePeriode) {
        
        logger.info("GET /api/analytics/vendeur/tendances - vendeurId: {}", vendeur.getId());
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .typePeriode(typePeriode)
            .build();
        
        return ResponseEntity.ok(analyticsService.getTendancesVentes(vendeur.getId(), filter));
    }

    /**
     * Récupère l'analyse des produits du vendeur connecté
     */
    @GetMapping("/vendeur/produits")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<ProduitAnalyticsResponse> getProduitsVendeur(
            @AuthenticationPrincipal Vendeur vendeur,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) BigDecimal prixMin,
            @RequestParam(required = false) BigDecimal prixMax,
            @RequestParam(required = false) Double noteMinimale,
            @RequestParam(required = false) String triPar,
            @RequestParam(required = false) String ordre,
            @RequestParam(required = false) Boolean estApprouve) {
        
        logger.info("GET /api/analytics/vendeur/produits - vendeurId: {}", vendeur.getId());
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .categorieId(categorieId)
            .prixMin(prixMin)
            .prixMax(prixMax)
            .noteMinimale(noteMinimale)
            .triPar(triPar)
            .ordreTriger(ordre)
            .estApprouve(estApprouve)
            .build();
        
        return ResponseEntity.ok(analyticsService.getAnalyseProduits(vendeur.getId(), filter));
    }

    /**
     * Récupère l'analyse des catégories pour le vendeur connecté
     */
    @GetMapping("/vendeur/categories")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<CategorieAnalyticsResponse> getCategoriesVendeur(
            @AuthenticationPrincipal Vendeur vendeur,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        logger.info("GET /api/analytics/vendeur/categories - vendeurId: {}", vendeur.getId());
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .build();
        
        return ResponseEntity.ok(analyticsService.getAnalyseCategories(vendeur.getId(), filter));
    }

    /**
     * Récupère les recommandations intelligentes pour le vendeur connecté
     */
    @GetMapping("/vendeur/recommandations")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<RecommandationsResponse> getRecommandationsVendeur(
            @AuthenticationPrincipal Vendeur vendeur) {
        
        logger.info("GET /api/analytics/vendeur/recommandations - vendeurId: {}", vendeur.getId());
        return ResponseEntity.ok(analyticsService.getRecommandationsVendeur(vendeur.getId()));
    }

    /**
     * Récupère les commandes du vendeur connecté (commandes contenant ses produits)
     */
    @GetMapping("/vendeur/commandes")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> getCommandesVendeur(
            @AuthenticationPrincipal Vendeur vendeur,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        logger.info("GET /api/analytics/vendeur/commandes - vendeurId: {}", vendeur.getId());
        return ResponseEntity.ok(analyticsService.getCommandesVendeur(vendeur.getId(), statut, dateDebut, dateFin));
    }

    /**
     * Prépare l'export des données pour le vendeur connecté
     */
    @GetMapping("/vendeur/export")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<ExportDataResponse> exportVendeur(
            @AuthenticationPrincipal Vendeur vendeur,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long categorieId) {
        
        logger.info("GET /api/analytics/vendeur/export - vendeurId: {}", vendeur.getId());
        
        AnalyticsFilterRequest filter = AnalyticsFilterRequest.builder()
            .dateDebut(dateDebut)
            .dateFin(dateFin)
            .categorieId(categorieId)
            .build();
        
        return ResponseEntity.ok(analyticsService.prepareExport(vendeur.getId(), filter));
    }
}
