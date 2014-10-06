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
			rowWidth = ((containerCount)*(element.find(".container").width()) + 10000),
			wrapperWidth = element.find(".wrapper").width();


		/* several changes to the sizes */
		rowWidth = (containerCount == 1)?"100%":rowWidth;
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
	};

})(jQuery);