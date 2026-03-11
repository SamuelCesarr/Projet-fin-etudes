<template>
    <div class="favorites">
        <h1>Mes cartes favorites</h1>

        <div v-if="loading">Chargement...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="favoriteCards.length === 0" class="no-favorites">
            <p>Vous n'avez encore ajouté aucune carte à vos favoris.</p>
            <p>Parcourez les cartes et cliquez sur le cœur pour les ajouter !</p>
        </div>
        <div v-else class="cardsGrid">
            <div v-for="card in favoriteCards" :key="card.id" class="card">
                <router-link :to="{ name: 'CardDetails', params: { id: card.id } }">
                    <div class="cardImage" :style="{ backgroundImage: `url(${card.image})` }"></div>
                    <div class="cardInfo">
                        <h3>{{ card.name }}</h3>
                        <p>{{ card.set }}</p>
                    </div>
                </router-link>
                <BoutonLike :cardId="card.id" @like-changed="onLikeChanged" />
            </div>
        </div>
    </div>
</template>

<script>
import './Favorites.css'
import './PokemonDetails.css'
import BoutonLike from '../components/BoutonLike.vue'

export default {
    name: 'Favorites',
    components: {
        BoutonLike
    },
    data() {
        return {
            favoriteCards: [],
            loading: true,
            error: null
        }
    },
    mounted() {
        // Charger les favoris au montage du composant
        this.loadFavorites()
    },
    methods: {
        /**
         * Charge les cartes favorites et leurs détails
         * Utilise localStorage pour les IDs et l'API TCGdex pour les détails
         * Traite les cartes par batch (20 à la fois) pour optimiser les performances
         */
        async loadFavorites() {
            try {
                this.loading = true
                this.error = null

                // Récupérer les IDs des cartes favorites depuis localStorage
                const likedCards = this.getLikedCards()
                if (likedCards.length === 0) {
                    this.favoriteCards = []
                    return
                }

                // Récupérer les détails de chaque carte favorite par batch
                // Évite de surcharger l'API avec trop de requêtes simultanées
                const batchSize = 20
                const transformed = []

                for (let i = 0; i < likedCards.length; i += batchSize) {
                    const batch = likedCards.slice(i, i + batchSize)
                    const batchPromises = batch.map(cardId =>
                        this.fetchCardDetails(cardId).then(fullCard => {
                            return {
                                id: fullCard.id,
                                name: fullCard.name,
                                image: fullCard.image ? `${fullCard.image}/high.webp` : '',
                                set: fullCard.set?.name || 'Unknown'
                            }
                        }).catch(err => {
                            console.warn(`Erreur récupération ${cardId}:`, err)
                            return null
                        })
                    )

                    const results = await Promise.all(batchPromises)
                    transformed.push(...results.filter(r => r !== null))
                }

                this.favoriteCards = transformed

            } catch (err) {
                console.error("Erreur récupération des favoris:", err)
                this.error = `Erreur: ${err.message}`
            } finally {
                this.loading = false
            }
        },

        /**
         * Récupère les IDs des cartes favorites depuis localStorage
         */
        getLikedCards() {
            try {
                const stored = localStorage.getItem('pokemon_favorites')
                return stored ? JSON.parse(stored) : []
            } catch (error) {
                console.error('Erreur lors de la récupération des favoris:', error)
                return []
            }
        },

        /**
         * Récupère les détails complets d'une carte via l'API TCGdex
         * Utilise sessionStorage comme cache pour éviter les requêtes répétées
         * @param {string} cardId - ID de la carte TCGdex
         */
        async fetchCardDetails(cardId) {
            try {
                const key = `tcgdex_card_${cardId}`
                const cached = sessionStorage.getItem(key)
                if (cached) {
                    return JSON.parse(cached)
                }
            } catch (e) {
            }

            const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${cardId}`)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            const data = await response.json()
            try {
                sessionStorage.setItem(`tcgdex_card_${cardId}`, JSON.stringify(data))
            } catch (e) {
            }
            return data
        },

        /**
         * Gère les changements de statut "like" d'une carte
         * Si une carte est retirée des favoris, recharge la liste
         */
        onLikeChanged(data) {
            // Recharger les favoris quand une carte est retirée
            if (!data.isLiked) {
                this.loadFavorites()
            }
        }
    }
}
</script>