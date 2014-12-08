app = angular.module('gothamTransit', []);


app.controller('main', function($scope, $http, $sce){

	$scope.lines = [];
	$scope.setFilter = function(){
		$scope.lines = $scope.lines;
	};
	$scope.refreshStatus = function(){
		$http.get('status')
		.success(function(lines){
			$scope.lines = lines
			$scope.refreshFavorites();
		})
		setTimeout(onResize, 500);
	};
	setInterval($scope.refreshStatus, 5 * 60 * 1000);
	$scope.refreshStatus();
	


	/* Tracking Favorites */
	$scope.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
	$scope.refreshFavorites = function(){
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
	$scope.removeFavorite = function(){
		var i = $scope.favorites.indexOf(this.line.id);
		if(i > -1){
			$scope.favorites.splice(i, 1);
		}
		localStorage.setItem('favorites', JSON.stringify($scope.favorites));
		$scope.refreshFavorites();
	};
	$scope.addFavorite = function(){
		$scope.favorites.push(this.line.id);
		localStorage.setItem('favorites', JSON.stringify($scope.favorites));
		$scope.refreshFavorites();
	};

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

/* Dyanmic Resizing Stuffs */
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
