var app=angular.module("myApp",['ui.router','ngToast','textAngular']);


  app.run(function($rootScope, AuthService, $state){
    // Stamplay.User.currentUser()
    // .then(function(res){
    //     if(res.user){
    //         $rootScope.loggedIn=true;
    //         console.log($rootScope.loggedIn);
    //     }
    //     else{
    //         $rootScope.loggedIn=false;
    //         console.log($rootScope.loggedIn);
    //     }
    // },function(err){

    //         console.log("An error occurred while getting current user!");
    // });
    //................................................................
    // AuthService.isAuthenticated()
    // .then(function(res){
    //     console.log(res);
    // })
    //...............................................................
    $rootScope.$on('$stateChangeStart',function(event,toState,toParams,fromState,fromParams){
        // console.log(fromState);
        // console.log(toState);
        if(toState.authenticate==true){
            AuthService.isAuthenticated()
            .then(function(res){
                if(res==false){
                    $state.go('login');
                }
            });
        }
        
    })
  });


app.factory('AuthService',function($q,$rootScope){
    return{
        isAuthenticated : function(){
            var defer=$q.defer();

            Stamplay.User.currentUser(function(err,res){
                if(err){
                    defer.resolve(false);
                    $rootScope.loggedIn=false;
                }
                if(res.user){
                    defer.resolve(true);
                    $rootScope.loggedIn=true;
                }
                else{
                    defer.resolve(false);
                    $rootScope.loggedIn=false;
                }
            });
            return defer.promise;
        }
    }
});

//app.config(function($stateProvider,$locationProvider){
  app.config(function($stateProvider,$urlRouterProvider){
    //Stamplay.init("blogit");
    Stamplay.init("shashablogiiitm");

    localStorage.removeItem('http://localhost:8080-jwt');
    //$locationProvider.hashPrefix('');
/*
    $routeProvider
    .when('/',{
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
    })
    .when('/login',{
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })
    .when('/signup',{
        templateUrl: 'templates/signup.html',
        controller: 'SignUpCtrl'
    })
    .when('/viewBlogs',{
        templateUrl: 'templates/viewblogs.html',
        controller: 'viewblogsCtrl'
    })
})
*/
  $stateProvider
    .state('home',{
        url: "/",
        templateUrl: "templates/home.html",
        controller: 'HomeCtrl'
    })
    .state('login',{
        url: "/login",
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })
    .state('signup',{
        url:"/signup",
        templateUrl: 'templates/signup.html',
        controller: 'SignUpCtrl'
    })
    .state('MyBlogs',{
        url:"/myBlogs",
        templateUrl: 'templates/myBlogs.html',
        controller: 'MyBlogsCtrl',
        authenticate :true
    })
    .state('Create',{
        url:"/create",
        templateUrl: 'templates/create.html',
        controller: 'CreateCtrl',
        authenticate :true
    })
    .state('Edit',{
        url:"/edit/:id",
        templateUrl: 'templates/edit.html',
        controller: 'EditCtrl',
        authenticate :true
    })
    .state('View',{
        url:"/view/:id",
        templateUrl: 'templates/view.html',
        controller: 'ViewCtrl'
    });
    /*
    .when('/viewBlogs',{
        templateUrl: 'templates/viewblogs.html',
        controller: 'viewblogsCtrl'
    })*/
    $urlRouterProvider.otherwise("/");
});
/*
app.controller("myCtrl", function($scope){
    //$scope.message="Welcome to BlogIt !";
    //$scope.fruits=['banana','orange','apple','mango','litchi'];
    $scope.numbers = [1,2,3,4,5,6,7,8,9,10]
})
*/

