<template>
    <footer class="footer">
        <div class="footer-content">

            <p class="footer-title">Bibliothèque Pokémon TCG</p>

            <p class="footer-credit">
                Données fournies par
                <a href="https://api.tcgdex.net/" target="_blank">
                    TCGdex API
                </a>
            </p>

            <p class="footer-info">
                Pokémon et Pokémon TCG sont des marques déposées de
                Nintendo / Game Freak / The Pokémon Company.
            </p>

            <p class="footer-year">
                Projet de fin d'études – {{ year }}
            </p>

        </div>
    </footer>
</template>

<script>
import './Footer.css'

export default {
    name: "Footer",
    computed: {
        year() {
            return new Date().getFullYear()
        }
    }
}
</script>