(function($){
	$.fn.jqueryTimeline = function(data) {
		return this.each(function() {
			(new $.jqueryTimeline($(this), data));
		});
	};

	jtVars = function(element, data) {
		// global vars and functions
		var rightButton = element.find(".jt-timeline .jt-right"),
			leftButton = element.find(".jt-timeline .jt-left"),
			accRel = 1,
			clickCount = 0,

			// Create structure for events
			createEventStructure = function() {
				var structure =
					'<div class="jt-container jt-table"> \
						<div class="jt-table-row"> \
							<div class="jt-media jt-table-cell"> \
								<span class="jt-caption"></span> \
							</div> \
							<div class="jt-content jt-table-cell"> \
								<div class="jt-content-col"> \
									<div class="jt-date"> \
										<span></span> \
									</div> \
									<div class="jt-heading"> \
										<h2></h2> \
									</div> \
									<div class="jt-text"> \
										<p></p> \
									</div> \
								</div> \
							</div> \
						</div> \
					</div>';

				appendContent(structure);
			},

			drawContentMedia = function(asset) {
				switch(asset.type) {
					case "image":
						return "<img src=\""+asset.url+"\" alt=\""+asset.caption+"\" />"; break;
					case "google-embed":
						return "<iframe src=\""+asset.url+"\" frameborder=\"0\" allowfullscreen></iframe>"; break;
					case "youtube-embed":
						return "<iframe src=\""+asset.url+"\" frameborder=\"0\" allowfullscreen></iframe>"; break;
				}
				return "";
			},

			//Filling data in created structure
			appendContent = function(structure) {
				$.each(data.timeline, function(i, timelineData) {
					element.find(".jt-row").append(structure);
					var container = element.find(".jt-container").last();

					container.find(".jt-media").prepend(drawContentMedia(timelineData.asset));
				});
			},

			// several changes to the sizes
			rowSize = function() {
				var containerCount = element.find(".jt-container").length,
					media = element.find(".jt-media"),
					content = element.find(".jt-content"),
					rowWidth = ((containerCount)*(element.find(".jt-container").width())),
					wrapperWidth = element.find(".jt-wrapper").width(),
					animationSpeed = 300,
					leftPosition = 0;

				rowWidth = (containerCount == 1)?"100%":rowWidth + 10000;
				if(!(element.find(".jt-media").html())) {
					element.find(".jt-media").remove();
					element.find(".jt-content").css({"width": "100%"});
				}
				element.find(".jt-container").css({"width": wrapperWidth});
				element.find(".jt-row").css({"width": rowWidth});
				$(window).resize(function() {
					wrapperWidth = element.find(".jt-wrapper").width();
					element.find(".jt-container").css({"width": wrapperWidth});
					element.find(".jt-row").css({"width": rowWidth});
				});
			},

			// animate by click on next/prev icon
			initEventAnimation = function() {
				var
					row = element.find(".jt-row"),
					container = element.find(".jt-container"),
					eventCount = 0,
					currentWrapperWidth = 0,
					isMoving = false,
					sliderTransition = 'all 1500ms cubic-bezier(.71,.08,.35,.87)',
					container = element.find(".jt-container"),

					moveToEvent = function(position, clickCount) {
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
						if (!isMoving) {
							isMoving = true;
							clickCount--;

							moveToEvent(currentWrapperWidth*clickCount, clickCount);

							setTimeout(function() {
								isMoving = false;
							}, 200);
						}
					},
					onBtnRight = function() {
						if (!isMoving) {
							isMoving = true;
							clickCount++;

							moveToEvent(currentWrapperWidth*clickCount, clickCount);

							setTimeout(function() {
								isMoving = false;
							}, 200);
						}
					},
					init = function() {
						currentWrapperWidth = element.find(".jt-wrapper").width();
						eventCount = container.size();
						if (eventCount > 1) {
							leftButton
								.bind("click", onBtnLeft);
							rightButton
								.bind("click", onBtnRight);
						}
					},
					onLoad = function() {
						// hide left button
						element.find(".jt-left").hide();

						init();
					};
				onLoad();
			},

			// hide show animation for prev/next buttons
			magicButtons = function (clickCount) {
				var containerCount = element.find(".jt-container").length;
				if (clickCount == 0) {
					element.find(".jt-left").animate({opacity:"hide"}, 500);
				}
				else {
					element.find(".jt-left").animate({opacity:"show"}, 1500);
					if (clickCount == (containerCount-1)) {
						element.find(".jt-right").animate({opacity:"hide"}, 500);
					}
					else {
						element.find(".jt-right").animate({opacity:"show"}, 1500);
					}
				}
			},

			// Content for right and left buttons
			buttonContent = function() {
				var i = 0;
				// add a rel attr to the containers
				element.find(".jt-timeline .jt-container").each(function() {
					$(this).attr("rel", i);
					i++;
				});
				// shows the heading of the next or prev events
				console.log(data);
			},

			// Timeline navigation
			navigationAnimation = function() {
				var navWidth = element.find(".jt-navigation .jt-navigation-row").width(),
					lastConPos = element.find(".jt-navigation .jt-navigation-row .jt-navigation-container").last().position(),
					firstConPos = element.find(".jt-navigation .jt-navigation-row .jt-navigation-container").first().position(),
					clicked = false,
					mousePosition = 0,
					left = 0,
					currPo = 0;
				// on mousedown change the left value to slide
				element.find(".jt-navigation")
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
							element.find(".jt-navigation .jt-navigation-row").css("left", -left);
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
					});
			};

		createEventStructure();
		rowSize();
		initEventAnimation();
		buttonContent();
		navigationAnimation();
	};

	$.jqueryTimeline = function(element, data) {
		jtVars(element, data);
	};
})(jQuery);