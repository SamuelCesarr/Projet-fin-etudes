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
                        <h2>{{ set.name }}</h2>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Affiche les cartes d'une extension -->
        <div v-else class="setCardsDetail">
            <div class="setHeader">
                <router-link :to="{ name: 'SetDetails' }" class="backButton">← Retour aux extensions</router-link>
                <h1>{{ currentSetName }}</h1>
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
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './SetDetails.css'
export default {
    name: 'SetDetails',
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
        '$route.params.id': function(newId) {
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
                const response = await fetch('https://api.tcgdex.net/v2/en/sets')
                const data = await response.json()

                // Filtrer seulement les sets Pocket
                const pocketSets = data.filter(set => {
                    const id = set.id?.toLowerCase() || ''
                    return /^[ab]\d+[a-z]?$/.test(id) || /^p-[a-z]+$/.test(id)
                })

                this.sets = pocketSets
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

                // Récupérer TOUTES les cartes du jeu
                const response = await fetch('https://api.tcgdex.net/v2/en/cards')
                let allCards = await response.json()
                
                // Filtrer les cartes qui appartiennent à ce set (l'ID commence par le setId)
                const setPrefix = `${setId}-`
                const setCards = allCards.filter(card => card.id.startsWith(setPrefix))

                console.log(`Cartes pour le set ${setId}:`, setCards.length)

                // Récupérer les détails complets de chaque carte en parallèle (par batch)
                const batchSize = 40
                const transformed = []

                for (let i = 0; i < setCards.length; i += batchSize) {
                    const batch = setCards.slice(i, i + batchSize)
                    const batchPromises = batch.map(card => 
                        this.fetchCardDetails(card.id).then(fullCard => {
                            return {
                                id: fullCard.id,
                                name: fullCard.name,
                                image: fullCard.image ? `${fullCard.image}/high.webp` : '',
                                category: fullCard.supertype || fullCard.category || 'Unknown'
                            }
                        }).catch(err => {
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