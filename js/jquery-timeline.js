(function($){

	// global vars and functions
	var
	baseElement,
	baseData,
	rightButton,
	leftButton,
	accRel = 1,
	clickCount = 0,
	sliderSpeed = 500,
	transitionVal = "all 500ms cubic-bezier(.71,.08,.35,.87)",
	wrapperWidth = 0,
	navigationWidth = 0,

	// several changes to the container and row sizes for resizing
	initRowSize = function() {
		var containerCount = baseElement.find(".jt-container").length,
			media = baseElement.find(".jt-media"),
			content = baseElement.find(".jt-content"),
			rowWidth = (containerCount)*(wrapperWidth),
			animationSpeed = 300,
			leftPosition = 0;

		rowWidth = (containerCount == 1)?"100%":rowWidth + 10000;
		baseElement.find(".jt-container").css({"width": wrapperWidth});
		baseElement.find(".jt-row").css({"width": rowWidth});
		// $(window).resize(function() {
		// 	baseElement.find(".jt-container").css({"width": wrapperWidth});
		// 	baseElement.find(".jt-row").css({"width": rowWidth});
		// });
	},

	// Create structure for events
	initWrapStructure = function() {
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
					<div class="jt-navigation-row">\
						<div class="jt-year-line"></div>\
					</div>\
				</div>\
			</div>';

		baseElement.append(wrapStructure);
		initEventStructure();
	},

	// Create structure for events
	initEventStructure = function() {
		var structure =
			'<div class="jt-container jt-table">\
				<div class="jt-table-row">\
					<div class="jt-media jt-table-cell"></div>\
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

			container.find(".jt-date > span").append(timelineData.date);
			container.find(".jt-heading > h2").append(timelineData.headline);
			container.find(".jt-text > p").append(timelineData.text);

			//create navigation boxes and add an rel attr
			navRow.append("<div class=\"jt-navigation-container\" rel=\""+i+"\"><div class=\"jt-col\"><span class=\"date\">"+timelineData.date+"</span><br /><span class=\"heading\">"+timelineData.headline+"</span></div><div class=\"jt-line\"></div></div>");
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
			isMoving = false,
			container = baseElement.find(".jt-container"),

			moveToEvent = function(position, clickCount) {
				transform3D(row, -position ,0 ,0);
				transition(row, transitionVal);

				magicButtons(clickCount);
			},
			onBtnLeft = function() {
				if (!isMoving) {
					isMoving = true;
					clickCount--;

					baseElement.find(".jt-navigation-container").removeClass("active");
					baseElement.find(".jt-navigation-container .jt-col").removeClass("active");
					baseElement.find(".jt-navigation-container[rel='"+clickCount+"']").addClass("active");
					baseElement.find(".jt-navigation-container[rel='"+clickCount+"'] .jt-col").addClass("active");

					baseElement.find(".jt-navigation-container[rel='"+clickCount+"'] .jt-col").click();

					moveToEvent(wrapperWidth*clickCount, clickCount);
					loadMediaContent(clickCount);

					//overwrite button content
					setButtonContent(clickCount);

					setTimeout(function() {
						isMoving = false;
					}, sliderSpeed);
				}
			},
			onBtnRight = function() {
				if (!isMoving) {
					isMoving = true;
					clickCount++;

					baseElement.find(".jt-navigation-container").removeClass("active");
					baseElement.find(".jt-navigation-container .jt-col").removeClass("active");
					baseElement.find(".jt-navigation-container[rel='"+clickCount+"']").addClass("active");
					baseElement.find(".jt-navigation-container[rel='"+clickCount+"'] .jt-col").addClass("active");

					baseElement.find(".jt-navigation-container[rel='"+clickCount+"'] .jt-col").click();

					moveToEvent(wrapperWidth*clickCount, clickCount);
					loadMediaContent(clickCount);

					//overwrite button content
					setButtonContent(clickCount);

					setTimeout(function() {
						isMoving = false;
					}, sliderSpeed);
				}
			},
			init = function() {
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

	// lazy load for media elements
	// remove element if empty
	loadMediaContent = function(id) {
		if (baseElement.find(".jt-container[rel='"+id+"'] .jt-media").is(':empty') && baseData.timeline[id].asset) {
			baseElement.find(".jt-container[rel='"+id+"'] .jt-media").append("<div class=\"jt-loader\"></div>");
			setTimeout(function() {
				baseElement.find(".jt-container[rel='"+id+"'] .jt-media").prepend(drawContentMedia(baseData.timeline[id].asset));
				baseElement.find(".jt-container[rel='"+id+"'] .jt-media").append("<span class=\"jt-caption\">"+baseData.timeline[id].asset.caption+"</span>");
				baseElement.find(".jt-container[rel='"+id+"'] .jt-media .loader").remove();
			}, 200);
		}
		setTimeout(function() {
			if((baseElement.find(".jt-container[rel='"+id+"'] .jt-media").is(':empty'))) {
				baseElement.find(".jt-container[rel='"+id+"'] .jt-media").remove();
				baseElement.find(".jt-container[rel='"+id+"'] .jt-content").css({"width": "100%"});
			}
		}, 400);
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

	setButtonContentText = function(button, data) {
		var str = data.headline;
		button.find(".jt-date").append(data.date);
		button.find(".jt-heading").append(str.substring(0,40));
	},

	// Sets content for right and left buttons
	setButtonContent = function(i) {
		var containerCount = baseElement.find(".jt-container").length;

		if (!i) i=0;

		// empty elements
		rightButton.find("span").empty();
		leftButton.find("span").empty();
		// shows the heading of the next or prev events
		if (containerCount > 1) {
			if (i == 0) {
				setButtonContentText(rightButton, baseData.timeline[i+1]);
			} else if(i == (containerCount-1)) {
				setButtonContentText(leftButton, baseData.timeline[i-1]);
			} else {
				setButtonContentText(rightButton, baseData.timeline[i+1]);
				setButtonContentText(leftButton, baseData.timeline[i-1]);
			}
		}
	},

	// toggle navigation
	initNavigationToggle = function() {
		// positioning toggle button
		var animate = false;

		// $(window).resize(function() {
		// 	baseElement.find(".jt-nav-toggle").css("left", ((wrapperWidth / 2)-60));
		// });
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

	// init timeline navigation
	initNavigationAnimation = function() {

		var lastConPos = baseElement.find(".jt-navigation .jt-navigation-row .jt-navigation-container").last().position(),
			clicked = false,
			mousePosition = 0;
		// on mousedown change the left value to slide
		baseElement.find(".jt-navigation")
			// calculate the left value of the row element
			.mousemove(function(event) {
				if (clicked) {

					var left, mouseX = parseInt(event.pageX);

					left = parseInt((mousePosition-mouseX));
					mousePosition = mouseX;

					setNavConPosDelta(-left, true);
					setNavConPos();
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
				clicked = true;
				setNavConTransition(false);
			})
			// slides animation stop
			.mouseup(function() {
				baseElement.find(".jt-navigation-row").css("cursor", "-webkit-grab");
				clicked = false;
					setNavConTransition(true);
			});
	},

	// sort obj by timestamp
	sortTimeline = function() {

		$.each(baseData.timeline, function(i, v) {
			dateSplit = v.date.split('-');
			date = new Date(dateSplit[0], parseInt(dateSplit[1]) - 1, dateSplit[2]).getTime();
			baseData.timeline[i].timestamp = date;
			baseData.timeline[i].year = parseInt(dateSplit[0]);
		});

		baseData.timeline = baseData.timeline.sort(function(a, b) {
			return (a.timestamp - b.timestamp);
		});
	},

	setNavConPosDelta = function(leftDelta, doNotOverwrite) {

		if (!leftDelta)
			leftDelta = 0;

		// set position of years
		$.each(baseData.years, function(i, v) {
			if (doNotOverwrite) {
				baseData.years[i].left += leftDelta;
			} else {
				baseData.years[i].left = leftDelta;
			}
		});

		// set positions of event flags
		$.each(baseData.timeline, function(i, v) {
			if (doNotOverwrite) {
				baseData.timeline[i].left += leftDelta;
			} else {
				baseData.timeline[i].left = leftDelta;
			}
		});
	},

	setNavConTransition = function(enable) {

		if (enable) {
			baseElement.find(".jt-navigation-container").removeClass("no-transition");
			baseElement.find(".jt-year-container").removeClass("no-transition");
		} else {
			baseElement.find(".jt-navigation-container").addClass("no-transition");
			baseElement.find(".jt-year-container").addClass("no-transition");
		}
	},

	getNavEventPos = function(i) {

		return (baseData.timeline[i].initialLeft + baseData.timeline[i].left);
	},

	// calculate current position of navigation containers
	setNavConPos = function(leftDelta) {

		// set position of years
		$.each(baseData.years, function(i, v) {
			baseElement.find(".jt-year-container[data-year='"+i+"']").css({
				left: (baseData.years[i].initialLeft + baseData.years[i].left)
			});
		});

		// set positions of event flags
		$.each(baseData.timeline, function(i, v) {
			baseElement.find(".jt-navigation-container[rel='"+i+"']").css({
				left: getNavEventPos(i)
			});
		});
	},

	// position of navigation containers by the year
	initNavConPos = function() {
		var
			yearArr = [],
			count = (baseElement.find(".jt-navigation-container").length - 1);
			navWrapWidth = navigationWidth - 190;
			baseElement.find(".jt-navigation-row").css("width", (navWrapWidth+190)),
			diff = 0;

		baseData.years = [];
		for(var i = baseData.timeline[0].year; i<= (baseData.timeline[count].year+1); i++) {
			yearArr.push(i);
			var timestamp = new Date(i, 0, 1).getTime();
			baseData.years.push({'timestamp': timestamp});
		}

		if ((baseElement.find(".jt-year-container").length) < 1) {
			// create containers for the year line
			$.each(yearArr, function(i, v) {
				baseElement.find(".jt-year-line").append("<div class=\"jt-year-container\" data-year=\""+i+"\">"+v+"<div class=\"jt-year-container-line\"></div></div>");
			});
		}

		// set position of years
		$.each(baseData.years, function(i, v) {
			diffYear = baseData.years[(baseData.years.length-1)].timestamp-baseData.years[0].timestamp;
			leftYear = ( ( (baseData.years[i].timestamp-baseData.years[0].timestamp) * navigationWidth ) / diffYear ) + 50;
			baseData.years[i].initialLeft = leftYear;
			baseData.years[i].left = 0;
		});

		// set positions of event flags
		$.each(baseData.timeline, function(i, v) {
			diff = baseData.years[(baseData.years.length-1)].timestamp-baseData.timeline[0].timestamp;
			left = ( ( (baseData.timeline[i].timestamp-baseData.years[0].timestamp) * navigationWidth ) / diff ) + 50;
			baseData.timeline[i].initialLeft = left;
			baseData.timeline[i].left = 0;
		});

		// set positions
		setNavConPos();
	},

	initNavZoomButtons = function() {

		var processZoom = function(zoomInOrOut) {

			$.each(baseData.years, function(i, v) {
				if (zoomInOrOut) {
					baseData.years[i].left += ((baseData.years[i].left + baseData.years[i].initialLeft) * 0.5);
				} else {
					baseData.years[i].left -= ((baseData.years[i].left + baseData.years[i].initialLeft) * 0.5);
				}
			});

			$.each(baseData.timeline, function(i, v) {
				if (zoomInOrOut) {
					baseData.timeline[i].left += ((baseData.timeline[i].left + baseData.timeline[i].initialLeft) * 0.5);
				} else {
					baseData.timeline[i].left -= ((baseData.timeline[i].left + baseData.timeline[i].initialLeft) * 0.5);
				}
			});

			setNavConPos();
			setEventFocus(baseElement.find(".jt-navigation-container.active").children());
			setNavTopPos();
		};

		baseElement.find(".jt-zoom-in").click(function(){
			processZoom(true);
		});
		baseElement.find(".jt-zoom-out").click(function(){
			processZoom(false);
		});
	},

	setNavTopPos = function() {
		var count = 1;
		baseElement.find(".jt-navigation-container").each(function(i, v) {
			var top = "5px";
			switch(count) {
				case 2:
					top = "60px";
					break;
				case 3:
					top = "116px";
					break;
			}
			$(v).find(".jt-col").css("top",top);
			count++;
			if (count > 3) {
				count = 1;
			}
		});
	},

	setEventFocus = function(element) {
		baseElement.find(".jt-navigation-container").removeClass("active");
		baseElement.find(".jt-navigation-container .jt-col").removeClass("active");

		element.addClass("active");
		element.parent().addClass("active");

		var leftPosition = element.parent().get(0).style.left,
			deltaToMiddle;

		clickCount = parseInt(element.parent().attr("rel"));
		setButtonContent(clickCount);
		magicButtons(clickCount);

		transform3D(baseElement.find(".jt-wrapper .jt-row"), -(wrapperWidth * clickCount), 0, 0);
		transition(baseElement.find(".jt-wrapper .jt-row"), transitionVal);

		deltaToMiddle = (navigationWidth / 2) - getNavEventPos(clickCount);

		setNavConPosDelta(deltaToMiddle+1, true);
		setNavConPos();

		loadMediaContent(clickCount);
	},


	initEventInteraction = function() {
		baseElement.find(".jt-navigation-container .jt-col")
			.hover(function() {
				$(this).addClass("hover");
				$(this).parent().addClass("hover");
			}, function() {
				baseElement.find(".jt-navigation-container").removeClass("hover");
				baseElement.find(".jt-navigation-container .jt-col").removeClass("hover");
			})
			.click(function() {
				setEventFocus($(this));
			});
	},

	transition = function(element, value){
		element.stop().css({
			'-webkit-transition' : value,
			'-moz-transition' : value,
			'-o-transition' : value,
			'transition' : value
		});
	},

	transform3D = function(element, x, y, z) {
		element.stop().css({
			'-webkit-transform' : 'translate3d('+x+'px, '+y+'px, '+z+'px)',
			'-moz-transform' : 'translate3d('+x+'px, '+y+'px, '+z+'px)',
			'-o-transform' : 'translate3d('+x+'px, '+y+'px, '+z+'px)',
			'transform' : 'translate3d('+x+'px, '+y+'px, '+z+'px)'
		});
	},

	transformX = function(element, value) {
		element.stop().css({
			"-webkit-transform": "translateX("+value+"px)",
			"-moz-transform": "translateX("+value+"px)",
			"-ms-transform": "translateX("+value+"px)",
			"-o-transform": "translateX("+value+"px)",
			"transform": "translateX("+value+"px)"
		});
	},

	initJt = function(element, data) {
		baseElement = element;
		baseData = data;

		sortTimeline();

		initWrapStructure();
		wrapperWidth = baseElement.find(".jt-wrapper").width();
		navigationWidth = baseElement.find(".jt-navigation").width();

		rightButton = baseElement.find(".jt-timeline .jt-right");
		leftButton = baseElement.find(".jt-timeline .jt-left");
		baseElement.find(".jt-navigation-container[rel='0']").addClass("active");
		baseElement.find(".jt-navigation-container[rel='0'] .jt-col").addClass("active");

		loadMediaContent(0);

		initRowSize();
		initEventAnimation();
		initNavigationAnimation();
		initNavigationToggle();
		initEventInteraction();

		setButtonContent();
		initNavConPos();
		initNavZoomButtons();

		setNavTopPos();

		// go to first element
		setEventFocus(baseElement.find(".jt-navigation-container[rel='0'] .jt-col"));

		$(window).resize(function() {
			var currentElement = baseElement.find(".jt-navigation-container .active");
			wrapperWidth = baseElement.find(".jt-wrapper").width();
			navigationWidth = baseElement.find(".jt-navigation").width();
			initRowSize();
			initNavigationAnimation();
			initNavigationToggle();
			initEventInteraction();
			initNavConPos();
			setEventFocus(currentElement);
		});
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