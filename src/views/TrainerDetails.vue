<template>
    <div class="pokemonList">
        <h1>Cartes Trainer</h1>

        <BoutonFiltre
            :filters="filters" 
            :boosters="availableBoosters"
            :setMap="setMap"
            :availableRarities="availableRarities"
            :availableTypes="availableTypes"
            :availableStages="availableStages"
            @reset-filters="resetFilters"
            @filters-changed="onFiltersChanged"
        />
        <BarreRecherche @search="updateSearch" />

        <div v-if="loading" class="loading">Chargement...</div>

        <div v-else class="cardsDisplay">
            <div v-if="error" class="error">{{ error }}</div>
            <div v-else-if="filteredCards.length === 0" class="no-results">
                Aucune carte trouvée avec les filtres sélectionnés.
            </div>

            <div v-else class="cardsGrid">
                <div v-for="card in filteredCards" :key="card.id" class="card">
                    <router-link :to="{ name: 'CardDetails', params: { id: card.id } }">
                        <div class="cardImage" :style="{ backgroundImage: `url(${card.image})` }"></div>
                        <div class="cardInfo">
                            <h3>{{ card.name }}</h3>
                            <p>{{ card.set }} - {{ card.setName }}</p>
                        </div>
                    </router-link>
                    <BoutonLike :cardId="card.id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './PokemonDetails.css'
import BoutonFiltre from '../components/BoutonFiltre.vue'
import BoutonLike from '../components/BoutonLike.vue'
import BarreRecherche from '../components/BarreRecherche.vue';

export default {
    name: 'TrainerDetails',
    components: {
        BoutonFiltre,
        BoutonLike,
        BarreRecherche
    },
    data() {
        return {
            allCards: [],
            cards: [],
            loading: true,
            error: null,
            setMap: {},
            availableBoosters: [],
            availableRarities: [],
            availableTypes: [],
            availableStages: [],
            filters: {
                rarities: [],
                types: [],
                stages: [],
                isEx: false,
                isMega: false,
                boosters: []
            },
            searchQuery: ""
        }
    },
    computed: {
        filteredCards() {
            return this.allCards.filter(card => {
                // Filtre Recherche
                if (this.searchQuery) {
                    const query = this.searchQuery.toLowerCase()

                    if (
                        !card.name.toLowerCase().includes(query) &&
                        !card.setName.toLowerCase().includes(query)
                    ) {
                        return false
                    }
                }

                // Filtre Rareté
                if (this.filters.rarities.length > 0) {
                    if (!this.filters.rarities.includes(card.rarity)) {
                        return false
                    }
                }

                // Filtre Type
                if (this.filters.types.length > 0) {
                    if (!card.types || !card.types.some(t => this.filters.types.includes(t))) {
                        return false
                    }
                }

                // Filtre Stade d'évolution
                if (this.filters.stages.length > 0) {
                    if (!this.filters.stages.includes(card.stage)) {
                        return false
                    }
                }

                // Filtre Pokémon ex
                if (this.filters.isEx && !card.isEx) {
                    return false
                }

                // Filtre Mega Evolution
                if (this.filters.isMega && !card.isMega) {
                    return false
                }

                // Filtre Booster Pack
                if (this.filters.boosters.length > 0) {
                    if (!this.filters.boosters.includes(card.set)) {
                        return false
                    }
                }

                return true
            })
        }
    },
    mounted() {
        this.fetchTrainerCards()
    },
    methods: {
        async fetchTrainerCards() {
            try {
                this.loading = true
                this.error = null
                this.allCards = []

                // Récupérer sets Pocket
                const setsResponse = await fetch('https://api.tcgdex.net/v2/en/sets')
                const sets = await setsResponse.json()

                const setMap = {}
                sets.forEach(set => {
                    setMap[set.id.toUpperCase()] = set.name
                })

                this.setMap = setMap

                const pocketSetIds = sets
                    .filter(set => {
                        const id = set.id?.toLowerCase() || ''
                        return /^[ab]\d+[a-z]?$/.test(id) || /^p-[a-z]+$/.test(id)
                    })
                    .map(set => set.id.toUpperCase())

                console.log("Sets Pocket:", pocketSetIds)

                // Récupérer uniquement les cartes Trainer
                const response = await fetch(
                    'https://api.tcgdex.net/v2/en/cards?category=Trainer'
                )

                const trainerCards = await response.json()
                console.log("Total Trainers:", trainerCards.length)

                const getSetCode = (id) => {
                    const match = id.match(/^(A\d+[a-z]?|B\d+[a-z]?|P-[A-Z]+)/i)
                    return match ? match[0].toUpperCase() : null
                }

                // Filtrer les cartes Pocket
                const pocketTrainerCards = trainerCards.filter(card => {
                    const setCode = getSetCode(card.id)
                    return setCode && pocketSetIds.includes(setCode)
                })

                console.log("Pocket Trainers:", pocketTrainerCards.length)

                // Récupérer les détails complets de chaque carte en parallèle (par batch)
                const batchSize = 40
                const transformed = []

                for (let i = 0; i < pocketTrainerCards.length; i += batchSize) {
                    const batch = pocketTrainerCards.slice(i, i + batchSize)
                    const batchPromises = batch.map(card => 
                        this.fetchCardDetails(card.id).then(fullCard => {
                            const setCode = getSetCode(fullCard.id)
                            return {
                                id: fullCard.id,
                                name: fullCard.name,
                                image: fullCard.image ? `${fullCard.image}/high.webp` : '',
                                set: setCode,
                                setName: setMap[setCode] || setCode,
                                rarity: fullCard.rarity || 'Common',
                                types: fullCard.types || ['Colorless'],
                                stage: fullCard.stage || 'N/A',
                                isEx: false,
                                isMega: false,
                                fullData: fullCard
                            }
                        }).catch(err => {
                            console.warn(`Erreur récupération ${card.id}:`, err)
                            return null
                        })
                    )

                    const results = await Promise.all(batchPromises)
                    transformed.push(...results.filter(r => r !== null))
                }

                this.allCards = transformed.sort((a, b) => {
                    if (a.set === b.set) {
                        return a.id.localeCompare(b.id)
                    }
                    return a.set.localeCompare(b.set)
                })

                this.cards = this.allCards

                // Extraire les boosters disponibles
                const boosterSet = new Set(this.allCards.map(c => c.set).filter(Boolean))
                this.availableBoosters = Array.from(boosterSet).sort()

                // Extraire les raretés, types et stages disponibles
                this.extractFilterOptions()

                if (this.cards.length === 0) {
                    this.error = "Aucune carte trouvée."
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
        },

        resetFilters() {
            this.filters = {
                rarities: [],
                types: [],
                stages: [],
                isEx: false,
                isMega: false,
                boosters: []
            }
        }
        ,

        onFiltersChanged(newFilters) {
            this.filters = Object.assign({}, newFilters)
        },

        extractFilterOptions() {
            const rarities = new Set()
            const types = new Set()
            const stages = new Set()

            this.allCards.forEach(card => {
                if (card.rarity) rarities.add(card.rarity)
                if (card.stage) stages.add(card.stage)
                if (card.types && Array.isArray(card.types)) {
                    card.types.forEach(t => types.add(t))
                }
            })

            this.availableRarities = Array.from(rarities)
            this.availableTypes = Array.from(types)
            this.availableStages = Array.from(stages)
        },

        updateSearch(query) {
            this.searchQuery = query
        }
    }
}
</script>