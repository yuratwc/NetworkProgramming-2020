<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Log;

class WorldCupController extends Controller
{
    //

    public function getData(Request $req)
    {
        $type = $req->input('type');
        $id = $req->input('id');
        if($type === 'team')    //especially select any tournament
        {
            if($id == -1)
            {
                $teams = DB::table('wc_team')
                ->orderBy('name')
                ->select('id', 'name')
                ->distinct()
                ->get();
                return json_encode($teams);
            }
            $team0 = $this->getJoinedDB()->where('wc_round.tournament_id', $id)->select('wc_team0.name as name', 'wc_team0.id as id', 'wc_round.tournament_id');

            return json_encode($this->getJoinedDB()->where('wc_round.tournament_id', $id)->select('wc_team1.name as name', 'wc_team1.id as id', 'wc_round.tournament_id')->union($team0)->get());
        }

        if($type === 'group')
        {
            $round = $req->input('round');
            if($id == -1)
            {
                return "[]";
            }

            return json_encode($this->getJoinedDB()->where('wc_round.tournament_id', $id)->where('wc_round.knockout', $round)->select('wc_round.name as name', 'wc_round.id as id', 'wc_round.tournament_id')->distinct()->get());
        }

        return '{}';
    }

    private function getJoinedDB()
    {
        $base_query = DB::table("wc_result")
        ->join('wc_match', 'wc_result.match_id', '=', 'wc_match.id')
        ->join('wc_round', 'wc_match.round_id', '=', 'wc_round.id')
        ->join('wc_tournament', 'wc_round.tournament_id', '=', 'wc_tournament.id')
        ->join('wc_group', 'wc_match.group_id', '=', 'wc_group.id')
        ->join('wc_team AS wc_team0', 'wc_result.team_id0', '=', 'wc_team0.id')
        ->join('wc_team AS wc_team1', 'wc_result.team_id1', '=', 'wc_team1.id');
        return $base_query;
    }

    public function search()
    {
        DB::enableQueryLog();

        $options = [];
        $tournament_results = DB::table('wc_tournament')
            ->orderBy('name')
            ->select('id', 'name')
            ->distinct()
            ->get();

        $groups = DB::table('wc_group')
            ->orderBy('name')
            ->select('id', 'name')
            ->distinct()
            ->get();
            
        $teams = DB::table('wc_team')
            ->orderBy('name')
            ->select('id', 'name')
            ->distinct()
            ->get();

        $rounds = DB::table('wc_round')
            ->orderBy('name')
            ->select('id', 'name')
            ->distinct()
            ->get();

        return view('worldcup/search', [
            'tournaments' => $tournament_results,
            'rounds' => $rounds,
            'groups' => $groups,
            'teams' => $teams
        ]);
    }

    public function searchResults()
    {
        $tour = request('tournament');
        $round = request('round');
        $group = request('group');
        $team = request('team');
        $outcome = request('outcome');
        //$tournament_id = request('tournament');

        $base_query = DB::table("wc_result")
        ->join('wc_match', 'wc_result.match_id', '=', 'wc_match.id')
        ->join('wc_round', 'wc_match.round_id', '=', 'wc_round.id')
        ->join('wc_tournament', 'wc_round.tournament_id', '=', 'wc_tournament.id')
        ->join('wc_group', 'wc_match.group_id', '=', 'wc_group.id')
        ->join('wc_team AS team0', 'wc_result.team_id0', '=', 'team0.id')
        ->join('wc_team AS team1', 'wc_result.team_id1', '=', 'team1.id');

        //->get();
        if(isset($tour))
        {
            error_log('tour checked');
            $base_query = $base_query->where('wc_tournament.id', $tour);
        }
        if(isset($group) && intval($group) != -1)   //str
        {
            //error_log('gr checked');
            $base_query = $base_query->where('wc_group.id', $group);
        }
        if(isset($team) && intval($team) != -1)
        {
            $base_query = $base_query->where('team0.id', $team);
        }
        if(isset($round) && intval($round) != -1)   //str
        {
            $base_query = $base_query->where('wc_round.knockout', $round);
        }
        if(isset($outcome))
        {
            $base_query = $base_query->where('wc_result.outcome', $outcome);
        }
        $results = $base_query->select("wc_tournament.name AS tournament_name", "wc_round.name AS round_name", "wc_group.name AS group_name", "wc_match.start_date AS date", "team0.name AS team0", "wc_result.rs AS rs", "wc_result.ra AS ra", "wc_result.rs_pk AS rs_pk", "wc_result.ra_pk AS ra_pk", "team1.name AS team1", "team0.lat AS team0_lat", "team0.lng AS team0_lng", "team1.lat AS team1_lat", "team1.lng AS team1_lng")
            ->get();

        return view('worldcup/search_results', [
            'data' => $results
        ]);
    }
}
