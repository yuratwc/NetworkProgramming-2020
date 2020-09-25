@extends('common.layout')
@section('addTitle')
<title>SQL Injection Sample</title>
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
    <div class="title">SQL Injection Sample</div>

    <form action="./injection" method="POST">
        {{ csrf_field() }}

        <div id="login_form">
            <div class="title">Login Form</div>
            <div class="form-group">
                <label for="User">User</label>
                <input class="form-control" id="user" name="user"></input>
            </div>
            <div class="form-group">
                <label for="Password">Password</label>
                <input class="form-control" id="password" name="password"></input>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </div>
    </form>
</div>
@stop
@include('common.footer')