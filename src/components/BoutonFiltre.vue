<template>
    <div class="filter-container">
        <button class="filter-toggle" @click="toggleFilters">
            {{ showFilters ? '✕ Fermer filtres' : 'Filtres' }}
        </button>

        <div v-if="showFilters" class="filter-panel">
            <!-- RARITY -->
            <div class="filter-group">
                <h4>Rareté</h4>
                <div class="filter-options">
                    <label v-for="rarity in rarities" :key="rarity" class="filter-checkbox">
                        <input type="checkbox" :value="rarity" v-model="localFilters.rarities">
                        <span :title="rarity">{{ getRarityIcon(rarity) }}</span>
                    </label>
                </div>
            </div>

            <!-- TYPE -->
            <div class="filter-group">
                <h4>Type</h4>
                <div class="filter-options">
                    <label v-for="type in types" :key="type" class="filter-checkbox">
                        <input type="checkbox" :value="type" v-model="localFilters.types">
                        <span :title="type" class="type-with-icon">
                            <img :src="getTypeIcon(type)" :alt="type" class="type-icon" />
                            {{ type }}
                        </span>
                    </label>
                </div>
            </div>

            <!-- EVOLUTION STAGE -->
            <div class="filter-group">
                <h4>Stade d'évolution</h4>
                <div class="filter-options">
                    <label v-for="stage in stages" :key="stage" class="filter-checkbox">
                        <input type="checkbox" :value="stage" v-model="localFilters.stages">
                        <span>{{ stage }}</span>
                    </label>
                </div>
            </div>

            <!-- EX / MEGA -->
            <div class="filter-group">
                <h4>Spécial</h4>
                <div class="filter-options">
                    <label class="filter-checkbox">
                        <input type="checkbox" v-model="localFilters.isEx">
                        <span>Pokémon ex</span>
                    </label>
                    <label class="filter-checkbox">
                        <input type="checkbox" v-model="localFilters.isMega">
                        <span>Mega Evolution</span>
                    </label>
                </div>
            </div>

            <!-- EXTENSION -->
            <div class="filter-group">
                <h4>Extension</h4>
                <div class="filter-options">
                    <label v-for="pack in boosters" :key="pack" class="filter-checkbox">
                        <input type="checkbox" :value="pack" v-model="localFilters.boosters">
                        <span>{{ pack }} - {{ setMap[pack] || pack }}</span>
                    </label>
                </div>
            </div>

            <!-- RESET BUTTON -->
            <button class="filter-reset" @click="resetFilters">Réinitialiser filtres</button>
        </div>
    </div>
</template>

<script>
import './BoutonFiltre.css'

export default {
    name: 'BoutonFiltre',
    props: {
        filters: {
            type: Object,
            required: true
        },
        boosters: {
            type: Array,
            default: () => []
        },
        setMap: {
            type: Object,
            default: () => ({})
        },
        availableRarities: {
            type: Array,
            default: () => []
        },
        availableTypes: {
            type: Array,
            default: () => []
        },
        availableStages: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            showFilters: false, // État du panneau de filtres (ouvert/fermé)
            // Copie locale des filtres pour éviter les mises à jour directes des props
            localFilters: JSON.parse(JSON.stringify(this.filters || {
                rarities: [], types: [], stages: [], isEx: false, isMega: false, boosters: []
            })),
            suppressEmit: false
        }
    },
    computed: {
        /**
         * Retourne les raretés disponibles triées dans l'ordre correct
         * Transforme les raretés dynamiques en ordre de rareté
         */
        rarities() {
            const rarityOrder = ['None', 'One Diamond', 'Two Diamond', 'Three Diamond', 'Four Diamond', 'One Star', 'Two Star', 'Three Star', 'One Shiny', 'Two Shiny', 'Crown']
            if (this.availableRarities.length > 0) {
                return this.availableRarities.sort((a, b) => {
                    const indexA = rarityOrder.indexOf(a)
                    const indexB = rarityOrder.indexOf(b)
                    return indexA - indexB
                })
            }
            return rarityOrder
        },
        /**
         * Retourne les types disponibles
         * Convertit 'Lightning' en 'Electric' pour compatibilité
         */
        types() {
            return this.availableTypes.length > 0
                ? this.availableTypes.map(t => t === 'Lightning' ? 'Electric' : t)
                : ['Grass', 'Fire', 'Water', 'Electric', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Colorless']
        },
        /**
         * Retourne les stades d'évolution disponibles triés
         */
        stages() {
            return this.availableStages.length > 0
                ? this.availableStages.sort()
                : ['Basic', 'Stage 1', 'Stage 2']
        }
    },
    watch: {
        // Surveille les changements des filtres provenant du parent
        filters: {
            deep: true,
            handler(newVal) {
                // Mise à jour des props provenant du parent: copier sans ré-émettre
                this.suppressEmit = true
                this.localFilters = { ...newVal, types: newVal.types.map(t => t === 'Lightning' ? 'Electric' : t) }
            }
        },
        // Surveille les changements locaux des filtres
        localFilters: {
            deep: true,
            handler(newVal) {
                if (this.suppressEmit) {
                    this.suppressEmit = false
                    return
                }
                // Émettre seulement quand l'utilisateur change les filtres
                const mappedFilters = { ...newVal, types: newVal.types.map(t => t === 'Electric' ? 'Lightning' : t) }
                this.$emit('filters-changed', JSON.parse(JSON.stringify(mappedFilters)))
            }
        }
    },
    methods: {
        /**
         * Bascule l'affichage du panneau de filtres
         */
        toggleFilters() {
            this.showFilters = !this.showFilters
        },
        /**
         * Réinitialise tous les filtres à leurs valeurs par défaut
         * Émet l'événement 'reset-filters' vers le parent
         */
        resetFilters() {
            this.localFilters = {
                rarities: [], types: [], stages: [], isEx: false, isMega: false, boosters: []
            }
            this.$emit('reset-filters')
            this.showFilters = false
        },
        /**
         * Convertit les noms de rareté en symboles visuels
         * @param {string} rarity - Nom de la rareté
         */
        getRarityIcon(rarity) {
            const rarityIcons = {
                'None': 'None',
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
        },
        /**
         * Retourne l'URL de l'icône du type Pokémon
         * @param {string} type - Type du Pokémon
         */
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
        }
    }
}
</script>