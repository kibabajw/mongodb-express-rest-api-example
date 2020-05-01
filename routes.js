'use strict';

let express = require('express');
let router = express.Router();
let Question = require('./models').Question;

router.param('qID', function(req, res, next, id) {
    Question.findById(id, function(err, doc) {
        if(err) return next(err);
        if(!doc) {
            err = new Error('Not found');
            err.status = 404;
            return next(err);
        }
        req.question = doc;
        return next();
    });
});

router.param('aID', function(req, res, next, id) {
    req.answer = req.questions.answers.id(id);
    if(!req.answer) {
        err = new Error('Not found');
        err.status = 404;
        return next(err);
    }
    next();
});

router.get('/', function(req, res, next){
    Question.find({}).sort({createdAt: -1})
                    .exec(function(err, questions) {
                    if(err) return next(err);
                    res.json(questions);
                    });
});

router.post('/', function(req, res, next){
    let question = new Question(req.body);
    question.save(function(err, question) {
        if(err) return next(err);
        res.status(201);
        res.json(question);
    });
});

router.get('/:qID', function(req, res, next){
    res.json(req.question);
});

router.post('/:qID/answers', function(req, res){
    req.question.answers.push(req.body);
    req.question.save(function(err, question) {
        if(err) return next(err);
        res.status(201);
        res.json(question);
    });
});

router.put('/:qID/answers/:aID', function(req, res, next){
    req.answer.update(req.body, function(err, results) {
        if(err) return next(err);
        res.json(results);
    });
});

router.delete('/:qID/answers/:aID', function(req, res){
    req.answer.remove(function(err) {
        req.question.save(function(err, question) {
            if(err) return next(err);
            res.json(question);
        });
    });
});

router.post('/:qID/answers/:aID/vote-:dir', function(req, res, next){
        if (req.params.dir.search(/^(up|down)$/) === -1) {
            let err = new Error('Not found');
            err.status = 404;
            next(err);
        } else {
            req.vote = req.params.dir;
            next();
        }
    }, function(req, res, next){
    req.answer.vote(req.vote, function(err, question) {
        if(err) return next(err);
        res.json(question);
    });
});

module.exports = router;






