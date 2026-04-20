import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMenuByRestaurant, getRestaurantById } from "../../api/userApi";

// ── MOCK RESTAURANTS ──
const mockRestaurants = {
    1: { name: "Mechmecha", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800", rating: 97, reviews: 850, time: "5-15 min", delivery: "Free", address: "La Marsa, Tunis" },
    2: { name: "Papillon", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c2?w=800", rating: 94, reviews: 620, time: "10-20 min", delivery: "2 DT", address: "Ennasr, Tunis" },
    3: { name: "KFC Tunisia", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800", rating: 91, reviews: 1500, time: "10-25 min", delivery: "Free", address: "Habib Bourguiba, Tunis" },
    4: { name: "Holy Moly", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800", rating: 92, reviews: 320, time: "15-25 min", delivery: "3 DT", address: "Habib Bourguiba, Tunis" },
    5: { name: "Jwajem Hachicha", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800", rating: 98, reviews: 2100, time: "5-15 min", delivery: "Free", address: "Médina, Tunis" },
    6: { name: "Ci Gusta", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800", rating: 95, reviews: 780, time: "10-20 min", delivery: "2 DT", address: "Les Berges du Lac, Tunis" },
    7: { name: "Côté Régale", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800", rating: 94, reviews: 430, time: "15-30 min", delivery: "Free", address: "Les Berges du Lac, Tunis" },
    8: { name: "Pasta Bella", image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800", rating: 93, reviews: 390, time: "15-25 min", delivery: "2 DT", address: "Sidi Bou Said, Tunis" },
    9: { name: "Pala Doro", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", rating: 96, reviews: 510, time: "20-30 min", delivery: "Free", address: "Gammarth, Tunis" },
    10: { name: "Pasta Cuzi", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800", rating: 90, reviews: 280, time: "15-25 min", delivery: "3 DT", address: "Menzah 6, Tunis" },
    11: { name: "Snack Attack", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", rating: 95, reviews: 500, time: "10-20 min", delivery: "Free", address: "Rue de la Liberté, Tunis" },
    12: { name: "Pazzino", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", rating: 93, reviews: 440, time: "15-25 min", delivery: "2 DT", address: "Ariana, Tunis" },
    13: { name: "Flannel Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", rating: 89, reviews: 310, time: "20-30 min", delivery: "Free", address: "La Soukra, Tunis" },
    14: { name: "Matador", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", rating: 88, reviews: 210, time: "10-20 min", delivery: "1 DT", address: "Ariana, Tunis" },
    15: { name: "Chich Taouk", image: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=800", rating: 96, reviews: 670, time: "5-15 min", delivery: "Free", address: "Menzah 6, Tunis" },
    16: { name: "Mlawi Hssouna", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800", rating: 99, reviews: 1200, time: "5-10 min", delivery: "Free", address: "Médina, Tunis" },
    17: { name: "King Sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", rating: 91, reviews: 380, time: "10-20 min", delivery: "2 DT", address: "Bab Souika, Tunis" },
    18: { name: "Bambo", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800", rating: 87, reviews: 290, time: "10-20 min", delivery: "1 DT", address: "Ettadhamen, Tunis" },
    19: { name: "Plan B", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", rating: 91, reviews: 280, time: "10-20 min", delivery: "Free", address: "Gammarth, Tunis" },
    20: { name: "Burger Xpress", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", rating: 89, reviews: 450, time: "10-20 min", delivery: "2 DT", address: "Ennasr, Tunis" },
    21: { name: "The Buzz", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", rating: 93, reviews: 340, time: "10-20 min", delivery: "Free", address: "Les Berges du Lac, Tunis" },
    22: { name: "Mascotte", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800", rating: 90, reviews: 195, time: "15-25 min", delivery: "2 DT", address: "Sidi Bou Said, Tunis" },
    23: { name: "Tex Mex", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800", rating: 92, reviews: 520, time: "10-20 min", delivery: "Free", address: "La Marsa, Tunis" },
    24: { name: "Burger Craft", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800", rating: 94, reviews: 380, time: "15-25 min", delivery: "3 DT", address: "Les Berges du Lac, Tunis" },
};

// ── MOCK MENU ITEMS (object by restaurant id) ──
const mockMenuItems = {

    1: [ // Mechmecha
        { id: 1, name: "Pizza Neptune", price: 20.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Sauce tomate, Fromage mozzarella, Thon, Olive", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Extra Mozzarella", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Ojja Crevette", price: 18.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400", ingredients: "2 Oeufs, 180gr Crevettes, Sauce tomate, Epices", supplements: [{ name: "Extra Crevettes", price: 4 }, { name: "Pain", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Tortilla Viande Hachée", price: 21.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400", ingredients: "Viande hachée, Oignons, Fromage slice", supplements: [{ name: "Extra Viande", price: 3 }, { name: "Sauce Harissa", price: 0.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Salade Fruits de Mer", price: 32.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", ingredients: "Crevettes, Calamars, Moules, Laitue, Tomates, Citron", supplements: [{ name: "Extra Fruits de mer", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Salade Mechouia", price: 8.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400", ingredients: "Poivrons grillés, Tomates, Oignons, Ail, Huile d'olive", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Extra Oeuf", price: 1 }] },
        { id: 6, name: "Brik", price: 4.500, available: true, topSale: false, image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400", ingredients: "Oeuf, Feuille de brik, Persil, Citron", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Sauce Harissa", price: 0.5 }] },
        { id: 7, name: "Calzone Kabeb", price: 15.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Sauce au choix, Kabeb, Fromage mozzarella", supplements: [{ name: "Extra Kabeb", price: 3 }, { name: "Sauce BBQ", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 8, name: "Calzone Escaloppe", price: 11.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Fromage mozzarella, Escaloppe, Sauce tomate", supplements: [{ name: "Extra Escaloppe", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 9, name: "Makloub Salami", price: 12.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Fromage mozzarella, Salami, Sauce tomate", supplements: [{ name: "Extra Salami", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 10, name: "Galette Thon", price: 30.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ingredients: "Sauce au choix, Fromage, Thon", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    2: [ // Papillon
        { id: 1, name: "Pizza Neptune", price: 21.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Sauce tomate, Fromage mozzarella, Thon, Olive", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Extra Mozzarella", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Pizza 4 Saisons", price: 24.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ingredients: "Sauce tomate, Mozzarella, Jambon, Champignons, Poivrons, Olives", supplements: [{ name: "Extra Mozzarella", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Chika Mixte", price: 14.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Cordon Bleu, Viande hachée, Fromage mozzarella", supplements: [{ name: "Extra Fromage", price: 1.5 }, { name: "Sauce BBQ", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Fénoméne", price: 12.500, available: true, topSale: false, image: "https://tse2.mm.bing.net/th/id/OIP.JRPIYtmPE7xf1YcBwmZbjwHaFS?pid=Api&P=0&h=180", ingredients: "Foie, Oeuf, Fromage mozzarella", supplements: [{ name: "Extra Foie", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Chika Tike", price: 11.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400", ingredients: "Poulet mariné, Ricotta, Fromage mozzarella", supplements: [{ name: "Extra Poulet", price: 3 }, { name: "Sauce Ranch", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 6, name: "Chicken Panné", price: 11.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400", ingredients: "Poulet pané croustillant, Sauce au choix, Fromage", supplements: [{ name: "Sauce BBQ", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 7, name: "Radical", price: 10.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Viande hachée, Oeuf, Fromage mozzarella", supplements: [{ name: "Extra Viande", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 8, name: "La Suisse", price: 10.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Cordon Bleu, Fromage mozzarella", supplements: [{ name: "Extra Cordon Bleu", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 9, name: "Orientale", price: 12.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", ingredients: "Merguez, Fromage mozzarella, Sauce tomate", supplements: [{ name: "Extra Merguez", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 10, name: "Sfaxien", price: 15.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400", ingredients: "Kleya, Oeuf, Sauce tomate, Epices sfaxiennes", supplements: [{ name: "Extra Kleya", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    3: [ // KFC Tunisia
        { id: 1, name: "Bucket Original", price: 35.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400", ingredients: "Poulet croustillant original, Epices KFC secrètes", supplements: [{ name: "Frites", price: 4 }, { name: "Boisson 50cl", price: 3 }, { name: "Coleslaw", price: 2 }] },
        { id: 2, name: "Zinger Burger", price: 18.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Filet de poulet épicé, Laitue, Mayo, Pain brioche", supplements: [{ name: "Frites", price: 4 }, { name: "Boisson 33cl", price: 3 }, { name: "Extra Sauce", price: 1 }] },
        { id: 3, name: "Twister Poulet", price: 15.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=400", ingredients: "Tortilla, Poulet grillé, Salade, Tomates, Sauce ranch", supplements: [{ name: "Frites", price: 4 }, { name: "Boisson 33cl", price: 3 }] },
        { id: 4, name: "Crispy Box", price: 22.000, available: true, topSale: true, image: "https://tse2.mm.bing.net/th/id/OIP.6L532ZryosbSf_30Gl5RxAHaHa?pid=Api&P=0&h=180", ingredients: "3 morceaux de poulet croustillant, Frites, Boisson", supplements: [{ name: "Extra Morceau", price: 6 }, { name: "Sauce BBQ", price: 1 }] },
        { id: 5, name: "Hot Wings", price: 14.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400", ingredients: "Ailes de poulet épicées, Sauce piquante, Herbes", supplements: [{ name: "Extra Wings", price: 4 }, { name: "Boisson 33cl", price: 3 }] },
        { id: 6, name: "Popcorn Chicken", price: 12.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400", ingredients: "Petits morceaux de poulet croustillant, Sauce au choix", supplements: [{ name: "Extra Portion", price: 4 }, { name: "Sauce BBQ", price: 1 }, { name: "Boisson 33cl", price: 3 }] },
        { id: 7, name: "Family Feast", price: 65.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.RK6kcfE7jT0vdpOFRzL1qQHaEK?pid=Api&P=0&h=180", ingredients: "8 morceaux poulet, Grandes frites, 4 Boissons, Coleslaw", supplements: [{ name: "Extra Morceau", price: 6 }] },
        { id: 8, name: "Sundae Caramel", price: 6.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", ingredients: "Glace vanille, Caramel, Chantilly", supplements: [{ name: "Extra Caramel", price: 1 }] },
    ],

    4: [ // Holy Moly
        { id: 1, name: "Cookies & Cream", price: 12.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400", ingredients: "Cookies Oreo, Crème chantilly, Sauce chocolat, Glace vanille", supplements: [{ name: "Extra Oreo", price: 2 }, { name: "Extra Chantilly", price: 1 }] },
        { id: 2, name: "Waffle Nutella", price: 14.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", ingredients: "Gaufre croustillante, Nutella, Banane, Fraises, Chantilly", supplements: [{ name: "Extra Nutella", price: 2 }, { name: "Glace boule", price: 3 }] },
        { id: 3, name: "Crêpe Spéciale", price: 11.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", ingredients: "Crêpe fine, Nutella, Fraises, Banane, Sucre glace", supplements: [{ name: "Extra Nutella", price: 2 }, { name: "Glace boule", price: 3 }] },
        { id: 4, name: "Milkshake Fraise", price: 10.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", ingredients: "Lait frais, Fraises, Glace vanille, Chantilly", supplements: [{ name: "Extra boule glace", price: 2 }, { name: "Sauce caramel", price: 1 }] },
        { id: 5, name: "Pancake Stack", price: 13.000, available: true, topSale: false, image: "https://tse2.mm.bing.net/th/id/OIP.lnAQ7jzP1UItXVotdj4o2QHaHa?pid=Api&P=0&h=180", ingredients: "3 Pancakes moelleux, Sirop d'érable, Beurre, Fruits rouges", supplements: [{ name: "Extra pancake", price: 3 }, { name: "Glace boule", price: 3 }] },
        { id: 6, name: "Churros Chocolat", price: 9.000, available: true, topSale: true, image: "https://tse1.mm.bing.net/th/id/OIP.pTSHk3d9H8gj4NPz8QULPAHaEH?pid=Api&P=0&h=180", ingredients: "Churros frits, Sauce chocolat, Sucre cannelle", supplements: [{ name: "Extra sauce", price: 1.5 }, { name: "Glace boule", price: 3 }] },
        { id: 7, name: "Cheesecake Fruits Rouges", price: 15.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", ingredients: "Base biscuit, Cream cheese, Coulis fruits rouges", supplements: [{ name: "Extra coulis", price: 1.5 }] },
    ],

    5: [ // Jwajem Hachicha
        { id: 1, name: "Jwajem Classique", price: 4.000, available: true, topSale: true, image: "https://tse3.mm.bing.net/th/id/OIP.oFcOhhINKZbQA0KaJYOq0gHaE7?pid=Api&P=0&h=180", ingredients: "Pâte feuilletée, Miel, Pistaches, Eau de rose", supplements: [{ name: "Extra Miel", price: 0.5 }, { name: "Café tunisien", price: 2 }] },
        { id: 2, name: "Makroudh", price: 3.500, available: true, topSale: true, image: "https://tse3.mm.bing.net/th/id/OIP.gmscqxcY4YxtV8Y2aOuaDAHaEH?pid=Api&P=0&h=180", ingredients: "Semoule, Dattes, Eau de fleur d'oranger, Huile", supplements: [{ name: "Extra Miel", price: 0.5 }, { name: "Café tunisien", price: 2 }] },
        { id: 3, name: "Baklawa", price: 5.000, available: true, topSale: true, image: "https://tse1.mm.bing.net/th/id/OIP.ZekuBgf6_MhqxDOKvYu9zgHaFn?pid=Api&P=0&h=180", ingredients: "Pâte filo, Noix, Pistaches, Sirop de miel, Beurre", supplements: [{ name: "Café tunisien", price: 2 }, { name: "Thé à la menthe", price: 2 }] },
        { id: 4, name: "Assida Zgougou", price: 6.000, available: true, topSale: false, image: "http://www.baya.tn/wp-content/uploads/2012/02/cuisine-assida-zgougou.jpg", ingredients: "Pignons de pin, Lait, Sucre, Eau de rose, Pistaches", supplements: [{ name: "Extra Chantilly", price: 1 }] },
        { id: 5, name: "Kaak Warka", price: 4.500, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.gfJKzInm2uBT2DTQpjNX0wHaFi?pid=Api&P=0&h=180", ingredients: "Pâte warka, Amandes, Sucre, Eau de fleur d'oranger", supplements: [{ name: "Café tunisien", price: 2 }] },
        { id: 6, name: "Plateau Pâtisseries", price: 25.000, available: true, topSale: false, image: "http://labeylicale.tn/img/cms/Coffret%20Kaak%20Warka.jpg", ingredients: "Assortiment de 12 pièces: Jwajem, Baklawa, Makroudh, Kaak", supplements: [{ name: "Café tunisien x2", price: 4 }, { name: "Thé à la menthe x2", price: 4 }] },
    ],

    6: [ // Ci Gusta
        { id: 1, name: "Gelato Pistache", price: 8.000, available: true, topSale: true, image: "https://files.meilleurduchef.com/mdc/photo/recette/galette-pistache-framboise/galette-pistache-framboise-640.jpg", ingredients: "Glace artisanale, Pistaches siciliennes, Lait frais", supplements: [{ name: "Extra boule", price: 3 }, { name: "Cône gaufre", price: 1 }] },
        { id: 2, name: "Gelato Stracciatella", price: 8.000, available: true, topSale: true, image: "https://liliebakery.fr/wp-content/uploads/2023/08/Frozen-yogurt-yaourt-glace-maison-Lilie-Bakery_-1024x1534.jpg", ingredients: "Glace vanille, Copeaux chocolat noir, Crème fraîche", supplements: [{ name: "Extra boule", price: 3 }, { name: "Sauce chocolat", price: 1 }] },
        { id: 3, name: "Sundae Ci Gusta", price: 12.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", ingredients: "2 boules au choix, Sauce caramel, Chantilly, Amandes", supplements: [{ name: "Extra boule", price: 3 }, { name: "Extra sauce", price: 1 }] },
        { id: 4, name: "Affogato", price: 10.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.C3afVzaarZz__TecQWYKuAHaEO?pid=Api&P=0&h=180", ingredients: "Boule gelato vanille, Espresso chaud, Amandes grillées", supplements: [{ name: "Extra espresso", price: 2 }] },
        { id: 5, name: "Coupe Fruit", price: 14.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400", ingredients: "Fraises, Mangue, Kiwi, Glace sorbet, Menthe fraîche", supplements: [{ name: "Extra fruits", price: 3 }, { name: "Chantilly", price: 1 }] },
        { id: 6, name: "Waffle Gelato", price: 16.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", ingredients: "Gaufre croustillante, 2 boules gelato, Sauce fraise, Chantilly", supplements: [{ name: "Extra boule", price: 3 }, { name: "Extra sauce", price: 1 }] },
    ],

    7: [ // Côté Régale
        { id: 1, name: "Pain Perdu Caramel", price: 12.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", ingredients: "Pain brioché, Caramel beurre salé, Glace vanille, Chantilly", supplements: [{ name: "Extra Caramel", price: 1.5 }, { name: "Extra Glace", price: 3 }] },
        { id: 2, name: "Croque Monsieur", price: 10.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400", ingredients: "Pain de mie, Jambon, Emmental, Béchamel maison", supplements: [{ name: "Oeuf poché", price: 2 }, { name: "Salade verte", price: 1.5 }] },
        { id: 3, name: "Club Sandwich", price: 14.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", ingredients: "Pain toasté, Poulet, Bacon, Tomate, Laitue, Mayo", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Quiche Lorraine", price: 11.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ingredients: "Pâte brisée, Lardons, Emmental, Crème fraîche, Oeufs", supplements: [{ name: "Salade verte", price: 1.5 }] },
        { id: 5, name: "Tarte Tatin", price: 13.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", ingredients: "Pommes caramélisées, Pâte feuilletée, Caramel beurre salé", supplements: [{ name: "Glace vanille", price: 3 }, { name: "Crème fraîche", price: 1.5 }] },
        { id: 6, name: "Salade Niçoise", price: 15.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", ingredients: "Thon, Oeufs durs, Haricots verts, Tomates, Olives, Vinaigrette", supplements: [{ name: "Extra Thon", price: 3 }] },
    ],

    8: [ // Pasta Bella
        { id: 1, name: "Spaghetti Bolognese", price: 16.000, available: true, topSale: true, image: "https://inkristaskitchen.com/wp-content/uploads/2023/05/230515-rigatoni-bolognese-krista-stechman-midwest-food-photographer-7-1.jpg", ingredients: "Spaghetti, Viande hachée, Sauce tomate, Basilic, Parmesan", supplements: [{ name: "Extra Parmesan", price: 1.5 }, { name: "Pain à l'ail", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Penne Arrabiata", price: 14.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400", ingredients: "Penne, Sauce tomate épicée, Ail, Huile d'olive, Persil", supplements: [{ name: "Extra Piment", price: 0.5 }, { name: "Pain à l'ail", price: 2 }] },
        { id: 3, name: "Tagliatelle Saumon", price: 22.000, available: true, topSale: true, image: "https://cdn.shopify.com/s/files/1/0832/9391/products/tagliatelles_saumon_fp_2.jpg?v=1575966802", ingredients: "Tagliatelle fraîches, Saumon fumé, Crème, Aneth, Citron", supplements: [{ name: "Extra Saumon", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Lasagne Maison", price: 18.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.dvej1s8F7KkfffdfhmVhmAHaEO?pid=Api&P=0&h=180", ingredients: "Pâtes fraîches, Bœuf, Béchamel, Parmesan, Sauce tomate", supplements: [{ name: "Salade verte", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Gnocchi Pesto", price: 16.000, available: true, topSale: false, image: "https://tse1.mm.bing.net/th/id/OIP.HzkPIg_1zay1RJqtAHixgAHaEK?pid=Api&P=0&h=180", ingredients: "Gnocchi maison, Pesto basilic, Pignons, Parmesan", supplements: [{ name: "Extra Pesto", price: 2 }, { name: "Pain à l'ail", price: 2 }] },
        { id: 6, name: "Risotto aux Champignons", price: 20.000, available: true, topSale: true, image: "https://tse3.mm.bing.net/th/id/OIP.0mbt837uSmRPc-ENeUgcLAHaHa?pid=Api&P=0&h=180", ingredients: "Riz arborio, Champignons, Vin blanc, Parmesan, Beurre", supplements: [{ name: "Extra Champignons", price: 3 }, { name: "Truffe", price: 5 }] },
    ],

    9: [ // Pala Doro
        { id: 1, name: "Pâtes Carbonara", price: 18.000, available: true, topSale: true, image: "https://www.thespruceeats.com/thmb/ovIQQQxQajADuIE2lqhgqq7ppyE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/pasta-carbonara-recipe-5210168-hero-01-80090e56abc04ca19d88ebf7fad1d157.jpg", ingredients: "Spaghetti, Pancetta, Oeufs, Parmesan, Poivre noir", supplements: [{ name: "Extra Pancetta", price: 3 }, { name: "Extra Parmesan", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Linguine Fruits de Mer", price: 28.000, available: true, topSale: true, image: "https://tse1.mm.bing.net/th/id/OIP.FPI1sGyn6FjRuoeXClnwIwHaHa?pid=Api&P=0&h=180", ingredients: "Linguine, Crevettes, Moules, Calamars, Sauce tomate, Ail", supplements: [{ name: "Extra Fruits de mer", price: 6 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Pizza Diavola", price: 22.000, available: true, topSale: false, image: "https://thumbs.dreamstime.com/b/pizza-diavola-traditional-italian-meal-spicy-salami-peperoni-chili-olives-pizza-diavola-traditional-italian-meal-202024121.jpg", ingredients: "Sauce tomate, Mozzarella, Salami piquant, Piment, Basilic", supplements: [{ name: "Extra Salami", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Tiramisu Maison", price: 10.000, available: true, topSale: true, image: "http://www.mademoisellecuisine.com/wp-content/uploads/sites/2/2012/10/tiramisu-11.jpg", ingredients: "Mascarpone, Biscuits Savoyards, Café, Cacao, Oeufs frais", supplements: [{ name: "Café espresso", price: 2 }] },
        { id: 5, name: "Bruschetta Trio", price: 12.000, available: true, topSale: false, image: "https://vikalinka.com/wp-content/uploads/2013/05/Bruschetta-Recipe-15-Edit-683x1024.jpg", ingredients: "Pain ciabatta, Tomates, Basilic, Mozzarella, Huile d'olive", supplements: [{ name: "Extra Mozzarella", price: 2 }] },
        { id: 6, name: "Carpaccio Bœuf", price: 24.000, available: true, topSale: false, image: "https://cache.marieclaire.fr/data/photo/w2000_ci/6s/recette-carpaccio-de-boeuf-facile-rapide.jpg", ingredients: "Bœuf tranché fin, Parmesan, Roquette, Citron, Huile d'olive", supplements: [{ name: "Extra Parmesan", price: 2 }] },
    ],

    10: [ // Pasta Cuzi
        { id: 1, name: "Pasta Cuzi Signature", price: 19.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400", ingredients: "Pâtes maison, Sauce crémeuse aux 4 fromages, Basilic frais", supplements: [{ name: "Extra Fromage", price: 2 }, { name: "Poulet grillé", price: 4 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Fettuccine Alfredo", price: 17.000, available: true, topSale: false, image: "https://thefoodcharlatan.com/wp-content/uploads/2020/08/Homemade-Chicken-Fettuccine-Alfredo-10.jpg", ingredients: "Fettuccine, Beurre, Parmesan, Crème fraîche, Poivre", supplements: [{ name: "Poulet", price: 4 }, { name: "Champignons", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Penne Poulet Pesto", price: 18.000, available: true, topSale: true, image: "https://tse4.mm.bing.net/th/id/OIP.IhppoLsGhR8vzq08e2b1CgHaHa?pid=Api&P=0&h=180", ingredients: "Penne, Poulet grillé, Pesto basilic, Tomates cerises, Parmesan", supplements: [{ name: "Extra Poulet", price: 4 }, { name: "Extra Pesto", price: 1.5 }] },
        { id: 4, name: "Tortellini Ricotta", price: 20.000, available: true, topSale: false, image: "https://s.soyrice.com/media/20240913102029/creamy-spinach-ricotta-tortellini_done2-830x521.png", ingredients: "Tortellini farcis, Ricotta, Épinards, Sauce tomate fraîche", supplements: [{ name: "Extra Parmesan", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Spaghetti Vongole", price: 25.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.RW1Us8oWkODX2pkqbDVTmAHaHa?pid=Api&P=0&h=180", ingredients: "Spaghetti, Palourdes, Ail, Vin blanc, Persil, Huile d'olive", supplements: [{ name: "Extra Palourdes", price: 5 }, { name: "Pain à l'ail", price: 2 }] },
    ],

    11: [ // Snack Attack
        { id: 1, name: "Pizza Attack", price: 18.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Sauce tomate, Mozzarella, Pepperoni, Champignons, Poivrons", supplements: [{ name: "Extra Pepperoni", price: 2 }, { name: "Extra Mozzarella", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Burger Attack", price: 14.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Pain brioche, Steak haché, Cheddar, Laitue, Tomate, Sauce maison", supplements: [{ name: "Frites", price: 2.5 }, { name: "Double steak", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Hot Dog Maison", price: 8.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400", ingredients: "Pain hot dog, Saucisse grillée, Moutarde, Ketchup, Oignons", supplements: [{ name: "Frites", price: 2.5 }, { name: "Extra Saucisse", price: 3 }] },
        { id: 4, name: "Nachos Attack", price: 12.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400", ingredients: "Chips tortilla, Cheddar fondu, Jalapeños, Crème fraîche, Guacamole", supplements: [{ name: "Extra Guacamole", price: 2 }, { name: "Extra Cheese", price: 1.5 }] },
        { id: 5, name: "Wings BBQ", price: 15.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400", ingredients: "Ailes de poulet, Sauce BBQ maison, Herbes fraîches", supplements: [{ name: "Extra Wings", price: 4 }, { name: "Sauce Piquante", price: 1 }] },
        { id: 6, name: "Wrap Thon", price: 9.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.zpKmdRPNTXA-SzQ9Vf9AewHaEj?pid=Api&P=0&h=180", ingredients: "Tortilla, Thon, Maïs, Tomates, Laitue, Mayo", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    12: [ // Pazzino
        { id: 1, name: "Pizza Pazzino", price: 22.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Sauce tomate, Mozzarella bufala, Salami, Champignons, Basilic", supplements: [{ name: "Extra Mozzarella", price: 2 }, { name: "Extra Salami", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Pizza Royale", price: 26.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ingredients: "Sauce tomate, Mozzarella, Jambon, Champignons, Oeufs, Olives", supplements: [{ name: "Extra Jambon", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Pizza Végétarienne", price: 20.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Sauce tomate, Mozzarella, Poivrons, Courgettes, Aubergines, Tomates", supplements: [{ name: "Extra Légumes", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Pizza Chorizo", price: 24.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Sauce tomate, Mozzarella, Chorizo, Oignons rouges, Piment doux", supplements: [{ name: "Extra Chorizo", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Calzone Pazzino", price: 20.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Pâte croustillante, Ricotta, Jambon, Champignons, Mozzarella", supplements: [{ name: "Extra Ricotta", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    13: [ // Flannel Pizza
        { id: 1, name: "Flannel Classic", price: 19.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ingredients: "Sauce tomate maison, Mozzarella, Jambon fumé, Basilic frais", supplements: [{ name: "Extra Jambon", price: 2 }, { name: "Extra Mozzarella", price: 1.5 }] },
        { id: 2, name: "BBQ Chicken Pizza", price: 23.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Sauce BBQ, Poulet grillé, Oignons caramélisés, Mozzarella", supplements: [{ name: "Extra Poulet", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Pizza Blanche", price: 21.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", ingredients: "Crème fraîche, Mozzarella, Lardon, Champignons, Gruyère", supplements: [{ name: "Extra Lardons", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Pizza Fruits de Mer", price: 28.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ingredients: "Sauce tomate, Crevettes, Calamars, Moules, Mozzarella, Citron", supplements: [{ name: "Extra Fruits de mer", price: 5 }] },
        { id: 5, name: "Pizza Kebab", price: 22.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", ingredients: "Sauce tomate, Viande kebab, Oignons, Poivrons, Mozzarella, Harissa", supplements: [{ name: "Extra Viande", price: 3 }, { name: "Extra Harissa", price: 0.5 }] },
    ],

    14: [ // Matador
        { id: 1, name: "Sandwich Matador", price: 8.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400", ingredients: "Baguette, Thon, Harissa, Olives, Câpres, Pomme de terre, Oeuf dur", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Fromage", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Merguez Frites", price: 10.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", ingredients: "Merguez grillées, Frites maison, Harissa, Pain", supplements: [{ name: "Extra Merguez", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Fricassé Spécial", price: 6.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.RGII0TPJNmRtCGf6mZeT1QHaGM?pid=Api&P=0&h=180", ingredients: "Pain fricassé, Thon, Harissa, Câpres, Citron, Huile d'olive", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Oeuf", price: 1 }] },
        { id: 4, name: "Lablabi", price: 7.000, available: true, topSale: true, image: "https://www.themediterraneandish.com/wp-content/uploads/2023/02/Lablabi-recipe-6-600x400.jpg", ingredients: "Pois chiches, Pain rassis, Cumin, Harissa, Oeuf, Huile d'olive", supplements: [{ name: "Extra Pois chiches", price: 1 }, { name: "Thon", price: 2 }, { name: "Oeuf", price: 1 }] },
        { id: 5, name: "Kapsa Agneau", price: 25.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.BtrkaInBw03ral7lOTpLnwHaHa?pid=Api&P=0&h=180", ingredients: "Riz basmati, Agneau, Epices kapsa, Raisins secs, Amandes", supplements: [{ name: "Extra Agneau", price: 5 }] },
    ],

    15: [ // Chich Taouk
        { id: 1, name: "Wrap Chich Taouk", price: 10.000, available: true, topSale: true, image: "https://images.ricardocuisine.com/services/recipes/9461.jpg", ingredients: "Tortilla, Poulet mariné grillé, Toum ail, Tomates, Laitue", supplements: [{ name: "Extra Poulet", price: 3 }, { name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: " ChiAssiettech Taouk", price: 18.000, available: true, topSale: true, image: "https://tse4.mm.bing.net/th/id/OIP.GOpBgg1TZGxjD6m0YPqerAAAAA?pid=Api&P=0&h=180", ingredients: "Brochettes poulet mariné, Riz, Salade, Sauce toum", supplements: [{ name: "Extra Brochette", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Sandwich Kafta", price: 9.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.2vCfydZxqclt4gQdfsXWrgHaE8?pid=Api&P=0&h=180", ingredients: "Pain pita, Kafta grillée, Persil, Oignons, Tomates, Sauce tahini", supplements: [{ name: "Extra Kafta", price: 3 }, { name: "Frites", price: 2.5 }] },
        { id: 4, name: "Hummus Maison", price: 8.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.z4MPb0vVGWDzJ1MXeDkv1gHaD4?pid=Api&P=0&h=180", ingredients: "Pois chiches, Tahini, Citron, Ail, Huile d'olive, Paprika", supplements: [{ name: "Pain pita", price: 1.5 }, { name: "Extra Huile", price: 0.5 }] },
        { id: 5, name: "Falafel Plate", price: 12.000, available: true, topSale: false, image: "https://tse1.mm.bing.net/th/id/OIP.pYYIE8Z-632GhdsQ2Gvq6gHaHa?pid=Api&P=0&h=180", ingredients: "Falafels croustillants, Hummus, Taboulé, Sauce tahini, Pain pita", supplements: [{ name: "Extra Falafels", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    16: [ // Mlawi Hssouna
        { id: 1, name: "Omlette Chawarma", price: 7.500, available: true, topSale: true, image: "https://tse3.mm.bing.net/th/id/OIP.Q23rUmhetD-pPi4sSFB33AAAAA?pid=Api&P=0&h=180", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Chawarma", supplements: [{ name: "Extra Harissa", price: 0.5 }, { name: "Extra Mayo", price: 0.5 }, { name: "Extra Frite", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Omlette Escaloppe", price: 7.500, available: true, topSale: true, image: "https://vanoiserie.tn/wp-content/uploads/2024/06/mlewi.jpg", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Escaloppe", supplements: [{ name: "Extra Harissa", price: 0.5 }, { name: "Extra Mayo", price: 0.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Omlette Cordon Bleu", price: 7.500, available: true, topSale: false, image: "https://tse2.mm.bing.net/th/id/OIP.hbyUStRQW0xWj5Xr8fZKbAHaHa?pid=Api&P=0&h=180", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Cordon Bleu", supplements: [{ name: "Extra Harissa", price: 0.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Omlette Jambon", price: 6.500, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.mzWS0VOyCG-7TzbF05r-8AHaEK?pid=Api&P=0&h=180", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Jambon", supplements: [{ name: "Extra Harissa", price: 0.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Omlette Thon", price: 6.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.eREvNbhUDI7KjEkVs0q_IwHaHa?pid=Api&P=0&h=180", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Thon", supplements: [{ name: "Extra Thon", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 6, name: "Omlette Salami", price: 4.500, available: true, topSale: false, image: "https://www.forkinthekitchen.com/wp-content/uploads/2022/10/221011.breakfast.burritos-5706.jpg", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Salami", supplements: [{ name: "Extra Salami", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 7, name: "Omlette Thon Fromage", price: 8.000, available: true, topSale: false, image: "https://i.pinimg.com/originals/95/05/c1/9505c1334d284dfc3468eff6f5f68268.jpg", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Thon, Fromage", supplements: [{ name: "Extra Thon", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 8, name: "Mlawi Hssouna", price: 12.000, available: true, topSale: true, image: "https://tse2.mm.bing.net/th/id/OIP.18TLsRF5OsIQg2qiXueVpgHaFc?pid=Api&P=0&h=180", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Thon, Cordon Bleu, Salami, Jambon, Escaloppe", supplements: [{ name: "Extra Harissa", price: 0.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 9, name: "Mlewi Spécial", price: 10.000, available: true, topSale: false, image: "https://www.eurosofamadrid.es/wp-content/uploads/2023/12/1702887407_57_Burritolleva-Mexico-a-tu-mesa.jpg", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Garniture spéciale maison", supplements: [{ name: "Extra Harissa", price: 0.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 10, name: "Omlette Jambon Mozzarelle", price: 9.000, available: true, topSale: false, image: "https://1.bp.blogspot.com/-v7BwOL12mLI/Vt3kjEYegeI/AAAAAAAAKj8/AMlPB4JEq9Q/s640/_DSC3283.JPG", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Omlette, Jambon, Mozzarelle", supplements: [{ name: "Extra Mozzarelle", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 11, name: "Mlawi Hssouna Royale", price: 14.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400", ingredients: "Harissa, Salade mechouia, Mayo, Frite, Salami, Jambon, Mozzarelle", supplements: [{ name: "Extra Mozzarelle", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    17: [ // King Sandwich
        { id: 1, name: "King Burger", price: 13.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Pain brioche, Double steak, Cheddar, Laitue, Tomate, Sauce King", supplements: [{ name: "Frites", price: 2.5 }, { name: "Extra Steak", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Sandwich Tunisien Roi", price: 8.000, available: true, topSale: true, image: "https://tse2.mm.bing.net/th/id/OIP.Dwm7weEyJbyAAakV8QAW-QHaHa?pid=Api&P=0&h=180", ingredients: "Baguette royale, Thon, Harissa, Olives, Câpres, Oeuf, Frites", supplements: [{ name: "Extra Thon", price: 2 }, { name: "Fromage", price: 1.5 }] },
        { id: 3, name: "Wrap Poulet King", price: 11.000, available: true, topSale: false, image: "https://belappetit.com/assets/images/1739637292885-y52nyfaf.webp", ingredients: "Tortilla géante, Poulet croustillant, Salade coleslaw, Sauce BBQ", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Hot Dog King", price: 9.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400", ingredients: "Pain long, Saucisse fumée, Cheddar fondu, Oignons grillés, Moutarde", supplements: [{ name: "Frites", price: 2.5 }, { name: "Extra Saucisse", price: 3 }] },
        { id: 5, name: "Assiette Mixte King", price: 22.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", ingredients: "Merguez, Poulet, Kefta, Frites maison, Salade, Sauce maison", supplements: [{ name: "Extra Viande", price: 4 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    18: [ // Bambo
        { id: 1, name: "Sandwich Bambo", price: 7.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", ingredients: "Pain maison, Thon, Harissa douce, Salade, Tomates, Frites", supplements: [{ name: "Extra Thon", price: 1.5 }, { name: "Oeuf", price: 1 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Fricassé Bambo", price: 5.000, available: true, topSale: true, image: "https://tse1.mm.bing.net/th/id/OIP.cTPDigKdMlYQdF5dyaT-cgHaDt?pid=Api&P=0&h=180", ingredients: "Pain fricassé maison, Thon, Harissa, Pomme de terre, Câpres", supplements: [{ name: "Extra Thon", price: 1.5 }, { name: "Fromage", price: 1 }] },
        { id: 3, name: "Brik Bambo", price: 4.000, available: true, topSale: false, image: "https://blog.giallozafferano.it/mastercheffa/wp-content/uploads/2023/08/brik-tunisini-3-2048x1536.jpg", ingredients: "Feuille brik, Thon, Oeuf, Persil, Pomme de terre, Fromage", supplements: [{ name: "Extra Thon", price: 1.5 }, { name: "Sauce Harissa", price: 0.5 }] },
        { id: 4, name: "Assida Poulet", price: 15.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400", ingredients: "Semoule, Poulet, Légumes, Bouillon maison, Epices traditionnelles", supplements: [{ name: "Extra Poulet", price: 3 }] },
        { id: 5, name: "Merguez Pain", price: 8.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", ingredients: "Pain maison, Merguez grillées, Harissa, Tomates, Oignons", supplements: [{ name: "Extra Merguez", price: 2.5 }, { name: "Frites", price: 2 }] },
    ],

    19: [ // Plan B
        { id: 1, name: "Salade Plan B", price: 14.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400", ingredients: "Quinoa, Avocat, Tomates cerises, Concombre, Feta, Vinaigrette citron", supplements: [{ name: "Poulet grillé", price: 4 }, { name: "Saumon fumé", price: 6 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Bowl César Poulet", price: 16.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", ingredients: "Laitue romaine, Poulet grillé, Parmesan, Croûtons, Sauce César maison", supplements: [{ name: "Extra Poulet", price: 4 }, { name: "Oeuf poché", price: 2 }] },
        { id: 3, name: "Wrap Végétarien", price: 12.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.OWv-76LQzFo0qNxPHBfThgHaE8?pid=Api&P=0&h=180", ingredients: "Tortilla complète, Houmous, Légumes grillés, Roquette, Feta", supplements: [{ name: "Extra Légumes", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Salade Thaï", price: 15.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400", ingredients: "Vermicelles de riz, Crevettes, Mangue, Cacahuètes, Sauce nam prik", supplements: [{ name: "Extra Crevettes", price: 4 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Bowl Smoothie", price: 13.000, available: true, topSale: false, image: "https://tse3.mm.bing.net/th/id/OIP.WP8GuxiJmNgGxfmHE1PIaAHaGu?pid=Api&P=0&h=180", ingredients: "Base açaï, Granola, Fruits frais, Miel, Noix de coco", supplements: [{ name: "Extra Fruits", price: 2 }, { name: "Extra Granola", price: 1 }] },
        { id: 6, name: "Sandwich Saumon Avocat", price: 18.000, available: true, topSale: true, image: "https://tse4.mm.bing.net/th/id/OIP.ANDOQesAiGdsC3QPiBEoiQHaEJ?pid=Api&P=0&h=180", ingredients: "Pain complet, Saumon fumé, Avocat, Cream cheese, Câpres, Aneth", supplements: [{ name: "Extra Saumon", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
    ],

    20: [ // Burger Xpress
        { id: 1, name: "Xpress Classic", price: 12.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Pain grillé, Steak haché, Cheddar, Laitue, Tomate, Cornichon, Sauce maison", supplements: [{ name: "Frites", price: 2.5 }, { name: "Double steak", price: 4 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Xpress Crispy", price: 13.000, available: true, topSale: true, image: "https://tse2.mm.bing.net/th/id/OIP.1FGJZRq8NANC7XK94BtUHQHaFj?pid=Api&P=0&h=180", ingredients: "Pain brioche, Poulet croustillant, Coleslaw, Sauce ranch, Pickles", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Xpress Double", price: 18.000, available: true, topSale: false, image: "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/oklahoma_burger_10958_16x9.jpg", ingredients: "Pain brioche XXL, Double steak, Double cheddar, Bacon, Oignon, Sauce spéciale", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Smash Burger", price: 15.000, available: true, topSale: true, image: "https://tse1.mm.bing.net/th/id/OIP.AYz3o6XMqYM3TYdK6WPLtQHaEo?pid=Api&P=0&h=180", ingredients: "Steak smashé, Oignons caramélisés, Cheddar américain, Sauce burger", supplements: [{ name: "Frites", price: 2.5 }, { name: "Extra Steak", price: 4 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Cheese Fries", price: 8.000, available: true, topSale: false, image: "https://tse1.mm.bing.net/th/id/OIP.KaoPkff-eLpKD6sB4KhdSQHaJ4?pid=Api&P=0&h=180", ingredients: "Frites croustillantes, Sauce cheddar, Bacon bits, Ciboulette", supplements: [{ name: "Extra Sauce", price: 1.5 }] },
    ],

    21: [ // The Buzz
        { id: 1, name: "Buzz Salad", price: 15.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", ingredients: "Mesclun, Poulet rôti, Avocat, Tomates cerises, Noix, Vinaigrette miel-moutarde", supplements: [{ name: "Extra Poulet", price: 4 }, { name: "Extra Avocat", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Sandwich Buzz", price: 13.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", ingredients: "Pain artisanal, Poulet fumé, Fromage de chèvre, Roquette, Tomates séchées", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Poke Bowl Saumon", price: 22.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400", ingredients: "Riz vinaigré, Saumon mariné, Edamame, Avocat, Concombre, Sauce ponzu", supplements: [{ name: "Extra Saumon", price: 5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Salade Grecque", price: 13.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400", ingredients: "Tomates, Concombre, Oignons rouges, Feta, Olives, Origan, Huile d'olive", supplements: [{ name: "Pain pita", price: 1.5 }, { name: "Extra Feta", price: 2 }] },
        { id: 5, name: "Jus Detox Buzz", price: 8.000, available: true, topSale: false, image: "http://cache.cosmopolitan.fr/data/photo/w1000_c17/18r/jus-detox-vert-maison-chou-kale.jpg", ingredients: "Céleri, Concombre, Pomme verte, Citron, Gingembre, Menthe fraîche", supplements: [{ name: "Extra Gingembre", price: 0.5 }] },
    ],

    22: [ // Mascotte
        { id: 1, name: "Salade Mascotte", price: 14.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400", ingredients: "Laitue, Thon, Oeufs durs, Tomates, Pommes de terre, Olives, Anchois", supplements: [{ name: "Extra Thon", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Croque Madame", price: 12.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", ingredients: "Pain de mie, Jambon, Emmental, Béchamel, Oeuf poché", supplements: [{ name: "Salade verte", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Pasta Mascotte", price: 16.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400", ingredients: "Pâtes fraîches, Sauce crémeuse, Champignons, Parmesan, Basilic", supplements: [{ name: "Poulet grillé", price: 4 }, { name: "Extra Parmesan", price: 1.5 }] },
        { id: 4, name: "Club Mascotte", price: 15.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", ingredients: "Pain toasté triple, Poulet, Bacon, Tomate, Laitue, Emmental, Mayo", supplements: [{ name: "Frites", price: 2.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 5, name: "Tarte du Jour", price: 10.000, available: true, topSale: true, image: "https://tse3.mm.bing.net/th/id/OIP.WidUOtT-HrQdzYFjykpChwHaEO?pid=Api&P=0&h=180", ingredients: "Pâte brisée maison, Garniture du jour, Salade verte", supplements: [{ name: "Boisson 33cl", price: 2 }] },
    ],

    23: [ // Tex Mex
        { id: 1, name: "Burrito Supreme", price: 16.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400", ingredients: "Tortilla géante, Riz mexicain, Haricots noirs, Bœuf épicé, Guacamole, Sour cream", supplements: [{ name: "Extra Guacamole", price: 2 }, { name: "Extra Fromage", price: 1.5 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Tacos Tex Mex", price: 14.000, available: true, topSale: true, image: "https://tse2.mm.bing.net/th/id/OIP.V60pc6LFIaBn0hO75jm1egHaHZ?pid=Api&P=0&h=180", ingredients: "Tortilla croustillante, Poulet épicé, Pico de gallo, Cheddar, Jalapeños", supplements: [{ name: "Extra Jalapeños", price: 0.5 }, { name: "Guacamole", price: 2 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 3, name: "Quesadilla Poulet", price: 13.000, available: true, topSale: false, image: "https://producteurslaitiersducanada.ca/sites/default/files/styles/recipe_image/public/image_file_browser/conso_recipe/2021/Sans%20titre%20(11).png.jpeg?itok=4zcQVDt_", ingredients: "Tortilla grillée, Poulet, Cheddar fondu, Poivrons, Oignons, Crème fraîche", supplements: [{ name: "Extra Cheddar", price: 1.5 }, { name: "Guacamole", price: 2 }] },
        { id: 4, name: "Fajitas Bœuf", price: 20.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", ingredients: "Bœuf mariné, Poivrons tricolores, Oignons, Tortillas, Guacamole, Sour cream", supplements: [{ name: "Extra Bœuf", price: 5 }, { name: "Extra Guacamole", price: 2 }] },
        { id: 5, name: "Nachos Loaded", price: 15.000, available: true, topSale: true, image: "https://recipesblob.oetker.in/assets/b72049329c8742b98daf790c9ef937bd/1272x764/loaded-nachos.jpg", ingredients: "Chips tortilla, Cheese sauce, Bœuf épicé, Jalapeños, Guacamole, Sour cream", supplements: [{ name: "Extra Cheese sauce", price: 2 }, { name: "Extra Guacamole", price: 2 }] },
        { id: 6, name: "Churros Maison", price: 8.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.M4KRjMEF_ue1leWS3rECiQHaEO?pid=Api&P=0&h=180", ingredients: "Churros frits, Sauce chocolat, Caramel, Sucre cannelle", supplements: [{ name: "Extra sauce", price: 1.5 }] },
    ],

    24: [ // Burger Craft
        { id: 1, name: "Craft Classic", price: 16.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Pain artisanal, Bœuf Charolais 180g, Cheddar affiné, Laitue, Tomate, Sauce craft", supplements: [{ name: "Frites artisanales", price: 3 }, { name: "Extra Steak", price: 6 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 2, name: "Truffle Burger", price: 24.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400", ingredients: "Pain brioché, Steak bœuf prime, Sauce truffe, Roquette, Parmesan, Oignons confits", supplements: [{ name: "Frites artisanales", price: 3 }, { name: "Extra Truffe", price: 5 }] },
        { id: 3, name: "BBQ Smokehouse", price: 20.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400", ingredients: "Pain grillé, Bœuf fumé, Bacon croustillant, Oignons frits, Sauce BBQ fumée, Cheddar", supplements: [{ name: "Frites artisanales", price: 3 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 4, name: "Veggie Craft", price: 15.000, available: true, topSale: false, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400", ingredients: "Pain complet, Steak végétal, Avocat, Roquette, Tomates séchées, Houmous", supplements: [{ name: "Frites artisanales", price: 3 }, { name: "Extra Avocat", price: 2 }] },
        { id: 5, name: "Craft Smash Double", price: 22.000, available: true, topSale: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ingredients: "Pain brioché, Double smash patty, Double cheddar, Oignons caramélisés, Cornichons", supplements: [{ name: "Frites artisanales", price: 3 }, { name: "Extra Patty", price: 6 }, { name: "Boisson 33cl", price: 2 }] },
        { id: 6, name: "Onion Rings", price: 7.000, available: true, topSale: false, image: "https://tse4.mm.bing.net/th/id/OIP.Vu1SGNA-B7Tu0DfrhDqc2AHaE8?pid=Api&P=0&h=180", ingredients: "Rondelles d'oignon panées, Sauce ranch maison", supplements: [{ name: "Extra Sauce", price: 1 }] },
    ],
};

export default function MenuItems() {
    const [menuItems, setMenuItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [liked, setLiked] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedSupplements, setSelectedSupplements] = useState([]);
    const [itemQuantity, setItemQuantity] = useState(1);

    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchData();
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        if (sheetOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [sheetOpen]);

    const fetchData = async () => {
        try {
            const [menuData, restaurantData] = await Promise.all([
                getMenuByRestaurant(token, id),
                getRestaurantById(token, id)
            ]);
            if (Array.isArray(menuData) && menuData.length > 0) {
                setMenuItems(menuData);
            } else {
                setMenuItems(mockMenuItems[parseInt(id)] || mockMenuItems.default);
            }
            if (restaurantData && restaurantData.name) {
                setRestaurant(restaurantData);
            } else {
                setRestaurant(mockRestaurants[parseInt(id)] || mockRestaurants[1]);
            }
        } catch (err) {
            setMenuItems(mockMenuItems[parseInt(id)] || mockMenuItems.default);
            setRestaurant(mockRestaurants[parseInt(id)] || mockRestaurants[1]);
        } finally {
            setLoading(false);
        }
    };

    const openSheet = (item) => {
        setSelectedItem(item);
        setSelectedSupplements([]);
        setItemQuantity(1);
        setSheetOpen(true);
    };

    const closeSheet = () => {
        setSheetOpen(false);
        setTimeout(() => setSelectedItem(null), 300);
    };

    const toggleSupplement = (supp) => {
        setSelectedSupplements(prev =>
            prev.find(s => s.name === supp.name)
                ? prev.filter(s => s.name !== supp.name)
                : [...prev, supp]
        );
    };

    const getSheetTotal = () => {
        if (!selectedItem) return 0;
        const suppTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
        return ((selectedItem.price + suppTotal) * itemQuantity).toFixed(3);
    };

    const addToCartFromSheet = () => {
        const suppTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
        const itemPrice = selectedItem.price + suppTotal;
        const cartItem = {
            menuItemId: selectedItem.id,
            name: selectedItem.name + (selectedSupplements.length > 0
                ? ` (+ ${selectedSupplements.map(s => s.name).join(", ")})`
                : ""),
            price: itemPrice,
            quantity: itemQuantity,
            restaurantId: parseInt(id)
        };
        const existing = cart.find(c => c.menuItemId === selectedItem.id);
        let newCart;
        if (existing) {
            newCart = cart.map(c =>
                c.menuItemId === selectedItem.id
                    ? { ...c, quantity: c.quantity + itemQuantity }
                    : c
            );
        } else {
            newCart = [...cart, cartItem];
        }
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        closeSheet();
    };

    const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
    const topSales = menuItems.filter(i => i.topSale && i.available);
    const availableItems = menuItems.filter(i => i.available);
    const unavailableItems = menuItems.filter(i => !i.available);
    const resto = restaurant || mockRestaurants[parseInt(id)] || mockRestaurants[1];

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; background: #f7efe6; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pricePop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
                @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 60px; background: white; box-shadow: 0 2px 20px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 200; }
                .logo { font-size: 20px; font-weight: 700; color: #4caf50; text-decoration: none; }
                .nav-actions { display: flex; gap: 12px; align-items: center; }
                .nav-btn { padding: 9px 18px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-decoration: none; display: flex; align-items: center; gap: 6px; }
                .btn-outline { background: transparent; border: 1.5px solid #f27405; color: #f27405; }
                .btn-outline:hover { background: #f27405; color: white; }
                .btn-logout { background: transparent; border: 1.5px solid #ddd; color: #666; }
                .btn-logout:hover { background: #ff5252; color: white; border-color: #ff5252; }
                .cart-btn { background: #f27405; color: white; border: none; padding: 9px 20px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
                .cart-btn:hover { background: #e06600; transform: translateY(-2px); }
                .cart-count { background: white; color: #f27405; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }

                .hero { position: relative; height: 380px; overflow: hidden; }
                .hero-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
                .hero-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 60px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
                .back-btn { position: absolute; top: 20px; left: 60px; display: inline-flex; align-items: center; gap: 8px; color: white; text-decoration: none; font-weight: 600; font-size: 14px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(10px); transition: all 0.3s ease; }
                .back-btn:hover { background: rgba(255,255,255,0.3); }
                .hero-content { animation: fadeInUp 0.6s ease; }
                .hero-name { font-size: 42px; font-weight: 900; color: white; margin-bottom: 15px; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
                .hero-meta { display: flex; gap: 15px; flex-wrap: wrap; align-items: center; }
                .hero-tag { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; backdrop-filter: blur(10px); font-weight: 600; }
                .hero-tag.free { background: rgba(76,175,80,0.8); }
                .like-btn { background: rgba(255,255,255,0.2); border: none; cursor: pointer; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; backdrop-filter: blur(10px); transition: all 0.3s ease; }
                .like-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
                .like-btn.liked { animation: heartPop 0.3s ease; }

                .content { max-width: 1100px; margin: 0 auto; padding: 40px 60px 100px; }
                .section-title { font-size: 20px; font-weight: 800; color: #3a2e2a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }

                .top-ventes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
                .top-card { background: white; border-radius: 20px; overflow: hidden; display: flex; cursor: pointer; box-shadow: 0 5px 20px rgba(0,0,0,0.08); transition: all 0.3s ease; border: 2px solid transparent; animation: fadeInUp 0.5s ease; }
                .top-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(242,116,5,0.2); border-color: #f27405; }
                .top-card-img { width: 120px; height: 120px; object-fit: cover; flex-shrink: 0; }
                .top-card-img-placeholder { width: 120px; height: 120px; flex-shrink: 0; background: linear-gradient(135deg, #ffe3c5, #f27405); display: flex; align-items: center; justify-content: center; font-size: 40px; }
                .top-card-body { padding: 15px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
                .top-card-name { font-size: 15px; font-weight: 700; color: #3a2e2a; margin-bottom: 5px; }
                .top-card-ingredients { font-size: 11px; color: #aaa; margin-bottom: 10px; line-height: 1.4; }
                .top-card-footer { display: flex; justify-content: space-between; align-items: center; }
                .top-card-price { font-size: 16px; font-weight: 800; color: #f27405; }
                .top-sale-badge { background: #f27405; color: white; padding: 3px 10px; border-radius: 10px; font-size: 10px; font-weight: 700; }
                .add-btn-small { background: #f27405; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
                .add-btn-small:hover { background: #e06600; transform: scale(1.15); }

                .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
                .menu-card { background: white; border-radius: 16px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.07); transition: all 0.3s ease; animation: fadeInUp 0.5s ease; border: 2px solid transparent; }
                .menu-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(242,116,5,0.15); border-color: #ffe3c5; }
                .menu-card.unavailable { opacity: 0.5; pointer-events: none; }
                .item-img-wrapper { position: relative; height: 160px; overflow: hidden; }
                .item-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .menu-card:hover .item-img { transform: scale(1.08); }
                .item-img-placeholder { width: 100%; height: 160px; background: linear-gradient(135deg, #fff3e8, #ffe0c8); display: flex; align-items: center; justify-content: center; font-size: 50px; }
                .unavailable-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; }
                .item-body { padding: 14px; }
                .item-name { font-size: 14px; font-weight: 700; color: #3a2e2a; margin-bottom: 5px; }
                .item-ingredients { font-size: 11px; color: #aaa; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .item-footer { display: flex; justify-content: space-between; align-items: center; }
                .item-price { font-size: 15px; font-weight: 800; color: #f27405; }
                .plus-btn { background: #f27405; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
                .plus-btn:hover { background: #e06600; transform: scale(1.15); }
                .unavailable-title { font-size: 16px; font-weight: 600; color: #bbb; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }

                .sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(3px); animation: fadeIn 0.3s ease; }
                .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 24px 24px 0 0; z-index: 1000; max-height: 90vh; overflow-y: auto; animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
                .sheet-handle { width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 12px auto 0; cursor: pointer; }
                .sheet-img { width: 100%; height: 250px; object-fit: cover; }
                .sheet-img-placeholder { width: 100%; height: 250px; background: linear-gradient(135deg, #fff3e8, #f27405); display: flex; align-items: center; justify-content: center; font-size: 80px; }
                .sheet-body { padding: 25px; }
                .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                .sheet-name { font-size: 22px; font-weight: 800; color: #3a2e2a; }
                .sheet-base-price { font-size: 20px; font-weight: 800; color: #f27405; }
                .sheet-ingredients { background: #f9f5f0; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
                .sheet-ingredients-title { font-size: 13px; font-weight: 700; color: #3a2e2a; margin-bottom: 8px; }
                .sheet-ingredients-text { font-size: 13px; color: #666; line-height: 1.6; }
                .supplements-title { font-size: 16px; font-weight: 800; color: #3a2e2a; margin-bottom: 15px; }
                .supplement-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f0ec; cursor: pointer; transition: all 0.2s ease; }
                .supplement-item:hover { background: #fffaf5; margin: 0 -25px; padding: 12px 25px; border-radius: 8px; }
                .supplement-left { display: flex; align-items: center; gap: 12px; }
                .supplement-checkbox { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; }
                .supplement-checkbox.checked { background: #f27405; border-color: #f27405; }
                .supplement-name { font-size: 14px; color: #3a2e2a; font-weight: 500; }
                .supplement-price { font-size: 14px; font-weight: 700; color: #f27405; }
                .sheet-footer { display: flex; align-items: center; gap: 15px; margin-top: 25px; padding-top: 20px; border-top: 2px solid #f0e8e0; }
                .qty-control { display: flex; align-items: center; gap: 12px; }
                .qty-btn { width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
                .qty-minus { background: #f0f0f0; color: #666; }
                .qty-minus:hover { background: #ff5252; color: white; }
                .qty-plus { background: #f27405; color: white; }
                .qty-plus:hover { background: #e06600; transform: scale(1.1); }
                .qty-num { font-size: 18px; font-weight: 800; color: #3a2e2a; min-width: 25px; text-align: center; }
                .add-cart-btn { flex: 1; padding: 16px; border: none; border-radius: 50px; background: linear-gradient(135deg, #f27405, #e06600); color: white; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 5px 20px rgba(242,116,5,0.35); transition: all 0.3s ease; }
                .add-cart-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(242,116,5,0.45); }
                .add-cart-price { background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 20px; font-size: 15px; font-weight: 900; animation: pricePop 0.3s ease; }
                .loading { text-align: center; padding: 80px 20px; }
                .spinner { font-size: 50px; animation: spin 1s linear infinite; display: block; margin-bottom: 20px; }
            `}</style>

            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/restaurants" className="logo">🌿 Fresh Bites</Link>
                <div className="nav-actions">
                    <Link to="/my-orders" className="nav-btn btn-outline">📦 My Orders</Link>
                    <button className="cart-btn" onClick={() => navigate("/cart")}>
                        🛒 Cart
                        {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                    </button>
                    <button className="nav-btn btn-logout" onClick={() => { logout(); navigate("/"); }}>
                        🚪 Logout
                    </button>
                </div>
            </nav>

            {loading ? (
                <div className="loading">
                    <span className="spinner">🍽️</span>
                    <p>Loading menu...</p>
                </div>
            ) : (
                <>
                    {/* HERO */}
                    <div className="hero">
                        <img src={resto.image} alt={resto.name} className="hero-img"
                            onError={(e) => e.target.src = "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800"} />
                        <Link to="/restaurants" className="back-btn">← Retour</Link>
                        <div className="hero-overlay">
                            <div className="hero-content">
                                <h1 className="hero-name">{resto.name}</h1>
                                <div className="hero-meta">
                                    <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}>
                                        {liked ? '❤️' : '🤍'}
                                    </button>
                                    <span className="hero-tag">⭐ {resto.rating}%</span>
                                    <span className="hero-tag">⏱️ {resto.time}</span>
                                    <span className={`hero-tag ${resto.delivery === "Free" ? "free" : ""}`}>
                                        🛵 Livraison: {resto.delivery === "Free" ? "🎉 Gratuite" : resto.delivery}
                                    </span>
                                    <span className="hero-tag">📍 {resto.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="content">
                        {/* TOP VENTES */}
                        {topSales.length > 0 && (
                            <>
                                <div className="section-title">🔥 Top Ventes</div>
                                <div className="top-ventes-grid">
                                    {topSales.slice(0, 2).map((item, index) => (
                                        <div key={item.id} className="top-card" onClick={() => openSheet(item)} style={{ animationDelay: `${index * 0.1}s` }}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="top-card-img" onError={(e) => e.target.style.display = 'none'} />
                                            ) : (
                                                <div className="top-card-img-placeholder">🍽️</div>
                                            )}
                                            <div className="top-card-body">
                                                <div>
                                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px" }}>
                                                        <span className="top-card-name">{item.name}</span>
                                                        <span className="top-sale-badge">🔥 TOP</span>
                                                    </div>
                                                    <p className="top-card-ingredients">{item.ingredients}</p>
                                                </div>
                                                <div className="top-card-footer">
                                                    <span className="top-card-price">{item.price} DT</span>
                                                    <button className="add-btn-small" onClick={(e) => { e.stopPropagation(); openSheet(item); }}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ALL MENU */}
                        <div className="section-title">🍴 Notre Menu</div>
                        <div className="menu-grid">
                            {availableItems.map((item, index) => (
                                <div key={item.id} className="menu-card" onClick={() => openSheet(item)} style={{ animationDelay: `${index * 0.08}s` }}>
                                    <div className="item-img-wrapper">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="item-img" onError={(e) => e.target.style.display = 'none'} />
                                        ) : (
                                            <div className="item-img-placeholder">🍽️</div>
                                        )}
                                    </div>
                                    <div className="item-body">
                                        <h4 className="item-name">{item.name}</h4>
                                        <p className="item-ingredients">{item.ingredients}</p>
                                        <div className="item-footer">
                                            <span className="item-price">{item.price} DT</span>
                                            <button className="plus-btn" onClick={(e) => { e.stopPropagation(); openSheet(item); }}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* UNAVAILABLE */}
                        {unavailableItems.length > 0 && (
                            <>
                                <div className="unavailable-title">🚫 Temporairement indisponible</div>
                                <div className="menu-grid">
                                    {unavailableItems.map((item) => (
                                        <div key={item.id} className="menu-card unavailable">
                                            <div className="item-img-wrapper">
                                                <div className="item-img-placeholder">🍽️</div>
                                                <div className="unavailable-overlay">Non disponible</div>
                                            </div>
                                            <div className="item-body">
                                                <h4 className="item-name">{item.name}</h4>
                                                <div className="item-footer">
                                                    <span className="item-price">{item.price} DT</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* BOTTOM SHEET */}
                    {sheetOpen && selectedItem && (
                        <>
                            <div className="sheet-overlay" onClick={closeSheet} />
                            <div className="bottom-sheet">
                                <div className="sheet-handle" onClick={closeSheet} />
                                {selectedItem.image ? (
                                    <img src={selectedItem.image} alt={selectedItem.name} className="sheet-img" onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <div className="sheet-img-placeholder">🍽️</div>
                                )}
                                <div className="sheet-body">
                                    <div className="sheet-header">
                                        <h2 className="sheet-name">{selectedItem.name}</h2>
                                        <span className="sheet-base-price">{selectedItem.price} DT</span>
                                    </div>
                                    <div className="sheet-ingredients">
                                        <div className="sheet-ingredients-title">🥬 Ingrédients</div>
                                        <div className="sheet-ingredients-text">{selectedItem.ingredients}</div>
                                    </div>
                                    {selectedItem.supplements && selectedItem.supplements.length > 0 && (
                                        <>
                                            <div className="supplements-title">➕ Suppléments</div>
                                            {selectedItem.supplements.map((supp, i) => {
                                                const isChecked = selectedSupplements.find(s => s.name === supp.name);
                                                return (
                                                    <div key={i} className="supplement-item" onClick={() => toggleSupplement(supp)}>
                                                        <div className="supplement-left">
                                                            <div className={`supplement-checkbox ${isChecked ? 'checked' : ''}`}>
                                                                {isChecked && <span style={{ color: "white", fontSize: "14px" }}>✓</span>}
                                                            </div>
                                                            <span className="supplement-name">{supp.name}</span>
                                                        </div>
                                                        <span className="supplement-price">+ {supp.price} DT</span>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                    <div className="sheet-footer">
                                        <div className="qty-control">
                                            <button className="qty-btn qty-minus" onClick={() => setItemQuantity(q => Math.max(1, q - 1))}>−</button>
                                            <span className="qty-num">{itemQuantity}</span>
                                            <button className="qty-btn qty-plus" onClick={() => setItemQuantity(q => q + 1)}>+</button>
                                        </div>
                                        <button className="add-cart-btn" onClick={addToCartFromSheet}>
                                            🛒 Ajouter
                                            <span className="add-cart-price" key={getSheetTotal()}>{getSheetTotal()} DT</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
}