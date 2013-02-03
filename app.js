// create server.
var express = require('express'),
app = express(),
port = 977;
var Joi = require('joi');
var mysql = require('mysql');
enableCache = 'no'
app.listen(port);

var mysql_ini = function(){
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : '',
      password : '',
    });
    return connection
}

var db_fetchData = function(y,m,d, res){
    var createDay = y + '-' + m + '-' + d;
    var createDay2 = m + '/' + d;
    var maxAge = 86400/6
    console.log(createDay);
    
    var con = mysql_ini();
    var items = [];
    con.connect();
    con.query('use ptt_demo');
    con.query("SELECT id,author,title,date,head,full_article from gm WHERE date = '" + createDay + "'", function(err, rows, fields) {
        if (err) throw err;
        for (var i in rows) {
            items.push(rows[i]);
            console.log('> ', rows[i].author + ' '+ rows[i].title );
        }
        console.log('count: ' + items.length);
        if(enableCache == 'yes')
            if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + maxAge );
        res.send(JSON.stringify(items));
    });
}

var validation = function(obj){

    // var S = Joi.Types.String;
    var I = Joi.Types.Number;
    var rules = {
        'y': I().min(2000).max(2015),
        'm': I().min(1).max(12),
        'd': I().min(1).max(31)
    };
    var res = Joi.validate(obj, rules, function (err) {
        if (err) return 0;
        else return 1;
        });
        return res;
    }

    app.get('/8gua/:y/:m/:d', function(req, res){
        console.log(req.params.y + '/' + req.params.m + '/' + req.params.d);
        var obj = {
            y: req.params.y,
            m: req.params.m,
            d: req.params.d
        };
        var isVali = validation(obj);
        console.log('validation: ' + isVali);
        if(isVali)
            db_fetchData(req.params.y, req.params.m, req.params.d, res);
        else
            res.send({"page": ':3' });
    });

    app.get('*', function(req, res){
        res.send({"page": ':3' });
    });

    console.log('start express server at ' + port + '\n');
