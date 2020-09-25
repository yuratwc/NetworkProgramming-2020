@extends('common.layout')
@section('addTitle')
<title>SQL Injection Sample: Result</title>
@stop
@include('common.header')
@section('content')

<style>
    #search_form_area {
        padding: 0.5em 1em;
        margin: 2em 0;
        background: #f0f7ff;
        border: dashed 2px #5b8bd0;
    }
</style>

<div class="container">
    <div class="title">SQL Injection Sample: Result</div>
    <div id="result">Result: <?php echo $message; ?></div>
    <div id="query">Query: <?php echo $query; ?></div>
</div>
@stop
@include('common.footer')