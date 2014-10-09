(function($){
	$.fn.jqueryTimeline = function(data) {
		return this.each(function() {
			(new $.jqueryTimeline($(this), data));
		});
	};

	$.jqueryTimeline = function(element, data) {
		// event animations, hide/show buttons, several changes to the sizes
		var eventAnimation = function() {
			var media = element.find("media"),
				content = element.find(".content"),
				containerCount = element.find(".container").length,
				rowWidth = ((containerCount)*(element.find(".container").width())),
				wrapperWidth = element.find(".wrapper").width(),
				animationSpeed = 300,
				leftPosition = 0;

			// several changes to the sizes
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

			// animate by click on next/prev icon
			var initEventAnimation = function() {
				var
					row = element.find(".row"),
					container = element.find(".container"),
					eventCount = 0,
					currentWrapperWidth = 0,
					isMoving = false,
					sliderTransition = 'all 1500ms cubic-bezier(.71,.08,.35,.87)',
					clickCount = 0,

					moveTo = function(position, clickCount) {
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
						magicButtons(clickCount);
					},
					onBtnLeft = function() {
						var container = element.find(".container");

						if (!isMoving) {
							isMoving = true;
							clickCount--;

							moveTo(currentWrapperWidth*clickCount, clickCount);

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

							moveTo(currentWrapperWidth*clickCount, clickCount);

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
								.bind("click", onBtnLeft);
							btnRight
								.bind("click", onBtnRight);
						}
					},
					onLoad = function() {
						// hide left button
						element.find("#left").hide();

						init();
					};
				onLoad();
			};

			// hide show animation for prev/next buttons
			magicButtons = function (clickCount) {
				if (clickCount == 0) {
					element.find("#left").animate({opacity:"hide"}, 500);
				}
				else {
					element.find("#left").animate({opacity:"show"}, 1500);
					if (clickCount == (containerCount-1)) {
						element.find("#right").animate({opacity:"hide"}, 500);
					}
					else {
						element.find("#right").animate({opacity:"show"}, 1500);
					}
				}
			}
			initEventAnimation();
		},

		// Timeline navigation
		navigationAnimation = function() {
			var navWidth = element.find("#navigation .navigation-row").width(),
				lastConPos = element.find("#navigation .navigation-row .navigation-container").last().position(),
				firstConPos = element.find("#navigation .navigation-row .navigation-container").first().position(),
				curLeftPos = element.find("#navigation .navigation-row").attr("id"),
				clicked = false,
				mousePosition = 0,
				left = 0,
				currPo = 0;
			// on mousedown change the left value to slide
			element.find("#navigation")
				// calculate the left value of the row element
				.mousemove(function(event) {
					if (clicked) {
						var mouseX = parseInt(event.pageX);

						if (mouseX < mousePosition) {
							left = parseInt(currPo + (mousePosition-mouseX));
						}
						else {
							left = parseInt(currPo - (mouseX-mousePosition));
						}
						element.find("#navigation .navigation-row").css("left", -left);
					}
				})
				// by hover out stop the mousemove animation
				.hover(function() {
				}, function() {
					clicked = false;
				})
				// start the slide animation on click
				.mousedown(function() {
					if (currPo <= lastConPos.left) {
						mousePosition = window.event.clientX;
						pagePosition = window.event.pageX;
						currPo = left;

						if (currPo < navWidth){
							clicked = true;
						} else {
							clicked = false;
						}
					} else {
						clicked = true;
					}
				})
				// slides animation stop
				.mouseup(function() {
					clicked = false;
					if (currPo > lastConPos.left) {
						element.find("#navigation .navigation-row").animate({
							left: (-currPo + 1000)
						}, "fast");
					}
				});
		};

		eventAnimation();
		navigationAnimation();
	};
})(jQuery);