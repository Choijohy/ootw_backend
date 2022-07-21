const Sequelize = require('sequelize');
const env = process.env.NODE_ENV||'development';

//config.json의 development import
const config = require('../config/config')[env];
const db = {};

// models
const User = require('./user');
const Item = require('./item');
const Post = require('./post');
const Like = require('./like')
const Comment = require('./comment');
const TempCategory = require('./tempCategory');


const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User = User;
db.Item = Item;
db.Post = Post;
db.Like = Like;
db.Comment = Comment;
db.TempCategory = TempCategory;


User.init(sequelize);
Item.init(sequelize);
Post.init(sequelize);
Comment.init(sequelize);
Like.init(sequelize);
TempCategory.init(sequelize);



User.associate(db);
Post.associate(db);
Like.associate(db);
TempCategory.associate(db);


module.exports = db;    