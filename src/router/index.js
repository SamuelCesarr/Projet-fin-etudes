import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import PokemonDetails from "../views/PokemonDetails.vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import DetailsLayout from "../layouts/DetailsLayout.vue";
import TrainerDetails from "../views/TrainerDetails.vue";
import CardDetails from "../views/CardDetails.vue";
import SetDetails from "../views/SetDetails.vue";
import Favorites from "../views/Favorites.vue";

const routes = [
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

const router = createRouter({
    history: createWebHistory('/Projet-fin-etudes/'),
    routes,
});

export default router;