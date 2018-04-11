var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('Llamas', function($http, $window) {
    return {
        get : function() {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/llamas');
        }
    }
});
mp4Services.factory('taskData', function($http, $window) {
  var task;
  var index;

    return {
        setTaskData : function(task1) {
            task = task1;
        },
        getTask: function(){
          return task;
        },
        appendTask: function(pendingTasks, newTaskId){
          pendingTasks.push(newTaskId);
          return pendingTasks;
        },
        removeTask: function(pendingTasks, taskId){
          var i = pendingTasks.indexOf(taskId);
          if(i>-1){
            pendingTasks.splice(i,1);
          }
          return pendingTasks;
        },
        getIndex: function(users, name, options){
          //console.log("name: ",name);
          for(var i=0;i<users.length;i++){
            options.push(users[i].name);
            //console.log("users[i].name: ",users[i].name);
            if(users[i].name === name){index=i;}
          }
          return index;
        }
    }
});
mp4Services.factory('sharedServ', function($http) {
	var backURL = "";
    var curr_user = {};
    var curr_task = {};
    var skipped=0;
    var months = {'01':'January', '02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December'};

    return {
            setURL: function(url){
                backURL = url;
            },
            getURL: function(){
                return backURL;
            },
          getLowerTen: function(skipped){

            if(skipped%10 !== 0)return skipped - (skipped%10);
            else return (skipped-10);
          },

          setPage: function(skippedPage){
            skipped = skippedPage;
            console.log("set skip to: ",skip);
          },

          getSkippedPage: function(){
            return skipped;
          },

          setUser: function(user){
            curr_user = user;
          },
          getUser: function(){
            return curr_user;
          },
          setTask: function(task){
            curr_task = task;
          },
          getTask: function(){
            return curr_task;
          },
          convertDate: function(tasks){
            var mytasks = tasks.data;
            for(var i=0;i<mytasks.length;i++){
              var curr = mytasks[i].deadline;
              var parts = curr.split("-");
              var year = parts[0];
              var month = parts[1];
              var day = parts[2].substring(0,2);
              mytasks[i].deadline = "Deadline: "+months[month]+" "+day+", "+year;
            }
            return tasks;
          },
          getUserList: function(url){
            $http.get(backURL+'/users').success(function(data){
              console.log("user.html: successfully get users data: \n",data);
              return data;
            }).
            error(function(data){
              console.log("Get users data failed: ",data)
              return data;
            })
          }
        }
});// Write any factories or services here
