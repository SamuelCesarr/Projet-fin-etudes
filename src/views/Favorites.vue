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
        this.loadFavorites()
    },
    methods: {
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

                // Récupérer les détails de chaque carte favorite
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

        getLikedCards() {
            try {
                const stored = localStorage.getItem('pokemon_favorites')
                return stored ? JSON.parse(stored) : []
            } catch (error) {
                console.error('Erreur lors de la récupération des favoris:', error)
                return []
            }
        },

        async fetchCardDetails(cardId) {
            // Try sessionStorage cache first to reduce network calls
            try {
                const key = `tcgdex_card_${cardId}`
                const cached = sessionStorage.getItem(key)
                if (cached) {
                    return JSON.parse(cached)
                }
            } catch (e) {
                // ignore storage errors
            }

            const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${cardId}`)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            const data = await response.json()
            try {
                sessionStorage.setItem(`tcgdex_card_${cardId}`, JSON.stringify(data))
            } catch (e) {
                // ignore storage quota errors
            }
            return data
        },

        onLikeChanged(data) {
            // Recharger les favoris quand une carte est retirée
            if (!data.isLiked) {
                this.loadFavorites()
            }
        }
    }
}
</script>

<style scoped>
.favorites {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #242424;
}

.favorites h1 {
  text-align: center;
  font-size: 2rem;
  color: #FED000;
  background-color: #242424;
  margin: 0;
  padding: 20px 0;
}

.no-favorites {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
  background-color: #242424;
}

.no-favorites p {
  margin: 10px 0;
}

.cardsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  padding: 24px;
  background-color: #242424;
  width: 100%;
}

.card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  position: relative;
}

.card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card a {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cardImage {
  width: 100%;
  padding-top: 140%;
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
}

.card:hover .cardImage {
  transform: scale(1.05);
}

.cardInfo {
  padding: 12px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cardInfo h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #FED000;
  line-height: 1.3;
}

.cardInfo p {
  margin: 0;
  font-size: 12px;
  color: #aaa;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #FED000;
  font-size: 18px;
  background-color: #242424;
}

.error {
  text-align: center;
  padding: 40px 20px;
  color: #ff6b6b;
  font-size: 16px;
  background-color: #242424;
}
</style>