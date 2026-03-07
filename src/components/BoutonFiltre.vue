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
                        <span>{{ rarity }}</span>
                    </label>
                </div>
            </div>

            <!-- TYPE -->
            <div class="filter-group">
                <h4>Type</h4>
                <div class="filter-options">
                    <label v-for="type in types" :key="type" class="filter-checkbox">
                        <input type="checkbox" :value="type" v-model="localFilters.types">
                        <span>{{ type }}</span>
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

            <!-- BOOSTER PACK -->
            <div class="filter-group">
                <h4>Booster Pack</h4>
                <div class="filter-options">
                    <label v-for="pack in boosters" :key="pack" class="filter-checkbox">
                        <input type="checkbox" :value="pack" v-model="localFilters.boosters">
                        <span>{{ pack }}</span>
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
            return this.availableRarities.length > 0 
                ? this.availableRarities.sort() 
                : ['Common', 'Uncommon', 'Rare', 'Rare Holo']
        },
        types() {
            return this.availableTypes.length > 0
                ? this.availableTypes.sort()
                : ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Colorless']
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
                this.localFilters = JSON.parse(JSON.stringify(newVal))
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
                this.$emit('filters-changed', JSON.parse(JSON.stringify(newVal)))
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
        }
    }
}
</script>