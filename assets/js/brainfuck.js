var brainfuck;

Util = {
	parse: {
		template: function(template, data) {
			return template.replace(/%(\w+)%/g, function (m, key) {
				return data.hasOwnProperty(key) ? data[key] + "" : "";
			});
		},
		highlight: function(str, pointer) {
			return (str.substring(0, pointer) + " " + str.charAt(pointer) + " " + str.substring(pointer + 1)).trim();
		}
	}
};

/**
 *
 * @param {int} size
 * @param {boolean} [gui]
 * @param {string} [mode]
 * @constructor
 */
BF = function(size, gui, mode) {
	var self = this;
	this.modes = ["wrap", "error"];
	this.default_mode = 0;

	this.options = {
		size: size,
		gui: typeof gui === "boolean" ? gui : false,
		mode: this.modes.indexOf(mode) !== -1 ? mode : this.modes[this.default_mode],
		on_finish: function() {}
	};

	this.pointer = 0;
	this.instruction_pointer = 0;
	this.in_pointer = 0;
	this.halt = false;

	this.array = (new Array(this.options.size)).fill(0);
	this.program = "";
	this.value = "";
	this.std_in = "";

	this.GUI = {
		elements: {
			template: "",
			$cells: null,
			$container: null,
			$current: null,
			$output: null,
			$input: null
		},
		initialize: function() {
			self.GUI.elements.template = $("#template_bf_column").html();
			self.GUI.elements.$container = $("#brainfuck_container");
			self.GUI.elements.$output = $("#output");
			self.GUI.elements.$input = $("#input");

			if (self.gui) {
				var html = "";
				for (var i = 0; i < self.options.size; i++) {
					html += Util.parse.template(self.GUI.elements.template, {
						number: i,
						value: 0,
						ascii: "" //String.fromCharCode(0)
					});
				}

				self.GUI.elements.$container.html(html);
				self.GUI.elements.$cells = self.GUI.elements.$container.children();
				self.GUI.pointer.point(self.GUI.elements.$cells.first());
			}
		},
		pointer: {
			increment: function() {
				if (!self.gui)
					return;

				if (!self.GUI.elements.$current.next().length && self.options.mode == self.modes[0])
					self.GUI.pointer.point(self.GUI.elements.$cells.first());

				else
					self.GUI.pointer.point(self.GUI.elements.$current.next());
			},
			decrement: function() {
				if (!self.gui)
					return;

				if (!self.GUI.elements.$current.prev().length && self.options.mode == self.modes[0])
					self.GUI.pointer.point(self.GUI.elements.$cells.last());

				else
					self.GUI.pointer.point(self.GUI.elements.$current.prev());
			},
			point: function($elem) {
				if (!self.gui)
					return;

				if (self.GUI.elements.$current)
					self.GUI.elements.$current.removeClass("pointed");

				self.GUI.elements.$current = $elem;
				self.GUI.elements.$current.addClass("pointed");
			}
		},
		value: {
			write: function(value) {
				if (!self.gui)
					return;

				self.GUI.elements.$current.find(".value").text(value);
				self.GUI.elements.$current.find(".ascii").text(String.fromCharCode(value));
			}
		},
		io: {
			write: function() {
				self.GUI.elements.$output.val(self.value);
			},
			read: function() {
				self.std_in = self.GUI.elements.$input.val();
			}
		},
		clear: function() {
			if (!self.gui)
				return;

			self.GUI.elements.$cells.find(".value").text("0");
			self.GUI.elements.$cells.find(".ascii").text("");
			self.GUI.pointer.point(self.GUI.elements.$cells.first());
			self.GUI.elements.$output.val("");
		}
	};

	this.initialize();

	return {
		clear: function() {
			self.array.fill(0);
			self.pointer = 0;
			self.instruction_pointer = 0;
			self.in_pointer = 0;
			self.program = "";
			self.value = "";
			self.std_in = "";
			self.halt = false;

			self.GUI.clear();
		},
		/**
		 * Parse entire brainfuck program.
		 * @param {string} input
		 * @returns {Array}
		 */
		parse: function(input) {
			this.clear();
			self.parse(input.replace(/[^><\+\-\[\]\.,]/g, ""));
		},
		/**
		 *
		 * @param {function} callback
		 */
		setCallback: function(callback) {
			self.options.on_finish = callback;
		}
	};
};