app.controller("ViewCtrl",function($scope,$state,$stateParams,$timeout,ngToast){
    $scope.upVoteCount=10;
    $scope.downVoteCount=5;

    Stamplay.Object("blogs").get({_id:$stateParams.id})
    //Stamplay.Object("shashablogiiitm").get({_id:$stateParams.id})
    .then(function(response){
        $scope.blog=response.data[0];
        $scope.upVoteCount=$scope.blog.actions.votes.users_upvote.length
        $scope.downVoteCount=$scope.blog.actions.votes.users_downvote.length
        $scope.$apply();
        
        //$scope.$apply();
        $scope.blog.actions.comments.forEach(function(element,index){
            Stamplay.User.get({"_id":element.userId})
            .then(function(r){
                $scope.blog.actions.comments[index].displayName=r.data[0].firstName+" "+r.data[0].lastName;
                $scope.$apply();

            })
           
        });
         console.log($scope.blog);
    },function(error){
        console.log(error);
    });

    $scope.postComment=function(){
        Stamplay.Object("blogs").comment($stateParams.id,$scope.comment)
        //Stamplay.Object("shashablogiiitm").comment($stateParams.id,$scope.comment)
        .then(function(res){
            console.log(res);
            $scope.blog=res;

        $scope.blog.actions.comments.forEach(function(element,index){
            Stamplay.User.get({"_id":element.userId})
            .then(function(r){
                $scope.blog.actions.comments[index].displayName=r.data[0].firstName+" "+r.data[0].lastName;
                $scope.$apply();

            })
           
        });

            $scope.comment="";
            $scope.$apply();
        },function(err){
            console.log(err);
            if(err.code==403){
                console.log("Login first!");
                $timeout(function(){
                    ngToast.create('<a href="#/login" class="">Please Login before posting comments!.</a>')
                });
            }
        });
    }

    $scope.upVote=function(){
        Stamplay.Object("blogs").upVote($stateParams.id)
        //Stamplay.Object("shashablogiiitm").upVote($stateParams.id)
        .then(function(res){
            console.log(res);
            $scope.blog=res;
            $scope.comment="";
            $scope.upVoteCount=$scope.blog.actions.votes.users_upvote.length;
            $scope.$apply();
        },function(err){
            console.log(err);
            if(err.code==403){
                console.log("Login First!");
                $timeout(function(){
                    ngToast.create('<a href="#/login" class="">Please login before voting</a>');
                });
            }
            if(err.code==406){
                console.log("Already Voted!");
                $timeout(function(){
                    ngToast.create('You have already voted on this post');
                });
            }
        });
    }

    $scope.downVote=function(){
        Stamplay.Object("blogs").downVote($stateParams.id)
        //Stamplay.Object("shashablogiiitm").downVote($stateParams.id)
        .then(function(res){
            console.log(res);
            $scope.blog=res;
            $scope.comment="";
            $scope.upVoteCount=$scope.blog.actions.votes.users_upvote.length;
            $scope.downVoteCount=$scope.blog.actions.votes.users_downvote.length;
            
            $scope.$apply();
        },function(err){
            console.log(err);
            if(err.code==403){
                console.log("Login First!");
                $timeout(function(){
                    ngToast.create('<a href="#/login" class="">Please login before voting</a>');
                });
            }
            if(err.code==406){
                console.log("Already Voted!");
                $timeout(function(){
                    ngToast.create('You have already voted on this post');
                });
            }
        });
    }

});

app.filter('htmlToPlainText',function(){
    return function(text){
        return text ? String(text).replace(/<[^>]+>/gm,''):'';
    }

});

app.controller("EditCtrl",function($scope,$timeout,ngToast,taOptions,$state,$stateParams){
    $scope.Post={}

    taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  ];

    Stamplay.Object("blogs").get({_id:$stateParams.id})
    //Stamplay.Object("shashablogiiitm").get({_id:$stateParams.id})
    .then(function(res){
        console.log(res);
        $scope.Post=res.data[0];
        $scope.$apply();
        console.log($scope.Post);
    },function(err){
        console.log(err);

    });

    $scope.update = function(){
        Stamplay.User.currentUser().then(function(res){
            if(res.user){
                if(res.user._id==$scope.Post.owner){
                    Stamplay.Object("blogs").update($stateParams.id, $scope.Post)
                    //Stamplay.Object("shashablogiiitm").update($stateParams.id, $scope.Post)
                    .then(function(response){
                        console.log(response);
                        $state.go("MyBlogs");
                    },function(error){
                        console.log(error);
                    });
                }
                else{
                    $state.go("login");
                }
            }
            else{
                $state.go("login");
            }
        },function(err){
            console.log(err);
        });
    }

});

app.controller("CreateCtrl",function(taOptions,$state,$scope,ngToast,$timeout){

    $scope.newPost={}

    taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  ];

    $scope.create=function(){
        Stamplay.User.currentUser()
        .then(function(res){
            if(res.user){
                Stamplay.Object("blogs").save($scope.newPost)
                //Stamplay.Object("shashablogiiitm").save($scope.newPost)
                .then(function(res){
                    $timeout(function(){
                        ngToast.create("Post created successfully");
                    });
                    $state.go('MyBlogs');
                },function(err){
                    $timeout(function(){
                        ngToast.create("An error has occured while creating the post, Please try again later");
                    });

                })
            }
            else{
                $state.go('login');
            }
        },function(err){
            $timeout(function(){
                ngToast.create("An error has occured, Please try again later");
            });

            console.log(err);
        })
        
    }
})

