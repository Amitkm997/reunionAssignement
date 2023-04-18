

const userModel = require("../models/userModel");
const jwt=require("jsonwebtoken")

// -------- create User ---------------///

const isValid = function(value){
  if (typeof value ==='undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true
}

const createUser = async (req, res) => {
  try {
    let data = req.body;
    let { email, password} = data;

    if (!isValid(email)) {
      return res.status(400).send({ msg: "email is required" });
    }
    //email unique
    const isEmailAlreadyUsed = await userModel.findOne({ email });
    if (isEmailAlreadyUsed) {
      return res.status(400).send({status: false,message:` ${email} address is already registered`,});
    }
   
    if (!isValid(password)) {
      return res.status(400).send({ msg: "password is required" });
    }

    let validEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!validEmail.test(req.body.email)) {
      return res.status(400).send({ message: "invalid email address" });
    }
    let validPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (!validPassword.test(req.body.password)) {
      return res.status(400).send({ message: "invalid password" });
    }
    const user = await userModel.create(data)
        const token = user.generateAuthToken()
        return res.status(201).send({status:true , data:token}); 
    } catch (error) {
        return res.status(500).send({status:false,message: error.message })
    }
};


//----------------API to follow the user-------------------
const userFollow =  async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  // Check if user exists
  const userToFollow = await User.findById(id);
  if (!userToFollow) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Check if user is already followed
  const isAlreadyFollowed = userToFollow.followers.includes(userId);
  if (isAlreadyFollowed) {
    return res.status(400).json({ message: 'User is already followed.' });
  }

  // Add user to followers
  userToFollow.followers.push(userId);
  await userToFollow.save();

  return res.json({ message: 'User followed successfully.' });
};

//-------------------------API To unfollow the user-----------------------------
const userUnfollow= async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  // Check if user exists
  const userToUnfollow = await User.findById(id);
  if (!userToUnfollow) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Check if user is already unfollowed
  const isAlreadyUnfollowed = !userToUnfollow.followers.includes(userId);
  if (isAlreadyUnfollowed) {
    return res.status(400).json({ message: 'User is not followed.' });
  }

  // Remove user from followers
  userToUnfollow.followers = userToUnfollow.followers.filter(followerId => followerId !== userId);
  await userToUnfollow.save();

  return res.json({ message: 'User unfollowed successfully.' });
};

//-----------------------Get user profile-----------------------
 
const getUserProfile= async (req, res) => {
  const { userId } = req;

  try {
    // Get user profile from database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get number of followers and followings
    const numFollowers = user.followers.length;
    const numFollowings = user.followings.length;

    // Return user profile
    return res.json({
      name: user.name,
      numFollowers,
      numFollowings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


//----------------Add new post---------------------

// Add new post
const addNewPost= async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req;

  try {
    // Create new post
    const newPost = new Post({
      title,
      description,
      user: userId,
    });

    // Save new post to database
    await newPost.save();

    // Return post data
    return res.json({
      id: newPost._id,
      title: newPost.title,
      description: newPost.description,
      createdAt: newPost.createdAt.toUTCString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

//---------------------------------delete post---------------------------------

const deletePost= async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  try {
    // Find post by ID and check if it belongs to authenticated user
    const post = await Post.findOne({ _id: id, user: userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Delete post from database
    await post.remove();

    // Return success message
    return res.json({ message: 'Post deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


//--------------------Like post----------------------


// Like post
 const likePost=async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  try {
    // Find post by ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked.' });
    }

    // Add user to likes array and save post to database
    post.likes.push(userId);
    await post.save();

    // Return success message
    return res.json({ message: 'Post liked.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

//-------------------------unlike the post--------------------------
const unlikePost=async(req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the post ID from the URL parameter
  const postId = req.params.id;

  // Remove the like associated with the post ID for the authenticated user
  const userId = req.user.id; // Assuming user ID is stored in the req.user object
  removeLike(postId, userId)
    .then(() => {
      // Return a success response
      res.json({ success: true });
    })
    .catch((err) => {
      // Handle any errors that occurred during the removal of the like
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
};

//--------------------comment-------------------

const commentForPost=async(req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the post ID from the URL parameter
  const postId = req.params.id;

  // Get the comment text from the request body
  const { text } = req.body;

  // Add the comment to the post for the authenticated user
  const userId = req.user.id; // Assuming user ID is stored in the req.user object
  const commentId = addComment(postId, userId, text);

  // Return the ID of the new comment
  res.json({ commentId });
};


//-----------------------------------single post----------------------------------
const singlePost=async (req, res) => {
  // Get the post ID from the URL parameter
  const postId = req.params.id;

  // Retrieve the post from the database or API
  const post = getPost(postId);

  // Retrieve the number of likes for the post
  const numLikes = getNumLikes(postId);

  // Retrieve the comments for the post
  const comments = getComments(postId);

  // Combine the post, likes, and comments into a single object
  const postWithLikesAndComments = {
    ...post,
    numLikes,
    comments,
  };

  // Return the post with its likes and comments
  res.json(postWithLikesAndComments);
};

//-----------------------------return all post------------------------
const returnAllPost=async  (req, res) => {
  // Get the authenticated user ID from the request or session
  const userId = req.session.userId; // or however your authentication system works

  // Retrieve all posts created by the user from the database or API, sorted by post time
  const posts = getPosts(userId);

  // For each post, retrieve the number of likes and comments
  const postsWithLikesAndComments = posts.map((post) => ({
    ...post,
    likes: getNumLikes(post.id),
    comments: getComments(post.id),
  }));

  // Return the posts with their likes and comments
  res.json(postsWithLikesAndComments);
};
//exporting all the route handlers
module.exports={createUser, userFollow,userUnfollow,getUserProfile,addNewPost,deletePost,likePost,unlikePost,commentForPost,singlePost,returnAllPost};