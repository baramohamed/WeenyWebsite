(function($){ 
	var user = 'baramohamed';
	// Main code
	$(document).ready(function(){
		var config = {
			apiKey: "AIzaSyALSB6Lg5laEWHaadQpQNipdMaqOTxq4sA",
			authDomain: "ikids-3fc4a.firebaseapp.com",
			databaseURL: "https://ikids-3fc4a.firebaseio.com",
			projectId: "ikids-3fc4a",
			storageBucket: "ikids-3fc4a.appspot.com",
			messagingSenderId: "818000793503"
		};

		firebase.initializeApp(config);
		var database = firebase.database();

		firebase.database().ref('/users/'+user+'/bracelets').once('value').then(function(snapshot) {
			var n =parseInt(($(document).width()-240)/200);
			snapshot.forEach(function(child){
				if (n >0)
				{
					var str = '<li class="visible"><img src="assets/child.jpg" alt="Media Temple" /><p hidden>'+child.key+'</p><p>'+child.val().firstName + ' ' + child.val().lastName +'</p></li>';
					n--;
				}
				else var str = '<li><img src="assets/child.jpg" alt="Media Temple" /><p hidden>'+child.key+'</p><p>'+child.val().firstName + ' ' + child.val().lastName +'</p></li>';
				$("#carousel").append(str);
			});
			$("li").click(function(){
                var key = this.children[1].textContent;
                selectBracelet(key);
            });
			
		});
		
		

		$("#logout").click(function(){
			firebase.auth().signOut().then(function(){
				window.location = 'index.html';
			},
			function(error){
				alert(error.message);
			}
			);
		});
		// Initialize the object on dom load
		var navigator = new Navigator({
			carousel: '#carousel',
			nextButton: '.arrow.next',
			prevButton: '.arrow.prev',
			shuffle: true,
			chunkSize:parseInt(($(document).width()-240)/200),
		});
		
		navigator.init();	
		
	});
	

	// Sets the map on all markers in the array.
	function setMapOnAll(markers,map) {
		markers.forEach(marker =>  {
			marker.setMap(map);
		});
	}
	function selectBracelet(key)
	{
		if (activeMakers != null) setMapOnAll(activeMakers,null);
		firebase.database().ref('/users/'+user+'/bracelets/'+key+'/positions').once('value').then(function(snapshot) {
			var markers = new Array();
			snapshot.forEach(function(child){
				markers.push(new google.maps.Marker({position : {lat : child.val().Latitude , lng : child.val().Longitude}}));
			});
			setMapOnAll(markers,map);
			activeMakers = markers;
			
		});
		
	}
	
	// A Navigator "class" responsible for navigating through the carousel.
	function Navigator(config) {

		this.carousel = $(config.carousel); //the carousel element
		this.nextButton = $(config.nextButton); //the next button element
		this.prevButton = $(config.prevButton); //the previous button element
		this.chunkSize = config.chunkSize || 3; //how many items to show at a time (maximum)
		this.shuffle = config.shuffle || false; //should the list be shuffled first? Default is false.
		
		//private variables
		this._items = $(config.carousel + ' li'); //all the items in the carousel
		this._chunks = []; //the li elements will be split into chunks. 
		this._visibleChunkIndex = 0; //identifies the index from the this._chunks array that is currently being shown
		

		this.init = function () {
			
			//Shuffle the array if neccessary
			if (this.shuffle) {
				//remove visible tags
				this._items.removeClass('visible');
				
				//shuffle list
				this._items.sort(function() { return 0.5 - Math.random() });
				
				//add visible class to first "chunkSize" items
				this._items.slice(0, this.chunkSize).addClass('visible');
			}
			
			//split array of items into chunks
			this._chunks = this._splitItems(this._items, this.chunkSize);

			var self = this;
			
			//Set up the event handlers for previous and next button click
			self.nextButton.on('click', function(e) {
				self.handleNextClick(e);
			}).show();
			
			self.prevButton.on('click', function(e) {
				self.handlePrevClick(e);
			});
			
			// Showing the carousel on load
			self.carousel.addClass('active');
		}
		
		//handle all code when previous button is clicked
	  this.handlePrevClick = function (e) {
			
			e.preventDefault();
	
			//as long as there are some items before the current visible ones, show the previous ones
			if (this._chunks[this._visibleChunkIndex - 1] !== undefined) {
				this.showPrevItems();
			}
		};
		
		//handle all code when next button is clicked
		this.handleNextClick = function(e) {
			
			e.preventDefault();
			
			//as long as there are some items after the current visible ones, show the next ones
			if (this._chunks[this._visibleChunkIndex + 1] !== undefined) {
				this.showNextItems();
			}
		};
		
		//show the next 3 items
		this.showNextItems = function() {
			
			//remove visible class from current visible chunk
			$(this._chunks[this._visibleChunkIndex]).removeClass('visible');
			
			//add visible class to the next chunk
			$(this._chunks[this._visibleChunkIndex + 1]).addClass('visible');
			
			//update the current visible chunk
			this._visibleChunkIndex++;
			
			//see if the end of the list has been reached.
			this._checkForEnd();
			
		};
		
		//show the previous 3 items
		this.showPrevItems = function() {
			
			//remove visible class from current visible chunk
			$(this._chunks[this._visibleChunkIndex]).removeClass('visible');
			
			//add visible class to the previous chunk
			$(this._chunks[this._visibleChunkIndex - 1]).addClass('visible');
			
			//update the current visible chunk
			this._visibleChunkIndex--;
			
			//see if the beginning of the carousel has been reached.
			this._checkForBeginning();
			
		};
		
		/*
		//Determine if the previous button should be shown or not.
		this._checkForBeginning = function() {
			this.nextButton.show(); //the prev button was clicked, so the next button can show.
			
			if (this._chunks[this._visibleChunkIndex - 1] === undefined) {
				this.prevButton.hide();
			}
			else {
				this.prevButton.show();
			}
		};
		
		//Determine if the next button should be shown or not.
		this._checkForEnd = function() {
			this.prevButton.show(); //the next button was clicked, so the previous button can show.
			
			if (this._chunks[this._visibleChunkIndex + 1] === undefined) {
				this.nextButton.hide();
			}
			else {
				this.nextButton.show();
			}
		};
		*/
		
		//This function takes an array "items" and splits it into subArrays each with a maximum length of "chunk".
		this._splitItems = function(items, chunk) {
			
			var splitItems = [],
			i = 0;
			
			while (items.length > 0) {
				splitItems[i] = items.splice(0, chunk);
				i++;
			}
			
			return splitItems;
		
		};

	}
	
})(jQuery);