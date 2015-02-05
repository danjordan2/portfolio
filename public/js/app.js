var app = angular.module('resume', ["ngResource", "ngRoute", "ngAnimate", "ngProgressLite", "ui.bootstrap"])
//================================================
// Config
//================================================
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when("/resume", {
        templateUrl: "/partials/resume_home.html",
        controller: "resumeController",
        resolve: {
            resume: function(api) {
                return api.resume.query().$promise;
            }
        }
    }).when("/projects", {
        templateUrl: "/partials/projects.html",
        controller: "projectsController",
        resolve: {
            projects: function(api) {
                return api.projects.query().$promise;
            }
        }
    }).when("/project/:project", {
        templateUrl: "/partials/project.html",
        controller: "projectController",
        resolve: {
            project: function(api, $route) {
                return api.project.get({
                    project: $route.current.params.project
                }).$promise
            }
        }
    }).when("/contact", {
        templateUrl: "/partials/contact.html",
        controller: "contactController"
    }).otherwise({
        redirectTo: "/resume"
    })
    $locationProvider.html5Mode(true);
});
//================================================
// Services
//================================================
app.factory('api', ['$resource',
    function($resource, $cacheFactory) {
        return {
            header: $resource('/api/header', {}, {
                query: {
                    method: "GET",
                    isArray: false
                }
            }),
            resume: $resource('/api/resume', {}, {
                query: {
                    method: "GET",
                    isArray: false
                }
            }),
            projects: $resource('/api/projects', {}, {
                query: {
                    method: "GET",
                    isArray: true
                }
            }),
            project: $resource('/api/project/:project', {
                project: '@project'
            }, {
                get: {
                    method: "GET",
                    isArray: false
                }
            }),
            contact: $resource('/api/contact', {}, {
                'save': {
                    method: 'POST'
                }
            })
        };
    }
]);
//========= mainController =======================
// Wrapper controller. Controls core template data
//================================================
app.controller('mainController', function($rootScope, $scope, $timeout, ngProgressLite, api) {
    api.header.query().$promise.then(function(data) {
        $scope.header = data;
        $scope.isLoaded = true;
    });
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        ngProgressLite.start();
    });
    $rootScope.$on('$viewContentLoaded', function(event) {
        ngProgressLite.done();
    });
});
//========= resumeController =====================
// Receives data for home page resume
//================================================
app.controller('resumeController', function($scope, $route) {
    $scope.resume = $route.current.locals.resume;
});
//========= projectsController ===================
// Receives project data
//================================================
app.controller('projectsController', function($scope, $route) {
    $scope.projects = $route.current.locals.projects;
});
//========= projectController ====================
// Receives data for individual project. Launches
// bootstrap modal to display screenshots
//================================================
app.controller('projectController', function($scope, $route, $modal, ngProgressLite) {
    $scope.project = $route.current.locals.project;
    $scope.modal = function(screenshot) {
        ngProgressLite.start();
        $modal.open({
            templateUrl: '/partials/screenshot.html',
            controller: screenController,
            size: "lg",
            windowClass: "modal",
            resolve: {
                image: function() {
                    return "/img/portfolio/" + $scope.project.folder + "/screenshots/" + screenshot.file;
                },
                caption: function() {
                    return screenshot.caption;
                }
            }
        });
    };
    //Receive resolved data from modal
    var screenController = function($rootScope, $scope, $modalInstance, image, caption) {
        $scope.image = image;
        $scope.caption = caption;
        ngProgressLite.done();
    };
});
//========= contactController ====================
// Posts contact form data to the server 
//================================================
app.controller('contactController', function($scope, api, ngProgressLite) {
    $scope.sendEmail = function() {
        ngProgressLite.start();
        //Post data
        api.contact.save({ 
            "name": $scope.contact.name,
            "email": $scope.contact.email,
            "subject": $scope.contact.subject,
            "message": $scope.contact.message
        }).$promise.then(function(data) {
            //Make sure data resolved
            if(data.$resolved){
                //Send server response back to user view
                $scope.status = data.status;
                $scope.message = data.message;
                ngProgressLite.done();                
            }
        });
    }
});