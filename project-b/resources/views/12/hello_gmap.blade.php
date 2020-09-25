@extends('common.layout')
@section('addTitle')
<title>Hello Google Map!!</title>
@stop
@section('addMeta')
<meta name="csrf-token" content="{{csrf_token()}}">
@stop
@section('addCSS')
@stop
@section('addScript')
<!-- Google Map JavaScript Library -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=API_KEY" type="text/javascript"></script>
@stop
@include('common.header')
@section('content')

<div class="container">
    <div id="hello_gmap">
        <div class="title">Hello Google Map!!</div>
        <span>If your configuration is succeeded, you can see a world map in the following space.</span>
        <div id="gmap">
            <div id="mapinfo"></div>
            <div id="map" class="z-depth-1" style="height: 500px"></div>
        </div>
        <button type="submit" @click="addMarkerJapan" :disabled="false" class="btn btn-primary">Add Marker at Japan</button>
        <button type="submit" @click="addMarkerUSA" :disabled="false" class="btn btn-primary">Add Marker at U.S.A.</button>
        <button type="submit" @click="clearMarkers" :disabled="false" class="btn btn-primary">Clear Markers</button>
    </div>
</div>

<script src="{{ mix('js/hello_gmap.js') }}">
</script>

@stop
@include('common.footer')