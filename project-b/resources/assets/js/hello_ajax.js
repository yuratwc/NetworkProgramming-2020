/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

//require('./bootstrap');
const axios = require('axios');
window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    el: '#hello_ajax',
    data: {
        message: ""
    },
    methods: {
        showMessage1: function () {
            let url = "/ajax/hello_ajax_message";
            axios.get(url).then((res) => {
                this.message = res.data.message1;
            });
        },
        showMessage2: async function () {
            let url = "/ajax/hello_ajax_message";
            let res = await axios.get(url);
            this.message = res.data.message2;
        }
    }
});
