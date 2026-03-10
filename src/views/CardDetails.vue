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
                <div class="headerCarte">
                    <div class="nomCarte">
                        <h2>{{ card.name }}</h2>
                        <BoutonLike class="boutonLike" :cardId="card.id" />
                    </div>
                    <div v-if="card.type" class="typePokemon" :style="{ background: getTypeColor(card.type) }">
                        <img :src="getTypeIcon(card.type)" :alt="card.type" class="type-icon-card" />
                        <span>{{ card.type }}</span>
                    </div>
                </div>

                <div class="statsCarte">
                    <div class="stat">
                        <span class="statTitle">Rareté:</span>
                        <span class="statValue">{{ getRarityIcon(card.rarity) || 'N/A' }}</span>
                    </div>
                    <div class="stat">
                        <span class="statTitle">Catégorie:</span>
                        <span class="statValue">{{ card.category || 'N/A' }}</span>
                    </div>
                    <div class="stat">
                        <span class="statTitle">Stade d'évolution:</span>
                        <span class="statValue">{{ card.stage || 'N/A' }}</span>
                    </div>
                    <div class="stat">
                        <span class="statTitle">HP:</span>
                        <span class="statValue">{{ card.hp || 'N/A' }}</span>
                    </div>
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

                    <div v-for="attack in card.attacks" :key="attack.name" class="attaque" :style="{ '--attaque-color': getTypeColor(card.type) }">
                        <div class="attaqueHeader">
                            <div class="attaqueCost">
                                <img v-for="(cost, index) in attack.cost || []" :key="index" :src="getEnergyIcon(cost)"
                                    class="energyIcon">
                            </div>
                            <h4>{{ attack.name }}</h4>
                            <span class="damage">{{ attack.damage }}</span>
                        </div>
                        <p v-if="attack.effect">{{ attack.effect }}</p>
                    </div>
                </div>

                <div class="coutsCarte">
                    <div v-if="card.weakness" class="badgeType">
                        <span>Faiblesse: </span>
                        <img :src="getTypeIcon(card.weakness.type)" :alt="card.weakness.type" class="energyIcon" />
                        <span>{{ card.weakness.type }} ({{ card.weakness.value }})</span>
                    </div>

                    <div v-if="card.retreat !== undefined" class="badgeType retreat">
                        <span>Retreat: </span>
                        <img v-for="n in card.retreat" :key="n" :src="getEnergyIcon('Colorless')" alt="Colorless" class="energyIcon"/>
                    </div>
                </div>

                <div v-if="card.description" class="descriptionCarte">
                    <p><strong>Description:</strong> {{ card.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import './CardDetails.css'
import BoutonLike from '../components/BoutonLike.vue'

export default {
    name: 'CardDetails',
    components: {
        BoutonLike
    },
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
                    rarity: cardData.rarity || '',
                    abilities: cardData.abilities || [],
                    attacks: cardData.attacks || [],
                    weakness: this.extractWeakness(cardData),
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
        },
        extractWeakness(cardData) {
            // La faiblesse peut être un objet ou un tableau
            if (cardData.weaknesses) {
                if (Array.isArray(cardData.weaknesses) && cardData.weaknesses.length > 0) {
                    return cardData.weaknesses[0] || null
                }
            }
            return null
        },

        getTypeIcon(type) {
            const typeNames = {
                'Grass': 'grass',
                'Fire': 'fire',
                'Water': 'water',
                'Electric': 'electric',
                'Psychic': 'psychic',
                'Fighting': 'fighting',
                'Darkness': 'dark',
                'Metal': 'steel',
                'Dragon': 'dragon',
                'Colorless': 'normal'
            }
            const typeName = typeNames[type] || 'normal'
            return `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${typeName}.svg`
        },

        getTypeColor(type) {

            const colors = {
                Grass: "#4CAF50",
                Fire: "#F44336",
                Water: "#2196F3",
                Electric: "#FFD600",
                Psychic: "#9C27B0",
                Fighting: "#795548",
                Darkness: "#424242",
                Metal: "#9E9E9E",
                Dragon: "#3F51B5",
                Colorless: "#607D8B"
            }

            return colors[type] || "#555"
        },

        getEnergyIcon(type) {

            const icons = {
                Grass: "grass",
                Fire: "fire",
                Water: "water",
                Electric: "electric",
                Psychic: "psychic",
                Fighting: "fighting",
                Darkness: "dark",
                Metal: "steel",
                Dragon: "dragon",
                Colorless: "normal"
            }

            const name = icons[type] || "normal"

            return `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${name}.svg`
        },

        getRarityIcon(rarity) {
            const rarityIcons = {
                'None': 'PROMO',
                'One Diamond': '◇',
                'Two Diamond': '◇◇',
                'Three Diamond': '◇◇◇',
                'Four Diamond': '◇◇◇◇',
                'One Star': '★',
                'Two Star': '★★',
                'Three Star': '★★★',
                'One Shiny': '✷',
                'Two Shiny': '✷✷',
                'Crown': '🜲'
            }
            return rarityIcons[rarity] || rarity
        }
    }
}
</script>