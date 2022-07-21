const Sequelize = require('sequelize');

module.exports = class Item extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            itemId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                autoIncrement: true,
                primaryKey: true
            },
            item: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        }, {
            sequelize,
            timestamps:false, // true - createdAt,updatedAt 자동 생성 
            underscored:false, //true - created_at
            paranoid:false, //true - createdAt, updatedAt, deletedAt
            //javascript
            modelName: 'Item',
            //sql
            tableName:'items', //sequelize table명 - modelName을 소문자화한 후, 복수형
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        })
    }
    static associate(db){
        db.Item.hasMany(db.Post,
        {foreignKey:'item_Id',sourceKey:'itemId'});
        db.Item.hasMany(db.TempCategory,{foreignKey:'itemId',sourceKey:'itemId'});
        
    }
}