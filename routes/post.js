const express = require("express");
const postController = require("../controllers/post");
const { verify } = require("../auth");

const router = express.Router();

router.post("/", verify, postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.patch("/:id", verify, postController.updatePost);
router.delete("/:id", verify, postController.deletePost);

module.exports = router;
