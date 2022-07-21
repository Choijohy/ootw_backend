const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); 
const env = process.env.NODE_ENV||'development';
const User = require('../models/user');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const router = express.Router();
const path = require('path');
const fs = require('fs');
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

const upload = multer({
  storage: multerS3({
  s3: new AWS.S3(),
  bucket: 'ziriootw',
  key(req, file, cb) {
  // s3 안의 original 폴더 안에 저장 
  cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
  },
}),
limits: { fileSize: 5 * 1024 * 1024 },
});

// profile_img
router.post('/img', upload.single('img'), (req, res) => {
  // req.file.location -  이미지가 저장 되어 있는 s3 주소
  res.json({ profile_img: req.file.location });
});

//register
router.post('/join', isNotLoggedIn, async (req,res,next) => {
    // from front-end 
    const {login_id, password, email, birth , nickname, gender, cold_sensitivity, hot_sensitivity, area, area_detail,profile_img} = req.body;

    try {
        const exUser = await User.findOne({ where: { email }});
        if (exUser) {
            return res.json({error:"exist user"});
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            login_id,
            email,
            nickname,
            password: hash,
            birth,
            gender, 
            cold_sensitivity,
            hot_sensitivity,
            area,
            area_detail,
            profile_img
        });
        return res.json({message: "user created"});
    } catch (error){
        console.error(error);
        return next(error);
    }
});

//login - cookie,session,sns로그인 등 logic이 복잡해지므로 passport이용
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.json({message:`LoginError=${info.message}`});
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.json({message:"login success"});
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

// 팔로우 POST /user/:id(팔로우할 계정 아이디)/follow
router.post('/:id/follow',isLoggedIn,async(req,res,next)=>{
  try{
      const user = await User.findOne({where:{id:req.user.id}});
      if (user){
          await user.addFollowing(parseInt(req.params.id, 10));
          res.json({message:'following success'});
      }else{
          res.status(404).json({message:'no user'});
      }
  }catch(error){
      console.error(error);
      next(error);
  }
})

router.get('/logout', isLoggedIn,(req,res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.json('logout!');
  });;
  // req.session.destroy();
});

module.exports = router;