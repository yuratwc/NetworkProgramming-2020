@extends('common.layout')
@section('addTitle')
<title>Search Win Matches: Results</title>
@stop
@include('common.header')
@section('content')
<div class="container">
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
        <?php foreach ($data as $val) { ?>
            <tr>
                <td scope="row"><?php echo $val->tournament_name; ?></td>
                <td scope="row"><?php echo $val->round_name; ?></td>
                <td scope="row"><?php echo $val->group_name; ?></td>
                <td scope="row"><?php echo $val->date; ?></td>
                <td scope="row"><?php echo $val->team0; ?></td>
                <td scope="row"><?php echo $val->rs . ' - ' . $val->ra; if($val->rs_pk != 0 || $val->ra_pk != 0) echo '<br>PK ' . $val->rs_pk . ' - ' . $val->ra_pk?></td>
                <td scope="row"><?php echo $val->team1; ?></td>
            </tr>
        <?php } ?>
    </table>
    <?php endif; ?>
</div>
@stop
@include('common.footer')