<template>
    <div class="pokemonList">
        <h1>Cartes Trainer</h1>

        <div v-if="loading">Chargement...</div>

        <div v-else class="cardsDisplay">
            <div v-if="error" class="error">{{ error }}</div>
            <div v-else-if="cards.length === 0">
                Aucune carte trouvée.
            </div>

            <div v-else class="cardsGrid">
                <div v-for="card in cards" :key="card.id" class="card"> <router-link
                        :to="{ name: 'CardDetails', params: { id: card.id } }">
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
    name: 'PokemonDetails', data() { return { cards: [], loading: true, error: null } }, mounted() { this.fetchPokemonCards() }, methods: {
        async fetchPokemonCards() {
            try {
                this.loading = true
                this.error = null
                this.cards = []

                // Récupérer sets Pocket
                const setsResponse = await fetch('https://api.tcgdex.net/v2/en/sets')
                const sets = await setsResponse.json()

                const pocketSetIds = sets
                    .filter(set => {
                        const id = set.id?.toLowerCase() || ''
                        return /^[ab]\d+[a-z]?$/.test(id) || /^p-[a-z]$/.test(id)
                    })
                    .map(set => set.id)

                console.log("Sets Pocket:", pocketSetIds)

                // Récupérer uniquement les cartes Pokémon
                const response = await fetch(
                    'https://api.tcgdex.net/v2/en/cards?category=Trainer'
                )

                const pokemonCards = await response.json()

                console.log("Total Pokemon:", pokemonCards.length)

                const getSetCode = (id) => {
                    const match = id.match(/^(A\d+[a-z]?|B\d+[a-z]?|P-[A-Z]+)/i)
                    return match ? match[0].toUpperCase() : null
                }

                // Filtrer uniquement celles des sets Pocket
                const filtered = pokemonCards
                    .map(card => {
                        const setCode = getSetCode(card.id)
                        return {
                            id: card.id,
                            name: card.name,
                            image: card.image ? `${card.image}/high.webp` : '',
                            set: setCode
                        }
                    })
                    .filter(card => card.set && pocketSetIds.includes(card.set))

                this.cards = filtered.sort((a, b) => {
                    // Pour les promos, on ne peut pas parseInt, donc on trie par ID complet
                    if (a.set === b.set) {
                        return a.id.localeCompare(b.id)
                    }
                    return a.set.localeCompare(b.set)
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