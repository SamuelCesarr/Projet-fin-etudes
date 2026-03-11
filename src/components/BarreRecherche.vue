<template>
    <div class="searchBar">
        <input
            type="text"
            v-model="searchText"
            placeholder="Rechercher une carte..."
            @input="emitSearch"
        />
        <button @click="clearSearch">✕</button>
    </div>
</template>

<script>
import './BarreRecherche.css'

export default {
    name: "BarreRecherche",
    data() {
        return {
            searchText: ""
        }
    },
    methods: {
        emitSearch() {
            this.$emit("search", this.searchText)
        },
        clearSearch() {
            this.searchText = ""
            this.emitSearch()
        }
    }
}
</script>