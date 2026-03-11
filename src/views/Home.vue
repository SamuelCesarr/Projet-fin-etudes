<template>
    <div class="accueil">
        <!-- Page d'accueil avec les catégories principales -->
        <h1>Bibliothèque Pokémon TCG</h1>

        <div class="categories">
            <!-- Lien vers la liste des cartes Pokémon -->
            <router-link :to="{ name: 'PokemonDetails', params: { id: 1 } }" class="categorie-link">
                <div class="categorie-image"
                    style="background-image: url('https://s3.pokeos.com/pokeos-uploads/tcg/textless/546/376.png?v=2025-09-29T15:12:51.000Z');">
                </div>
                <h2>Pokémon</h2>
            </router-link>

            <!-- Lien vers la liste des cartes Trainer -->
            <router-link :to="{ name: 'TrainerDetails', params: { id: 1 } }" class="categorie-link">
                <div class="categorie-image"
                    style="background-image: url('https://assets.pokemon-zone.com/game-assets/CardPreviews/cTR_20_000040_00_HAKASENOKENKYU_SR.webp');">
                </div>
                <h2>Trainers</h2>
            </router-link>

            <!-- Lien vers la liste des extensions -->
            <router-link :to="{ name: 'SetDetails' }" class="categorie-link">
                <div class="categorie-image"
                    style="background-image: url('https://www.serebii.net/tcgpocket/geneticapex/charizard.jpg');">
                </div>
                <h2>Extensions</h2>
            </router-link>
        </div>

    </div>
</template>

<script>
import './Home.css'

export default {
    name: 'Home'
}
</script>