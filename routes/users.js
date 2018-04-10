var secrets = require('../config/secrets');
var User = require('../models/user');

module.exports = function(router) {

  var usersRoute = router.route('/users');

  usersRoute.get(function(req, res) {
    var count = 0;
    var skip = 0;
    var limit = 100;
    var success = 0;

    User.find().lean().exec(function(err, users){
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
            // console.log(parts[0],"\n",parts[1],"\n",parts[2],"\n",field_value);
            console.log("field:",field);
            console.log("field_value:",field_value );

            for(var i=users.length-1; i>=0; i--){
              if(users[i][field] !== field_value )users.splice(i,1);
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
              users.sort(function(a,b){
                if(a.name < b.name)return order*(-1);
                if(a.name > b.name)return order;
                return 0;
              })
            }
            if(field === "email"){
              users.sort(function(a,b){
                if(a.email < b.email)return order*(-1);
                if(a.email > b.email)return order;
                return 0;
              })
            }
            if(field === "dateCreate"){
              users.sort(function(a,b){
                if(a.dateCreated < b.dateCreated)return order*(-1);
                if(a.dateCreated > b.dateCreated)return order;
                return 0;
              })
            }
            if(field === "pendingTasks"){
              users.sort(function(a,b){
                if(a.pendingTasks < b.pendingTasks)return order*(-1);
                if(a.pendingTasks > b.pendingTasks)return order;
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
            for(var i=0;i<users.length;i++){
              if(include === '0')delete users[i][field];
              else{
                for(var property1 in users[i]){
                  if(users[i].hasOwnProperty(property1)){
                    if(property1 !== field && property1 !== "_id")delete users[i][property1];
                  }
                }
              }
            }

          }
          if(property === "skip")skip=value;
          if(property === "limit")limit=value;
          if(property === "count"){
            console.log("count:",value);
            if(value === "1" || value === "true")count=1;
            else if(value === "0" || value === "false")count=0;
            else success = -1;
          }
        }
      }
      console.log("count:",count);
      console.log("success:",success);
      if(count === 1 && success !== -1){
        console.log("mew");
        users.splice(0,skip);
        users.splice(limit,users.length-limit);
        res.status(200).send({"message":"OK", "data": users.length});
      }
      else if(count === 0 && success !== -1){
        users.splice(0,skip);
        users.splice(limit,users.length-limit);
        res.status(200).send({"message":"OK", "data":users});
      }
      else res.status(500).send({message:"I don't know what happened!", data: []});
    });
  });

  usersRoute.post(function(req,res){
    var pendingTasks_submit = [];
    if(req.body.pendingTasks !== undefined)pendingTasks_submit = req.body.pendingTasks;

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
    User.findOne({"email": req.body.email}, function(err, data){
      console.log("data:",data);
      if(data !== null){
        return res.status(500).send({"message": "This email already exists", "data":[]});
      }
      else{
        var newUser = new User({
          "name": req.body.name,
          "email": req.body.email,
          "pendingTasks": pendingTasks_submit,
          "dateCreated": new Date()
        });
        newUser.save(function(err){
          if(err)console.log(err);
          else console.log("post a new user");
        });
        res.status(201).send({"message": "User added", "data": newUser});
      }
    });
  });

  usersRoute.options(function(req, res){ res.writeHead(200); res.end(); });

  return router;
}
