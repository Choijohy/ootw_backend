const Sequelize = require('sequelize');



module.exports = class TempCategory extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            itemId :{
                type: Sequelize.DataTypes.INTEGER
            },
            item:{
                type: Sequelize.DataTypes.STRING,
                unique:false,
            },
            temp:{
                type: Sequelize.DataTypes.INTEGER,
                unique:false
            }
        },{
            sequelize,
            modelName: 'TempCategory',
            timestamps:false, // true - createdAt,updatedAt 자동 생성 
            underscored:false, //true - created_at
            paranoid:false, //true - createdAt, updatedAt, deletedAt
            //javascript
            //sql
            tableName:'tempcategories', //sequelize table명 - modelName을 소문자화한 후, 복수형
        }
    )}
    static associate(db){
        db.TempCategory.belongsTo(db.Item,{foreignKey:'itemId',targetKey:'itemId'});
    }
}