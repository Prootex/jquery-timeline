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
	initInProgress = false,

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

			if (timelineData.headline || timelineData.text) {
				container.find(".jt-date > span").append(timelineData.startDate);
				if (timelineData.endDate != timelineData.startDate) {
					container.find(".jt-date > span").append(" - "+timelineData.endDate);
				}
				container.find(".jt-heading > h2").append(timelineData.headline);
				container.find(".jt-text > p").append(timelineData.text);
			} else {
				container.find(".jt-content").children().remove();
			}

			//create navigation boxes and add an rel attr
			var content = (timelineData.headline ? content = timelineData.headline : content = timelineData.asset.caption);
			navRow.append("<div class=\"jt-navigation-container\" rel=\""+i+"\"><div class=\"jt-col\"><span class=\"heading\">"+content+"</span></div><div class=\"jt-line\"><div class=\"jt-line-dot\"></div></div></div>");
			if (timelineData.asset.thumbnail) {
				baseElement.find(".jt-navigation-container[rel="+i+"] .jt-col").prepend("<img src=\""+timelineData.asset.thumbnail+"\" height=\"25px\" width=\"25px\" />");
			}
		});
	},

	drawContentMedia = function(asset) {

		switch(asset.type) {
			case "image":
				return "<img src=\""+asset.asset+"\" alt=\""+asset.caption+"\" />"; break;
			case "google-embed":
				return "<iframe src=\""+asset.asset+"\" frameborder=\"0\" allowfullscreen></iframe>"; break;
			case "youtube-embed":
				return "<iframe src=\"https://www.youtube.com/embed/"+asset.asset+"\" frameborder=\"0\" allowfullscreen></iframe>"; break;
		}
		return "";
	},

	// lazy load for media elements
	// remove element if empty
	loadMediaContent = function(id) {

		if (baseElement.find(".jt-container[rel='"+id+"'] .jt-media").is(':empty')) {
			baseElement.find(".jt-container[rel='"+id+"'] .jt-media").append("<div class=\"jt-loader\"></div>");
			setTimeout(function() {
				baseElement.find(".jt-container[rel='"+id+"'] .jt-media").prepend(drawContentMedia(baseData.timeline[id].asset));
				baseElement.find(".jt-container[rel='"+id+"'] .jt-media").append("<span class=\"jt-caption\">"+baseData.timeline[id].asset.caption+"</span>");

				// asset only
				if (baseData.timeline[id].asset.asset && !(baseData.timeline[id].headline || baseData.timeline[id].text)) {

					baseElement.find(".jt-container[rel='"+id+"'] .jt-media").css("width", "100%");
					baseElement.find(".jt-container[rel='"+id+"'] .jt-media img").css("width", "auto");
					baseElement.find(".jt-container[rel='"+id+"'] .jt-media iframe").css("width", "70%");
				}
				// text only
				else if (!baseData.timeline[id].asset.asset && (baseData.timeline[id].headline || baseData.timeline[id].text)) {

					baseElement.find(".jt-container[rel='"+id+"'] .jt-media").remove();
					baseElement.find(".jt-container[rel='"+id+"'] .jt-content").css({"width": "100%"});
				}

				baseElement.find(".jt-container[rel='"+id+"'] .jt-media .loader").remove();

			}, 200);
		}
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

					// prevent pagination from stepping to far
					if (clickCount < 0) {
						clickCount = 0;
					}

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

					// prevent pagination from stepping to far
					if (clickCount > baseData.timeline.length-1) {
						clickCount = baseData.timeline.length-1;
					}

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

				if (baseData.config.keyboardCommands) {
					$("body").keydown(function(e){
						if (e.keyCode == 37) {
							leftButton.trigger("click");
						}
						if (e.keyCode == 39) {
							rightButton.trigger("click");
						}
					});
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

	setButtonContentText = function(button, data) {

		var str = (data.headline ? str = data.headline : str = data.asset.caption);
		button.find(".jt-date").append(data.startDate);
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

		// toggle button position
		baseElement.find(".jt-nav-toggle").css("left", ((wrapperWidth / 2)-60));

		// unbind previous event handlers
		baseElement.find(".jt-navigation").unbind('mousemove');
		baseElement.find(".jt-navigation").unbind('hover');
		baseElement.find(".jt-navigation").unbind('mousedown');
		baseElement.find(".jt-navigation").unbind('mouseup');

		// on mousedown change the left value to slide
		baseElement.find(".jt-navigation")
			// calculate the left value of the row element
			.mousemove(function(event) {
				if (clicked) {

					var left, mouseX = parseInt(event.pageX);

					left = parseInt((mousePosition-mouseX));
					mousePosition = mouseX;

					setNavConPosDelta(-left, true);
					setNavConPosEndDelta(-left, true);
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
			startDateSplit = v.startDate.split('-');
			startDate = new Date(startDateSplit[0], parseInt(startDateSplit[1]) - 1, startDateSplit[2]).getTime();
			baseData.timeline[i].startTimestamp = startDate;
			baseData.timeline[i].year = parseInt(startDateSplit[0]);

			endDateSplit = v.endDate.split('-');
			endDate = new Date(endDateSplit[0], parseInt(endDateSplit[1]) - 1, endDateSplit[2]).getTime();
			baseData.timeline[i].endTimestamp = endDate;
		});

		baseData.timeline = baseData.timeline.sort(function(a, b) {
			return (a.startTimestamp - b.startTimestamp);
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

	setNavConPosEndDelta = function(leftDelta, doNotOverwrite) {

		if (!leftDelta)
			leftDelta = 0;

		// set end positions of event flag duration
		$.each(baseData.timeline, function(i, v) {
			if (doNotOverwrite) {
				baseData.timeline[i].endLeft += leftDelta;
			} else {
				baseData.timeline[i].endLeft = leftDelta;
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
	getNavEventEndPos = function(i) {

		return (baseData.timeline[i].initialEndLeft + baseData.timeline[i].endLeft);
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
			if (baseData.timeline[i].endTimestamp > baseData.timeline[i].startTimestamp) {
				baseElement.find(".jt-navigation-container[rel='"+i+"'] .jt-line-dot").css({
					width: parseInt(getNavEventEndPos(i)-getNavEventPos(i))
				});
			}
		});
	},

	// position of navigation containers by the year
	initNavConPos = function(initialZoom) {

		var
			yearArr = [],
			count = (baseElement.find(".jt-navigation-container").length - 1);
			navWrapWidth = navigationWidth - 190;
			baseElement.find(".jt-navigation-row").css("width", (navWrapWidth+190));

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
			var diffYear, leftYear;

			diffYear = baseData.years[(baseData.years.length-1)].timestamp-baseData.years[0].timestamp;
			leftYear = ( ( (baseData.years[i].timestamp-baseData.years[0].timestamp) * navigationWidth ) / diffYear ) + 50;
			baseData.years[i].initialLeft = leftYear * initialZoom;
			baseData.years[i].left = 0;
		});

		// set positions of event flags
		$.each(baseData.timeline, function(i, v) {
			var diff, left;

			diff = baseData.years[(baseData.years.length-1)].timestamp-baseData.timeline[0].startTimestamp;
			left = ( ( (baseData.timeline[i].startTimestamp-baseData.years[0].timestamp) * navigationWidth ) / diff ) + 50;
			baseData.timeline[i].initialLeft = left * initialZoom;
			baseData.timeline[i].left = 0;

			// set positions of navigation dot line
			if (baseData.timeline[i].endTimestamp) {
				diff = baseData.years[(baseData.years.length-1)].timestamp-baseData.timeline[0].endTimestamp;
				left = ( ( (baseData.timeline[i].endTimestamp-baseData.years[0].timestamp) * navigationWidth ) / diff ) + 50;
				baseData.timeline[i].initialEndLeft = left * initialZoom;
				baseData.timeline[i].endLeft = 0;
			}
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
					baseData.timeline[i].endLeft += ((baseData.timeline[i].endLeft + baseData.timeline[i].initialEndLeft) * 0.5);
				} else {
					baseData.timeline[i].left -= ((baseData.timeline[i].left + baseData.timeline[i].initialLeft) * 0.5);
					baseData.timeline[i].endLeft -= ((baseData.timeline[i].endLeft + baseData.timeline[i].initialEndLeft) * 0.5);
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
		setNavConPosEndDelta(deltaToMiddle+1, true);
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
		initNavConPos(baseData.config.zoom);
		initNavZoomButtons();

		setNavTopPos();

		// go to first element
		setEventFocus(baseElement.find(".jt-navigation-container[rel='0'] .jt-col"));

		$(window).resize(function() {
			if (!initInProgress) {
				initInProgress = true;
				setTimeout(function(){
					var currentElement = baseElement.find(".jt-navigation-container .active");

					wrapperWidth = baseElement.find(".jt-wrapper").width();
					navigationWidth = baseElement.find(".jt-navigation").width();
					initRowSize();
					initNavigationAnimation();
					initEventInteraction();
					initNavConPos(baseData.config.zoom);
					setEventFocus(currentElement);
					initInProgress = false;
				}, 500);
			}
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