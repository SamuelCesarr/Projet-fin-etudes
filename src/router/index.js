import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import PokemonDetails from "../views/PokemonDetails.vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import DetailsLayout from "../layouts/DetailsLayout.vue";
import TrainerDetails from "../views/TrainerDetails.vue";
import CardDetails from "../views/CardDetails.vue";
import SetDetails from "../views/SetDetails.vue";
import Favorites from "../views/Favorites.vue";

// Configuration des routes de l'application
// Utilise Vue Router pour gérer la navigation entre les différentes vues
const routes = [
    // Route par défaut avec layout principal pour la page d'accueil et les favoris
    {
        path: "/*",
        name: "DefaultLayout",
        component: DefaultLayout,
        redirect: "/",
        children: [
            {
                path: "/",
                name: "Home",
                component: Home,
            },
            {
                path: "/favorites",
                name: "Favorites",
                component: Favorites,
            }
        ],
    },
    // Route pour les détails des Pokémon avec layout détaillé
    {
        path: "/PokemonDetails",
        name: "PokemonDetailsLayout",
        component: DetailsLayout,
        redirect: "/PokemonDetails",
        children: [
            {
                path: "/pokemon/:id",
                name: "PokemonDetails",
                component: PokemonDetails,
            }
        ],
    },
    // Route pour les détails des Trainers avec layout détaillé
    {
        path: "/TrainerDetails",
        name: "TrainerDetailsLayout",
        component: DetailsLayout,
        redirect: "/TrainerDetails",
        children: [
            {
                path: "/trainer/:id",
                name: "TrainerDetails",
                component: TrainerDetails,
            }
        ],
    },
    // Route pour les détails des cartes individuelles
    {
        path: "/CardDetails",
        name: "CardLayout",
        component: DetailsLayout,
        redirect: "/CardDetails",
        children: [
            {
                path: "/card/:id",
                name: "CardDetails",
                component: CardDetails,
            }
        ],
    },
    // Route pour les extensions (sets) et leurs cartes
    {
        path: "/set",
        name: "SetLayout",
        component: DetailsLayout,
        children: [
            {
                path: "",
                name: "SetDetails",
                component: SetDetails,
            },
            {
                path: ":id",
                name: "SetDetailsDetail",
                component: SetDetails,
            }
        ],
    }
];

// Création du router avec historique basé sur l'URL
const router = createRouter({
    history: createWebHistory('/Projet-fin-etudes/'),
    routes,
});

export default router;