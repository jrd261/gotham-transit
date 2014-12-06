app = angular.module('gothamTransit', []);


app.controller('main', function($scope, $http, $sce){

	$scope.setFilter = function(){
		$scope.lines = $scope.lines;
	};
	$scope.refreshStatus = function(){
		$http.get('status')
		.success(function(data){
			$scope.time = data.time;
			$scope.lines = data.lines;
			console.log($scope.lines)

		})
		.error(function(){

		});
	};

	
	$scope.refreshStatus();

	$scope.testFilter = function(){
		var filter = ($scope.filter || '').toLowerCase();
		return (this.line.name.toLowerCase().indexOf(filter) > -1 
			|| this.line.type.toLowerCase().indexOf(filter) > -1);
	};


});

