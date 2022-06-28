const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController")
const authorController = require("../controllers/authorController")
const authenticate = require("../middlewares/auth")

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/authors", authorController.createAuthor)

router.post("/login", authorController.login)

router.post("/blogs", authenticate.authentication, blogController.createBlog)

router.get("/blogs", authenticate.authentication, blogController.getBlog)

router.put("/blogs/:blogId", authenticate.authentication, authenticate.authorisation, blogController.updateBlog)

router.delete("/blogs/:blogId", authenticate.authentication, authenticate.authorisation, blogController.deleteBlog)

router.delete("/blogs/:authorId", authenticate.authentication, authenticate.authorisation, blogController.deleteByQuery)

module.exports = router; 