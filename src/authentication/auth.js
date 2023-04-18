const jwt = require("jsonwebtoken");
const blogsModel = require("../model/blogsModel");
const mongoose = require("mongoose");

const authentication = (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];

    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: "the token must be present" });
    } else {
      const validToken = jwt.decode(token);
      if (validToken) {
        jwt.verify(token, "this is the secret key");
        next();
      } else {
        res.status(401).send({ status: false, msg: "invalid token" });
      }
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const authorization = async (req, res, next) => {
  try {
    const blogsId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res
        .status(400)
        .send({
          status: false,
          msg: "invalid userId",
        });
    let data = await blogsModel.findById(userId);
    if (!data)
      return res
        .status(400)
        .send({ status: false, msg: "provide valid userId" });
    const token = req.headers["x-api-key"];
    const decodedToken = jwt.verify(token, "this is the secret key");

    if (data.userId == decodedToken.ID) {
      next();
    } else {
      res.status(403).send({ status: false, msg: "authorization failed" });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.authentication = authentication;
module.exports.authorization = authorization;
