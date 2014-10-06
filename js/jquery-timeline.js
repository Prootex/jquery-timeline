(function($){

	var containerCount = $("#jquery-timeline > .wrapper > .row > .container").length,
		rowWidth = ((containerCount)*($("#jquery-timeline > .wrapper > .row > .container").width()));

	(containerCount == 1)?rowWidth = "100%":"";


	$.fn.jqueryTimeline = function(data) {
		return this.each(function() {
			(new $.jqueryTimeline($(this), data));
		});
	};

	$.jqueryTimeline = function(element, data) {

		element.find(".wrapper > .row").css({"width": rowWidth});
		// element.html(structure);
	};

})(jQuery);