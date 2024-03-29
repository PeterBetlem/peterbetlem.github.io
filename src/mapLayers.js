import { md, sidebar, map } from "./map"
/*const OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18});
*/

function get_random_color(id) {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * (5+5*id))];
    } 
    return color;
}

 
var OSM = new L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors',
})

var domStyleOptions = {
    fillColor: "red",
    color: "red",
    weight: 3,
}
var img360StyleOptions = {
    fillColor: "orange",
    color: "orange",
    radius: 3,
    opacity: 0.5,
    fillOpacity: 0.8
}

var img360_markers = new L.markerClusterGroup({
	spiderfyOnMaxZoom: true,
	showCoverageOnHover: false,
    removeOutsideVisibleBounds: true,
    clusterPane: "tilePane"
    }); 

var geojsonMarkerOptions = {
    radius: 100,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.8
};

var myRequest = "https://wms.qgiscloud.com/peterbetlem/rnd?service=WFS&request=GetFeature";
var outputFormat = "outputformat=geojson";
var projectsRequest = myRequest + "&typename=projects&" + outputFormat; 
var domsRequest = myRequest + "&typename=doms&" + outputFormat; 
var tracksRequest = myRequest + "&typename=tracks&" + outputFormat; 
var photosphereRequest = myRequest + "&typename=photo_sphere&" + outputFormat; 

const project_tracks = L.geoJson(null, {
    style: {color: "black",
            dashArray: '5, 5', dashOffset: '5'},
    //function(feature) {
     //   return {color: get_random_color(feature.properties.qc_id)}
    //},
    onEachFeature: onEachFeatureClosure("tracks"),
    id: "tracks"
    });

const projects_layer = L.geoJson(null, {

    pointToLayer: function(feature, latlng) {

        return L.circleMarker(latlng, {
        radius:6,
        opacity: .5,
        //color: "#000",
        //color:getColor(feature.properties.League),
        //fillColor:  getColor(feature.properties.League),
        fillOpacity: 0.8

        });  //.bindTooltip(feature.properties.Name);
    },
    onEachFeature: onEachFeatureClosure("projects"),
    id: "projects"
    });


const personal_doms = L.geoJson(null, {
    style: domStyleOptions,
    onEachFeature: onEachFeatureClosure("pdom"),
    id: "doms"
    });

const photo_spheres = L.geoJson(null, {
    pointToLayer: function(feature, latlng) {

        return L.circleMarker(latlng, {
        radius:4,
        opacity: .5,
        color: "orange",
        //color:getColor(feature.properties.League),
        //fillColor:  getColor(feature.properties.League),
        fillOpacity: 0.8

        });  //.bindTooltip(feature.properties.Name);
    },
    onEachFeature: onEachFeatureClosure("img360"),
    id: "img360"
    });

function getJSONForRequest(request, container) {
    $.getJSON(request, function(data){
        // L.geoJson function is used to parse geojson file and load on to map
        container.addData(data)
        })
        /*    .success(function(){
            console.log("Successfully retrieved GIS objects.")
        })
        */
        .fail(function(){
            alert('Failed to access project GIS data')
            console.log("Failed to retrieve project GIS objects.")
        })
}

getJSONForRequest(domsRequest, personal_doms)
getJSONForRequest(projectsRequest, projects_layer)
getJSONForRequest(tracksRequest, project_tracks)
getJSONForRequest(photosphereRequest, photo_spheres)

var doms_layer = L.esri.featureLayer({
    url: 'https://svalbox.unis.no/arcgis/rest/services/dom/DOM/MapServer/1',
    style: domStyleOptions,
    onEachFeature: onEachFeatureClosure("dom"),
});

var img360_layer = L.esri.featureLayer({
    url: 'https://svalbox.unis.no/arcgis/rest/services/Images/images360/MapServer/0',
    onEachFeature: onEachFeatureClosure("img360"),
    pointToLayer: function(feature, latlng) {
        var marker = L.circleMarker(latlng, {
            radius:3,
            opacity: .5,
            color: "orange",
            //color:getColor(feature.properties.League),
            //fillColor:  getColor(feature.properties.League),
            fillOpacity: 0.8

            });  //.bindTooltip(feature.properties.Name);
        //marker.addTo(img360_markers);
        return marker
        },
});

export var searchGroup = L.featureGroup([projects_layer, personal_doms, doms_layer]);

export const mapLayers = [
    {
        layer: OSM,
        defaultAdd: true,
        baseLayerControl: true,
        title: "OSM",
    },
    {
        layer: project_tracks,
        eventType: "tracks",
        overlayLayerControl: true,
        title: "Projects",
    },
    {
        layer: photo_spheres,
        eventType: "img360",
        overlayLayerControl: true,
        title: "Photospheres",
    },
    {
        layer: doms_layer,
        eventType: "DOMs",
        overlayLayerControl: true,
        title: "DOMs",
    },
    {
        layer: personal_doms,
        eventType: "DOMs",
        overlayLayerControl: true,
        title: "DOMs",
    },
    {
        layer: projects_layer,
        eventType: "projects",
        overlayLayerControl: true,
        title: "Projects",
    },
]

