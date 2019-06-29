const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Get Post Model
const Post = require('../../models/Post');
//Get Profile Model
const Profile = require('../../models/Profile');

//Validator
const validatePostInput = require("../../validation/post");
//Validator
const validateCommentInput = require("../../validation/comment");

// @route   GET api/posts/test
//@desc     Tests posts route
//@access   Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Post API works."
  })
);

// @route   POST api/posts/
//@desc     Send posts to database
//@access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  //Validate
  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(404).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => {
    res.json(post)
  }).catch(err => {
    res.status(404).json(err)
  })
})

// @route   GET api/posts/
//@desc     Get all posts
//@access   Public
router.get('/', (req, res) => {
  Post.find().sort({ date: -1 }).then(posts => {
    res.json(posts);
  }).catch(err => res.status(404).json({ nopost: "There are no posts." }))
})

// @route   GET api/posts/:id
//@desc     Get one post
//@access   Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id).then(post => {
    res.json(post)
  }).catch(err => res.status(404).json({ error: "There is no post." }))
})

// @route   DELETE api/posts/:id
//@desc     Delete one post
//@access   Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      //Check for post owner
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ error: "Unauthorized process." })
      }
      post.remove().then(() => res.json({ success: true }))
    }).catch(err => res.status(404).json({ postnotfound: "No post found." }))
  })
})

// @route   POST api/posts/like/:id
//@desc     Like a post
//@access   Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      if (post.likes.filter(like => like.id.toString() === req.user.id).length > 0) {
        return res.status(400).json({ alreadyliked: "User already liked this post." })
      }
      post.likes.unshift(req.user.id);

      //Save
      post.save().then((post) => { res.json(post) })
    }).catch(err => res.status(404).json({ postnotfound: "No post found" }));
  })
})

// @route   POST api/posts/unlike/:id
//@desc     Unlike a post
//@access   Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      if (post.likes.filter(like => like.id.toString() === req.user.id).length === 0) {
        return res.status(400).json({ notliked: "You have not liked this post yet" })
      }
      const removeIndex = post.likes.map(item => item.id.toString()).indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);
      //Save
      post.save().then(post => {
        res.json(post)
      })
    }).catch(err => res.status(404).json({ postnotfound: "No post found" }));
  })
})

// @route   POST api/posts/comment/:id
//@desc     Add comment to a post
//@access   Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id).then(post => {
    const { errors, isValid } = validateCommentInput(req.body);

    if (!isValid) {
      return res.status(404).json(errors);
    }

    const newCmnt = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    }
    //Push
    post.comments.unshift(newCmnt);
    //Save
    post.save().then((post) => { res.json(post) }).catch(err => res.status(404).json(err))
  })
})

// @route   DELETE api/posts/comment/:id/:comment_id
//@desc     Delete comment from a post
//@access   Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id).then(post => {

    if (post.comments.filter(comment => comment.id === req.params.comment_id).length === 0) {
      return res.status(404).json({ thereisnocomment: "Comment couldn't find." })
    }
    //FindIndex
    const removeIndex = post.comments.map(comment => comment.id.toString()).indexOf(req.params.comment_id);
    //remove comment
    post.comments.splice(removeIndex, 1);
    //Save
    post.save().then(post => res.json(post)).catch(err => res.status(404).json(err))

  }).catch(err => res.status(404).json(err))
})

module.exports = router;
