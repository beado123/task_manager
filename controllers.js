var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('SettingsController', ['$scope' , '$window','$http', 'sharedServ', function($scope, $window,$http,sharedServ) {
    $scope.url = $window.sessionStorage.baseurl;
    console.log("baseURL: ",$scope.url);

    //set the server URL
    $scope.setUrl = function(){
        $window.sessionStorage.baseurl = $scope.url;
        $scope.displayText = "URL set";
        sharedServ.setURL($scope.url);
    };

}]);

mp4Controllers.controller('UserController', ['$scope', '$routeParams', 'sharedServ','$http','$window', function($scope, $routeParams,sharedServ,$http,$window) {

  $scope.url = sharedServ.getURL();
  console.log("at user controller");

  $http.get($scope.url+'/users?count=false').success(function(data,status){
    console.log("user.html: successfully get users data: \n",data,"status:",status);
    $scope.users = data;

  }).
  error(function(data,status){
    console.log("Get users data failed, response: ",data," status:",status);
  })

  $scope.addUser = function(){
    window.location = '#/users_add/';
  }
  $scope.displayDetail = function(user){
    window.location = '#/users_detail/'+ user._id;
    sharedServ.setUser(user);
    $routeParams.id = user._id;
  }
  $scope.deleteUser = function(user){

    //update assignedUserName field of all its pendingTasks to "unassigned"
    $http.get($scope.url+'/users/'+ user._id).success(function(data,status){

      console.log("successfully get user: ",data,"status:",status);
      for(var i=0;i<data.data.pendingTasks.length;i++){

        var curr_task = data.data.pendingTasks[i];
        $http.get($scope.url+'/tasks/'+curr_task).success(function(data){

          console.log("successfully get task: ",data);
          var newTask = {
            "name": data.data.name,
            "description": data.data.description,
            "deadline": data.data.deadline,
            "completed": data.data.completed,
            "assignedUser": "",
            "assignedUserName": "unassigned",
            "dateCreated": data.data.dateCreated
          };
          $http.put($scope.url+'/tasks/'+data.data._id, newTask).success(function(data){
            console.log("successfully updated task to unassigned");
          }).
          error(function(data,status){
            console.log("failed to update task: ",data,"status: ",status);
          })

        }).
        error(function(data,status){
          console.log("get task failed: ",data,"status: ",status);
        })
      }
    }).
    error(function(data,status){
      console.log("get user failed: ",data,"status:",status);
    })


     //delete the chosen user
    $http.delete($scope.url+'/users/'+user._id).success(function(data,status){
      console.log("Successfully deleted user: ",data,status);
      $http.get($scope.url+'/users').success(function(data){
        $scope.users = data;
      }).
      error(function(data,status){
        console.log("Get users data failed, response: ",data," status:",status);
      })
    }).
    error(function(data,status){
      console.log("Failed to delete user: ",user.name, "\ndata: ",data, "\nstatus: ",status);
    })
  }
}]);

