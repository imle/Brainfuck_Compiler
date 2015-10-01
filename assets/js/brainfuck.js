Brainfuck = {
	initialize: function() {},
	GUI: {
		elements: {
			template: "",
			$container: null
		},
		initialize: function() {
			Brainfuck.GUI.elements.template = $("#template_bf_column").html();

			Brainfuck.GUI.elements.$contianer = $("#brainfuck_container");
		}
	}
};