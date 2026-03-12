# Projet : Application Web Pokémon TCG
- Auteur : Samuel César
- Repository : https://github.com/SamuelCesarr/Projet-fin-etudes

----------------------------------------------------
1. LISTE DES FICHIERS SOURCES CRÉÉS (ordre décroissant
du plus pertinent et complexe au moins complexe)
----------------------------------------------------

1. src/views/PokemonDetails.vue - src/views/TrainerDetails.vue
   Composants principaux qui récupèrent et affichent les cartes Pokémon et Trainer, appliquent les filtres et la recherche.

2. src/views/CardDetails.vue
   Page affichant les détails complets d’une carte Pokémon sélectionnée.

3. src/components/BoutonFiltre.vue
   Composant pour filtrer les cartes selon rareté, type, stage,
   extension, Pokémon ex ou Mega.

4. src/views/Favorites.vue
   Page affichant les cartes ajoutées aux favoris.

5. src/router/index.js
   Ce fichier configure et exporte le routeur de l’application Vue.js pour gérer la navigation entre les différentes pages et layouts.

6. src/components/BarreRecherche.vue
   Composant permettant la recherche d’une carte par son nom.

7. src/components/BoutonLike.vue
   Composant pour ajouter ou retirer une carte des favoris.

8. src/views/Home.vue
   Page d’accueil du site.

9. src/views/SetDetails.vue
   Page affichant les détails d’une extension spécifique de cartes.

10. src/layouts/DefaultLayout.vue - src/layouts/DetailsLayout.vue - src/layouts/CardLayout.vue
    Ces fichiers définissent un layout Vue.js réutilisable qui encadre chaque page avec un Header en haut, un Footer en bas, et le contenu dynamique grâce à <router-view>.

11. src/components/Header.vue
    Composant de navigation avec menu principal et logo.

12. src/components/Footer.vue
    Composant pied de page.

----------------------------------------------------
2. INSTRUCTIONS POUR DÉMARRER L’APPLICATION
----------------------------------------------------

1. Cilquer sur le lien GitHub Pages dans la section déploiements du repository

L’application web sera alors accessible et permettra de :
- naviguer dans les cartes Pokémon
- utiliser les filtres
- rechercher une carte par nom
- consulter les détails d’une carte
- gérer les favoris

----------------------------------------------------
FIN DU DOCUMENT
----------------------------------------------------