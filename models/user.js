const Sequelize = require('sequelize');


module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            login_id: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                //암호화 경우까지 대비하여 여유롭게 최대 100글자
                type: Sequelize.STRING(100),  
                allowNull: false,
            },
            email:{
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate:{
                    isEmail:true,
                }
            },
            birth :{
                type: Sequelize.DataTypes.DATEONLY,
                allowNull: false,
            },
            nickname:{
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            profile_img:{
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            gender:{
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            cold_sensitivity:{
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            hot_sensitivity:{
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            area:{
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                validate: {
                    isIn:[['강원도','경기도','경상남도','경상북도','광주광역시','대구광역시','대전광역시','부산광역시','서울특별시','세종특별자치시','울산광역시','인천광역시','전라남도','제주특별자치도','충청남도','충청북도']]
                },
            },
            area_detail:{
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
               
            },
        },{
            sequelize,
            timestamps: true, // true - createdAt,updatedAt 자동 생성 
            underscored:false, //true - created_at
            paranoid:true, 
            //javascript
            modelName: 'User',
            //sql
            tableName:'users', //sequelize table명 - modelName을 소문자화한 후, 복수형
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    static associate(db){
        db.User.hasMany(db.Post,{sourceKey: 'id', foreignKey: 'writer'});
        db.User.belongsToMany(db.User,{
            foreignKey: 'followingId',
            as:'Followers',
            through : 'Follow'
        });
        db.User.belongsToMany(db.User,{
            foreignKey:'followerId',//foreignKey없을 경우, 자동으로 userId로 들어감
            as:'Followings', // foreignKey와 반대 
            through:'Follow', //중간 테이블 이름
        });
        db.User.hasMany(db.Like, {foreignKey:'userId', sourceKey:'id'})
    }
};