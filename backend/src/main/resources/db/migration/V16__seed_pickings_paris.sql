-- Paris / Île-de-France cueillettes (CSV import): enrich V9 rows + insert new farms.
-- Adds phone_secondary for a second number (fixe + mobile) when both are known.
--
-- Omitted as duplicate inserts (already in V9); updated below instead:
--   Lumigny, Servigny, Gally, Viltain, Chanteloup, Torfou, La Grange, Rutel, Cergy.
-- New vs V9: La Ferme du Logis, Cueillette de Voisenon.

ALTER TABLE pickings ADD COLUMN phone_secondary VARCHAR(50);

-- Enrich existing rows (matched by website).
UPDATE pickings SET
    name = 'Cueillette du Plessis à Lumigny',
    address = 'Route de Lumigny, D20, 77540 Lumigny',
    postal_code = '77540',
    city = 'Lumigny',
    website = 'https://www.cueillettedelumigny.fr/',
    lat = 48.725682,
    lng = 2.954233,
    email = 'info@cueillettedelumigny.fr',
    phone = '+33164429405',
    phone_secondary = NULL,
    description = 'L''accès à la cueillette est possible pour les familles (cellule familiale du foyer)',
    opening_hours = 'Lundi Fermé; Mardi-vendredi 9h-12h30 14h-19h; Samedi 9h-19h; Dimanche 9h-19h'
WHERE website ILIKE '%cueillettedelumigny.fr%';

UPDATE pickings SET
    lat = 48.609261,
    lng = 2.551538,
    opening_hours = 'Lundi 14h30-18h30; Mardi-samedi 9h15-12h30 14h30-18h30; Dimanche Fermé'
WHERE website ILIKE '%cueillettedeservigny.fr%';

-- CSV ligne fixe + mobile issu de l''ancien seed V9
UPDATE pickings SET
    address = 'RD7, Route de St Cyr l''Ecole, 78870 Bailly',
    phone = '+33139633090',
    phone_secondary = '+33639633090',
    opening_hours = 'Lundi 13h30-18h; Mardi-samedi 10h-18h; Dimanche 10h-13h'
WHERE website ILIKE '%cueillettedegally.com%';

UPDATE pickings SET
    address = 'Chemin de Viltain, 78350 Jouy-en-Josas',
    city = 'Jouy-en-Josas',
    lat = 48.75098,
    lng = 2.165736,
    email = 'contact@cueillettedeviltain.fr',
    opening_hours = 'Lundi Fermé; Mardi-samedi 9h-19h; Dimanche Fermé'
WHERE website ILIKE '%cueillettedeviltain.fr%';

-- Deux numéros distincts (CSV vs ancien V9)
UPDATE pickings SET
    name = 'Cueillette du Plessis à Chanteloup',
    address = 'Rue de la Cueillette, 77600 Chanteloup-en-Brie',
    city = 'Chanteloup-en-Brie',
    phone = '+33160032724',
    phone_secondary = '+33160316086',
    opening_hours = 'Lundi Fermé; Mardi-vendredi 9h30-12h30 14h-19h; Samedi 9h30-19h; Dimanche 9h30-12h30'
WHERE website ILIKE '%cueillettedechanteloup.fr%';

UPDATE pickings SET
    opening_hours = 'Lundi 9h30-12h30 14h-18h; Mardi 14h-18h; Mercredi-vendredi 9h30-12h30 14h-18h; Samedi 9h30-12h30 14h-18h; Dimanche 9h30-12h30'
WHERE website ILIKE '%cueillettedetorfou.fr%';

UPDATE pickings SET
    opening_hours = 'Lundi-dimanche 9h-19h'
WHERE website ILIKE '%cueillettedelagrange.fr%';

UPDATE pickings SET
    address = 'Rocade Ouest de Meaux, 77124 Villenoy',
    opening_hours = 'Lundi 14h30-19h; Mardi 9h30-12h30 14h30-19h; Mercredi-vendredi 9h30-12h30 14h30-19h; Samedi 9h30-19h; Dimanche 9h30-12h30',
    description = 'L''accès à la cueillette est possible pour les familles (cellule familiale du foyer)'
WHERE website ILIKE '%cueillettederutel.fr%';

UPDATE pickings SET
    address = 'Route de Courcelles, A15 Sortie n°13, 95650 Puiseux-Pontoise',
    opening_hours = 'Lundi 14h-18h30; Mardi-samedi 9h30-18h30; Dimanche 9h30-13h'
WHERE website ILIKE '%cueillettedecergy.fr%';

INSERT INTO pickings (name, address, postal_code, city, website, lat, lng, email, phone, phone_secondary, description, opening_hours) VALUES
(
    'La Ferme du Logis',
    'Lieu-dit Le Logis, 78580 Jumeauville',
    '78580',
    'Jumeauville',
    'https://lafermedulogis.com/',
    48.904278,
    1.791886,
    'contact@lafermedulogis.com',
    '+33130426127',
    NULL,
    'La cueillette est ouverte au public',
    'Lundi Fermé; Mardi-vendredi 9h-12h30 14h30-18h; Samedi 9h-12h30 14h30-18h; Dimanche Fermé'
),
(
    'Cueillette de Voisenon',
    '51 Rue des Écoles, 77950 Voisenon',
    '77950',
    'Voisenon',
    'https://cueillette-de-voisenon77.fr/',
    48.575801,
    2.664272,
    'contact@cueillette-de-voisenon77.fr',
    '+33164380746',
    NULL,
    'La cueillette est ouverte au public',
    'Lundi-mardi Fermé; Mercredi-vendredi 9h-12h 14h30-19h; Samedi 9h-12h 14h30-18h30; Dimanche Fermé'
);
