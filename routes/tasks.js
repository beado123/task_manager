var secrets = require('../config/secrets');
var Task = require('../models/task');
// var User = require('../models/user');

module.exports = function(router) {

  var tasksRoute = router.route('/tasks');

  tasksRoute.get(function(req, res) {
    var count = 0;
    var skip = 0;
    var limit = 100;
    var success = 0;

    Task.find().lean().exec(function(err, tasks){
      if(err)return console.error(err);

      for(var property in req.query){
        if(req.query.hasOwnProperty(property)){
          var value = req.query[property];

          if(property === "where"){
            var parts = value.split(/"/);
            var field = parts[1];
            var parts1 = parts[2].split("}")
            var field_value = parts[3];
            //check for only one object
            var second = parts[2].split(",");
            if(second[1] !== undefined){success = -1;}
            if(field === "completed")field_value = ((parts[2].split("}"))[0].replace(/\s+/g, '')).substring(1); //space between : and val
            if(field === "completed" && field_value !== 'true' && field_value !== 'false' ){success = -1;}
            // console.log(parts[0],"\n",parts[1],"\n",parts[2],"\n",field_value);
            console.log("field:",field);
            console.log("field_value:",field_value );

            if(field === "completed"){
              var temp = (field_value == 'true');
              for(var i=tasks.length-1;i>=0;i--){

                if(tasks[i][field] != temp){
                  tasks.splice(i,1);
                }
              }
            }else{
              for(var i=tasks.length-1; i>=0; i--){
                if(tasks[i][field] !== field_value )tasks.splice(i,1);
              }
            }
          }
          if(property === "sort"){
            var parts = value.split(/"/);
            var field = parts[1];
            var order = (parts[2].replace(/\s+/g, '')).substring(1,2);
            //check for only one object
            var second = parts[2].split(",");
            if(second[1] !== undefined){success = -1;}
            if(order === "1")order = 1;
            else order = -1;
            console.log("field:",field);
            console.log("order:",order );
            if(field === "name"){
              tasks.sort(function(a,b){
                if(a.name < b.name)return order*(-1);
                if(a.name > b.name)return order;
                return 0;
              });
            }
            if(field === "assignedUserName"){
              tasks.sort(function(a,b){
                if(a.assignedUserName < b.assignedUserName)return order*(-1);
                if(a.assignedUserName > b.assignedUserName)return order;
                return 0;
              });
            }
            if(field === "dateCreated"){
              tasks.sort(function(a,b){
                if(a.dateCreated < b.dateCreated)return order*(-1);
                if(a.dateCreated > b.dateCreated)return order;
                return 0;
              })
            }
            if(field === "deadline"){
              tasks.sort(function(a,b){
                if(a.deadline < b.deadline)return order*(-1);
                if(a.deadline > b.deadline)return order;
                return 0;
              })
            }
          }
          if(property === "select"){
            var parts = value.split(/"/);
            field = parts[1];
            var include = (parts[2].replace(/\s+/g, '')).substring(1,2);
            //check for only one object
            var second = parts[2].split(",");
            if(second[1] !== undefined){success = -1;}
            console.log("field: ",field);
            console.log("include:",include);
            for(var i=0;i<tasks.length;i++){
              if(include === '0')delete tasks[i][field];
              else{
                for(var property1 in tasks[i]){
                  if(tasks[i].hasOwnProperty(property1)){
                    if(property1 !== field && property1 !== "_id")delete tasks[i][property1];
                  }
                }
              }
            }

          }
          if(property === "skip")skip = value;
          if(property === "limit")limit = value;
          if(property === "count"){
            console.log("count:",value);
            if(value === "1" || value === "true")count=1;
            else if(value === "0" || value === "false")count=0;
            else success = -1;
          }
        }
      }//for loop end
      console.log("success:",success);
      if(count === 1 && success !== -1){
        tasks.splice(0,skip);
        tasks.splice(limit,tasks.length-limit);
        res.status(200).send({"message":"OK", "data":tasks.length});
      }
      else if(count === 0 && success !== -1){
        tasks.splice(0,skip);
        tasks.splice(limit,tasks.length-limit);
        res.status(200).send({"message":"OK", "data":tasks});
      }
      else res.status(500).send({"message":"I don't know what happened!", "data": []});

    });
  });

  tasksRoute.post(function(req, res) {
    var assignedUser_submit = "";
    var assignedUserName_submit = "unassigned";

    if(req.body.name === "" || req.body.name === undefined ){
      if(req.body.deadline === "" || req.body.deadline === undefined){
        console.log("no name deadline1");
        return res.status(500).send({ "message": "Validation Error: A name is required! A deadline is required!", "data": [] });
      }
      else return res.status(500).send({"message": "Validation Error: A name is required!", "data":[]});
    }
    if(req.body.deadline === "" || req.body.deadline === undefined ){
      if(req.body.name === "" || req.body.name === undefined){
        console.log("no name deadline2");
        return res.status(500).send({ "message": "Validation Error: A name is required! A deadline is required!", "data": [] });
      }
      else return res.status(500).send({"message": "Validation Error: A deadline is required!", "data":[]});
    }
    if(req.body.assignedUser !== undefined && req.body.assignedUser !== ""){
      assignedUser_submit = req.body.assignedUser;
      assignedUserName_submit = req.body.assignedUserName;
    }
    var newTask = new Task({
      "name": req.body.name,
      "description": req.body.description,
      "deadline": req.body.deadline,
      "completed": false,
      "assignedUser": assignedUser_submit,
      "assignedUserName": assignedUserName_submit,
      "dateCreated": new Date()
    });
    newTask.save(function(err){
      if(err)console.log(err);
      else console.log("post a new task");
    });
    res.status(201).send({"message": "Task added", "data": newTask});

  });

  tasksRoute.options(function(req, res){ res.writeHead(200); res.end(); });

  return router;
}
