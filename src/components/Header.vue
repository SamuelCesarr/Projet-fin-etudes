<template>
    <header class="header">
        <div class="logo">
            <router-link to="/">
                <img :src="logo" alt="Logo Pokémon Library" />
            </router-link>
        </div>

        <nav>
            <ul>
                <li><router-link :to="{ name: 'Home' }">Accueil</router-link></li>
                <li><router-link :to="{ name: 'PokemonDetails', params: { id: 1 } }">Pokémon</router-link></li>
                <li><router-link :to="{ name: 'TrainerDetails', params: { id: 1 } }">Trainers</router-link></li>
                <li><router-link :to="{ name: 'SetDetails' }">Extensions</router-link></li>
                <li><router-link :to="{ name: 'Favorites' }">
                        Favoris
                        <span v-if="favoritesCount > 0">({{ favoritesCount }})</span>
                    </router-link></li>
            </ul>
        </nav>
    </header>
</template>

<script>
import './Header.css'
import logo from '../assets/logo.png'

export default {
    name: 'Header',
    data() {
        return {
            favoritesCount: 0,
            logo
        }
    },
    mounted() {
        // Initialiser le compteur de favoris au chargement du composant
        this.updateFavoritesCount()
        // Écouter les changements dans localStorage
        window.addEventListener('storage', this.updateFavoritesCount)
    },
    beforeUnmount() {
        // Nettoyer l'écouteur d'événements lors de la destruction du composant
        // Évite les fuites mémoire
        window.removeEventListener('storage', this.updateFavoritesCount)
    },
    methods: {
        /**
         * Met à jour le compteur de favoris affiché dans le header
         * Lit les favoris depuis localStorage et affiche leur nombre
         */
        updateFavoritesCount() {
            try {
                const stored = localStorage.getItem('pokemon_favorites')
                const favorites = stored ? JSON.parse(stored) : []
                this.favoritesCount = favorites.length
            } catch (error) {
                console.error('Erreur lors de la récupération du nombre de favoris:', error)
                this.favoritesCount = 0
            }
        }
    }
}
</script>