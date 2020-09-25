@extends('common.layout')
@section('addTitle')
<title>Hello AJAX!!</title>
@stop
@section('addMeta')
<meta name="csrf-token" content="{{csrf_token()}}">
@stop
@section('addCSS')
@stop
@include('common.header')
@section('content')

<div class="container">
    <div id="hello_ajax">
        <div class="title">Hello AJAX!!</div>
        <div><span>Push button to get message from the server: </span></div>
        <button type="submit" @click="showMessage1" :disabled="false" class="btn btn-primary">Show Message1</button>
        <button type="submit" @click="showMessage2" :disabled="false" class="btn btn-primary">Show Message2</button>
        <div class="title">@{{ message }}</div>
    </div>
</div>

<script src="{{ mix('js/hello_ajax.js') }}">
</script>

@stop
@include('common.footer')