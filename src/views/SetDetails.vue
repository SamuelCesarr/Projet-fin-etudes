<template>
    <div class="setContainer">
        <!-- Affiche la liste des extensions -->
        <div v-if="!currentSetId" class="setList">
            <h1>Extensions</h1>

            <div v-if="loading">Chargement...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else class="sets">
                <div v-for="set in sets" :key="set.id" class="set">
                    <router-link :to="{ name: 'SetDetailsDetail', params: { id: set.id } }">
                        <img v-if="set.images?.logo" :src="set.images.logo" alt="Logo de l'extension" class="logoSet" />
                        <h2>{{ set.name }} <span class="cards-count">({{ set.cardsCount }} cartes)</span></h2>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Affiche les cartes d'une extension -->
        <div v-else class="setCardsDetail">
            <div class="setHeader">
                <router-link :to="{ name: 'SetDetails' }" class="backButton">← Retour aux extensions</router-link>
                <h1>{{ currentSetName }} ({{ setCards.length }} cartes)</h1>
            </div>

            <div v-if="loading" class="loading">Chargement des cartes...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="setCards.length === 0" class="no-results">
                Aucune carte trouvée pour cette extension.
            </div>
            <div v-else class="cardsGrid">
                <div v-for="card in setCards" :key="card.id" class="card">
                    <router-link :to="{ name: 'CardDetails', params: { id: card.id } }">
                        <div class="cardImage" :style="{ backgroundImage: `url(${card.image})` }"></div>
                        <div class="cardInfo">
                            <h3>{{ card.name }}</h3>
                            <p class="cardType">{{ card.category }}</p>
                        </div>
                    </router-link>
                    <BoutonLike :cardId="card.id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './SetDetails.css'
import BoutonLike from '../components/BoutonLike.vue'
export default {
    name: 'SetDetails',
    components: {
        BoutonLike
    },
    data() {
        return {
            sets: [],
            setCards: [],
            loading: true,
            error: null,
            currentSetId: null,
            currentSetName: null
        }
    },
    mounted() {
        const setId = this.$route.params.id
        if (setId) {
            this.currentSetId = setId
            this.fetchSetCards(setId)
        } else {
            this.fetchSets()
        }
    },
    watch: {
        '$route.params.id': function (newId) {
            if (newId) {
                this.currentSetId = newId
                this.fetchSetCards(newId)
            } else {
                this.currentSetId = null
                this.fetchSets()
            }
        }
    },
    methods: {
        async fetchSets() {
            try {
                this.loading = true
                this.error = null

                // Récupérer la liste des sets
                const response = await fetch('https://api.tcgdex.net/v2/en/sets')
                const data = await response.json()

                // Filtrer seulement les sets Pocket
                const pocketSets = data.filter(set => {
                    const id = set.id?.toLowerCase() || ''
                    return /^[ab]\d+[a-z]?$/.test(id) || /^p-[a-z]+$/.test(id)
                })

                // Pour chaque set, récupérer le nombre de cartes via son endpoint
                const setsWithCount = await Promise.all(pocketSets.map(async set => {
                    try {
                        const setDetailResp = await fetch(`https://api.tcgdex.net/v2/en/sets/${set.id}`)
                        const setDetail = await setDetailResp.json()
                        const cardsCount = setDetail.cards?.length || 0
                        return { ...set, cardsCount }
                    } catch (err) {
                        console.warn(`Erreur récupération du set ${set.id}:`, err)
                        return { ...set, cardsCount: 0 }
                    }
                }))

                this.sets = setsWithCount

            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        async fetchSetCards(setId) {
            try {
                this.loading = true
                this.error = null
                this.setCards = []

                // Récupérer les infos du set
                const setResponse = await fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`)
                const setData = await setResponse.json()
                this.currentSetName = setData.name

                // Récupérer TOUTES les cartes
                const response = await fetch('https://api.tcgdex.net/v2/en/cards')
                const allCards = await response.json()

                // Filtrer les cartes du set
                const setPrefix = `${setId}-`
                const setCardsRaw = allCards.filter(card => card.id.startsWith(setPrefix))
                console.log(`Cartes pour le set ${setId}:`, setCardsRaw.length)

                // Mettre à jour le compteur dans la liste des sets
                const index = this.sets.findIndex(s => s.id === setId)
                if (index > -1) {
                    this.sets[index].cardsCount = setCardsRaw.length
                }

                // Transformer les cartes pour l'affichage
                const batchSize = 40
                const transformed = []
                for (let i = 0; i < setCardsRaw.length; i += batchSize) {
                    const batch = setCardsRaw.slice(i, i + batchSize)
                    const batchPromises = batch.map(card =>
                        this.fetchCardDetails(card.id)
                            .then(fullCard => ({
                                id: fullCard.id,
                                name: fullCard.name,
                                image: fullCard.image ? `${fullCard.image}/high.webp` : '',
                                category: fullCard.supertype || fullCard.category || 'Unknown'
                            }))
                            .catch(err => {
                                console.warn(`Erreur récupération ${card.id}:`, err)
                                return null
                            })
                    )
                    const results = await Promise.all(batchPromises)
                    transformed.push(...results.filter(r => r !== null))
                }

                this.setCards = transformed

                if (this.setCards.length === 0) {
                    this.error = "Aucune carte trouvée pour cette extension."
                }

            } catch (err) {
                console.error("Erreur récupération:", err)
                this.error = `Erreur: ${err.message}`
            } finally {
                this.loading = false
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
        }
    }
}
</script>