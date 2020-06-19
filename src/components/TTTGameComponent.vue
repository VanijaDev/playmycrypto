<template>
  <div class="row">

  </div>
</template>

<script>
  export default {
    name: "TTTGameComponent",
    data: function () {
      return {
        game: {}
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency
      }
    },
    methods: {}
  };
</script>

<style scoped lang="scss">

</style>
