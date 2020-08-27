/*
    worldcup_getter ( kadai C1 )
    network programming
    bi18027 / yuratwc
*/

const puppeteer = require('puppeteer');
const fs = require('fs');
const world_cup_url = "https://ja.wikipedia.org/wiki/2018_FIFA%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89%E3%82%AB%E3%83%83%E3%83%97";
const exportDirectory = "./export";

function obj2CSVKeys(obj) {
    const values = Object.keys(obj);
    return ary2CSVLine(values);
}

function obj2CSVLine(obj) {
    const values = Object.values(obj);
    return ary2CSVLine(values);
}

function ary2CSVLine(ary) {
    let r = [];
    for(let v of ary) {
        if(v == null) {
            r.push('null');
        } else if(typeof(v) === "string") {
            r.push('"' + v + '"');
        } else {
            r.push(v);
        }
    }

    return r.join(",");
}

function dateFormaDate(date) {
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
}

(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(world_cup_url);
    let data = await page.evaluate(() => {

        function captureRegex(regex, str) {
            let r = str.match(regex);
            if(r && r.length > 1) {
                return r[1];
            }
            return null;
        }
        
        function getNearestH4(dom) {
            while(dom.previousElementSibling && dom.previousElementSibling.nodeName != "H4" && dom.previousElementSibling.nodeName != "H3" && (dom = dom.previousElementSibling)) {}
            return dom.previousElementSibling ? dom.previousElementSibling : null;
        }

        let r = [];
        let vevents = document.getElementsByClassName('vevent');
        for(let v of vevents) {
            let divs = v.querySelectorAll("td > div");
            if(divs.length != 2)
                continue;
            
            let matchdata = {};
            r.push(matchdata);

            let h4 = getNearestH4(v);
            if(h4 && h4.innerText) {
                matchdata.group = h4.innerText.replace('[編集]', '');
            }
            let timeDiv = divs[0];

            let timeDivHtml = timeDiv.innerText;
            
            matchdata.date =  captureRegex(/((?:[年月日]|[0-9])+)/, timeDivHtml);
            matchdata.time =  captureRegex(/(\d\d:\d\d)/, timeDivHtml);
            matchdata.utc =  Number(captureRegex(/UTC[\+\-](\d+)/, timeDivHtml));

            let date = new Date(matchdata.date.replace('年', '/').replace('月', '/').replace('日', '/') + ' ' +matchdata.time + ':00');
            date.setHours(date.getHours() - matchdata.utc);
            matchdata.heldDate = date.getTime();

            let teamTds = v.getElementsByClassName("vcard attendee");
            let i = 0;
            for(let td of teamTds) {
                matchdata["team" + i] = td.innerText.trim();//captureRegex(/>(.+)<\/a>/, teamTds[i].innerHTML);
                i++;
            }
            let scoreThs = v.querySelectorAll('th');
            let scoreTh = scoreThs[0];
            if(scoreTh.innerText.includes("(")) { //entyou
                let scores = scoreTh.innerText.replace('(延長)', '').split('-');
                matchdata["score0"] = Number(scores[0].trim());
                matchdata["score1"] = Number(scores[1].trim());
                if(scoreThs.length > 2) {
                    scores = scoreThs[2].innerText.replace('–', '-').replace('–', '-').split('-');
                    matchdata["scorePK0"] = Number(scores[0]);
                    matchdata["scorePK1"] = Number(scores[1]);
                }
            } else {
                let scores = scoreTh.innerText.split('-');
                matchdata["score0"] = Number(scores[0].trim());
                matchdata["score1"] = Number(scores[1].trim());
            }


        }
        return r;
    });
    //console.log(data);

    let groups = await page.evaluate(() => {
        
        function captureRegex(regex, str) {
            let r = str.match(regex);
            if(r && r.length > 1) {
                return r[1];
            }
            return null;
        }

        function getNearestH4(dom) {
            while(dom.previousElementSibling && dom.previousElementSibling.nodeName != "H4" && dom.previousElementSibling.nodeName != "H3" && (dom = dom.previousElementSibling)) {}
            return dom.previousElementSibling ? dom.previousElementSibling : null;
        }
        let r = [];
        let tables = document.querySelectorAll(".wikitable");
        for(let t of tables) {
            let n = getNearestH4(t);
            if(!n || !n.innerText || !n.innerText.includes("グループ"))
                continue;
            
            let tds = t.querySelectorAll('td');
            let i = 1;
            for(let d of tds) {
                if(d.innerText && d.firstChild && d.firstChild.nodeName == "SPAN") {
                    r.push({order:i, name: captureRegex(/([^\[\]]+)/, n.innerText).trim(), country: captureRegex(/([^\(\)]+)/, d.innerText).trim()});
                    i++;
                }
            }
        }
        return r;
    });
    //console.log(groups);

    //mkdir
    if(!fs.existsSync(exportDirectory)) {
        fs.mkdirSync(exportDirectory);
    }

    let teamMap = {};
    (function() {
        let countries = new Set();
        for(let d of data) {
            countries.add(d.team0);
            countries.add(d.team1);
        }
        let ary = [];
        let i = 0;
        for(let d of countries) {
            ary.push({id: i, name:d, country:d, counrty_now:d, lat:0, lng:0, area:'unknown'});
            i++;
        }

        let r = [];
        for(let d of ary) {
            if(r.length == 0) {
                r.push(obj2CSVKeys(d));
            }
            r.push(obj2CSVLine(d));

            teamMap[d.name] = d;
        }
        fs.writeFileSync(exportDirectory + "/wc_team.csv", r.join('\r\n'));
    })();

    let tournament = null;
    (function() {
        for(let d of data) {
            let p = d.heldDate;
            d.heldDate = new Date(p);
        }
        data.sort((a,b) => {
            return a < b ? -1 : a > b ? 1 : 0;
        });

        const obj = {id:0, start_date:dateFormaDate(data[0].heldDate), year:data[0].heldDate.getFullYear(), country:"russia", name:"ロシア大会"};
        tournament = obj;
        let r = [obj2CSVKeys(obj), obj2CSVLine(obj)];
        fs.writeFileSync(exportDirectory + "/wc_tournament.csv", r.join('\r\n'));

    })();
    
    let round = {};
    (function() {
        let rounds = {};
        let roundObjs = {};
        for(let d of data) {
            if(!rounds[d.group]) {
                rounds[d.group] = [];
            }
            rounds[d.group].push(d);
        }
        let r = [];
        let i = 0;
        for(let k of Object.keys(rounds)) {
            let ar = rounds[k];
            //console.log(ar);
            ar.sort((a,b) => {
                return a < b ? -1 : a > b ? 1 : 0;
            });
            const kn = k.includes("決");
            roundObjs[k] = {id:i,tournament_id:tournament.id, name:k, ordering: 0, knockout: Number(kn), start_date:dateFormaDate(ar[0].heldDate), end_date:dateFormaDate(ar[ar.length - 1].heldDate)};
            if(i == 0) {
                r.push(obj2CSVKeys(roundObjs[k]));
            }
            r.push(obj2CSVLine(roundObjs[k]));
            round[k] = roundObjs[k];
            i++;
        }
        fs.writeFileSync(exportDirectory + "/wc_round.csv", r.join('\r\n'));
    })();

    let group = {};
    (function() {
        let r = [];
        let set = new Set();
        for(let g of groups) {
            set.add(g.name);
        }
        let k = [...set];
        k.sort();
        let i = 1;
        for(let g of k ) {
            const obj = {id: i, name:g, order:i};
            if(r.length == 0) {
                r.push(obj2CSVKeys(obj));
            }
            r.push(obj2CSVLine(obj));
            i++;
            group[obj.name] = obj;
        }
        fs.writeFileSync(exportDirectory + "/wc_group.csv", r.join('\r\n'));
    })();

    (function() {
        let r = [];
        let s = [];
        let order = 1;
        let rid = 1;
        for(let d of data) {
            ///// wc_match
            let obj = {id:order, round_id: round[d.group].id, group_id: 0, order:order, knockout:Number(d.group.includes("決"))};
            if(group[d.group]) {
                obj.group_id = group[d.group].id;
            }

            if(r.length == 0) {
                r.push(obj2CSVKeys(obj));
            }
            r.push(obj2CSVLine(obj));


            ////// wc_result
            const objR0 = {id:rid, match_id:order, team_id0: teamMap[d.team0].id, team_id1: teamMap[d.team1].id};
            let team0Score = Number(d.scorePK0 ? d.scorePK0 : 0) + Number(d.score0);
            let team1Score = Number(d.scorePK1 ? d.scorePK1 : 0) + Number(d.score1);
            objR0.rs = d.scorePK0 ? 0 :d.score0;
            objR0.rs_extra = d.scorePK0 ? d.score0 : null;
            objR0.rs_pk = d.scorePK0 ? d.scorePK0 : null;

            objR0.ra = d.scorePK1 ? 0: d.score1;
            objR0.ra_extra = d.scorePK1 ? d.score1 : null;
            objR0.ra_pk = d.scorePK1 ? d.scorePK1 : null;
            objR0.difference = Math.abs(d.score1 - d.score0);
            objR0.outcome = objR0.difference == 0 ? "引き分け" : (team0Score > team1Score ? "勝利" : "敗北");
            objR0.outcome_90min = objR0.difference == 0 ? "引き分け" : (team0Score > team1Score ? "勝利" : "敗北");
            objR0.count_win = (team0Score > team1Score ? 1 : 0);
            objR0.count_loss = (team0Score < team1Score ? 1 : 0);
            objR0.count_stillmate = (objR0.difference == 0 ? 1: 0);
            objR0.point = d.scorePK0 ? 0 : d.score0 - d.score1;
            objR0.extra = d.scorePK0 ? d.score0 - d.score1 : 0;
            objR0.pk = d.scorePK0 ? 0 : 1;
            objR0.duplicate = '重複を省く';

            rid++;

            if(s.length == 0) {
                s.push(obj2CSVKeys(objR0));
            }
            s.push(obj2CSVLine(objR0));

            const objR1 = {id:rid, match_id:order, team_id0: teamMap[d.team1].id, team_id1: teamMap[d.team0].id};
            objR1.ra = d.scorePK0 ? 0 :d.score0;
            objR1.ra_extra = d.scorePK0 ? d.score0 : null;
            objR1.ra_pk = d.scorePK0 ? d.scorePK0 : null;

            objR1.rs = d.scorePK1 ? 0: d.score1;
            objR1.rs_extra = d.scorePK1 ? d.score1 : null;
            objR1.rs_pk = d.scorePK1 ? d.scorePK1 : null;

            objR1.difference = Math.abs(d.score1 - d.score0);
            objR1.outcome = objR1.difference == 0 ? "引き分け" : (team0Score < team1Score ? "勝利" : "敗北");
            objR1.outcome_90min = objR1.difference == 0 ? "引き分け" : (team0Score < team1Score ? "勝利" : "敗北");
            objR1.count_win = (team0Score < team1Score ? 1 : 0);
            objR1.count_loss = (team0Score > team1Score ? 1 : 0);
            objR1.count_stillmate = (objR1.difference == 0 ? 1: 0);
            objR1.point = d.scorePK1 ? 0 : d.score1 - d.score0;
            objR1.extra = d.scorePK1 ? d.score1 - d.score0 : 0;
            objR1.pk = d.scorePK1 ? 0 : 1;
            objR1.duplicate = '重複を省く';
            s.push(obj2CSVLine(objR1));
            
            rid++;

            order++;

        }
        fs.writeFileSync(exportDirectory + "/wc_match.csv", r.join('\r\n'));
        fs.writeFileSync(exportDirectory + "/wc_result.csv", s.join('\r\n'));
    })();

    await browser.close();
})();