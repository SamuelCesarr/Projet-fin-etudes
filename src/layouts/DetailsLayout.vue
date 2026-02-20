<template>
    <div class="layout">
        <Header/>
            <router-view/>
        <Footer/>
    </div>
</template>

<script>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
    name: 'DetailsLayout',
    components: {
        Header,
        Footer
    }
}
</script>

<style>
.layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>