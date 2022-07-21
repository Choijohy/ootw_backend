const express = require('express');
const {User,like,Post, TempCategory} = require('../models');
const { Op } = require("sequelize");
const { isLoggedIn } = require('./middlewares');
// 라우터 분리
const router = express.Router();

  
        /*
        "regionUsers": [{"id": 1},{"id": 2},{"id": 4}]
        result : [[ '0', { id: 1 } ],[ '1', { id: 2 } ],
        [ '2', { id: 4 } ],[ '3', { id: 5 } ]]
        regionPosts:
        [{
            id: 1,
            title: '첫 글',
            body: '아무말 아무말 아무말',
            temp: 10,
            item: '라이더자켓',
            createdAt: 2022-07-19T12:06:34.000Z,
            updatedAt: 2022-07-19T12:06:34.000Z,
            writer: 1,
            item_Id: null
          },
          {
            id: 2,
            title: '첫 글',
            body: '아무말 아무말 아무말',
            temp: 10,
            item: '라이더자켓',
            createdAt: 2022-07-19T12:13:48.000Z,
            updatedAt: 2022-07-19T12:13:48.000Z,
            writer: 1,
            item_Id: null
          }]
        */ 
        
    /*
    팔로우 조회
    const user = await User.findOne({where:{id:req.user.id}});
     if(user){
       const following = await user.getFollowings();
       console.log(followingid);
       res.json({following : following});
    */

router.get('',isLoggedIn,async(req,res,next)=>{
  try{
    // //현재 온도에 해당되는 범위 내에서 작성된 게시글 조회(최신순)
    const posts = await Post.findAll({
      where:{
        temp:{[Op.gte]:parseInt(req.query.temp,10)-3,
          [Op.lte]:parseInt(req.query.temp,10)+3}
      },
      order:[["createdAt", "DESC"]]
    })
    // // 추천아이템
    const itemRecommendations = await TempCategory.findAll({
      where:{temp:req.query.temp},
      limit: 4
    })
    

    // 지역 게시글
    const user = await User.findOne({
      where :{id:req.user.id}
    })

    const regionUsers = await User.findAll({
      attributes: ['id'],
      where: { area_detail: req.user.area_detail },
      raw: true,
    });

    var result = Object.entries(regionUsers);
     
    let result_array = [];

    for(value of result){
      // 본인 제외, 자신과 같은 지역의 user조회
      if (value[1].id != req.user.id) {
        // 해당 user의 post조회
        const regionPosts = await Post.findAll({
          where: { writer: value[1].id },
          raw: true,});
                
        console.log(regionPosts);
                
        regionPosts.forEach((val) => {
            result_array.push(val);
        })
      }console.log(result_array)
    };
     

  // 동일 민감도 게시글
  const sensitivityUsers = await User.findAll({
    attributes: ['id'],
    where: { 
      cold_sensitivity: req.user.cold_sensitivity,
      hot_sensitivity:req.user.hot_sensitivity },
  });

  var result2 = Object.entries(sensitivityUsers);
   
  let result2_array = [];

  for(value of result2){
    // 본인 제외, 자신과 같은 지역의 user조회
    if (value[1].id != req.user.id) {
      // 해당 user의 post조회
      const sensitivityPosts = await Post.findAll({
        where: { writer: value[1].id },
        raw: true,});
              
      console.log(sensitivityPosts);
              
      sensitivityPosts.forEach((val) => {
          result2_array.push(val);
      })
    }console.log(result2_array)
  };
   
  res.json({posts:posts,itemRecommendations:itemRecommendations,regionPosts: result_array,sensitivityPosts:result2_array});
  }catch(error){
      console.error(error);
      next(error);
}})


router.get('/profile',isLoggedIn, async (req,res)=>{
  const user_profile = await User.findOne({
    attributes:{exclude:['password']},
    where:{id:req.user.id}});
  const userPosts = await Post.findAll({
    where:{writer:req.user.id}
  })
    res.json({user_profile,userPosts});
});

// 회원정보 수정
router.patch('/profile',isLoggedIn,async(req,res,next)=>{
  try{
      const updatedProfile = await User.update({
          nickname :  req.body.nickname,
          gender: req.body.gender,
          birth : req.body.birth,
          area: req.body.area,
          area_detail : req.body.area_detail,
          hot_sensitivity : req.body.hot_sensitivity,
          cold_sensitivity : req.body.cold_sensitivity,
          profile_img : req.body.profile_img
      },{where:{id:req.user.id}})
      res.json({message:"update success!"});
  }
  catch(error){
      console.error(error);
      next(error);
  }
});

module.exports = router;