const express = require("express");
const commentController = require("../controllers/comment");
const { verify } = require("../auth");

const router = express.Router();

router.post("/", verify, commentController.createComment);
router.get("/post/:postId", commentController.getCommentsByPostId);
router.delete("/:id", verify, commentController.deleteComment);

module.exports = router;
