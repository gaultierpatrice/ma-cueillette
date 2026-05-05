-- Seed reviews data
-- This assumes at least one user exists in the database
-- Reviews will be created for pickings 1-35, one review each

-- First, we'll insert reviews using the first user in the database
-- If you have multiple users, feel free to adjust the user_id references

INSERT INTO reviews (rating, comment, published_at, user_id, picking_id)
SELECT 
    (ARRAY[3, 4, 5])[floor(random() * 3 + 1)],
    (ARRAY[
        'Excellente expérience ! Les produits sont frais et de qualité.',
        'Très bon accueil, je recommande vivement.',
        'Super cueillette en famille, les enfants ont adoré !',
        'Fruits et légumes délicieux, on reviendra.',
        'Cadre magnifique et produits bio de qualité.',
        'Un peu cher mais la qualité est au rendez-vous.',
        'Belle découverte, équipe sympathique.',
        'Parfait pour une sortie en famille le weekend.',
        'Produits frais et savoureux, exactement ce que je cherchais.',
        'Très satisfait de ma visite, lieu agréable.',
        'Bonne sélection de produits, je reviendrai.',
        'Ambiance conviviale, personnel accueillant.',
        'Top ! Meilleure cueillette de la région.',
        'Bien organisé et produits de saison variés.',
        'Expérience authentique à la ferme.',
        'Les fraises sont excellentes !',
        'Prix corrects et produits de qualité.',
        'Très bon rapport qualité-prix.',
        'Belle initiative locale, à soutenir.',
        'Parking pratique et accès facile.',
        'Idéal pour découvrir les produits locaux.',
        'Cueillette ludique, activité sympa.',
        'Produits bio certifiés, vraiment top.',
        'On sent la passion du producteur.',
        'Fraîcheur garantie, cueilli le jour même.',
        'Sortie agréable en pleine nature.',
        'Grand choix de légumes de saison.',
        'Personnel très serviable et de bon conseil.',
        'Belle expérience champêtre.',
        'Qualité irréprochable, je recommande.',
        'Très bonne adresse pour du local.',
        'Ambiance familiale et chaleureuse.',
        'Les produits ont du goût, un vrai plaisir !',
        'Cueillette bien entretenue et propre.',
        'Parfait pour les amateurs de produits frais.'
    ])[floor(random() * 35 + 1)],
    NOW() - (random() * interval '60 days'),
    (SELECT id FROM users ORDER BY subscription_date LIMIT 1),
    picking_id
FROM generate_series(1, 35) AS picking_id;
