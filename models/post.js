const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            title: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique:false
            },
            body: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique:false
            },
            temp:{
                type:Sequelize.INTEGER,
                allowNull:false,
                unique:false
            },
            item:{
                type:Sequelize.STRING(30),
                allowNull:false,
                unique:false
            },
            imgURL:{
                type:Sequelize.STRING,
                allowNull:false,
                unique:true
            }
        },{
            sequelize,
            timestamps:true, // true - createdAt,updatedAt 자동 생성 
            underscored:false, //true - created_at
            paranoid:false, //true - createdAt, updatedAt, deletedAt
            //javascript
            modelName: 'Post',
            //sql
            tableName:'posts', //sequelize table명 - modelName을 소문자화한 후, 복수형
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        })
    }
    static associate(db){
        db.Post.belongsTo(db.User, {foreignKey: 'writer', targetKey: 'id'});
        db.Post.belongsTo(db.Item,{foreignKey:'item_Id',targetKey:'itemId'});
        db.Post.hasMany(db.Like, {foreignKey:'postId', sourceKey:'id'})
        // db.Post.belongsToMany(db.User, {
        //     through : 'Like',
        //     as : 'UsersLikingIt' // addpostId 관계쿼리 
        // });
    }
}