mp4Controllers.controller('UserAddController', ['$scope', 'sharedServ','$http','$window', function($scope, sharedServ,$http,$window) {
  $scope.submitted = false;
  $scope.submitSuccess = false;
  $scope.error = false;

  $scope.url = sharedServ.getURL();

  $scope.postUser = function(){
    $scope.submitted = true;
    $scope.submitSuccess = false;
    $scope.enteredUser = $scope.username;
    var newUser = {
      "name": $scope.username,
      "email": $scope.email,
      "pendingTasks": "",
      "dateCreated": ""
    };

    if($scope.username !== "" && $scope.email !== "" && $scope.username !== undefined && $scope.email !== undefined){

      $http.post($scope.url+'/users',newUser).success(function(data,status){

        console.log("post data success: ",data,"status:",status);
        $scope.submitSuccess = true;
        $scope.submitted = false;
        $scope.error = false;
        $scope.username = "";
        $scope.email = "";
      }).
      error(function(data,status){

        $scope.submitSuccess = false;
        $scope.submitted = false;
        $scope.error = true;
        $scope.err_msg = data.message;

        console.log("post data failed: ",data," status: ",status);
      });

    }

  }


}]);
mp4Controllers.controller('UserDetailController', ['$scope','sharedServ','$http','$window', function($scope,sharedServ,$http,$window) {
  $scope.url = sharedServ.getURL();
  $scope.user = sharedServ.getUser();
  $scope.readyshow = false;
  $scope.show = false;
  $scope.showCompleted = false;

  //get all the pendingTasks of the user for display
  $http.get($scope.url+'/tasks/?where={"assignedUserName":"'+ $scope.user.name+'", "completed" :false}&sort={"dateCreated":1}').success(function(data,status){
    $scope.tasks = sharedServ.convertDate(data);
    console.log("get user detail: ",data,"status:",status);
  }).
  error(function(data,status){
    console.log("Get task failed: ",data, "status: ",status);
  });

  $scope.showComplete = function(){

    if($scope.showCompleted ===true)$scope.showCompleted = false;
    else $scope.showCompleted = true;

    //get pending tasks which are completed
    $http.get($scope.url+'/tasks/?where={"assignedUserName":"'+ $scope.user.name+'", "completed" :true}&sort={"dateCreated":-1}').success(function(data){
      console.log("successfully get tasks: ",data);
      if(data.data.length > 0){
        $scope.complete_tasks = sharedServ.convertDate(data);
      }
    }).
    error(function(data,status){
      console.log("Get task failed: ",data, "status: ",status);
    });

  }
  $scope.toComplete = function(task){

    task.completed = true;
    var updatedTask = {
      "name": task.name,
      "description": task.description,
      "deadline": task.deadline,
      "completed": true,
      "assignedUser": task.assignedUser,
      "assignedUserName": task.assignedUserName,
      "dateCreated": task.dateCreated
    };

    //update the task, push it to server
    $http.put($scope.url+'/tasks/'+ task._id, updatedTask).success(function(data){

      $http.get($scope.url+'/tasks/?where={"assignedUserName":"'+ $scope.user.name+'", "completed" :false}&sort={"dateCreated":1}').success(function(data){
        $scope.tasks = sharedServ.convertDate(data);
        console.log("get pending tasks: ",data);
      }).
      error(function(data,status){
        console.log("Get task failed: ",data, "status: ",status);
      });
      if($scope.showCompleted === true){

        //display list of tasks updated
        $http.get($scope.url+'/tasks/?where={"assignedUserName":"'+ $scope.user.name+'", "completed" :true}&sort={"dateCreated":-1}').success(function(data){
          $scope.complete_tasks = sharedServ.convertDate(data);
          console.log("get completed tasks: ",data);
        }).
        error(function(data,status){
          console.log("Get task failed: ",data, "status: ",status);
        });

      }
    }).
    error(function(data,status){
      console.log("Failed to update completed field to true: ",data," status:",status);
    })
  }

  $scope.gotoDetail = function(task){
    window.location = '#/tasks_detail';
    sharedServ.setTask(task);
  }
}]);



