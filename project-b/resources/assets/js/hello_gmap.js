/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

//require('./bootstrap');

window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    el: '#hello_gmap',
    data: {
        gmap: null,
        markers: []
    },
    mounted: async function () {
        await this.sleep(1000);   // wait until loading google map javascript
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 0, lng: 0 },
            zoom: 1
        });
    },
    methods: {
        sleep: function (msec) {
            return new Promise((resolve) => {
                setTimeout(() => { resolve() }, msec);
            })
        },
        addMarkerJapan: function () {
            let location = { lat: 36.2048, lng: 138.25 };
            let marker = this.addMarker("Japan", location);
            this.markers.push(marker);
        },
        addMarkerUSA: function () {
            let location = { lat: 37.0902, lng: -95.7129 };
            let marker = this.addMarker("Japan", location);
            this.markers.push(marker);
        },
        clearMarkers: function () {
            this.markers.forEach((marker) => {
                marker.setMap(null);
            })
            this.markers = [];
        },
        addMarker(title, location, callback) {
            let marker = new google.maps.Marker(
                {
                    position: location,
                    map: this.map,
                    title: title
                }
            );
            return marker;
        },
    }
});
