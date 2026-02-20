<template>
    <div class="cardDetails">
        <h1>Détails de la carte</h1>

        <div v-if="loading">Chargement...</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else class="infoCarte">
            <div class="art">
                <img :src="cardImage" alt="Image de la carte" class="imageCarte" />
                <p class="artisteCarte">{{ card.illustrator }}</p>
            </div>
            <div class="infos">
                <h2>{{ card.name }}</h2>
                <div class="statsCarte">
                    <p><strong>Catégorie:</strong> {{ card.category || 'N/A' }}</p>
                    <p><strong>Stade:</strong> {{ card.stage || 'N/A' }}</p>
                    <p><strong>HP:</strong> {{ card.hp || 'N/A' }}</p>
                    <p><strong>Rareté:</strong> {{ card.rarity || 'N/A' }}</p>
                </div>

                <div v-if="card.abilities && card.abilities.length > 0" class="abilitesCarte">
                    <h3>Capacités</h3>
                    <div v-for="ability in card.abilities" :key="ability.name" class="capacite">
                        <h4>{{ ability.name }}</h4>
                        <p>{{ ability.text }}</p>
                    </div>
                </div>

                <div v-if="card.attacks && card.attacks.length > 0" class="attaquesCarte">
                    <h3>Attaques</h3>
                    <div v-for="attack in card.attacks" :key="attack.name" class="attaque">
                        <h4>{{ attack.name }}</h4>
                        <p><strong>Dégâts:</strong> {{ attack.damage || 'N/A' }}</p>
                        <p><strong>Description:</strong> {{ attack.text }}</p>
                    </div>
                </div>

                <div class="coutsCarte">
                    <p v-if="card.weakness"><strong>Faiblesse:</strong> {{ card.weakness.type }}
                        ({{ card.weakness.value }})</p>
                    <p v-if="card.retreat !== undefined"><strong>Coût de retraite:</strong> {{ card.retreat }}</p>
                </div>

                <div v-if="card.description" class="descriptionCarte">
                    <p><strong>Description:</strong> {{ card.description }}</p>
                </div>
            </div>
            <div v-if="card.type" class="typePokemon">
                {{ card.type }}
            </div>
        </div>
    </div>
</template>

<script>
import './CardDetails.css'

export default {
    name: 'CardDetails',
    data() {
        return {
            card: {
                id: '',
                name: 'Carte inconnue',
                type: '',
                category: '',
                stage: '',
                hp: '',
                rarity: '',
                abilities: [],
                attacks: [],
                weakness: null,
                resistance: null,
                retreat: '',
                description: '',
                illustrator: 'Artiste inconnu',
                image: ''
            },
            cardImage: '',
            loading: true,
            error: null
        }
    },
    mounted() {
        this.fetchCardDetails()
    },
    methods: {
        async fetchCardDetails() {
            try {
                const cardId = this.$route.params.id
                console.log('Récupération de la carte:', cardId)

                // Récupérer les détails de la carte depuis tcgdex
                const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${cardId}`)
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`)
                }

                const cardData = await response.json()
                console.log('Données de la carte:', cardData)

                // Construire l'URL de l'image
                let imageUrl = ''
                if (cardData.image) {
                    imageUrl = `${cardData.image}/high.webp`
                }

                this.card = {
                    id: cardData.id || 'N/A',
                    name: cardData.name || 'Carte inconnue',
                    type: this.extractType(cardData),
                    category: this.extractCategory(cardData),
                    stage: cardData.stage || '',
                    hp: cardData.hp || '',
                    rarity: cardData.rarity?.name || '',
                    abilities: cardData.abilities || [],
                    attacks: cardData.attacks || [],
                    weakness: cardData.weakness || null,
                    resistance: cardData.resistance || null,
                    retreat: cardData.retreat || '',
                    description: cardData.description || '',
                    illustrator: cardData.illustrator || 'Artiste inconnu',
                    image: imageUrl
                }

                this.cardImage = imageUrl

            } catch (err) {
                console.error('Erreur lors de la récupération de la carte:', err)
                this.error = `Impossible de charger la carte: ${err.message}`
            } finally {
                this.loading = false
            }
        },

        extractType(cardData) {
            // Le type peut être dans .type ou .types
            if (cardData.type) return cardData.type
            if (Array.isArray(cardData.types) && cardData.types.length > 0) {
                return cardData.types[0].name || cardData.types[0]
            }
            return 'N/A'
        },
        extractCategory(cardData) {
            // La catégorie de la carte (Pokémon, Trainer, etc.)
            if (cardData.supertype) return cardData.supertype
            if (cardData.category) return cardData.category
            return 'N/A'
        }
    }
}
</script>