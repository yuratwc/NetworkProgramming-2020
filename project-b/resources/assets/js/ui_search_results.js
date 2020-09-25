window.Vue = require('vue');

const app = new Vue({
    el: '#vue_container',
    data: {
        gmap: null,
        markers: [],
        resultData: null,
        countries: [],
        countries2Index: {},
        oldIndex: -1
    },
    mounted: async function () {
        //await this.sleep(1000);   // wait until loading google map javascript
        this.sleep(1000).then(() => {
            this.map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 0, lng: 0 },
                zoom: 1
            });
        }).finally(() => {
            this.applyResultMarkers();
        });
        this.resultData = getResultData();
    },
    methods: {
        sleep: function (msec) {
            return new Promise((resolve) => {
                setTimeout(() => { resolve() }, msec);
            })
        },
        applyResultMarkers : function() {
            let cs = [];
            for(let r of this.resultData) {
                cs.push({name:r.team0, lat:r.team0_lat, lng:r.team0_lng});
                cs.push({name:r.team1, lat:r.team1_lat, lng:r.team1_lng});
            }
            cs.sort((a,b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            for(let i = 0; i < cs.length; i++) {
                if(i > 0 && cs[i].name === cs[i-1].name) continue;
                this.countries2Index[cs[i].name] = this.countries.length;
                this.countries.push(cs[i]);
            }
            for(let r of this.countries) {
                r.marker = this.addMarker(r.name, r);
            }
        },
        updateMarker : function(index) {
            this.changeMarkerBlue(this.countries2Index[this.resultData[index].team0]);
            this.changeMarkerBlue(this.countries2Index[this.resultData[index].team1]);
            if(this.oldIndex != -1) {
                this.changeMarkerRed(this.countries2Index[this.resultData[this.oldIndex].team0]);
                this.changeMarkerRed(this.countries2Index[this.resultData[this.oldIndex].team1]);
            }
            this.oldIndex = index;
        },
        changeMarkerRed: function(index) {
            this.changeMarkerIcon(index, "https://maps.google.com/mapfiles/ms/icons/red-dot.png");
        },
        changeMarkerBlue: function(index) {
            this.changeMarkerIcon(index, "https://maps.google.com/mapfiles/ms/icons/blue-dot.png");
        },
        changeMarkerIcon: function(index, iconUrl) {
            this.countries[index].marker.setMap(null);
            //console.log(this.countries[index].marker.getIcon());

            this.countries[index].marker.setIcon(iconUrl);
            this.countries[index].marker.setMap(this.map);
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
                    title: title,
                    icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }
            );
            return marker;
        },
    }
});
