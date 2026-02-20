<template>
    <nav>
        <ul>
            <li><router-link :to="{ name: 'Home' }">Accueil</router-link></li>
            <li><router-link :to="{ name: 'PokemonDetails', params: { id: 1 } }">Pokémon</router-link></li>
            <li><router-link :to="{ name: 'TrainerDetails', params: { id: 1 } }">Trainers</router-link></li>
        </ul>
    </nav>
</template>