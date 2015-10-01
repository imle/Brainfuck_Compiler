Util = {
	parse: {
		template: function(template, data) {
			return template.replace(/%(\w+)%/g, function (m, key) {
				return data.hasOwnProperty(key) ? data[key] + "" : "";
			});
		}
	}
};

Brainfuck = {
	array_size: 120,
	initialize: function() {
		Brainfuck.GUI.initialize();
	},
	GUI: {
		elements: {
			template: "",
			$container: null
		},
		initialize: function() {
			Brainfuck.GUI.elements.template = $("#template_bf_column").html();

			Brainfuck.GUI.elements.$contianer = $("#brainfuck_container");

			var html = "";
			for (var i = 0; i < Brainfuck.array_size; i++) {
				html += Util.parse.template(Brainfuck.GUI.elements.template, {
					number: i
				});
			}

			Brainfuck.GUI.elements.$contianer.html(html);
		}
	}
};

$(document).ready(function() {
	Brainfuck.initialize();
});