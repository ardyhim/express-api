var express   = require('express'),
    router    = express.Router(),
    md5       = require('md5'),
    jwt       = require('jsonwebtoken'),
    mongoose  = require('mongoose'),
    config    = require('../bin/config'),
    db        = require('../model/db');

function isAuthenticated(req, res, next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token){
    jwt.verify(token, config.secret, function(err, decoded){
      if (err) {
        res.json({success: false, message: 'Failed to authenticate token'});
      }else {
        req.decoded = decoded;
        next();
      }
    });
  }else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
}

router.get('/', function(req, res, next){
  return res.json({
    register: {
      method: 'POST',
      url   : 'http://localhost:3000/api/register'
    },
    login: {
      method: 'POST',
      url   : 'http://localhost:3000/api/authenticate'
    },
    logout: {
      method: 'GET',
      url   : 'http://localhost:3000/api/logout'
    },
    article_add: {
      method: 'POST',
      url   : 'http://localhost:3000/api/article'
    },
    article_list: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article'
    },
    article_most_vote: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article/most/vote'
    },
    article_last: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article/most/comment'
    },
    article_last_comment: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article/last'
    },
    article_read: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article/read/:id'
    },
    article_read_comment: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article/read/:id/comment'
    },
    article_vote: {
      method: 'GET',
      url   : 'http://localhost:3000/api/article/vote/:id'
    }
  });
});

// Post Register
router.post('/register', function(req, res, next){
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('birthday', 'Birthday is required').notEmpty();
  var validEorros = req.validationErrors();
  if (validEorros) {
    res.json({success: false, message: validEorros});
  }else {
    db.users.findOne({$or:[{username: req.body.username},{email:req.body.email}]},function(err,data){
      if (data) {
        if (data.username == req.body.username) {
          return res.json({message: 'This username is available', success: false});
        }
        if (data.email == req.body.email) {
          return res.json({message: 'This email is available', success: false});
        }
      }else {
        var add = new db.users({
          username  : req.body.username,
          password  : md5(req.body.password),
          email     : req.body.email,
          phone     : '62'+req.body.phone,
          birthday  : req.body.birthday
        });
        add.save(function(err){
          if(err) return res.status(401).send();
          return res.json({message: 'success', success: true});
        });
      }
    });
  }
});

// Post login
router.post('/authenticate', function(req, res, next){
  db.users.findOne({username: req.body.username}).select('username password email').exec(function(err, data){
    if (data) {
      if (data.password !== md5(req.body.password)) {
        return res.json({message: 'password not match', success: false});
      }else {
        var token = jwt.sign(data, config.secret, {
          expiresIn: '60m',
          algorithm: 'HS256'
        });
        return res.json({message: 'logged', success: true, token: token});
      }
    }else {
      res.json({message: 'This username is not available', success: false});
    }
  });
});

// get Logout
router.get('/logout', isAuthenticated, function(req, res, next){
  return res.json({message: 'Success to logout', success: true});
});

// get users
router.get('/users/:users', function(req, res, next){
  db.users.findOne({username:req.params.users}).select('posts username avatar email').exec(function(err,data){
    return res.json(data);
  });
});

// post Article
router.post('/article', isAuthenticated, function(req, res, next){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('desciption', 'Desciption is required').notEmpty();
  req.checkBody('tag', 'Tag is required').notEmpty();
  req.checkBody('price', 'Price is required').notEmpty();
  req.checkBody('price', 'Only numbers').isNumeric();
  var validEorros = req.validationErrors();
  if (validEorros) {
    res.json({success: false, message: validEorros});
  }else {
    var add = new db.article({
      title       : req.body.title,
      desciption  : req.body.desciption,
      tag         : req.body.tag.split(','),
      price       : req.body.price,
      author      : req.decoded._doc.username
    });
    add.save(function(err,result){
      if(err) return res.status(401).send();
      if (!err) {
        data = {
          id: result._id,
          title: result.title
        };
        db.users.findOneAndUpdate({username:req.decoded._doc.username},{$addToSet:{posts:data}}, function(err,data){
          if(err) return res.json({message: 'Failed to insert article', success: false});
          return res.json({message: 'Success to insert article', success: true});
        });
      }
    });
  }
});

