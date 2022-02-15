const db = require("../db/connection.js");

exports.selectArticle = (id) => {
  return db
    .query(
      `SELECT * FROM articles 
      WHERE article_id = $1;`,
      [id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `No article found for article_id: ${id}`,
        });
      }
      return rows[0];
    });
};