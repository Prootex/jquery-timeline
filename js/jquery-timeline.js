(function($){

	$.fn.jqueryTimeline = function(data) {
		return this.each(function() {
			(new $.jqueryTimeline($(this), data));
		});
	};
	$.jqueryTimeline = function(element, data) {
		var structure = "<div class=\"heading\">"+data.timeline.headline+"</div> \
		<img src=\""+data.timeline.asset.media+"\" alt=\""+data.timeline.asset.caption+"\" />";
		element.html(structure);
	};

})(jQuery);