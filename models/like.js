const Sequelize = require('sequelize');
const {User,Post} =  require('../models');

module.exports = class Like extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            postId: {
                type : Sequelize.DataTypes.INTEGER,
                allowNull:false,
                unique:false
            },
            userId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull : false,
                unique: false
            }
        },{
            sequelize,
            timestamps:true, // true - createdAt,updatedAt 자동 생성 
            underscored:false, //true - created_at
            modelName: 'Like',
            //sql
            tableName:'likes', //sequelize table명 - modelName을 소문자화한 후, 복수형
        })
    }
    static associate(db){
        db.Like.belongsTo(db.User, {foreignKey: 'userId', targetKey: 'id'});
        db.Like.belongsTo(db.Post, {foreignKey: 'postId', targetKey: 'id'});
        // db.Post.belongsToMany(db.User, {
        //     through : 'Like',
        //     as : 'UsersLikingIt' // addpostId 관계쿼리 
        // });
    }
}