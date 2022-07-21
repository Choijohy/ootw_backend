const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            upper_comment_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            writer: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
            },
            posting_id:{
                type: Sequelize.INTEGER,
                allowNull: false,
                
            }, 
        },{
            sequelize,
            timestamps:false, // true - createdAt,updatedAt 자동 생성 
            underscored:false, //true - created_at
            paranoid:false, //true - createdAt, updatedAt, deletedAt
            //javascript
            modelName: 'Comment',
            //sql
            tableName:'comments', //sequelize table명 - modelName을 소문자화한 후, 복수형
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        })
    }
};