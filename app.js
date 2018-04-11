var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services','720kb.datepicker']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UserController'
  }).
  when('/users_add', {
    templateUrl: 'partials/users_add.html',
    controller: 'UserAddController'
  }).
  when('/users_detail/:id', {
    templateUrl: 'partials/users_detail.html',
    controller: 'UserDetailController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TaskController'
  }).
  when('/tasks_add', {
    templateUrl: 'partials/tasks_add.html',
    controller: 'TaskAddController'
  }).
  when('/tasks_detail', {
    templateUrl: 'partials/tasks_detail.html',
    controller: 'TaskDetailController'
  }).
  when('/tasks_edit', {
    templateUrl: 'partials/tasks_edit.html',
    controller: 'TaskEditController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/llamalist', {
    templateUrl: 'partials/llamalist.html',
    controller: 'LlamaListController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
