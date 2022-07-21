const express = require('express');
const { isLoggedIn } = require('./middlewares');
const {Like, Post, Item, User}= require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { signedCookie } = require('cookie-parser');
const { parse } = require('path');
const env = process.env.NODE_ENV||'development';
const { Op } = require("sequelize");
//config.json의 development import
const config = require('../config/config')[env];
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');



const router = express.Router()

try{
    fs.readdirSync('uploads');    
}catch(error){
    console.error('uploads폴더가 없어 해당 폴더를 생성합니다');
    fs.mkdirSync('uploads');
}

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


router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    // req.file.location -  이미지가 저장 되어 있는 s3 주소
    res.json({ url: req.file.location });
});



//post create
// img upload할 부분이 없으므로 'upload.none()'
router.post('', isLoggedIn,upload.single('img'),async(req,res,next)=>{
    try{
        let itemId = await Item.findOne({
            attributes:['itemId'],
            where:{item:req.body.item}
        });

        // res.json({itemId:itemId.itemId})
        const post = await Post.create({
            title :  req.body.title,
            body: req.body.body,
            item_Id :itemId.itemId,
            temp : req.body.temp,
            writer : req.user.id,
            item : req.body.item,
            imgURL: req.body.imgURL
        })
        res.json({post:post});
    }
    catch(error){
        console.error(error);
        next(error);
    }
});

// post read - all
router.get('',isLoggedIn,async(req,res,next)=>{
    try{
        const posts = await Post.findAll(
           {order:[["createdAt", "DESC"]]}
            )
        res.json({posts:posts});
    }
    catch(error){
        console.error(error);
        next(error);
    }
});

// post read - 특정 게시글 상세보기
router.get('/read/:postid',isLoggedIn,async(req,res,next)=>{
    try{
        const LikeCnt = await Like.count({
            where:{postId:req.params.postid}
        })
        const post = await Post.findAll({
            where:{id:req.params.postid},
            });res.json({post:post, LikeCnt:LikeCnt});
    }catch(error){
        console.error(error);
        next(error);
    }
})

// posts read - certain one
router.get('/search', isLoggedIn, async(req,res,next)=>{
    try{
        //category keyword search
        if(req.query.item){
            const posts = await Post.findAll({
                where: {item: req.query.item}
            })
            res.json({posts:posts}); 
        }
        // category itemId search
        else if(req.query.itemId){
            const posts = await Post.findAll({
                where: {item_Id: req.query.itemId}
            })
            res.json({posts:posts});
        }
        // month search
        else if(req.query.month){
            const month = req.query.month
            const evenMon = [2,4,6,8,10,12];
            if(month in evenMon){
                if(month == 2){
                    let endDate = "2022-02-28";
                    let startDate = "2022-02-01";
                    const posts = await Post.findAll({
                        where:{createdAt: {
                            [Op.lt]: new Date(new Date(endDate).getTime() + 60 * 60 * 24 * 1000 - 1),
                            [Op.gt]: new Date(startDate)
                    }}})
                    res.json({posts,posts})  
                }else{
                    let endDate = `2022-${month}-30`;
                    let startDate = `2022-${month}-01`;
                    const posts = await Post.findAll({
                        where:{createdAt: {
                            [Op.lt]: new Date(new Date(endDate).getTime() + 60 * 60 * 24 * 1000 - 1),
                            [Op.gt]: new Date(startDate)
                    }}
                })
            }}else{
                let endDate = `2022-${month}-31`;
                    let startDate = `2022-${month}-01`;
                const posts = await Post.findAll({
                    where:{createdAt:{
                        [Op.lt]: new Date(new Date(endDate).getTime() + 60 * 60 * 24 * 1000 - 1),
                        [Op.gt]: new Date(startDate)}}})      
                res.json({posts,posts})
        }}
    }catch(error){
        console.error(error);
        next(error);
        
    }
})


// 특정 사용자 작성 게시글
router.get('/search/writer',isLoggedIn,async(req,res,next)=>{
    try{
        const posts = await Post.findAll({
            where: {writer:req.user.id}
        })
        res.json({posts:posts});
    }
    catch(error){
        console.error(error);
        next(error)
    }
})





// post update
router.patch('/:postid',isLoggedIn,async(req,res,next)=>{
    try{
        const itemId = await Item.findOne({
            attributes:['itemId'],
            where:{item:req.body.item}
        });
        const updatedPost = await Post.update({
            title :  req.body.title,
            body: req.body.body,
            itemId : itemId,
            temp : req.body.temp,
            item : req.body.item
        },{where:{id:req.params.postid}})
        res.json({message:"update success!"});
    }
    catch(error){
        console.error(error);
        next(error);
    }
});

//post delete
router.delete('/:postid', isLoggedIn, async(req,res,next)=>{
    try{
        const deletePost = await Post.destroy({
            where:{id:req.params.postid}
        });
        res.json({message:"delete success!"});
    }
    catch(error){
        console.error(error);
        next(error);
    }
});

//좋아요 클릭 
router.post('/like/:postid',isLoggedIn,async(req,res,next)=>{
    try{
        // console.log(req.params.postid)
        const post = await Post.findOne({
            where:{id:req.params.postid}})
        if(post){
            // LIKE테이블에서 postId와 연결되어 있는 userId에 parseInt(req.user.id,10)을 추가 -> addUsersLinkingIt
            await Like.create({
                postId: req.params.postid,
                userId: req.user.id});
            res.json({message:'liked counted'});
        }else{
            res.json({message:'no post'});  
        }
    } catch(error){
        console.error(error);
        next(error);
    }
});

// 좋아요 취소
router.delete('/like/:postid',isLoggedIn,async(req,res,next)=>{
    try{
        const deletedLike = await Like.destroy({
            where:{
            userId : req.user.id,
            postId : req.params.postid }
        })
        res.json({message:"like is deleted"})
    }
    catch(error){
        console.error(error);
        next(error);
    }
} )

// 좋아요한 게시글

router.get('/like',isLoggedIn,async(req,res,next)=>{
    try{
        const posts = await Like.findAll({
            where:{userId:req.user.id},
            attributes:["postId","userId"],
            include:Post
        })
        res.json({posts:posts})
    }
    catch(error){
        console.error(error);
        next(error);
    }
})

module.exports = router;