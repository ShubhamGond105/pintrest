var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const upload = require('./multer');
const users = require('./users');


passport.use(new LocalStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});
router.get('/register',  function(req, res, next) {
  res.render('register',{nav:false});
});
router.get('/profile', isLoggedIn,async function(req, res, next) {
  const user = await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")
  res.render('profile',{user ,nav:true});
});


router.get('/show/posts', isLoggedIn,async function(req, res, next) {
  const user = await userModel
  .findOne({username: req.session.passport.user})
  const posts = await postModel.find(); // No need to populate "posts" here
  res.render('feed', { user, posts, nav: true });
});


router.get('/feed', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
 
 const posts = await postModel.find(); // No need to populate "posts" here
 res.render('feed', { user, posts, nav: true });
});


router.get('/add', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add',{user ,nav:true});
});
router.post('/createpost', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Create the post and wait for it to be created
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });

    // Update the user's posts array
    user.posts.push(post._id);

    // Save the user with the updated posts array
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



router.post('/fileupload', isLoggedIn,upload.single("image"),async  function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect("/profile")
});

router.post('/register', function(req, res, next) {
 const data = new userModel({
  fullname:req.body.fullname,
  username : req.body.username,
  email : req.body.email,
  contact:req.body.contact
 })
userModel.register(data, req.body.password)
.then(function(){
  passport.authenticate("local")(req , res,function(){
    res.redirect("/profile")
  });
});
});

router.post('/login', passport.authenticate("local", {
  failureRedirect:  "/",
  successRedirect:"/profile" ,
}), function(req, res, next) {
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){ // Fix typo in this line
    return next();
  }
  res.redirect('/');
}

module.exports = router;
