<template>
    <div class="pokemonList">
        <h1>Cartes Pokémon TCG Pocket</h1>

        <div v-if="loading">Chargement...</div>

        <div v-else class="cardsDisplay">
            <div v-if="error" class="error">{{ error }}</div>
            <div v-else-if="cards.length === 0">Aucune carte trouvée.</div>
            <div v-else class="cardsGrid">
                <div v-for="card in cards" :key="card.id" class="card">
                    <router-link :to="{ name: 'CardDetails', params: { id: card.id } }">
                        <div class="cardImage" :style="{ backgroundImage: `url(${card.image})` }"></div>
                        <div class="cardInfo">
                            <h3>{{ card.name }}</h3>
                            <p>{{ card.set }}</p>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './PokemonDetails.css'

export default {
    name: 'PokemonDetails',
    data() {
        return {
            cards: [],
            loading: true,
            error: null
        }
    },
    mounted() {
        this.fetchPokemonCards()
    },
    methods: {
        async fetchPokemonCards() {
            try {
                this.loading = true
                this.error = null
                this.cards = []

                // Tous les sets
                const setsResponse = await fetch('https://api.tcgdex.net/v2/en/sets')
                const sets = await setsResponse.json()

                // Filtrer Pocket via ID
                const pocketSets = sets.filter(set => {
                    const id = set.id?.toLowerCase() || ''

                    return /^[ab]\d+[a-z]?$/.test(id) || /^p-[a-z]$/.test(id)
                })

                console.log("Sets Pocket détectés:", pocketSets)

                const cardRequests = pocketSets.map(set =>
                    fetch(`https://api.tcgdex.net/v2/en/cards?set=${set.id}`)
                        .then(res => res.json())
                        .then(cards => ({ cards, setName: set.name }))
                )

                const results = await Promise.all(cardRequests)

                results.forEach(result => {

                    const mapped = result.cards
                        .filter(c => (c.supertype || c.category) === "Pokemon")
                        .map(c => ({
                            id: c.id,
                            name: c.name,
                            image: c.image ? `${c.image}/high.webp` : '',
                            set: result.setName
                        }))

                    this.cards.push(...mapped)
                })

                if (this.cards.length === 0) {
                    this.error = "Aucune carte trouvée."
                }

            } catch (err) {
                console.error("Erreur récupération:", err)
                this.error = String(err)
            } finally {
                this.loading = false
            }
        }
    }
}
</script>