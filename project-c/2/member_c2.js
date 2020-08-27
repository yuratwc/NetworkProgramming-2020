/*
    member_c2 ( kadai C2 )
    network programming
    bi18027 / yuratwc
*/
const puppeteer = require('puppeteer');
const fs = require('fs');
const baseUrl = "https://ja.wikipedia.org/wiki/Category:FIFA%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89%E3%82%AB%E3%83%83%E3%83%97%E5%8F%82%E5%8A%A0%E3%83%81%E3%83%BC%E3%83%A0";

let useMySql = false;
let mysql = null;
let dbc = null;
try {
    require.resolve('mysql');
    mysql = require('mysql');
    dbc = mysql.createConnection({
        host: 'localhost',
        user: 'node',
        password: '1234',
        database: 'netpro'
    });
    dbc.connect();
    useMySql = true;
} catch(err) {
    console.log('database connection failed, runnning with virtual mode.');
}

function fetchQuery(str, vals) {
    return new Promise((resolve, fail) => {
        dbc.query(str, vals, (err, response) => {
            if(err) {
                fail(err);
                return;
            }
            resolve(response);
        });
    });
}

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


(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(baseUrl);
    const urls = await page.evaluate(() => {
        let _urls = [];
        let as = document.getElementById('mw-pages').querySelectorAll('a');
        for(let atag of as) {
            _urls.push('https://ja.wikipedia.org' + atag.getAttribute("href"));
        }
        return _urls;
    });
    let tasks = [];
    for(let url of urls) {
        tasks.push(new Promise( async (resolve) => {
            const pg = await browser.newPage();
            await pg.goto(url);
            let p = await pg.evaluate((resolve, e) => {
                let year = document.getElementById('firstHeading').innerText.substr(0, 4);
                function getNearestH3(dom) {
                    while(true) {
                        if(dom.previousElementSibling = null) {
                            dom = dom.parentNode;
                            continue;
                        }
                        if(dom.nodeName == "H3") {
                            return dom;
                        }
                        if(dom.previousElementSibling.nodeName == "H3") {
                            break;
                        }
                        dom = dom.previousElementSibling;
                    }
                    return dom.previousElementSibling ? dom.previousElementSibling : null;
                }
                let result = {};
                let dats = [];
                let curCountry = "";
                for(let tag of document.querySelectorAll('table > tbody > tr > td > table > tbody > tr')) {
                    if(tag.children.length != 7)
                        continue;
                    if(tag.firstElementChild.nodeName == "TH") {   //header
                        if(curCountry && curCountry.length > 0) {
                            //save
                            result[curCountry] = dats;
                            dats = [];
                        }
                        let m = getNearestH3(tag.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);
                        if(m && m.innerText) {
                            curCountry = m.innerText.replace('[編集]', '');
                        }
                        
                        continue;
                    }
                    let dat = [];
                    for(let c of tag.children) {
                        dat.push(c.innerText);
                    }
                    dat.push(year);
                    dats.push(dat);

                }
                if(curCountry && curCountry.length > 0 && dats.length > 0) {
                    //save
                    result[curCountry] = dats;
                    dats = [];
                }

                return result;
            });
            resolve(p);
        }));
    }
    let result = await Promise.all(tasks);
    let i = 0;
    let j = 0;
    let r = [];
    
    let years = {};
    if(useMySql) {
        try {
            let ys = await fetchQuery("select id, year from wc_tournament;", []);
            for(let y of ys) {
                years[y.year.substr(0,4)] = y.id;
            }
        } catch(err) {}
    }

    for(let k of result) {
        for(let key of Object.keys(k)) {
            let teamId = j;
            if(useMySql) {
                try {
                    let teams = await fetchQuery("select id from wc_team where `country` = ?", [key.trim()]);
                    if(teams.length > 0 && teams[0].id) {
                        teamId = teams[0].id;
                    }
                } catch(err) {
                    //console.log(err);
                }
            }
            let val = k[key];

            for(let m of val) {
                let tid = -1;
                if(years[m[7]]) {
                    tid = years[m[7]];
                }
                const obj = {id:i, tournament_id :tid, team_id : teamId, name:m[3], position:m[1]};
                if(r.length == 0) {
                    r.push( obj2CSVKeys( obj));
                }
                r.push(obj2CSVLine(obj));
                i++;
            }
            j++;
        }
        
    }
    fs.writeFileSync("./wc_members.csv", r.join('\r\n'));
    await browser.close();
    if(dbc) {
        dbc.end();
    }

})();
