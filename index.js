var express = require('express')
var bodyParser = require('body-parser')
var server = express()
port = parseInt(process.env.PORT, 10) || 8080;

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
server.use(bodyParser.json())

const db = require("./data/db.js");

const serverDate = new Date();

server.get('/', (req, res) => {
    res.send('Hello World!');
});

server.get('/api/posts', (req, res) => {
    db
        .find()
        .then(posts => {
            res.send(posts);
        })
        .catch(err => {
            res.status(550).json({ error: err, message: "could not get posts" });
        });
});

server.get("/api/posts/:id", (req, res) => {
    db
        .findById(req.params.id)
        .then(post => {
            if (!post) {
                res
                    .status(404)
                    .json({ message: "Could not find post in database with post ID " + req.params.id });
            } else {
                res.json(post);
            }
        })
        .catch(err => {
            res.status(400).json({ error: err, message: "Error at findById call" });
        });
});

server.get("/api/posts/:id/comments", (req, res) => {
    console.log("finding post with id", req.params.id);
    db
    .findPostComments(req.params.id)
    .then((comments) => {
        res.json(comments);
    })
    .catch((err) => {
        res.status(400).json({ error: err, message: "Error at findCommentsByID call" });
    })
});

server.post("/api/posts", (req, res) => {

    const newPost = {
        title: req.body.title, // String, required
        contents: req.body.contents, // String, required
        created_at: serverDate.getTime(),
        updated_at: serverDate.getTime()
      }

    if (!newPost.title || !newPost.contents) {
        res
            .status(400)
            .json({ message: "You must provide a title and contents while posting a new post" });
    } else {
        db
            .insert(newPost)
            .then(post => {
                res.status(201).json(post);
            })
            .catch(err => {
                res.json({ error: err, message: "Error at .insert call" });
            });
    }
});

server.post("/api/posts/:id/comments", (req, res) => {

    const newComment = {
        text: req.body.text, // String, required
        post_id: req.params.id,
        created_at: serverDate.getTime(),
        updated_at: serverDate.getTime()
      }
      console.log("text ", newComment.text)
    if (!newComment.text) {
        console.log("text undefined")
        res
            .status(400)
            .json({ message: "You must provide a title and contents while posting a new comment" });
    } else {
        db
            .insertComment(newComment)
            .then(post => {
                res.status(201).json(post);
            })
            .catch(err => {
                res.json({ error: err, message: "Error at .insertComment call" });
            });
    }
});

server.delete("/api/posts/:id", (req, res) => {

    db.findById(req.params.id)
        .then(user => {
            if (!user) {
                res
                    .status(404)
                    .json({ message: "Could not find post in database with post ID " + req.params.id });
            } else {
                db
                    .remove(req.params.id)
                    .then(result => {
                        res.status(201).json(result);
                    })
                    .catch(err => {
                        res.status(500).json({ error: err, message: "Error at .remove call" });
                    });
            }
        });
});

server.put("/api/posts/:id", (req, res) => {

    db
        .findById(req.params.id)
        .then(post => {
            if (!post) {
                res
                    .status(404)
                    .json({ message: "Could not find post in database with post ID " + req.params.id });
            } else if (!req.body.title || !req.body.contents) {
                res
                    .status(400)
                    .json({ error: "You must provide a title and contents while putting a post" });
            } else {
                db
                    .update(req.params.id, req.body)
                    .then(response => {
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        res.status(500).json({ error: err, message: "Error at .update call" });
                    });
            }
        });
});

server.listen(port, () => console.log('API running on port ' + port));