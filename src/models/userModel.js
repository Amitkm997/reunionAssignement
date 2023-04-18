const { default: mongoose } = require(mongoose);
const jwt = require(jsonwebtoken);
var ObjectId = mongoose.Types.ObjectId();

const userSchema = mongoose.Schema(
  {
    email: String,
    password: String,
  },
  { timeStamps: true }
);

const post = mongoose.Schema(
  {
    user_id: ObjectId,
    caption: String,
    image_url: String,
    likes: [ObjectId],
    comments: [
      {
        user_id: ObjectId,
        text: String,
      },
    ],
  },
  { timeStamps: true }
);



// const followers = mongoose.Schema(
//     follower_id  : ObjectId,
//     following_id : ObjectId,
//   { timeStamps: true }
// );

userSchema.methods.generateAuthToken = () => {
  const user = this;
  const token = jwt.sign({ userId: user._id }, "this is the secret key," {
    expiresIn: 50,
  });
  return token;
};

module.exports = mongoose.model(Alluser, userSchema);
module.exports = mongoose.model(post, post);
module.exports = mongoose.model(followers, followers);
