var RecipeGeneration = require('../model/RecipeGeneration');
var read = require('../model/Read');
var MatrixUpdate = require('../model/MatrixUpdate');
var JsonFileManagement = require('../model/JsonFileManagement');

module.exports = function (app, passport) {
	
	//New Routes
	app.get('/newroute', function(req, res){
		res.send('<h1>This is my new Route</h1>');
	});
	
	// normal routes ==============================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
    	if(!req.user)
    		res.render('index.ejs');
    	else
    		res.render('welcomepage.ejs', {user: req.user});
    });
    
 // PROFILE SECTION =========================
    /*app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });*/
    
 // LOGOUT ==============================
    app.get('/logout', function(req, res) {
    	
    	//Logic below to unlink Token/Password before logout.
        req.logout();
        res.redirect('/');
    });
    
 // =============================================================================
 // AUTHENTICATE (FIRST LOGIN) ==================================================
 // =============================================================================

    //LDAP Authentication
    // show the login form
    app.get('/ldaplogin', function(req, res) {
        res.render('ldaplogin.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/ldaplogin', passport.authenticate('ldap-login', {
        successRedirect : '/welcomepage', // redirect to the secure profile section
        failureRedirect : '/ldaplogin', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    
     // locally --------------------------------
         // LOGIN ===============================
         // show the login form
         app.get('/login', function(req, res) {
             res.render('login.ejs', { message: req.flash('loginMessage') });
         });

         // process the login form
         app.post('/login', passport.authenticate('local-login', {
             successRedirect : '/welcomepage', // redirect to the secure profile section
             failureRedirect : '/login', // redirect back to the signup page if there is an error
             failureFlash : true // allow flash messages
         }));

         // SIGNUP =================================
         // show the signup form
         app.get('/signup', function(req, res) {
             res.render('signup.ejs', { message: req.flash('signupMessage') });
         });

         // process the signup form
         app.post('/signup', passport.authenticate('local-signup', {
             successRedirect : '/welcomepage', // redirect to the secure profile section
             failureRedirect : '/signup', // redirect back to the signup page if there is an error
             failureFlash : true // allow flash messages
         }));

     // facebook -------------------------------

         // send to facebook to do the authentication
         app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

         // handle the callback after facebook has authenticated the user
         app.get('/auth/facebook/callback',
             passport.authenticate('facebook', {
                 successRedirect : '/welcomepage',
                 failureRedirect : '/'
             }));

     // twitter --------------------------------

         // send to twitter to do the authentication
         app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

         // handle the callback after twitter has authenticated the user
         app.get('/auth/twitter/callback',
             passport.authenticate('twitter', {
                 successRedirect : '/welcomepage',
                 failureRedirect : '/'
             }));


     // google ---------------------------------

         // send to google to do the authentication
         app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

         // the callback after google has authenticated the user
         app.get('/auth/google/callback',
             passport.authenticate('google', {
                 successRedirect : '/welcomepage',
                 failureRedirect : '/'
             }));

      // =============================================================================
      // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
      // =============================================================================

          // locally --------------------------------
              app.get('/connect/local', function(req, res) {
                  res.render('connect-local.ejs', { message: req.flash('loginMessage') });
              });
              app.post('/connect/local', passport.authenticate('local-signup', {
                  successRedirect : '/welcomepage', // redirect to the secure profile section
                  failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
                  failureFlash : true // allow flash messages
              }));

          // facebook -------------------------------

              // send to facebook to do the authentication
              app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

              // handle the callback after facebook has authorized the user
              app.get('/connect/facebook/callback',
                  passport.authorize('facebook', {
                      successRedirect : '/welcomepage',
                      failureRedirect : '/'
                  }));

          // twitter --------------------------------

              // send to twitter to do the authentication
              app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

              // handle the callback after twitter has authorized the user
              app.get('/connect/twitter/callback',
                  passport.authorize('twitter', {
                      successRedirect : '/welcomepage',
                      failureRedirect : '/'
                  }));


          // google ---------------------------------

              // send to google to do the authentication
              app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

              // the callback after google has authorized the user
              app.get('/connect/google/callback',
                  passport.authorize('google', {
                      successRedirect : '/welcomepage',
                      failureRedirect : '/'
                  }));

           // =============================================================================
           // UNLINK ACCOUNTS =============================================================
           // =============================================================================
           // used to unlink accounts. for social accounts, just remove the token
           // for local account, remove email and password
           // user account will stay active in case they want to reconnect in the future

               // local -----------------------------------
               app.get('/unlink/local', isLoggedIn, function(req, res) {
                   var user            = req.user;
                   user.local.email    = undefined;
                   user.local.password = undefined;
                   user.save(function(err) {
                       res.redirect('/welcomepage');
                   });
               });

               // facebook -------------------------------
               app.get('/unlink/facebook', isLoggedIn, function(req, res) {
                   var user            = req.user;
                   user.facebook.token = undefined;
                   user.save(function(err) {
                       res.redirect('/welcomepage');
                   });
               });

               // twitter --------------------------------
               app.get('/unlink/twitter', isLoggedIn, function(req, res) {
                   var user           = req.user;
                   user.twitter.token = undefined;
                   user.save(function(err) {
                       res.redirect('/welcomepage');
                   });
               });

               // google ---------------------------------
               app.get('/unlink/google', isLoggedIn, function(req, res) {
                   var user          = req.user;
                   user.google.token = undefined;
                   user.save(function(err) {
                       res.redirect('/welcomepage');
                   });
               });


           // route middleware to ensure user is logged in
           function isLoggedIn(req, res, next) {
               if (req.isAuthenticated())
                   return next();

               res.redirect('/');
           }

        // =============================================================================
        // Routes to Other Pages========================================================
        // =============================================================================
           app.get('/welcomepage', isLoggedIn, read.showhomepage);
           app.get('/loadtestcase', isLoggedIn, read.showloadpage);
           /*app.post('/uploadtestcase', isLoggedIn, function(req, res){
          // console.log("Before Render Upload : ",req.query.upload);
        	   console.log("upload :",req.files);
        		console.log(req.files.fileupload.name);
        		console.log(req.files.fileupload.path);
        	  res.send('upl:' + req.files.fileupload.path);
           });*/
           app.post('/uploadtestcase', isLoggedIn, read.uploadtestcase);
           app.get('/RecipeGenerationNew', isLoggedIn,RecipeGeneration.showRecipePage);
           app.get('/RecipeGeneration', RecipeGeneration.showRecipeOldPage);//added to show performance old recipe gen
           app.get('/saveRecipe', isLoggedIn, RecipeGeneration.saveRecipe);
           app.post('/RESTWSRecipeGeneration',RecipeGeneration.loadTestcases);
           app.get('/jsonfilemanagement',isLoggedIn, JsonFileManagement.jsonFileManagement);
           app.post('/jsonfile', isLoggedIn, MatrixUpdate.jsonfile);	//on save
           app.get('/matrixdownload',isLoggedIn, MatrixUpdate.matdownload);
           app.get('/download', isLoggedIn, MatrixUpdate.download);
           app.get('/downloadsuccess',isLoggedIn, MatrixUpdate.downloadsuccess);
      				
};