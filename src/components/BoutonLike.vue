<template>
    <button class="like-button" :class="{ liked: isLiked }" @click="toggleLike"
        :title="isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
        <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                :fill="isLiked ? '#ff4757' : 'white'"
                stroke="#ff4757"
                stroke-width="2"
            />
        </svg>
    </button>
</template>

<script>
import './BoutonLike.css'

export default {
    name: 'BoutonLike',
    props: {
        cardId: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isLiked: false
        }
    },
    mounted() {
        this.checkIfLiked()
    },
    watch: {
        cardId: {
            immediate: true,
            handler() {
                this.checkIfLiked()
            }
        }
    },
    methods: {
        checkIfLiked() {
            try {
                const likedCards = this.getLikedCards()
                this.isLiked = likedCards.includes(this.cardId)
            } catch (error) {
                console.error('Erreur lors de la vérification des favoris:', error)
                this.isLiked = false
            }
        },

        toggleLike() {
            try {
                const likedCards = this.getLikedCards()
                if (this.isLiked) {
                    // Retirer des favoris
                    const index = likedCards.indexOf(this.cardId)
                    if (index > -1) {
                        likedCards.splice(index, 1)
                    }
                } else {
                    // Ajouter aux favoris
                    likedCards.push(this.cardId)
                }

                // Sauvegarder dans localStorage
                localStorage.setItem('pokemon_favorites', JSON.stringify(likedCards))
                this.isLiked = !this.isLiked

                // Émettre l'événement
                this.$emit('like-changed', {
                    cardId: this.cardId,
                    isLiked: this.isLiked
                })

                // Déclencher un événement de stockage pour mettre à jour le Header
                window.dispatchEvent(new Event('storage'))

            } catch (error) {
                console.error('Erreur lors de la sauvegarde des favoris:', error)
            }
        },

        getLikedCards() {
            try {
                const stored = localStorage.getItem('pokemon_favorites')
                return stored ? JSON.parse(stored) : []
            } catch (error) {
                console.error('Erreur lors de la récupération des favoris:', error)
                return []
            }
        }
    }
}
</script>