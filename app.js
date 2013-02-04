// create server.
var express = require('express'),
app = express(),
port = 977;
var Joi = require('joi');
var mysql = require('mysql');
var fs = require('fs');
enableCache = 'yes'
app.listen(port);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.configure(function() {
  app.use(allowCrossDomain);
});

var mysql_ini = function(){
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : '',
      password : '',
    });
    return connection;
}

var db_fetchData = function(y,m,d, res, msgObj){
    var createDay = y + '-' + m + '-' + d;
    var createDay2 = m + '/' + d;
    var maxAge = 86400/6
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

        if(enableCache == 'yes')
            if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + maxAge );
        res.send(JSON.stringify(items));

        msgObj.count = items.length;
        console.log(msgObj);
    }); 
}

var validation = function(obj, mode){
    if (mode == 'full'){
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

    if (mode == 'list'){
        var S = Joi.Types.String;
        var rules = {'board': S().max(15)};
        var res = Joi.validate(obj, rules, function (err) {
            if (err) return 0;
            else return 1;
        });
        return res;
    }
}

    app.get('/Gossiping/:y/:m/:d', function(req, res){
        var input = req.params.y + '/' + req.params.m + '/' + req.params.d;
        var obj = {
            y: req.params.y,
            m: req.params.m,
            d: req.params.d
        };

        var isVali = validation(obj,'full');
        var msgObj = {"input" : input, "isVali" : isVali};
        
        if(isVali)
            db_fetchData(req.params.y, req.params.m, req.params.d, res, msgObj);
        else
            res.send({"page": ':3' });
        
    });

    app.get('/:board/list', function(req, res){
        var input = req.params.board;
        var obj = { board: req.params.board };
        var isVali = validation(obj, 'list');
        var msgObj = {"input" : input, "isVali" : isVali};

        if(obj.board){
            var path = "/var/www/quick-ptt/" + req.params.board + ".html";
            fs.readFile(path, function(err, content) { 
                if(err){
                    console.log(err);
                    res.writeHead(500);
                    res.end("Erro loading file");
                }
                    res.writeHead(200);
                    res.end(content);
            });
        }else{
            res.send({"page": ':3' });
        }
        console.log(msgObj);
    });

    app.get('*', function(req, res){
        var input = req.params;
        var obj = { "other input": input };
        console.log(obj)
        res.send({"page": ':3' });
    });

    console.log('start express server at ' + port + '\n');