BF.prototype.initialize = function() {
	this.GUI.initialize();
};

BF.prototype.throwError = function(err_id, fatal) {
	fatal = typeof fatal === "boolean" ? fatal : false;

	if (fatal) {
		this.GUI.elements.$container.html("");
		brainfuck = null;
	}
	var error;

	switch (err_id) {
		case 0:
			error = "Index out of bounds exception. Instruction Number: " + self.instruction_pointer;
			break;
	}

	if (error)
		throw new Error("Error " + err_id + ": " + error)
};

BF.prototype.parse = function(input) {
	this.program = input;
	this.GUI.io.read();

	while (!this.halt && this.program.charAt(this.instruction_pointer) != "") {
		this.execute();
		this.instruction_pointer++;
	}

	this.options.on_finish();
};

BF.prototype.execute = function() {
	switch (this.program.charAt(this.instruction_pointer)) {
		case ">": this.incrementPointer();  break;
		case "<": this.decrementPointer();  break;
		case "+": this.incrementValue();    break;
		case "-": this.decrementValue();    break;
		case "[": this.jumpForward();       break;
		case "]": this.jumpBack();          break;
		case ".": this.write();             break;
		case ",": this.read();              break;
	}
};

BF.prototype.incrementPointer = function() {
	this.pointer++;

	if (this.options.mode == this.modes[1] && this.pointer >= this.options.size)
		this.throwError(0, true);

	this.GUI.pointer.increment();
};

BF.prototype.decrementPointer = function() {
	this.pointer--;

	if (this.options.mode == this.modes[1] && this.pointer < 0)
		this.throwError(0, true);

	this.GUI.pointer.decrement();
};

BF.prototype.incrementValue = function() {
	this.GUI.value.write(++(this.array[this.pointer]));
};

BF.prototype.decrementValue = function() {
	this.GUI.value.write(--(this.array[this.pointer]));
};

BF.prototype.jumpForward = function() {
	if (this.array[this.pointer] == 0) {
		var nest_count = 1;
		do {
			this.instruction_pointer++;

			nest_count += this.program.charAt(this.instruction_pointer) == "]" ? -1 :
			              this.program.charAt(this.instruction_pointer) == "[" ? 1 : 0;
		} while (nest_count != 0);
	}
};

BF.prototype.jumpBack = function() {
	if (this.array[this.pointer] != 0) {
		var nest_count = 1;
		do {
			this.instruction_pointer--;

			nest_count += this.program.charAt(this.instruction_pointer) == "[" ? -1 :
			              this.program.charAt(this.instruction_pointer) == "]" ? 1 : 0;
		} while (nest_count != 0);
	}
};

BF.prototype.write = function() {
	this.value += String.fromCharCode(this.array[this.pointer]);
	this.GUI.io.write();
};

BF.prototype.read = function() {
	if (this.in_pointer >= this.std_in.length) {
		this.halt = true;
		return;
	}

	this.array[this.pointer] = this.std_in.charCodeAt(this.in_pointer++);
	this.GUI.value.write(this.array[this.pointer]);
};



$(document).ready(function() {
	brainfuck = new BF(100);

	$("#brainfuck_run").click(function() {
		var $input = $("#input");
		var $elem = $(this).parent().addClass("running");
		$elem.find("textarea").prop("disabled", true);
		$input.prop("disabled", true);

		brainfuck.setCallback(function() {
			$elem.removeClass("running").find("textarea").prop("disabled", false);
			$input.prop("disabled", false);
		});

		brainfuck.parse($elem.find("textarea").val());
	});
});