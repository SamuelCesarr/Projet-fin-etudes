import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import PokemonDetails from "../views/PokemonDetails.vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import DetailsLayout from "../layouts/DetailsLayout.vue";
import TrainerDetails from "../views/TrainerDetails.vue";
import CardDetails from "../views/CardDetails.vue";

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;