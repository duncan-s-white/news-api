const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("ALL", () => {
  test("status: 404 - should return with a 'Path not found!' message & status code of 404 if the path is not found", () => {
    return request(app)
      .get("/api/topicsss")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Path not found!");
      });
  });
});
describe("GET - /api", () => {
  test("status: 200 - should respond with JSON representing all the endpoints of the API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body.endpoints["GET /api"].description).toBe(
          "serves up a json representation of all the available endpoints of the api"
        );
      });
  });
});
describe("GET - /api/topics", () => {
  test("status: 200 - should return an array of 3 topic objects with slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        expect(res.body.topics).toHaveLength(3);
        res.body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});
describe("POST - /api/topics", () => {
  test("status: 201 - should return a 201 status and the added object", () => {
    return request(app)
      .post("/api/topics")
      .send({
        slug: "topic_name",
        description: "This is a new topic",
      })
      .expect(201)
      .then((res) => {
        expect(res.body.topic).toEqual({
          slug: "topic_name",
          description: "This is a new topic",
        });
      });
  });
});
describe("GET - /api/articles/:article_id", () => {
  test("status: 200 - should return an article with the specified properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(res.body.article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          })
        );
      });
  });
  test("status: 200 - should return an article with a property stating the correct number of comments", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(res.body.article.comment_count).toBe(11);
      })
      .then(() => {
        return request(app)
          .get("/api/articles/11")
          .expect(200)
          .then((res) => {
            expect(res.body.article.comment_count).toBe(0);
          });
      })
      .then(() => {
        return request(app)
          .get("/api/articles/9")
          .expect(200)
          .then((res) => {
            expect(res.body.article.comment_count).toBe(2);
          });
      });
  });
  test("status: 400 - should return a 'Bad request!' message and status 400 if the article_id is not an integer", () => {
    return request(app)
      .get("/api/articles/dog")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
  test("status: 404 - should return a 'No article found ...' message and status 404 if the article_id does not exist in the db", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("No article found for article_id: 9999");
      });
  });
});

describe("PATCH - /api/articles/:article_id", () => {
  test("status: 200 - should increment the articles votes field in the db, and return the updated article", () => {
    const expected1 = {
      article: {
        article_id: 1,
        title: expect.any(String),
        topic: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
        created_at: expect.any(String),
        votes: 101,
      },
    };
    const expected2 = { article: { ...expected1.article, votes: 1 } };
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining(expected1));
      })
      .then(() => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: -100 })
          .expect(200);
      })
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining(expected2));
      });
  });
  test("status: 400 - should return a message and a status of 400 when invalid id provided", () => {
    return request(app)
      .patch("/api/articles/not-an-id")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
  test("status: 400 - should return a message and a status of 400 when inc_votes property is invalid", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
  test("status: 404 - should return a message and a status of 404 when id does not exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found!");
      });
  });
});
describe("DELETE - /api/articles/:article_id", () => {
  test("status: 204 - should return a 204 status and no content", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });
  test("status: 400 - should return a message and a 400 status when the comment_id provided is invalid", () => {
    return request(app)
      .delete("/api/articles/dog")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
});
describe("GET - /api/users", () => {
  test("status: 200 - should return an array of 4 user objects with a username property", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        expect(res.body.users).toHaveLength(4);
        res.body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET - /api/users/:username", () => {
  test("status: 200 - should return a user with specified properties", () => {
    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then((res) => {
        expect(res.body.user).toEqual({
          username: "rogersop",
          name: "paul",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
        });
      });
  });
  test("status: 404 - should return a message and status 404", () => {
    return request(app)
      .get("/api/users/doesnotexist")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found!");
      });
  });
});

describe("GET - /api/articles", () => {
  test("status: 200 - should return an array of 12 article objects with specified properties, sorted by date DESC when limit query is 0", () => {
    return request(app)
      .get("/api/articles?limit=0")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toHaveLength(12);
        expect(res.body.articles).toBeSorted({
          descending: true,
          key: "created_at",
        });
        res.body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            })
          );
        });
      });
  });
  test("status: 200 - should return an array of article objects also including a comment_count property", () => {
    return request(app)
      .get("/api/articles?limit=0")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toHaveLength(12);
        res.body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              comment_count: expect.any(Number),
            })
          );
          if (article.article_id == 1) {
            expect(article.comment_count).toBe(11);
          }
        });
      });
  });
  test("status: 200 - should be sorted by column and direction when passed in query params", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc&limit=0")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toHaveLength(12);
        expect(res.body.articles).toBeSorted({
          ascending: true,
          key: "comment_count",
        });
      });
  });
  test("status: 200 - should be filtered by a topic when passed a topic query param", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=0")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toHaveLength(11);
      });
  });
  test("status: 200 - should return an empty list of articles when passed a topic that exists but belongs to no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toEqual([]);
      });
  });
  test("status: 200 - should return a total_count property and an array of 5 article objects starting from article_id 6 when limit=5 and p=2", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=2")
      .expect(200)
      .then((res) => {
        expect(res.body.total_count).toBe(12);
        expect(res.body.articles).toHaveLength(5);
        expect(res.body.articles[0].article_id).toBe(6);
      });
  });
  test("status: 400 - should return a message and a status 400 when the sort_by column does not exist", () => {
    return request(app)
      .get("/api/articles?sort_by=dnexist")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid sort by!");
      });
  });
  test("status: 400 - should return a message and a status 400 when the order is not valid (asc, desc)", () => {
    return request(app)
      .get("/api/articles?order=dnexist")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid order by!");
      });
  });
  test("status: 404 - should return a message and a status 404 when the topic is not in the database", () => {
    return request(app)
      .get("/api/articles?topic=dnexist")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found!");
      });
  });
});

