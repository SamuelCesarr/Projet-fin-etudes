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
            showFilters: false,
            localFilters: JSON.parse(JSON.stringify(this.filters || {
                rarities: [], types: [], stages: [], isEx: false, isMega: false, boosters: []
            })),
            suppressEmit: false
        }
    },
    computed: {
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
        types() {
            return this.availableTypes.length > 0
                ? this.availableTypes.map(t => t === 'Lightning' ? 'Electric' : t)
                : ['Grass', 'Fire', 'Water', 'Electric', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Colorless']
        },
        stages() {
            return this.availableStages.length > 0
                ? this.availableStages.sort()
                : ['Basic', 'Stage 1', 'Stage 2']
        }
    },
    watch: {
        filters: {
            deep: true,
            handler(newVal) {
                // Prop update coming from parent: copy without re-emitting
                this.suppressEmit = true
                this.localFilters = { ...newVal, types: newVal.types.map(t => t === 'Lightning' ? 'Electric' : t) }
            }
        },
        localFilters: {
            deep: true,
            handler(newVal) {
                if (this.suppressEmit) {
                    this.suppressEmit = false
                    return
                }
                // Emit only when user changes localFilters
                const mappedFilters = { ...newVal, types: newVal.types.map(t => t === 'Electric' ? 'Lightning' : t) }
                this.$emit('filters-changed', JSON.parse(JSON.stringify(mappedFilters)))
            }
        }
    },
    methods: {
        toggleFilters() {
            this.showFilters = !this.showFilters
        },
        resetFilters() {
            this.localFilters = {
                rarities: [], types: [], stages: [], isEx: false, isMega: false, boosters: []
            }
            this.$emit('reset-filters')
            this.showFilters = false
        },
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