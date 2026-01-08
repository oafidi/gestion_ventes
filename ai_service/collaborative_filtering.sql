use affiliate_sales_db;


-- get_collab_filtered_data
SELECT 
    co.client_id,
    ca.nom AS categorie,
    SUM(lc.quantite) AS score
FROM lignes_commande lc
INNER JOIN commandes co 
    ON lc.commande_id = co.id
INNER JOIN vendeur_produits vp
    ON lc.vendeur_produit_id = vp.id
INNER JOIN produits pr
    ON pr.id = vp.produit_id
INNER JOIN categories ca
    ON pr.categorie_id = ca.id
GROUP BY co.client_id, ca.nom;


-- recommend products offres
SELECT DISTINCT vp.id, vp.titre  
FROM lignes_commande lc
INNER JOIN commandes co 
    ON lc.commande_id = co.id
INNER JOIN vendeur_produits vp
    ON vp.id = lc.vendeur_produit_id
WHERE co.client_id in (6, 8) -- his similar clients
AND NOT EXISTS (
    SELECT 1
    FROM lignes_commande lc2
    INNER JOIN commandes co2 
        ON lc2.commande_id = co2.id
    WHERE co2.client_id = 5 -- our client
    AND lc2.vendeur_produit_id = vp.id
);

-- check if our client have already a commande
SELECT count(*) as total
FROM commandes
WHERE client_id = 5;