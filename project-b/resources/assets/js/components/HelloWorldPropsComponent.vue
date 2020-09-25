<template>
  <div class="container">
    <div class="message">Hello World!!</div>
    <div class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.message {
  color: red;
  font-family: "Nico Moji";
  font-size: 24px;
}
</style>

<script>
export default {
  props: {
    message: String
  },
  mounted() {
    console.log("HelloWorldPropsComponent mounted.");
  }
};
</script>
