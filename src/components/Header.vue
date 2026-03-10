<template>
    <nav>
        <ul>
            <li><router-link :to="{ name: 'Home' }">Accueil</router-link></li>
            <li><router-link :to="{ name: 'PokemonDetails', params: { id: 1 } }">Pokémon</router-link></li>
            <li><router-link :to="{ name: 'TrainerDetails', params: { id: 1 } }">Trainers</router-link></li>
            <li><router-link :to="{ name: 'SetDetails' }">Extensions</router-link></li>
            <li><router-link :to="{ name: 'Favorites' }">
                Favoris
                <span v-if="favoritesCount > 0" >({{ favoritesCount }})</span>
            </router-link></li>
        </ul>
    </nav>
</template>

<script>
import './Header.css'

export default {
    name: 'Header',
    data() {
        return {
            favoritesCount: 0
        }
    },
    mounted() {
        this.updateFavoritesCount()
        // Écouter les changements dans localStorage
        window.addEventListener('storage', this.updateFavoritesCount)
    },
    beforeUnmount() {
        window.removeEventListener('storage', this.updateFavoritesCount)
    },
    methods: {
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