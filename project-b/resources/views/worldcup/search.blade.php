@extends('common.layout')
@section('addTitle')
<title>Search World Cup Database</title>

<style>
    #search_form_area {
        padding: 0.5em 1em;
        margin: 2em 0;
        background: #f0f7ff;
        border: dashed 2px #5b8bd0;
    }
</style>

@stop
@include('common.header')
@section('content')


<?php $last = null ?>
<div id="form_app" class="container">
    <div class="title">Search World Cup Database</div>

    <form action="./search_results" method="POST">
        {{ csrf_field() }}

        <div id="search_form_area">
            <div class="title">Search Form</div>
            <div class="form-group">
                <label for="Tournament">Tournament</label>
                <select class="form-control" id="tournament" name="tournament" v-model="selected.tournament" @change="updateTeams()">
                    <option value="-1" v-bind:value="-1" selected></option>
                    <?php foreach ($tournaments as $v) { ?>
                    <?php if($v->name == $last)
                        {
                            $last = $v->name;
                            continue;
                        }?>
                        <option v-bind:value=<?php echo $v->id; ?>><?php echo $v->name; ?></option>
                        <?php     $last = $v->name;}?>
                </select>
            </div>

            <div class="form-group">
                <label for="round">Round</label>
                <select class="form-control" id="round" name="round" v-model="selected.round" @change="updateGroups()">
                    <option value="" v-bind:value="-1" selected></option>
                    <option value="1" v-bind:value="1">Knockout</option>
                    <option value="2" v-bind:value="2">Group</option>
                </select>
            </div>
            <div class="form-group" v-if="selected.round != -1 && selected.tournament != -1">
                <label for="group">Group</label>
                <select class="form-control" id="group" name="group">
                    <option value="" v-bind:value="-1" selected></option>
                    <option v-for="group in lists.groups" v-bind:value="group.id">@{{group.name}}</option>
                </select>
            </div>

            
            <div class="form-group">
                <label for="team">Team</label>
                <select class="form-control" id="team" name="team" v-model="selected.team">
                    <option value="" v-bind:value="-1" selected></option>
                    <option v-for="team in lists.teams" v-bind:value="team.id">@{{team.name}}</option>
                </select>
            </div>

            <div class="form-group" v-if="selected.team != -1">
                <label for="outcome">Outcome(for the you set)</label>
                <select class="form-control" id="outcome" name="outcome">
                    <option value="" selected></option>
                    <option value="勝利">勝利</option>
                    <option value="敗北">敗北</option>
                    <option value="引き分け">引き分け</option>
                </select>
            </div>

            <button type="submit" class="btn btn-primary">Submit</button>
        </div>
    </form>
</div>

<script src="{{ mix('js/ui_search.js') }}"></script>
@stop
@include('common.footer')