mp4Controllers.controller('TaskController', ['$scope','sharedServ','$http','taskData','$window', function($scope,sharedServ,$http,taskData,$window) {
  $scope.url = sharedServ.getURL();
  $scope.types = ["dateCreated","deadline","name","assignedUserName"];
  $scope.search = 1;
  $scope.complete_info = false;
  $scope.sortType = "dateCreated";
  sharedServ.setPage(0);
  var ALL = 3

  $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
    $scope.tasks = sharedServ.convertDate(data);
    if(data.data.length<10)sharedServ.setPage(data.data.length);
    else sharedServ.setPage(10);
  }).
  error(function(data,status){
    console.log("Get tasks failed, response: ",data," status:",status);
  })



  $scope.goNextPage = function(){

      //temp holds the pages that should skip
    var temp = sharedServ.getSkippedPage();

    //this if statement is used for calculating how many tasks with specified parameter are left
    if($scope.complete_info ===ALL){

      $http.get($scope.url +'/tasks?sort={"' +$scope.sortType+ '":' +$scope.search+ '}').success(function(data){

        $scope.pageCount = data.data.length;

        //check that we're not in the last page
        if(temp%10 ==0 && temp < $scope.pageCount){

          if($scope.complete_info === ALL){

            //get tasks with parameter skip and limit specified
            $http.get($scope.url+'/tasks?sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' +temp+ '&limit=10').success(function(data){
              $scope.tasks = sharedServ.convertDate(data);

              if(data.data.length<10)sharedServ.setPage(temp+data.data.length);
              else sharedServ.setPage(temp+10);
            }).
            error(function(data,status){
              console.log("Get tasks failed, response: ",data," status:",status);
            })

          }
          else{

            $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' +temp+ '&limit=10').success(function(data){
              $scope.tasks = sharedServ.convertDate(data);
              if(data.data.length<10)sharedServ.setPage(temp+data.data.length);
              else sharedServ.setPage(temp+10);
            }).
            error(function(data,status){
              console.log("Get tasks failed, response: ",data," status:",status);
            })
          }

        }
      }).
      error(function(data,status){
        console.log("failed to get all task:",data);
      })

    }else{
      $http.get($scope.url +'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"' +$scope.sortType+ '":' +$scope.search+ '}').success(function(data){
        console.log("successfully get all task:",data);
        $scope.pageCount = data.data.length;

        if(temp%10 ==0 && temp < $scope.pageCount){

          if($scope.complete_info === ALL){

            $http.get($scope.url+'/tasks?sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' +temp+ '&limit=10').success(function(data){
              $scope.tasks = sharedServ.convertDate(data);

              if(data.data.length<10)sharedServ.setPage(temp+data.data.length);
              else sharedServ.setPage(temp+10);
            }).
            error(function(data,status){
              console.log("Get tasks failed, response: ",data," status:",status);
            })

          }
          else{

            $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' +temp+ '&limit=10').success(function(data){
              $scope.tasks = sharedServ.convertDate(data);
              if(data.data.length<10)sharedServ.setPage(temp+data.data.length);
              else sharedServ.setPage(temp+10);
            }).
            error(function(data,status){
              console.log("Get tasks failed, response: ",data," status:",status);
            })
          }

        }

      }).
      error(function(data,status){
        console.log("failed to get all task:",data);
      })
    }
  }

  $scope.goPreviousPage = function(){

    var totalPage = sharedServ.getSkippedPage();
    var shouldSkip;

    if(totalPage > 10){

        //this if statement calculates position of the previous page
      if(totalPage%10 !== 0){
        shouldSkip = (totalPage - totalPage%10)-10;
      }
      else shouldSkip = totalPage - 20;

      if($scope.complete_info === ALL){

        $http.get($scope.url+'/tasks?sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' +shouldSkip+ '&limit=10').success(function(data){

          $scope.tasks = sharedServ.convertDate(data);
          if(data.data.length<10)sharedServ.setPage(shouldSkip+data.data.length);
          else sharedServ.setPage(shouldSkip+10);
        }).
        error(function(data,status){
          console.log("Get tasks failed, response: ",data," status:",status);
        })
      }
      else{

        $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' +shouldSkip+ '&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          if(data.data.length<10)sharedServ.setPage(shouldSkip+data.data.length);
          else sharedServ.setPage(shouldSkip+10);
        }).
        error(function(data,status){
          console.log("Get tasks failed, response: ",data," status:",status);
        })
      }
    }
  }

  $scope.displayDetail = function(task){
    window.location = '#/tasks_detail';
    sharedServ.setTask(task);
  }


  $scope.addTask = function(){
    window.location = '#/tasks_add/';
  }
  $scope.deleteTask = function(task){
    var skipped = sharedServ.getSkippedPage();

    console.log("get skipped in deleteTask: ",skipped);

    //remove task in pendingTasks of user
    if(task.assignedUser !== ""){
      console.log("task.assignedUserName: ", task.assignedUserName);

      $http.get($scope.url+'/users/'+task.assignedUser).success(function(data){
        console.log("deleteTask(): data: ",data);
        console.log("task: ", task);

        var newTask = taskData.removeTask(data.data.pendingTasks,task._id);
        var newUser = {
          "name": data.data.name,
          "email": data.data.email,
          "pendingTasks": newTask,
          "dateCreated": data.data.dateCreated
        }
        $http.put($scope.url+'/users/'+task.assignedUser, newUser).success(function(data,status){
          console.log("successfully removed task from user:",data,status);
        }).
        error(function(data,status){
          console.log("failed to remove task from user");
        })
      }).
      error(function(data,status){
        console.log("DeleteTask(): failed to get user data, response: ", data,"status:",status);
      })

    }

    //delete task
    $http.delete($scope.url+'/tasks/'+task._id).success(function(data,status){
      console.log("successfully deleted task:",data,status);
      sharedServ.setPage(skipped-1);
      console.log("set skip to ",skipped-1, "after deletion");
      skipped = sharedServ.getLowerTen(skipped-1);


      if($scope.complete_info === ALL){
        $http.get($scope.url+'/tasks?sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' + skipped+ '&limit=10').success(function(data){

          $scope.tasks = data;
          if(data.data.length<10)sharedServ.setPage(skipped+data.data.length);
          else sharedServ.setPage(skipped+10);
        }).
        error(function(data,status){
          console.log("Get tasks data failed, response: ",data," status:",status);
        })
      }
      else{
        $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"' +$scope.sortType+ '":' +$scope.search+ '}&skip=' + skipped+ '&limit=10').success(function(data){
          // console.log("successfully deleted task",data);
          $scope.tasks = data;
          if(data.data.length<10)sharedServ.setPage(skipped+data.data.length);
          else sharedServ.setPage(skipped+10);
        }).
        error(function(data,status){
          console.log("Get tasks data failed, response: ",data," status:",status);
        })
      }

    }).
    error(function(data,status){
      console.log("Failed to delete tasks: ",task._id, "\ndata: ",data, "\nstatus: ",status);
    })
  }

  $scope.showPending = function(){

    $http.get($scope.url+'/tasks?where={"completed":false}&sort={"'+ $scope.sortType+ '":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
      $scope.tasks = sharedServ.convertDate(data);
      console.log("show pending tasks: ",data);
      if(data.data.length<10)sharedServ.setPage(data.data.length);
      else sharedServ.setPage(10);
    }).
    error(function(data,status){
      console.log("Sort pending tasks failed, response: ",data," status:",status);
    })
  }
  $scope.showCompleted = function(){

    $http.get($scope.url+'/tasks?where={"completed":true}&sort={"'+ $scope.sortType+ '":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
      $scope.tasks = sharedServ.convertDate(data);
      console.log("show completed tasks: ",data);
      if(data.data.length<10)sharedServ.setPage(data.data.length);
      else sharedServ.setPage(10);
    }).
    error(function(data,status){
      console.log("Sort completed tasks failed, response: ",data," status:",status);
    })
  }
  $scope.showAll = function(){

    $http.get($scope.url+'/tasks?sort={"'+ $scope.sortType+ '":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
      $scope.tasks = sharedServ.convertDate(data);
      console.log("show all");
      if(data.data.length<10)sharedServ.setPage(data.data.length);
      else sharedServ.setPage(10);
    }).
    error(function(data,status){
      console.log("Sort completed tasks failed, response: ",data," status:",status);
    })
  }


  $scope.goAscend = function(){

    if($scope.complete_info ===ALL){

      $http.get($scope.url+'/tasks?sort={"'+ $scope.sortType+ '":1}&skip=0&limit=10').success(function(data){
        $scope.tasks = sharedServ.convertDate(data);
        if(data.data.length<10)sharedServ.setPage(data.data.length);
        else sharedServ.setPage(10);
        console.log("go Ascending: ",data);
      }).
      error(function(data,status){
        console.log("Sort completed tasks failed, response: ",data," status:",status);
      })
    }
    else{
      $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"'+ $scope.sortType+ '":1}&skip=0&limit=10').success(function(data){
        $scope.tasks = sharedServ.convertDate(data);
        console.log("go Ascending: ",data);
        if(data.data.length<10)sharedServ.setPage(data.data.length);
        else sharedServ.setPage(10);
      }).
      error(function(data,status){
        console.log("Sort completed tasks failed, response: ",data," status:",status);
      })
    }

  }
  $scope.goDescend = function(){

    if($scope.complete_info ===ALL){
      $http.get($scope.url+'/tasks?sort={"'+ $scope.sortType+ '": -1}&skip=0&limit=10').success(function(data){
        $scope.tasks = sharedServ.convertDate(data);
        console.log("go Descending: ",data);
        if(data.data.length<10)sharedServ.setPage(data.data.length);
        else sharedServ.setPage(10);
      }).
      error(function(data,status){
        console.log("Sort completed tasks failed, response: ",data," status:",status);
      })
    }
    else{
      $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"'+ $scope.sortType+ '": -1}&skip=0&limit=10').success(function(data){
        $scope.tasks = sharedServ.convertDate(data);
        console.log("go Ascending: ",data);
        if(data.data.length<10)sharedServ.setPage(data.data.length);
        else sharedServ.setPage(10);
      }).
      error(function(data,status){
        console.log("Sort completed tasks failed, response: ",data," status:",status);
      })
    }

  }

  $scope.sortOnType = function(){

    if($scope.sortType === "dateCreated"){

      if($scope.complete_info===ALL){
        $http.get($scope.url+'/tasks?sort={"dateCreated":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on dateCreated: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }
      else{
        $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"dateCreated":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on dateCreated: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }


    }
    else if($scope.sortType === "deadline"){

      if($scope.complete_info===ALL){
        $http.get($scope.url+'/tasks?sort={"deadline":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on deadline: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }
      else{
        $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"deadline":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on deadline: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }



    }
    else if($scope.sortType === "name"){

      if($scope.complete_info===ALL){
        $http.get($scope.url+'/tasks?sort={"name":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on name: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }
      else{
        $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"name":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on name: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }



    }
    else if($scope.sortType === "assignedUserName"){

      if($scope.complete_info===ALL){
        $http.get($scope.url+'/tasks?sort={"assignedUserName":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on assignedUserName: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }
      else{
        $http.get($scope.url+'/tasks?where={"completed":' +$scope.complete_info+ '}&sort={"assignedUserName":' +$scope.search+ '}&skip=0&limit=10').success(function(data){
          $scope.tasks = sharedServ.convertDate(data);
          console.log("sort on assignedUserName: ",data);
          if(data.data.length < 10)sharedServ.setPage(data.data.length);
          else sharedServ.setPage(10);
        }).
        error(function(data,status){
          console.log("Sort completed tasks failed, response: ",data," status:",status);
        })
      }
    }
  }
}]);

mp4Controllers.controller('TaskAddController', ['$scope','sharedServ','taskData','$http','$window', function($scope,sharedServ,taskData,$http,$window) {
  $scope.submitted = false;
  $scope.error = false;
  $scope.submitSuccess = false;


  $scope.url = sharedServ.getURL();
  $http.get($scope.url+'/users').success(function(data){
    //console.log("user.html: successfully get users data: \n",data);
    $scope.users = data;
  }).
  error(function(data,status){
    console.log("Get users data failed, response: ",data," status:",status);
  });

  $scope.postTask = function(){
    $scope.submitted = true;
    $scope.submitSuccess = false;

    $scope.enteredTask = $scope.taskname;
    var assignedUserID = "";
    var assignedUserName = "unassigned";
    console.log("assignedUser: ", $scope.assignedUser);
    if($scope.assignedUser !== undefined && $scope.assignedUser !== "" ){
      assignedUserID = $scope.assignedUser._id;
      assignedUserName = $scope.assignedUser.name;

    }
    var data = {
      "name": $scope.taskname,
      "description": $scope.description,
      "deadline": $scope.date,
      "completed": false,
      "assignedUser":assignedUserID,
      "assignedUserName":assignedUserName,
      "dateCreated":""
    };
    console.log("taskname: ", $scope.taskname);
    console.log("deadline", $scope.date );

    if($scope.taskname !== undefined && $scope.date !== undefined && $scope.taskname !== "" && $scope.date !== ""){

      //post task
      $http.post($scope.url+'/tasks',data).success(function(data,status){
        console.log("post data success: ",data,status);
        $scope.submitSuccess = true;
        $scope.submitted = false;
        $scope.error = false;
        $scope.taskname = "";
        $scope.description = "";
        $scope.date = undefined;
        $scope.assignedUser = undefined;

        //update pendingTasks in user
        console.log("data.data.assignedUser:", data.data.assignedUser);
        if(data.data.assignedUser !== ""){
          //get newly added task
          console.log("get in");
          $http.get($scope.url+'/tasks?where={"name":"' +data.data.name+ '"}').success(function(data){
            console.log("successfully get newly added task: ",data);

            $scope.newTaskId = data.data[0]._id;
            //get assigned user
            $http.get($scope.url+'/users/'+data.data[0].assignedUser).success(function(data){
              var newTasks = taskData.appendTask(data.data.pendingTasks, $scope.newTaskId);
              var newUser = {
                "name":data.data.name,
                "email":data.data.email,
                "pendingTasks":newTasks,
                "dateCreated": data.data.dateCreated
              }
              $http.put($scope.url+'/users/'+data.data._id, newUser).success(function(data){
                console.log("successfully updated pendingTasks of user");
              }).
              error(function(data,status){
                console.log("failed to updated pendingTasks of user: ",data,"status:",status);
              })

            }).
            error(function(data,status){
              console.log("failed to get user: ",data,"status:",status);
            })
          }).
          error(function(data,status){
            console.log("failed to get just added task: ",data,"status:",status);
          })

        }
      }).
      error(function(data,status){
        $scope.error = true;
        $scope.submitSuccess = false;
        $scope.submitted = false;
        $scope.err_msg = data.message;
        console.log("post data failed: ",data," status: ",status);
      });

    }

  }
}]);

mp4Controllers.controller('TaskDetailController', ['$scope','sharedServ','taskData','$http','$window', function($scope,sharedServ,taskData,$http,$window) {
  $scope.url = sharedServ.getURL();
  $scope.task = sharedServ.getTask();
  taskData.setTaskData($scope.task);
  $scope.editTask = function(){
      window.location = '#/tasks_edit/';
  }
}]);


mp4Controllers.controller('TaskEditController', ['$scope','sharedServ','taskData','$http','$window', function($scope,sharedServ,taskData,$http,$window) {
    $scope.url = sharedServ.getURL();

    $scope.task = taskData.getTask();
    $scope.name1 = $scope.task.name;
    $scope.date1 = $scope.task.deadline;
    $scope.description1 = $scope.task.description;
    $scope.completed = $scope.task.completed;
    $scope.curr_username = $scope.task.assignedUserName;
    $scope.UserId = $scope.task.assignedUser;
    $scope.taskId = $scope.task._id;

    $scope.submitted = false;
    $scope.error = false;
    $scope.submitSuccess = false;

    //initialize default value in Forms
    $scope.date = $scope.date1;
    $scope.description = $scope.description1;
    $scope.options = [];
    $http.get($scope.url+'/users').success(function(data){
        $scope.users = data.data;
        console.log("user data: ",data);
        $scope.index = taskData.getIndex($scope.users, $scope.curr_username, $scope.options);
        console.log("index: ",$scope.index);
        console.log("options: ",$scope.options);
        if($scope.curr_username !== "unassigned"){
            //console.log("$scope.options[$scope.index].name: ",$scope.options[$scope.index].name);
            $scope.selectedUser = $scope.options[$scope.index];
        }

    }).
    error(function(data,status){
        console.log("Get users data failed, response: ",data," status:",status);
    });
    $scope.editTask = function(){

        $scope.submitted = true;
        $scope.submitSuccess = false;

        var submitName, submitDescription, submitDeadline, submitUsername, submitUserId, submitComplete;
        if($scope.complete_change !== $scope.completed)submitComplete = $scope.complete_change;
        else submitComplete = $scope.completed;

        if($scope.selectedUser === undefined)$scope.selectedUser = "unassigned";

        if($scope.selectedUser !== $scope.curr_username){
            submitUsername = $scope.selectedUser;
            console.log("selectedUser: ", $scope.selectedUser);
            console.log("curr_username: ", $scope.curr_username);

            if($scope.selectedUser !== "unassigned"){

                //get new user
                $http.get($scope.url+'/users?where={"name": "'+$scope.selectedUser+ '"}').success(function(data){
                    console.log("get new user: ",data);
                    submitUserId = data.data[0]._id;

                    console.log("data.data.pendingTasks: ",data.data[0].pendingTasks);
                    var newtasks = taskData.appendTask(data.data[0].pendingTasks, $scope.taskId);
                    var user1 = {
                        "name": data.data[0].name,
                        "email": data.data[0].email,
                        "pendingTasks":newtasks,
                        "dateCreated": data.data[0].dateCreated
                    }
                    $http.put($scope.url+'/users/'+data.data[0]._id, user1).success(function(data){
                        console.log("updated new user and add task: ", $scope.taskId);
                    }).
                    error(function(data,status){
                        console.log("failed to post user and add task, response: ",data," status:",status);
                    })
                }).
                error(function(data,status){
                    console.log("Get user data failed, response: ",data," status:",status);
                });
            }



            //get old user
            if($scope.curr_username !== "unassigned"){ //if it's unassigned, no need to update old user

                $http.get($scope.url+'/users?where={"name":"' +$scope.curr_username+ '"}').success(function(data){
                    console.log("get old user: ",data);
                    //console.log("data.data[0].pendingTasks: ",data.data[0].pendingTasks);
                    if(data.data[0] !== undefined){

                        var newtasks = taskData.removeTask(data.data[0].pendingTasks, $scope.taskId);
                        var user1 = {
                            "name": data.data[0].name,
                            "email": data.data[0].email,
                            "pendingTasks": newtasks,
                            "dateCreated": data.data[0].dateCreated
                        }
                        $http.put($scope.url+'/users/'+data.data[0]._id, user1).success(function(data){
                            console.log("updated old user and remove task: ", $scope.taskId);
                        }).
                        error(function(data,status){
                            console.log("failed to post user and remove task, response: ",data," status:",status);
                        })

                    }

                }).
                error(function(data,status){
                    console.log("failed to get user, response: ",data," status:",status);
                })

            }


        }
        else{ submitUserId = $scope.UserId; submitUsername = $scope.curr_username; }
        if($scope.taskname !== $scope.name1)submitName = $scope.taskname;
        else submitName = $scope.name1;
        if($scope.date !== $scope.date1)submitDeadline = $scope.date;
        else submitDeadline = $scope.date1;
        if($scope.description !== $scope.description1)submitDescription = $scope.description;
        else submitDescription = $scope.description1;

        var submitTask = {
            "name": submitName,
            "description": submitDescription,
            "deadline": submitDeadline,
            "completed": submitComplete,
            "assignedUser": submitUserId,
            "assignedUserName": submitUsername,
            "dateCreated": submitDeadline
        }
        if($scope.taskname !== undefined && $scope.date !== undefined && $scope.taskname !== "" && $scope.date !== ""){

            $http.put($scope.url+'/tasks/'+ $scope.taskId, submitTask).success(function(data,status){
                console.log("successfully updated tasks: ",data,status);
                $scope.submitSuccess = true;
                $scope.submitted = false;
                $scope.error = false;
            }).
            error(function(data,status){
                $scope.error = true;
                $scope.submitSuccess = false;
                $scope.submitted = false;
                $scope.err_msg = data.message;
                console.log("failed to update task, response: ",data,"status:",status);
            })
        }
    }
}]);

