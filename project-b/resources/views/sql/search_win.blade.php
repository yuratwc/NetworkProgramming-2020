@extends('common.layout')
@section('addTitle')
<title>Search Win Matches</title>
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
    <div class="title">Search Win Matches</div>

    <form action="./search_win_results" method="POST">
        {{ csrf_field() }}

        <div id="search">
            <div class="form-group">
                <label for="Team">Input Team ID</label>
                <input class="form-control" id="team" name="team"></input>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </div>
    </form>
</div>
@stop
@include('common.footer')