function onEachFeatureClosure(data_type) {
    return function onEachFeature (feature, layer) {
        layer.on("click", function(e){
            switch (data_type) {
                case "projects":
                    updateProjectDivTag("#projects", feature.properties)
                    window.location.hash = '#projects='+feature.properties.name.replace(/\s+/g, '-').toLowerCase()
                    sidebar.enablePanel('projects');
                    sidebar.open("projects")
                    break
                case "dom":
                    updateSketchfabDivTag("#events", feature.properties)
                    $( "#events-content" ).html()
                    
                    sidebar.enablePanel('events');
                    sidebar.open("events")
                    break
                case "pdom":
                    updateSketchfabPDivTag("#events", feature.properties)
                    $( "#events-content" ).html()
                    
                    sidebar.enablePanel('events');
                    sidebar.open("events")
                    break
                case "v3geo":
                    updateV3geoDivTag("#events", feature.properties)
                    sidebar.enablePanel('events');
                    sidebar.open("events")
                    break
                case "img360":
                    updateImg360DivTag("#events", feature.properties)
                    sidebar.enablePanel('events');
                    sidebar.open("events")
                    break
                case "tracks":
                    updateTracksDivTag("#events", feature.properties)
                    sidebar.enablePanel('events');
                    sidebar.open("events")
                    break
                }
    })

    window.addEventListener('hashchange', function () {
        zoomToURL("projects", data_type, feature)
    });
    zoomToURL("projects", data_type, feature)
    
    
        
    }
}

function updateProjectDivTag( divTag, properties) {
    $( divTag + "-title").html( properties.name )
    $( divTag + "-content" ).html( md.render(properties.description) )
}

function updateV3geoDivTag( divTag, properties) {
    $( divTag + "-title").html( "Digital outcrop model" )
    $( divTag + "-content" ).html(
        '<br><div> <iframe style="width:100%;height:95%;position:absolute;left:0px;top:44px;'+
        '" title="V3Geo" width=100% frameborder="0" allowfullscreen mozallowfullscreen="true" '+
        'webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport '+
        'execution-while-not-rendered web-share src="https://v3geo.com/viewer/index.html#/' + properties.v3geo_id + '"></iframe></div>')
}

function updateSketchfabDivTag( divTag, properties) {
    $( divTag + "-title").html( "Digital outcrop model" )
    $( divTag + "-content" ).html('<center>Copyright and use policy:<br><a href="https://doi.org/' + properties.data_doi+'" target=blank>' +
    'https://doi.org/' + properties.data_doi+'</a></center>'+
    '<br><div class="sketchfab-embed-wrapper"> '+
    '<iframe style="width:100%;height:90%;position:absolute;left:0px;top:90px;" width=100% frameborder="0" allowfullscreen mozallowfullscreen="true" '+
    'webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport '+
    'execution-while-not-rendered web-share src="https://sketchfab.com/models/' + properties.publ_sketchfab_id + '/embed"></iframe></div>')
}

function updateSketchfabPDivTag( divTag, properties) {
    console.log(properties)
    $( divTag + "-title").html( "Digital outcrop model" )
    $( divTag + "-content" ).html('<center>Copyright and use policy:<br><a href="https://doi.org/' + properties.doi+'" target=blank>' +
    'https://doi.org/' + properties.doi+'</a></center>'+
    '<br><div class="sketchfab-embed-wrapper"> '+
    '<iframe style="width:100%;height:90%;position:absolute;left:0px;top:90px;" width=100% frameborder="0" allowfullscreen mozallowfullscreen="true" '+
    'webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport '+
    'execution-while-not-rendered web-share src="https://sketchfab.com/models/' + properties.publishing.mesh.sketchfab + '/embed"></iframe></div>')
}

function updateImg360DivTag( divTag, properties) {
    $( divTag + "-title").html( "Photosphere" )
    $( divTag + "-content" ).html(
        '<center>Copyright and use policy:<br><a href="https://doi.org/10.5281/zenodo.' + properties.doi+'" target=blank>' +
        '<img src="https://zenodo.org/badge/DOI/10.5281/zenodo.'+properties.doi+'.svg" alt="DOI"></a></center>' +
        '<center>' +
        '<a href="https://zenodo.org/record/' + properties.doi+'/files/'+ properties.uid + '.jpg?download=1' + '" target=_blank>Download Full Resolution </a>' +
        '<br>' +
    '<br><div class="sketchfab-embed-wrapper"> <iframe style="width:100%;height:90%;position:absolute;left:0px;top:100px;" width=100% <iframe width="100%" height="150%" allowfullscreen style="border-style:none;"'+
    ' src="https://cdn.pannellum.org/2.5/pannellum.htm#panorama='+properties.api_link+'&autoLoad=false"></iframe></div>')
}

function updateTracksDivTag( divTag, properties) {
    $( divTag + "-title").html( properties.name )
    var youtube = '';
    if (properties.uid_youtube) {
        youtube = '<br><iframe width="100%" height="315" src="https://www.youtube.com/embed/' + properties.uid_youtube +'" title="YouTube video player"' + 
        ' frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' + '<br>'
    }
    console.log(youtube)
    $( divTag + "-content" ).html( youtube + md.render(properties.description) )
}


function zoomToURL(target_data_type, data_type, feature){
    const location = window.location.href
    if (location.includes("#"+target_data_type+"=")) {
        const project = location.split('projects=')[1]
    
        if (data_type == target_data_type && feature.properties.name) {
            if (feature.properties.name.replace(/\s+/g, '-').toLowerCase() == project.replace(/\s+/g, '-').toLowerCase()) {
                updateProjectDivTag("#projects", feature.properties)
                sidebar.enablePanel('projects');
                sidebar.open("projects")
                map.flyTo([feature.geometry.coordinates[0][1], feature.geometry.coordinates[0][0]], 6);
            }
    
        }
    
    }

    }
