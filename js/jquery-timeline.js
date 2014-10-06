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
			leftPosition = parseInt(element.find(".row").css("left"));

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
		element.find(".icon-arrow").click(function() {
			if ($(this).attr("id") == "left" && $(this).css("left") != "0px") {
				console.log("left click");
				element.find(".row").animate({
					left: (leftPosition-wrapperWidth)
				}, animationSpeed);
				magicButtons();
			}
			else if ($(this).attr("id") == "right" && $(this).css("left") != (rowWidth-wrapperWidth)) {
				console.log("right click");
				element.find(".row").animate({
					left: -(leftPosition+wrapperWidth)
				}, animationSpeed);
				magicButtons();
			}
		});

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
	};

})(jQuery);