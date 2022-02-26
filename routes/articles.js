const {
  getArticles,
  getArticle,
  patchArticle,
} = require("../controllers/articles");
const {
  getCommentsByArticleId,
  postComment,
} = require("../controllers/comments");

const articleRouter = require("express").Router();

articleRouter.route("/").get(getArticles);

articleRouter.route("/:article_id").get(getArticle).patch(patchArticle);

articleRouter
  .route("/:article_id/comments")
  .post(postComment)
  .get(getCommentsByArticleId);

module.exports = articleRouter;