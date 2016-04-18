var mongoose = require('mongoose'),
    config = require('../bin/config'),
    db = mongoose.connection,
    Schema = mongoose.Schema,
    SchemaUsers,
    SchemaPosting;
mongoose.connect(config.monggo);

SchemaUsers = new Schema({
  username  : String,
  password  : String,
  phone     : Number,
  email     : String,
  birthday  : String,
  avatar    : {type: String, default: '/img/avatar.png'},
  posts     : [Schema({
                title : String,
                id    : String
              })],
  dete      : {type: Date, default: Date.now},
  verified  : {type: Boolean, default: false},
  token     : String
});
exports.users = db.model('users', SchemaUsers);

SchemaArticle = new Schema({
  title       : String,
  desciption  : String,
  tag         : Array,
  price       : Number,
  vote        : {type:String, default: 0},
  voter       : Array,
  date        : {type: Date, default: Date.now},
  author      : String,
  comment     : [Schema({
                  username : String,
                  body     : String,
                  date     : {type: Date, default: Date.now}
                })]
});
exports.article = db.model('Article', SchemaArticle);

SchemaTag = new Schema({
  name: String,
  total: {type: String, default: 1}
});
exports.tag = db.model('Tag', SchemaTag);