describe("POST - /api/articles", () => {
  test("status: 201 - should return a 201 status and the added object", () => {
    const newArticle = {
      author: "rogersop",
      title: "New Article",
      body: "This is my very interesting article",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((res) => {
        expect(res.body.article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            author: "rogersop",
            title: "New Article",
            body: "This is my very interesting article",
            topic: "mitch",
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          })
        );
      });
  });
  test("status: 400 - should return a message and a status 400 when request body has no title property", () => {
    const newArticle = {
      author: "rogersop",
      body: "This is my very interesting article",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Missing property");
      });
  });
  test("status: 400 - should return a message and a status 400 when request body has no body property", () => {
    const newArticle = {
      author: "rogersop",
      title: "New Article",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Missing property");
      });
  });
  test("status: 400 - should return a FK message and a status 400 when the topic does not exist", () => {
    const newArticle = {
      author: "rogersop",
      body: "This is my very interesting comment",
      title: "New Article",
      topic: "dave",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Invalid FK");
      });
  });
  test("status: 400 - should return a FK message and a status 400 when the username does not exist", () => {
    const newArticle = {
      author: "non-existent",
      body: "This is my very interesting comment",
      title: "New Article",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Invalid FK");
      });
  });
});

describe("GET - /api/articles/:article_id/comments", () => {
  test("status: 200 - should return a list of comments, with specified properties, associated with the article", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=0")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toHaveLength(11);
        res.body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });
  test("status: 200 - should return an empty list of comments for an existing article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toEqual([]);
      });
  });
  test("status: 200 - should return a total_count property and an array of 4 comment objects starting from comment_id 5 when limit=3 and p=2", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3&p=2")
      .expect(200)
      .then((res) => {
        expect(res.body.total_count).toBe(11);
        expect(res.body.comments).toHaveLength(3);
        expect(res.body.comments[0].comment_id).toBe(5);
      });
  });
  test("status: 404 - should return a message and a 404 status when the article does not currently exist", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found!");
      });
  });
  test("status: 400 - should return a message and a status of 400 when article_id is invalid", () => {
    return request(app)
      .get("/api/articles/dog/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
});

describe("POST - /api/articles/:article_id/comments", () => {
  test("status: 201 - should return a 201 status and the added object", () => {
    const newComment = {
      username: "rogersop",
      body: "This is my very interesting comment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        expect(res.body.comment).toEqual(
          expect.objectContaining({
            comment_id: 19,
            article_id: 2,
            author: "rogersop",
            body: "This is my very interesting comment",
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("status: 201 - should return a 201 status and the added object, even when object contains unnecessary properties", () => {
    const newComment = {
      username: "rogersop",
      body: "This is my very interesting comment",
      unnecessProp1: 100,
      unnecessProp2: "str",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        expect(res.body.comment).toEqual(
          expect.objectContaining({
            comment_id: 19,
            article_id: 2,
            author: "rogersop",
            body: "This is my very interesting comment",
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("status: 400 - should return a message and a status 400 when an invalid article_id is provided", () => {
    const newComment = {
      username: "rogersop",
      body: "This is my very interesting comment",
    };
    return request(app)
      .post("/api/articles/dog/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
  test("status: 400 - should return a message and a status 400 when request body has no body property", () => {
    const newComment = {
      username: "rogersop",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Missing property");
      });
  });

  test("status: 400 - should return a FK message and a status 400 when the article does not exist", () => {
    const newComment = {
      username: "rogersop",
      body: "This is my very interesting comment",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Invalid FK");
      });
  });
  test("status: 400 - should return a FK message and a status 400 when the username does not exist", () => {
    const newComment = {
      username: "non-existent",
      body: "This is my very interesting comment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Invalid FK");
      });
  });
});

describe("PATCH - /api/comments/:comment_id", () => {
  test("status: 200 - should increment the comments votes field in the db, and return the updated comment", () => {
    const expected1 = {
      comment: {
        comment_id: 1,
        body: expect.any(String),
        article_id: expect.any(Number),
        author: expect.any(String),
        created_at: expect.any(String),
        votes: 17,
      },
    };
    const expected2 = { comment: { ...expected1.comment, votes: -3 } };
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining(expected1));
      })
      .then(() => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: -20 })
          .expect(200);
      })
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining(expected2));
      });
  });
  test("status: 400 - should return a message and a status of 400 when no inc_votes property on the request body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request! Missing property");
      });
  });
  test("status: 400 - should return a message and a status of 400 when inc_votes property is invalid", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
});
describe("DELETE - /api/comments/:comment_id", () => {
  test("status: 204 - should return a 204 status and no content", () => {
    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });
  test("status: 400 - should return a message and a 400 status when the comment_id provided is invalid", () => {
    return request(app)
      .delete("/api/comments/dog")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request!");
      });
  });
  test("status: 404 - should return a message and a 404 status when the comment_id provided does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found!");
      });
  });
});
