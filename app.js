// create server.
var express = require('express'),
app = express(),
port = 8000;
var Joi = require('joi');
var MongoClient = require('mongodb').MongoClient;

app.listen(port);

var db_fetchData = function(y,m,d, res){
    var createDay = y + '-' + m + '-' + d;
    var createDay2 = m + '/' + d;

    console.log(createDay2);
    MongoClient.connect("mongodb://[ID]:[PASS]@linus.mongohq.com:10054/[DB]", function(err, db) {
        if(err) { return console.dir(err); }
        else
            db.collection('[collname]', function(err, collection) { 
            // db.XD.find({date:'1/23',pushCount:'6'},{date:1,author:1,pushCount:1}).limit(10)
                 collection.find({date:createDay2}).sort({_id : -1}).limit(10).toArray(function(err, items) {
                    //console.log(items);
                    res.send(items);
                 });
            });
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

    app.get('/:y/:m/:d', function(req, res){
        console.log(req.params.y + '/' + req.params.m + '/' + req.params.d);
        var obj = {
            y: req.params.y,
            m: req.params.m,
            d: req.params.d
        };
        var isVali = validation(obj);
        console.log('validation: ' + isVali);
        if(isVali)  db_fetchData(req.params.y, req.params.m, req.params.d, res);
    });

    app.get('*', function(req, res){
        res.send({"page": ':3' });
    });

    console.log('start express server\n');