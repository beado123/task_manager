var secrets = require('../config/secrets');
var Task = require('../models/task');

module.exports = function(router) {

  var tasksIdRoute = router.route('/tasks/:id');

  tasksIdRoute.get(function(req, res) {
    Task.find({"_id": req.params.id}).lean().exec(function(err, task){
      if(err)return console.error(err);
      if(task.length === 0)return res.status(404).send({"message": "Task not found", "data": []});

      // for(var property in req.query){
      //   if(req.query.hasOwnProperty(property)){
      //     var value = req.query[property];
      //     if(property === "select"){
      //       var parts = value.split(/"/);
      //       field = parts[1];
      //       var include = (parts[2].replace(/\s+/g, '')).substring(1,2);
      //       //check for only one object
      //       var second = parts[2].split(",");
      //       if(second[1] !== undefined){success = -1;}
      //       console.log("field: ",field);
      //       console.log("include:",include);
      //       if(include === '0')delete task[0][field];
      //       else{
      //         for(var property1 in task[0]){
      //           if(task[0].hasOwnProperty(property1)){
      //             if(property1 !== field && property1 !== "_id")delete task[0][property1];
      //           }
      //         }
      //       }
      //     }
      //   }
      // }//for loop end
      res.status(200).send({"message": "OK", "data": task[0]});
    });
  });

  tasksIdRoute.put(function(req, res){
    var assignedUser_submit = "";
    var assignedUserName_submit = "unassigned";
    if(req.body.assignedUser !== undefined && req.body.assignedUser !== ""){
      assignedUser_submit = req.body.assignedUser;
      assignedUserName_submit = req.body.assignedUserName;
    }

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
    Task.findByIdAndUpdate(req.params.id, {$set: {
                                                  name: req.body.name,
                                                  description: req.body.description,
                                                  deadline: req.body.deadline,
                                                  assignedUser: assignedUser_submit,
                                                  assignedUserName: assignedUserName_submit,
                                                  completed: req.body.completed,
                                                  }
                                                }, {new:true}, function(err, updated_task){
      if(err)return console.error(err);
      else res.status(200).send({"message": "Task updated", "data": updated_task});
    });
  });

  tasksIdRoute.delete(function(req, res){
    Task.findByIdAndRemove({"_id": req.params.id}, function(err,task){
      if(err)return console.err(err);
      else if(task === null)res.status(404).send({"message": "Task not found", "data": []});
      else res.status(200).send({"message": "Task deleted", "data": []});
    })
  });

  return router;
}
