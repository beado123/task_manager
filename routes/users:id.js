var secrets = require('../config/secrets');
var User = require('../models/user');

module.exports = function(router) {

  var usersIdRoute = router.route('/users/:id');

  usersIdRoute.get(function(req, res) {

    User.findOne({'_id': req.params.id}).lean().exec( function(err, user){
      if(err)return console.error(err);
      console.log("users/:id: get",user);
      if(user === null)return res.status(404).send({"message": "User not found", "data": []});
      // for(var property in req.query){
      //   if(req.query.hasOwnProperty(property)){
      //     var value = req.query[property];
      //
      //     if(property === "select"){
      //       var parts = value.split(/"/);
      //       field = parts[1];
      //       var include = (parts[2].replace(/\s+/g, '')).substring(1,2);
      //       //check for only one object
      //       var second = parts[2].split(",");
      //       if(second[1] !== undefined){success = -1;}
      //       console.log("field: ",field);
      //       console.log("include:",include);
      //
      //       if(include === '0'){delete user[field];}
      //       else{
      //         for(var property1 in user){
      //           if(user.hasOwnProperty(property1)){
      //             if(property1 !== field && property1 !== "_id")delete user[property1];
      //           }
      //         }
      //       }
      //     }
      //   }
      // }//for loop end
      res.status(200).send({"message": "OK", "data": user});
    });
  });

  usersIdRoute.put(function(req, res) {
    var pendingTasks_submit = [];
    if(req.body.pendingTasks !== undefined)pendingTasks_submit = req.body.pendingTasks;
    var dateCreated_submit = new Date();
    if(req.body.dateCreated !== undefined)dateCreated_submit = req.body.dateCreated;

    if(req.body.name === "" || req.body.name === undefined ){
      if(req.body.email === "" || req.body.email === undefined){
        console.log("no name email1");
        return res.status(500).send({ "message": "Validation Error: A name is required! An email is required!", "data": [] });
      }
      else return res.status(500).send({"message": "Validation Error: A name is required!", "data":[]});
    }
    if(req.body.email === "" || req.body.email === undefined ){
      if(req.body.name === "" || req.body.name === undefined){
        console.log("no name email2");
        return res.status(500).send({ "message": "Validation Error: A name is required! An email is required!", "data": [] });
      }
      else return res.status(500).send({"message": "Validation Error: An email is required!", "data":[]});
    }
console.log("new pendingTasks:", req.body.pendingTasks);
console.log("new date:",req.body.dateCreated);
    User.findByIdAndUpdate(req.params.id, {$set: {
                                                  "name": req.body.name,
                                                  "email": req.body.email,
                                                  // "pendingTasks": pendingTasks_submit,
                                                  }
                                          }, {new:true},function(err, user){
                                            console.log("users/:id put:",user);
      if(err)return console.error(err);
      else res.status(200).send({"message": "User updated", "data": user});
    });
  });

  usersIdRoute.delete(function(req, res){
    User.findByIdAndRemove({"_id": req.params.id}, function(err,user){
      if(err)return console.err(err);
      else if(user === null)res.status(404).send({"message": "User not found", "data": []});
      else res.status(200).send({"message": "User deleted", "data": []});
    })
  });

  return router;
}
