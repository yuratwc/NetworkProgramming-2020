const axios = require('axios');
window.Vue = require('vue');

window.onload = (function() {

    const app = new Vue({
        el: '#form_app',
        data: {
            selected: {tournament:-1, round:-1, team:-1},
            lists: {teams:[], groups:[]}
            //showMessage: "Good Morning VueJS from Vue App",

        },
        mounted: function() {
            this.updateTeams();
        },
        methods: {
            changeMessage: function () {
                //this.showMessage = this.message2;
            },
            updateTeams: async function() {
                let data = await axios.get('/ajax/wc?type=team&id=' + this.selected.tournament);
                this.lists.teams = data.data;
                this.selected.team = -1;
            },
            updateGroups : async function() {
                let data = await axios.get('/ajax/wc?type=group&id=' + this.selected.tournament + '&round=' + this.selected.round);
                console.log(data);
                this.lists.groups = data.data;
                this.selected.groups = -1;
            }
        }
    });
    
});