// Get article
router.get('/article', isAuthenticated, function(req, res, next){
  db.article.find({}, function(err, data){
    if(err) return res.status(401).send();
    res.json(data);
  });
});

// Get One Article

router.get('/article/read/:id', function(req, res, next){
  db.article.findOne({_id:req.params.id}, function(err, data){
    if(err) return res.status(401).send();
    res.json(data);
  });
});

// delete users post
router.delete('/article/:id', isAuthenticated, function(req, res, next){
  db.article.findOne({_id: req.params.id}, function(err, data){
    if(err) return res.status(401).send();
    if (data) {
      if (data.author == req.decoded._doc.username) {
        db.article.remove({_id: req.params.id}, function(err_rem){
          db.users.update({username: req.decoded._doc.username}, {$pull:{posts:{id:req.params.id}}}, {safe:true}, function(err_up){
            if (!err_up) {
              res.json({message: 'success delete', success: true});
            }
          });
        });
      }else {
        res.json({message:'not allowed to delete', success: false});
      }
    }else {
      res.status(401).send();
    }
  });
});

// Update Article
router.put('/article/update/:id', isAuthenticated, function(req, res, next){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('desciption', 'Desciption is required').notEmpty();
  req.checkBody('tag', 'Tag is required').notEmpty();
  req.checkBody('price', 'Price is required').notEmpty();
  req.checkBody('price', 'Only numbers').isNumeric();
  var validEorros = req.validationErrors();
  if (validEorros) {
    res.json({success: false, message: validEorros});
  }else {
    var data = {
      title       : req.body.title,
      desciption  : req.body.desciption,
      price       : req.body.price
    };
    db.article.findOne({_id: req.params.id}, function(err, result){
      if (result) {
        if (result.author == req.decoded._doc.username) {
          if (req.body.tag.split(',') == result.tag) {
            db.article.update({_id: req.params.id}, data, function(err, data){
              if (!err) {
                return res.json({message:'success update', success: true});
              }
            });
          }else {
            db.article.update({_id: req.params.id}, {$set: {tag: req.body.tag.split(',')}}, function(err, data){
              if (!err) {
                return res.json({message:'success update', success: true});
              }
            });
          }
        }else {
          res.json({message: 'not allowed to update'});
        }
      }else {
        res.json({message: 'tidak ada data'});
      }
    });
  }
});


// Post comment
router.post('/article/read/:id/comment', isAuthenticated, function(req, res, next){
  var data = {
    username  : req.session.users.username,
    body      : req.body.body
  };
  db.article.update({_id:req.params.id},{$addToSet:{comment:data}}, function(err){
    if(err) return res.status(401).send();
    res.json({message: 'Success to comment'});
  });
});

// Get vote
router.get('/article/vote/:id',  function(req, res, next){
  db.article.findOne({_id: req.params.id},function(err, data){
    jwt.verify(req.query.token, config.secret, function(err, decoded){
    if(err) return res.status(401).send();
      if (data) {
        if (decoded._doc.username == data.author) return res.json({message: 'not allowed to vote', success: false});
        for (var i = 0; i < data.voter.length; i++) {
          if (data.voter[i] == req.session.users.username) {
            return res.json({message: 'Failed to vote'});
          }
        }
        var vote = data.vote++;
        db.article.findOneAndUpdate({_id: req.params.id}, {vote: vote++, $push:{voter:req.session.users.username}}, function(err, data){
          if(err) return res.status(401).send();
          return res.json({message: 'success vote', success: true});
        });
      }
    });
  });
});

// Get most vote
router.get('/article/most/vote',  function(req, res, next){
  db.article.find({}).sort({vote: -1}).exec(function(err, data){
    if(err) return res.status(401).send();
    return res.json(data);
  });
});

// Get last comment
router.get('/article/most/comment',  function(req, res, next){
  db.article.find().sort({comment: -1}).exec(function(err, data){
    if(err) return res.status(401).send();
    return res.json(data);
  });
});

// Get last thread
router.get('/article/last',  function(req, res, next){
  db.article.find().sort({date: -1}).exec(function(err, data){
    if(err) return res.status(401).send();
    return res.json(data);
  });
});

module.exports = router;
