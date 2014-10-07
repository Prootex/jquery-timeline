(function($){
	$.fn.jqueryTimeline = function(data) {
		return this.each(function() {
			(new $.jqueryTimeline($(this), data));
		});
	};

	$.jqueryTimeline = function(element, data) {
		var media = element.find("media"),
			content = element.find(".content"),
			containerCount = element.find(".container").length,
			rowWidth = ((containerCount)*(element.find(".container").width())),
			wrapperWidth = element.find(".wrapper").width(),
			animationSpeed = 300,
			leftPosition = 0;

		/* hide left icon-arrow */
		// magicButtons();

		/* several changes to the sizes */
		rowWidth = (containerCount == 1)?"100%":rowWidth + 10000;
		if(!(element.find(".media").html())) {
			element.find(".media").remove();
			element.find(".content").css({"width": "100%"});
		}
		element.find(".container").css({"width": wrapperWidth});
		element.find(".row").css({"width": rowWidth});
		$(window).resize(function() {
			wrapperWidth = element.find(".wrapper").width();
			element.find(".container").css({"width": wrapperWidth});
			element.find(".row").css({"width": rowWidth});
		});

		/* animate by click on next/prev icon */
		var initEventAnimation = function() {
			var
				row = element.find(".row"),
				container = element.find(".container"),
				eventCount = 0,
				currentWrapperWidth = 0,
				isMoving = false,
				sliderTransition = 'all 1500ms cubic-bezier(.71,.08,.35,.87)',
				clickCount = 0,

				moveTo = function(position) {
					row.css({
						'-webkit-transform' : 'translate3d('+(-position)+'px, 0px, 0px)',
						'-moz-transform' : 'translate3d('+(-position)+'px, 0px, 0px)',
						'-o-transform' : 'translate3d('+(-position)+'px, 0px, 0px)',
						'transform' : 'translate3d('+(-position)+'px, 0px, 0px)',
						'-webkit-transition' : sliderTransition,
						'-moz-transition' : sliderTransition,
						'-o-transition' : sliderTransition,
						'transition' : sliderTransition
					});
				},

				onBtnLeft = function() {
					var container = element.find(".container");

					if (!isMoving) {
						isMoving = true;
						clickCount--;

						moveTo(currentWrapperWidth*clickCount);

						setTimeout(function() {
							isMoving = false;
						}, 200);
					}
				},

				onBtnRight = function() {
					var container = element.find(".container");

					if (!isMoving) {
						isMoving = true;
						clickCount++;

						moveTo(currentWrapperWidth*clickCount);

						setTimeout(function() {
							isMoving = false;
						}, 200);
					}
				},

				init = function() {
					var btnLeft = element.find("#left"),
						btnRight = element.find("#right");

					currentWrapperWidth = element.find(".wrapper").width();

					eventCount = container.size();
					if (eventCount > 1) {
						btnLeft
							.show()
							.bind("click", onBtnLeft);
						btnRight
							.show()
							.bind("click", onBtnRight);
					}
				},

				onLoad = function() {
					init();
				};
			onLoad();
		};

		/* hide show buttons */
		magicButtons = function () {
			if (element.find(".row").css("left") == "0px") {
				element.find("#left").hide();
			}
			else {
				element.find("#left").show();
				if (element.find(".row").css("left") == -(rowWidth-wrapperWidth)) {
					element.find("#right").hide();
				}
				else {
					element.find("#right").show();
				}
			}
		}
		initEventAnimation();
	};

})(jQuery);