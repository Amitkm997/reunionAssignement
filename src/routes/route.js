const express=require('express');
const router=express.Router()


const {createUser,userUnfollow,userFollow,getUserProfile,addNewPost, deletePost, likePost, unlikePost, commentForPost, singlePost, returnAllPost}=require("../controllers/createUser.js");
const { authentication, authorization } = require('../authentication/auth.js');

//---------------------  **API Endpoints**  --------------------

//----------------------user creation------------------
router.post('/authenticate',createUser);

//--------------follow user--------------------------
router.post('/api/unfollow/:id',authentication,authorization,userFollow);

//--------------------unfollow user-------------------
router.post('/api/unfollow/:id', authentication,authorization,userUnfollow );

//--------------------get userProfile------------------------
router.get('/api/user',authentication,authorization,getUserProfile);

//-----------------------addnewpost-----------------------------------
router.post('/api/posts',authentication,authorization,addNewPost);

//----------------------------deletePost--------------------------------
router.delete('/api/posts/:id',authentication,authorization,deletePost);

//----------------------------like the post---------------------------
router.post('/api/like/id',authentication,authorization,likePost);

//--------------------------unlike the post--------------------------------
router.post('/api/unlike/id',authentication,authorization,unlikePost);

//-------------------------comment For Post--------------------------------
router.post('/api/comment/id',authentication,authorization,commentForPost);

//--------------------------single post-----------------------------
router.get('/api/posts/id',authentication,authorization,singlePost);

//------------------------get all post----------------------------
router.get('/api/all_posts',authentication,authorization,returnAllPost);


module.exports=router