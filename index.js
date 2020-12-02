var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash")
    User        = require("./models/user"),
	Meeting        = require("./models/meeting"),
    session = require("express-session"),
    methodOverride = require("method-override");
	router = express.Router(),
	MongoClient = require("mongodb").MongoClient;

// configure dotenv
require('dotenv').load();

//requiring routes
var indexRoutes      = require("./routes/index");
    
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

const databaseUri ='mongodb://localhost/confmate';
mongoose.connect("mongodb+srv://danish:jRRyezykn9p1zYwo@conf-mate.shxow.mongodb.net/confmate?retryWrites=true&w=majority",{ useFindAndModify: false, useNewUrlParser: true ,useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Hello, welcome to Conf Mate",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


app.use("/", indexRoutes);

app.get("/login", function(req,res){
	res.render("login");
})

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: ("/profile"),
        failureRedirect: "/login" 
    }), function(req, res){
});

app.get("/signup",function(req,res){
	res.render("signup");
})

app.post("/signup",function(req,res){
	 var newUser = new User({username: req.body.username, email:req.body.email});
     User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
			req.flash("error",err);
            return res.render("signup");
        }
		 res.redirect("/login");
        // passport.authenticate("local")(req, res, function(){
        //    res.redirect("/login");
        // });
    });
})

app.get("/profile", function(req, res) {
	if(req.isAuthenticated())
	{
		var user = req.user;
		res.render("profile", {user:user})
	}
	else
	{
		req.flash("error", "You must be signed in to do that!");
		res.redirect("/login");
	}
});

// app.post("/profile", function(req,res){
// 	res.redirect("/video");
// 	res.redirect("/meeting/"+req.body.meetingcode);
// })
var user1;
// app.post("/profileh",function(req,res){
// 	User.findById(req.body.host,function(err,user){
// 		if(err){
// 			console.log(err);
// 		}
// 		else{
// 			User.findByIdAndUpdate(user._id,{meeting:true},function(err,user){
// 				if(err){
// 					console.log(err);
// 				}
// 			});		
// 			user1 = user;
// 			// res.redirect("/meeting/"+user._id);
// 			res.redirect("/video");
// 		}
// 	})
// })

app.get("/video",function(req,res,next){
	res.render("video");
})

app.post("/video",function(req,res,next){
	Meeting.findByIdAndUpdate(user1._id, {username : req.user.username , stream : req.body.source}, {upsert : true}, function(err,meeting){
		if(err){
			console.log(err)
		}
	})
	res.redirect("/meeting/"+user1._id);
})

app.get("/meeting/:id",function(req,res){
	User.findById(req.params.id, function(err,user){
		if(err){
			console.log(err)
		}
		else{
			if(user.meeting){
					
				Meeting.findById(user._id,function(err,meeting){
					if(err){
						console.log(err)
					}
					console.log(meeting);
					res.render("meeting", {meeting:meeting});
				})			
			}
			else {
				res.send("The user hasn't hosted the meeting yet!")
			}
		}
	})
})

// app.post("/meeting/:id",function(req,res){
// 	Meeting.findByIdAndUpdate({id:user._id},{is:user._id},function(err,meeting){
// 					meeting.user.push({username : currentUser.username , stream : req.body.source })
// 					res.render("meeting", {meeting:meeting});
// 				})	
// })

app.get("*",function(req,res){
	res.send("The Page You Are Looking For is Not Found!")
})

function isLoggedIn(req, res, next){
        if(req.isAuthenticated())
		{
            return 1;
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    };

app.listen(process.env.PORT, function(){
   console.log("The Server Has Started!");
});
