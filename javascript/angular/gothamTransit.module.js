app = angular.module('gothamTransit', []);


app.controller('main', function($scope, $http, $sce){

	$scope.lines = [];
	$scope.setFilter = function(){
		$scope.lines = $scope.lines;
	};
	$scope.refreshStatus = function(){
		$http.get('status')
		.success(function(data){
			$scope.lines = data
			$scope.refreshFavorites();
		})
	};
	window.t = $scope;

	$scope.id = localStorage.getItem('id');
	if(!$scope.id){
		$scope.id = Math.random().toString(36).substring(7);
		localStorage.setItem('id', $scope.id);
	}
	$http.get('favorites/' + $scope.id)
	.success(function(items){
		$scope.favorites = items;
		$scope.refreshFavorites();
	})
	
	$scope.refreshFavorites = function(){
		// Modify lines to indicate favorites
		for(var i=0; i<$scope.lines.length; i++){
			$scope.lines[i].isFavorite = false;
			for(var j=0; j<$scope.favorites.length; j++){
				if($scope.favorites[j] == $scope.lines[i].id){
					$scope.lines[i].isFavorite = true;
					break;
				}
			}
		}
	};

	setInterval($scope.refreshStatus, 5 * 60 * 1000);
	$scope.refreshStatus();

	$scope.searchFilter = function(){
		var filter = ($scope.filter || '').toLowerCase();
		return (this.line.name.toLowerCase().indexOf(filter) > -1 
			|| this.line.type.toLowerCase().indexOf(filter) > -1);
	};
	$scope.showText = function(){
		$scope.text = $sce.trustAsHtml(this.line.text);
		$scope.doShowText = true;
		$scope.doShowShader = true;
	};
	$scope.closeText = function(){
		$scope.text = 'No information available at the present time.'
		$scope.doShowText = false;
		$scope.doShowShader = false;
	};


});


function onResize(){
	if(!$('.line')[0]){
		setTimeout(onResize, 50);
	}
	var full = $('body').width();
	var width = null;
	for(var i=1; i<100; i++){
		width = full / i;
		if(width < 400){
			break;
		}
	}
	$('.line').css('width', width + 'px');
}
$(window).on('resize', onResize);
$(window).load(function(){
	setTimeout(onResize, 50)});
