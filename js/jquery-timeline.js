(function($){

	// global vars and functions
	var
	baseElement,
	baseData,
	rightButton,
	leftButton,
	accRel = 1,
	clickCount = 0,
	sliderSpeed = 1500,

	// several changes to the sizes
	rowSize = function() {
		var containerCount = baseElement.find(".jt-container").length,
			media = baseElement.find(".jt-media"),
			content = baseElement.find(".jt-content"),
			rowWidth = ((containerCount)*(baseElement.find(".jt-container").width())),
			wrapperWidth = baseElement.find(".jt-wrapper").width(),
			animationSpeed = 300,
			leftPosition = 0;

		rowWidth = (containerCount == 1)?"100%":rowWidth + 10000;
		if(!(baseElement.find(".jt-media").html())) {
			baseElement.find(".jt-media").remove();
			baseElement.find(".jt-content").css({"width": "100%"});
		}
		baseElement.find(".jt-container").css({"width": wrapperWidth});
		baseElement.find(".jt-row").css({"width": rowWidth});
		$(window).resize(function() {
			wrapperWidth = baseElement.find(".jt-wrapper").width();
			baseElement.find(".jt-container").css({"width": wrapperWidth});
			baseElement.find(".jt-row").css({"width": rowWidth});
		});
	},

	// Create structure for events
	createWrapStructure = function() {
		var wrapStructure =
			'<div class="jt-timeline">\
				<div class="jt-left jt-icon-arrow">\
					<div class="jt-prev">\
						<span class="jt-date"></span><br />\
						<span class="jt-heading"></span>\
					</div>\
				</div>\
				<div class="jt-wrapper">\
					<div class="jt-nav-toggle"><span class="jt-icon-arrow-bottom jt-sprite jt-sprite_223_chevron-right"></span></div>\
					<div class="jt-row"></div>\
				</div>\
				<div class="jt-right jt-icon-arrow">\
					<div class="jt-next">\
						<span class="jt-date"></span><br />\
						<span class="jt-heading"></span>\
					</div>\
				</div>\
			</div>\
			<div class="jt-navigation">\
				<div class="jt-navigation-wrapper">\
					<div class="jt-nav-zoom">\
						<span class="jt-zoom-in jt-sprite jt-sprite_190_circle_plus"></span>\
						<span class="jt-zoom-out jt-sprite jt-sprite_191_circle_minus"></span>\
					</div>\
					<div class="jt-navigation-row"></div>\
				</div>\
			</div>';

		baseElement.append(wrapStructure);
		createEventStructure();
	},

	// Create structure for events
	createEventStructure = function() {
		var structure =
			'<div class="jt-container jt-table">\
				<div class="jt-table-row">\
					<div class="jt-media jt-table-cell">\
						<span class="jt-caption"></span>\
					</div>\
					<div class="jt-content jt-table-cell">\
						<div class="jt-content-col">\
							<div class="jt-date">\
								<span></span>\
							</div>\
							<div class="jt-heading">\
								<h2></h2>\
							</div>\
							<div class="jt-text">\
								<p></p>\
							</div>\
						</div>\
					</div>\
				</div>\
			</div>';

		appendContent(structure);
	},

	//Filling data in created structure
	appendContent = function(structure) {
		$.each(baseData.timeline, function(i, timelineData) {
			baseElement.find(".jt-row").append(structure);

			var container = baseElement.find(".jt-container").last(),
				navRow = baseElement.find(".jt-navigation-row").last();
			// add a rel attr to the containers
			container.attr("rel", i);

			container.find(".jt-media").prepend(drawContentMedia(timelineData.asset));
			container.find(".jt-caption").append(timelineData.asset.caption);
			container.find(".jt-date > span").append(timelineData.date);
			container.find(".jt-heading > h2").append(timelineData.headline);
			container.find(".jt-text > p").append(timelineData.text);

			//create navigation boxes and add an rel attr
			navRow.append("<div class=\"jt-navigation-container\" rel=\""+i+"\"><div class=\"jt-col\"><span class=\"date\">"+timelineData.date+"</span><br /><span class=\"heading\">"+timelineData.headline+"</span></div></div>");
		});
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

	// animate by click on next/prev icon
	initEventAnimation = function() {
		var
			row = baseElement.find(".jt-row"),
			container = baseElement.find(".jt-container"),
			eventCount = 0,
			currentWrapperWidth = 0,
			isMoving = false,
			sliderTransition = 'all '+sliderSpeed+'ms cubic-bezier(.71,.08,.35,.87)',
			container = baseElement.find(".jt-container"),

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
					//overwrite button content
					buttonContent(clickCount);

					setTimeout(function() {
						isMoving = false;
					}, sliderSpeed);
				}
			},
			onBtnRight = function() {
				if (!isMoving) {
					isMoving = true;
					clickCount++;

					moveToEvent(currentWrapperWidth*clickCount, clickCount);
					//overwrite button content
					buttonContent(clickCount);

					setTimeout(function() {
						isMoving = false;
					}, sliderSpeed);
				}
			},
			init = function() {
				currentWrapperWidth = baseElement.find(".jt-wrapper").width();
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
				baseElement.find(".jt-left").hide();

				init();
			};
		onLoad();
	},

	// hide show animation for prev/next buttons
	magicButtons = function (clickCount) {
		var containerCount = baseElement.find(".jt-container").length;
		if (clickCount == 0) {
			baseElement.find(".jt-left").animate({opacity:"hide"}, 500);
		}
		else {
			baseElement.find(".jt-left").animate({opacity:"show"}, 1500);
			if (clickCount == (containerCount-1)) {
				baseElement.find(".jt-right").animate({opacity:"hide"}, 500);
			}
			else {
				baseElement.find(".jt-right").animate({opacity:"show"}, 1500);
			}
		}
	},

	buttonContentFill = function(button, data) {
		var str = data.headline;
		button.find(".jt-date").append(data.date);
		button.find(".jt-heading").append(str.substring(0,40));
	},

	// Content for right and left buttons
	buttonContent = function(i) {
		var containerCount = baseElement.find(".jt-container").length;

		if (!i) i=0;

		// empty elements
		rightButton.find("span").empty();
		leftButton.find("span").empty();
		// shows the heading of the next or prev events
		if (containerCount > 1) {
			if (i == 0) {
				buttonContentFill(rightButton, baseData.timeline[i+1]);
			} else if(i == (containerCount-1)) {
				buttonContentFill(leftButton, baseData.timeline[i-1]);
			} else {
				buttonContentFill(rightButton, baseData.timeline[i+1]);
				buttonContentFill(leftButton, baseData.timeline[i-1]);
			}
		}
	},

	// toggle navigation
	toggleNavigation = function() {
		// positioning toggle button
		var wrapperWidth = baseElement.find(".jt-wrapper").width(),
			animate = false;
		$(window).resize(function() {
			wrapperWidth = baseElement.find(".jt-wrapper").width();
			baseElement.find(".jt-nav-toggle").css("left", ((wrapperWidth / 2)-60));
		});
		baseElement.find(".jt-nav-toggle").css("left", ((wrapperWidth / 2)-60));

		// add class to toggle icon
		baseElement.find(".jt-nav-toggle").click(function() {
			if (!animate) {
				animate = true;
				if ($(this).find("> span").hasClass("jt-icon-arrow-bottom")) {
					$(this).find("> span").removeClass("jt-icon-arrow-bottom").addClass("jt-icon-arrow-top");
				} else {
					$(this).find("> span").removeClass("jt-icon-arrow-top").addClass("jt-icon-arrow-bottom");
				}
				baseElement.find(".jt-navigation").toggle("fast", function() {
					animate = false;
				});
			}
		});
	},

	// Timeline navigation
	navigationAnimation = function() {
		var navWidth = baseElement.find(".jt-navigation .jt-navigation-row").width(),
			lastConPos = baseElement.find(".jt-navigation .jt-navigation-row .jt-navigation-container").last().position(),
			clicked = false,
			mousePosition = 0,
			left = 0,
			currPo = 0;

		// on mousedown change the left value to slide
		baseElement.find(".jt-navigation")
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
					baseElement
						.find(".jt-navigation .jt-navigation-container")
						.css({
							"-webkit-transform": "translateX("+-left+"px)",
							   "-moz-transform": "translateX("+-left+"px)",
							    "-ms-transform": "translateX("+-left+"px)",
							     "-o-transform": "translateX("+-left+"px)",
							        "transform": "translateX("+-left+"px)"
						});
				}
			})
			// by hover out stop the mousemove animation
			.hover(function() {}, function() {
				baseElement.find(".jt-navigation-row").css("cursor", "-webkit-grab");
				clicked = false;
			})
			// start the slide animation on click
			.mousedown(function(event) {
				baseElement.find(".jt-navigation-row").css("cursor", "-webkit-grabbing");
				mousePosition = event.clientX;
				pagePosition = event.pageX;
				currPo = left;
				clicked = true;
			})
			// slides animation stop
			.mouseup(function() {
				baseElement.find(".jt-navigation-row").css("cursor", "-webkit-grab");
				clicked = false;
			});
	},

	// position of navigation containers by the year
	navConPos = function(zoomScale) {
		var left = 0,
			timeObj = {},
			count = (baseElement.find(".jt-navigation-container").length - 1);
			navWrapWidth = baseElement.find(".jt-navigation-wrapper").width() - 220;
			baseElement.find(".jt-navigation-row").css("width", (navWrapWidth+190)),
			diff = 0;

		if(!zoomScale){zoomScale=1;}

		$.each(baseData.timeline, function(i, v) {
			dateSplit = v.date.split('-');
			date = new Date(dateSplit[0], parseInt(dateSplit[1], 10) - 1, dateSplit[2]).getTime();
			timeObj[i] = date;
		});

		$.each(baseElement.find(".jt-navigation-container"), function(i, v) {
			diff = timeObj[count]-timeObj[0];
				left = (((timeObj[i]-timeObj[0])*(baseElement.find(".jt-navigation-row").width()))/diff);
				$(this).css("left", left*zoomScale);
		});
	},

	//
	navZoom = function() {
		var zoomScale = 1;
		baseElement.find(".jt-zoom-in").click(function(){
			zoomScale = zoomScale*2;
			navConPos(zoomScale);
		});
		baseElement.find(".jt-zoom-out").click(function(){
			zoomScale = zoomScale*0.5;
			navConPos(zoomScale);
		});
	},

	initJt = function(element, data) {
		baseElement = element;
		baseData = data;

		// sort obj by date
		baseData.timeline = baseData.timeline.sort(function(a, b) {
			return (a.date > b.date);
		});

		createWrapStructure();

		rightButton = baseElement.find(".jt-timeline .jt-right");
		leftButton = baseElement.find(".jt-timeline .jt-left");

		rowSize();
		buttonContent();
		initEventAnimation();
		navigationAnimation();
		toggleNavigation();
		navConPos();
		$(window).resize(function() {
			navConPos()
		});
		navZoom();
	};

	$.jqueryTimeline = function(element, data) {
		initJt(element, data);
	};

	$.fn.jqueryTimeline = function(data) {
		return this.each(function() {
			(new $.jqueryTimeline($(this), data));
		});
	};

})(jQuery);