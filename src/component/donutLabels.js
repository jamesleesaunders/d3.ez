import * as d3 from "d3";

/**
 * Reusable Donut Chart Label Component
 *
 * @module
 */
export default function() {

	/* Default Properties */
	let width = 300;
	let height = 300;
	let transition = { ease: d3.easeBounce, duration: 500 };
	let radius = 150;
	let innerRadius;
	let classed = "donutLabels";

	/**
	 * Initialise Data and Scales
	 *
	 * @private
	 * @param {Array} data - Chart data.
	 */
	function init(data) {
		// If the radius has not been passed then calculate it from width/height.
		radius = (typeof radius === "undefined") ?
			(Math.min(width, height) / 2) :
			radius;

		innerRadius = (typeof innerRadius === "undefined") ?
			(radius / 4) :
			innerRadius;
	}

	/**
	 * Constructor
	 *
	 * @constructor
	 * @alias donutLabels
	 * @param {d3.selection} selection - The chart holder D3 selection.
	 */
	function my(selection) {
		selection.each(function(data) {
			init(data);

			// Pie Generator
			let pie = d3.pie()
				.value(function(d) { return d.value; })
				.sort(null)
				.padAngle(0.015);

			// Arc Generator
			let arc = d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(radius)
				.cornerRadius(2);

			// Outer Arc Generator
			let outerArc = d3.arc()
				.innerRadius(radius * 0.9)
				.outerRadius(radius * 0.9);

			// Mid Angle
			let midAngle = function(d) {
				return d.startAngle + (d.endAngle - d.startAngle) / 2;
			};

			// Update series group
			let seriesGroup = d3.select(this);
			seriesGroup
				.classed(classed, true);

			// Text Labels
			let labelsGroupSelect = seriesGroup.selectAll("g.labels")
				.data(function(d) {
					return [d];
				});

			let labelsGroup = labelsGroupSelect.enter()
				.append("g")
				.attr("class", "labels")
				.merge(labelsGroupSelect);

			let labels = labelsGroup.selectAll("text.label")
				.data(function(d) {
					return pie(d.values);
				});

			labels.enter()
				.append("text")
				.attr("class", "label")
				.attr("dy", ".35em")
				.merge(labels)
				.transition()
				.duration(transition.duration)
				.text(function(d) {
					return d.data.key;
				})
				.attrTween("transform", function(d) {
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						let d2 = interpolate(t);
						let pos = outerArc.centroid(d2);
						pos[0] = radius * (midAngle(d2) < Math.PI ? 1.2 : -1.2);
						return "translate(" + pos + ")";
					};
				})
				.styleTween("text-anchor", function(d) {
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						let d2 = interpolate(t);
						return midAngle(d2) < Math.PI ? "start" : "end";
					};
				});

			labels.exit()
				.remove();

			// Text Label to Slice Connectors
			let connectorsGroupSelect = seriesGroup.selectAll("g.connectors")
				.data(function(d) {
					return [d];
				});

			let connectorsGroup = connectorsGroupSelect.enter()
				.append("g")
				.attr("class", "connectors")
				.merge(connectorsGroupSelect);

			let connectors = connectorsGroup.selectAll("polyline.connector")
				.data(function(d) {
					return pie(d.values);
				});

			connectors.enter()
				.append("polyline")
				.attr("class", "connector")
				.merge(connectors)
				.transition()
				.duration(transition.duration)
				.attrTween("points", function(d) {
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						let d2 = interpolate(t);
						let pos = outerArc.centroid(d2);
						pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1.2 : -1.2);
						return [arc.centroid(d2), outerArc.centroid(d2), pos];
					};
				});

			connectors.exit()
				.remove();
		});
	}

	/**
	 * Width Getter / Setter
	 *
	 * @param {number} _v - Width in px.
	 * @returns {*}
	 */
	my.width = function(_v) {
		if (!arguments.length) return width;
		width = _v;
		return this;
	};

	/**
	 * Height Getter / Setter
	 *
	 * @param {number} _v - Height in px.
	 * @returns {*}
	 */
	my.height = function(_v) {
		if (!arguments.length) return height;
		height = _v;
		return this;
	};

	/**
	 * Radius Getter / Setter
	 *
	 * @param {number} _v - Radius in px.
	 * @returns {*}
	 */
	my.radius = function(_v) {
		if (!arguments.length) return radius;
		radius = _v;
		return this;
	};

	/**
	 * Inner Radius Getter / Setter
	 *
	 * @param {number} _v - Inner radius in px.
	 * @returns {*}
	 */
	my.innerRadius = function(_v) {
		if (!arguments.length) return innerRadius;
		innerRadius = _v;
		return this;
	};

	return my;
}
