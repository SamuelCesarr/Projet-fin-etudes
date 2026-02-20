<template>
    <div class="accueil">
        <h1>Catégories</h1>

        <div class="categories">
            <router-link :to="{ name: 'PokemonDetails', params: { id: 1 } }">
                <div class="categorie"
                    style="background-image: url('https://s3.pokeos.com/pokeos-uploads/tcg/textless/546/376.png?v=2025-09-29T15:12:51.000Z');">
                    <h2>Pokémon</h2>
                </div>
            </router-link>

            <router-link :to="{ name: 'TrainerDetails', params: { id: 1 } }">
                <div class="categorie"
                    style="background-image: url('https://assets.pokemon-zone.com/game-assets/CardPreviews/cTR_20_000040_00_HAKASENOKENKYU_SR.webp');">
                    <h2>Trainers</h2>
                </div>
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