var brainfuck;

Util = {
	parse: {
		template: function(template, data) {
			return template.replace(/%(\w+)%/g, function (m, key) {
				return data.hasOwnProperty(key) ? data[key] + "" : "";
			});
		}
	}
};

BF = function(size, mode) {
	var self = this;
	this.modes = ["wrap", "error"];
	this.default_mode = 0;

	this.options = {
		size: size,
		mode: this.modes.indexOf(mode) !== false ? mode : this.modes[this.default_mode]
	};

	this.array = new Array(this.options.size);

	this.GUI = {
		elements: {
			template: "",
			$cells: [],
			$container: null,
			$current: null
		},
		initialize: function() {
			self.GUI.elements.template = $("#template_bf_column").html();

			self.GUI.elements.$contianer = $("#brainfuck_container");

			var html = "";
			for (var i = 0; i < self.options.size; i++) {
				html += Util.parse.template(self.GUI.elements.template, {
					number: i
				});
			}

			self.GUI.elements.$contianer.html(html);
			self.GUI.elements.$cells = self.GUI.elements.$contianer.children();
			self.GUI.pointer.point(self.GUI.elements.$cells.first());
		},
		pointer: {
			increment: function() {
				self.GUI.pointer.point(
						self.GUI.elements.$current.next().length
								? self.GUI.elements.$current.next()
								: self.GUI.elements.$cells.first()
				);
			},
			decrement: function() {
				self.GUI.pointer.point(
						self.GUI.elements.$current.prev().length
								? self.GUI.elements.$current.prev()
								: self.GUI.elements.$cells.last()
				);
			},
			point: function($elem) {
				if (self.GUI.elements.$current)
					self.GUI.elements.$current.removeClass("pointed");

				self.GUI.elements.$current = $elem;
				self.GUI.elements.$current.addClass("pointed");
			}
		},
		value: {
			increment: function() {},
			decrement: function() {},
			read: function() {},
			write: function() {}
		}
	};
};

BF.prototype.initialize = function() {
	this.GUI.initialize();
};

BF.prototype.parse = function() {

};

$(document).ready(function() {
	brainfuck = new BF(256, "wrap");
});