/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router) {
  app.use('/api', require('./home.js')(router));
  app.use('/api/users', require('./users.js')(router));
  app.use('/api/users/:id', require('./users:id.js')(router));
  app.use('/api/tasks', require('./tasks.js')(router));
  app.use('/api/tasks/:id', require('./tasks:id.js')(router));

/*The code below are drawn from references which I include in the form*/
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
};