app.controller("HomeCtrl", function($scope,$http){
   /*
    var API_KEY="927096a6404048d6a006f65cfb070f9a";
    $scope.wtinfo="type city name";
    $http.get("http://api.openweathermap.org/data/2.5/weather?q="+$scope.wtinfo+"&appid="+API_KEY)
    .then(success, failure);
    function success(response){
        console.log(response);
        $scope.weatherData=response.data;
    }
    function failure(err){
        console.log(err);
    }
    */
    // ..................................................Assignment..........................
//     var API_KEY="927096a6404048d6a006f65cfb070f9a";
//    $scope.wtinfo="type city name";
//     $scope.getTemp =function(){
//         //var city="new delhi";

//         $http.get("http://api.openweathermap.org/data/2.5/weather?q="+$scope.wtinfo+"&appid="+API_KEY)
//         .then(success, failure);
//         function success(response){
//             console.log(response);
//             $scope.weatherData=response.data;
//         }
//         function failure(err){
//             console.log(err);
//         }
            
//     }
// ............................................................completed................................

    Stamplay.Object("blogs").get({sort:"-dt_create"})
    //Stamplay.Object("shashablogiiitm").get({sort:"-dt_create"})
    .then(function(res){
        console.log(res);
        $scope.latestBlogs=res.data;
        $scope.$apply();
        console.log($scope.latestBlogs);
    },function(err){
        console.log(err);
    });
})


app.controller("LoginCtrl", function($scope,$state,$timeout,$rootScope,ngToast){
    $scope.login = function(){
        Stamplay.User.currentUser()
        .then(function(res){
            console.log(res);
            //console.log(res.User);
            //$timeout(function(){
                ngToast.create("Login successful");
            //});
            
            console.log("Hello res");
            if(res.user){
                $rootScope.loggedIn=true;
                console.log($rootScope.loggedIn);
                $rootScope.displayName=res.user.firstName+" "+res.user.lastName;
                $timeout(function(){
                    $state.go("MyBlogs");
                });
                
            }
            else{
                Stamplay.User.login($scope.user)
                .then(function(res){
                    //console.log("logged in " + res);
                    console.log(res);
                    //$timeout(function(){
                        ngToast.create("Login successful");
                    //});
                    
                    $rootScope.loggedIn=true;
                    console.log($rootScope.loggedIn);
                    $rootScope.displayName=res.firstName+" "+res.lastName;
                    $timeout(function(){
                        //$location.path("/viewBlogs");
                        $state.go("MyBlogs");
                    });
                },function(err){
                    console.log(err);
                    $rootScope.loggedIn=false;
                    //$timeout(function(){
                        ngToast.create("Login failed");
                    //});
                    
                })
                
                
            }
        },function(error){
            //$timeout(function(){
                ngToast.create("An error has occured, Please try later");
            //});
            
            console.log(error);
        });
    }
});

app.controller("SignUpCtrl", function($scope,$timeout,ngToast){
    $scope.newUser = {};
    $scope.signup = function(){
        $scope.newUser.displayName=$scope.newUser.firstName+" "+$scope.newUser.lastName;
        if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.ConfirmPassword){
            console.log("all fields are valid !");

            if($scope.newUser.password == $scope.newUser.ConfirmPassword){
                console.log("All good!, Lets signup");
                Stamplay.User.signup($scope.newUser)
                .then(function(response){
                    //$timeout(function(){
                        ngToast.create("Your account has been created, Please login !");
                   // });
                    
                    console.log(response);
                },function(error){
                    //$timeout(function(){
                        ngToast.create("An error has occurred, Please try again later ");
                   // });
                    
                    console.log(error);
                });
            }
            else{
                //$timeout(function(){
                    ngToast.create("Passwords do not match.");
                //});
                
                console.log("password do not match");
            }
        }
        else{
            //$timeout(function(){
                ngToast.create("some fields are invalid !");
            //});
            
            console.log("some fields are invalid !");
        }
    }
});


app.controller("MyBlogsCtrl", function($scope){
    Stamplay.User.currentUser(function(err,res){
        if(res.user){
            Stamplay.Object("blogs").get({owner:res.user._id, sort : "-dt_create"})
            //Stamplay.Object("shashablogiiitm").get({owner:res.user._id, sort : "-dt_create"})
            .then(function(res){
                console.log(res);
                $scope.userBlogs=res.data;
                $scope.$apply();
                console.log($scope.userBlogs);
            },function(err){
                console.log(err);
            });
        
         }
        else{
            $state,go('login');
        }
    },function(err){
        console.log(err);
    });
})

app.controller("MainCtrl", function($scope,$rootScope,$timeout){
    $scope.logout=function(){
        console.log("Logout called")
        //Stamplay.User.logout(true,function(){
            localStorage.removeItem('http://localhost:8080-jwt');
            console.log("Logged out!");
            $timeout(function(){
                $rootScope.loggedIn=false;
            })
        //});
    }
})
