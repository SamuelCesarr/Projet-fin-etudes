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
    name: 'CardLayout',
    components: {
        Header,
        Footer
    }
}
</script>