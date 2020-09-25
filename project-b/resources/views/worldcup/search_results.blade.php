@extends('common.layout')
@section('addTitle')
<title>Search Matches: Results</title>
@stop
@section('addScript')
<!-- Google Map JavaScript Library -->

@stop
@include('common.header')
@section('content')
<script async defer src="https://maps.googleapis.com/maps/api/js?key=KEY" type="text/javascript"></script>
<div class="container" id="vue_container">
    <div class="title">Search Matches: Results</div>
    <?php if(isset($team)): ?>
    <div class="title">Search: <?php echo $team; ?></div>
    <?php endif; ?>

    <?php if(count($data) == 0): ?>
    <p>Not Exists.</p>
    <?php else: ?>
    <table class="table table-striped">
        <thead class="thead-dark">
            <tr>
                <th scope="col">TOURNAMENT</th>
                <th scope="col">ROUND</th>
                <th scope="col">GROUP</th>
                <th scope="col">DATE</th>
                <th scope="col">TEAM</th>
                <th scope="col">RESULT</th>
                <th scope="col">TEAM</th>
            </tr>
        </thead>
        <?php for ($i = 0; $i < count($data); $i++): ?>
            <?php $val = $data[$i]; ?>
            <tr>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->tournament_name; ?></td>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->round_name; ?></td>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->group_name; ?></td>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->date; ?></td>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->team0; ?></td>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->rs . ' - ' . $val->ra; if($val->rs_pk != 0 || $val->ra_pk != 0) echo '<br>PK ' . $val->rs_pk . ' - ' . $val->ra_pk?></td>
                <td @click="updateMarker(<?= $i ?>)" scope="row"><?php echo $val->team1; ?></td>
            </tr>
        <?php endfor; ?>
    </table>
    <?php endif; ?>

    <div id="map" class="z-depth-1" style="height: 500px"></div>

</div>
<script>
    function getResultData() {return JSON.parse('<?= json_encode($data) ?>');}
</script>

<script src="{{ mix('js/ui_search_results.js') }}"></script>

@stop
@include('common.footer')