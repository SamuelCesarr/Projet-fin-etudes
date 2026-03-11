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
            searchText: "" // Texte saisi dans l'input de recherche
        }
    },
    methods: {
        /**
         * Émet l'événement "search" au composant parent
         * Déclenché à chaque modification du texte de recherche
         */
        emitSearch() {
            this.$emit("search", this.searchText)
        },
        /**
         * Efface le texte de recherche et émet l'événement
         * Triggered par le bouton ✕
         */
        clearSearch() {
            this.searchText = ""
            this.emitSearch()
        }
    }
}
</script>