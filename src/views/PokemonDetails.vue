<template>
    <div class="pokemonList">
        <h1>Cartes Pokémon</h1>

        <BoutonFiltre :filters="filters" :boosters="availableBoosters" :setMap="setMap"
            :availableRarities="availableRarities" :availableTypes="availableTypes" :availableStages="availableStages"
            @reset-filters="resetFilters" @filters-changed="onFiltersChanged" />
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
                            <div class="cardTextInfo">
                                <h3>{{ card.name }}</h3>
                                <p>{{ card.set }} - {{ card.setName }}</p>
                            </div>
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
    name: 'PokemonDetails',
    components: {
        BoutonFiltre,
        BoutonLike,
        BarreRecherche
    },
    data() {
        return {
            allCards: [], // Toutes les cartes Pokémon Pocket chargées
            cards: [],
            loading: true, // État du chargement des données
            error: null, // Message d'erreur s'il y a un problème
            setMap: {}, // Mapping des IDs de set vers leur nom
            availableBoosters: [], // Liste des extensions disponibles
            availableRarities: [], // Raretés disponibles dans les cartes loadés
            availableTypes: [], // Types disponibles
            availableStages: [], // Stades d'évolution disponibles
            filters: {
                rarities: [],
                types: [],
                stages: [],
                isEx: false,
                isMega: false,
                boosters: []
            },
            searchQuery: "" // Texte de recherche saisi
        }
    },
    computed: {
        /**
         * Filtre les cartes selon les critères actuels
         * Combine filtres de rareté, type, stade, boosters et recherche
         */
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
        // Charger les cartes Pokémon au montage du composant
        this.fetchPokemonCards()
    },
    methods: {
        /**
         * Récupère les cartes Pokémon depuis l'API TCGdex
         * - Filtre les cartes pour ne garder que celles de Pokémon Pocket
         * - Charge les détails complets en parallèle par batch (40 à la fois)
         * - Construit la liste complète avec informations de rareté, type, etc.
         */
        async fetchPokemonCards() {
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

                // Récupérer uniquement les cartes Pokémon
                const response = await fetch(
                    'https://api.tcgdex.net/v2/en/cards?category=Pokemon'
                )

                const pokemonCards = await response.json()
                console.log("Total Pokemon:", pokemonCards.length)

                const getSetCode = (id) => {
                    const match = id.match(/^(A\d+[a-z]?|B\d+[a-z]?|P-[A-Z]+)/i)
                    return match ? match[0].toUpperCase() : null
                }

                // Filtrer les cartes Pocket
                const pocketCards = pokemonCards.filter(card => {
                    const setCode = getSetCode(card.id)
                    return setCode && pocketSetIds.includes(setCode)
                })

                console.log("Pocket Pokemon:", pocketCards.length)

                // Récupérer les détails complets de chaque carte en parallèle (par batch)
                // Augmenter batchSize pour réduire overhead réseau
                const batchSize = 40
                const transformed = []

                for (let i = 0; i < pocketCards.length; i += batchSize) {
                    const batch = pocketCards.slice(i, i + batchSize)
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
                                stage: fullCard.stage || 'Basic',
                                isEx: fullCard.name.includes(' ex') || fullCard.name.includes(' EX'),
                                isMega: fullCard.name.includes('Mega ') || fullCard.name.includes('M '),
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
                    const [setA, numA] = a.id.split('-')
                    const [setB, numB] = b.id.split('-')

                    if (setA === setB) {
                        const numAInt = parseInt(numA) || 0
                        const numBInt = parseInt(numB) || 0
                        return numAInt - numBInt
                    }

                    return setA.localeCompare(setB)
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

        /**
         * Récupère les détails complets d'une carte depuis l'API TCGdex
         * Utilise sessionStorage comme cache pour réduire les appels réseau
         * @param {string} cardId - ID de la carte
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
         * Réinitialise tous les filtres à leurs valeurs par défaut
         */
        resetFilters() {
            this.filters = {
                rarities: [],
                types: [],
                stages: [],
                isEx: false,
                isMega: false,
                boosters: []
            }
        },

        /**
         * Met à jour les filtres locaux depuis le composant enfant BoutonFiltre
         * @param {Object} newFilters - Nouveaux filtres depuis BoutonFiltre
         */
        onFiltersChanged(newFilters) {
            this.filters = Object.assign({}, newFilters)
        },

        /**
         * Extrait les options de filtre disponibles depuis les cartes chargées
         * Construit les listes de raretés, types et stades uniques
         */
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

        /**
         * Met à jour la requête de recherche
         * Déclenche le filtrage réactif des cartes
         * @param {string} query - Texte saisi par l'utilisateur
         */
        updateSearch(query) {
            this.searchQuery = query
        }
    }
}
</script>