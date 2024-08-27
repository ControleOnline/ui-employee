<template>
  <People :context="context" :peopleId="peopleId" v-if="context" />
</template>

<script>
import People from "@controleonline/ui-people/src/components/People/Details.vue";

export default {
  components: {
      People,
  },

  data() {
    return {
      context: 'employee',
      peopleId:null
    };
  },
  created() {
    this.peopleId = decodeURIComponent(this.$route.params.id);
   },
};
</script>
