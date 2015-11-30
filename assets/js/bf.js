/**
 *
 * @param {int} size
 * @param {string} [mode]
 * @constructor
 */
BF = function(size, mode) {
	var self = this;
	this.modes = ["wrap", "error"];
	this.default_mode = 0;

	this.options = {
		size: size,
		mode: this.modes.indexOf(mode) !== -1 ? mode : this.modes[this.default_mode]
	};

	this.pointer = 0;
	this.instruction_pointer = 0;
	this.in_pointer = 0;

	this.array = (new Array(this.options.size)).fill(0);
	this.program = "";
	this.std_out = [];
	this.std_in = [];

	return {
		/**
		 * Parse entire bf program.
		 * @param {string} program
		 * @param {string} input
		 * @returns {Array}
		 */
		interpret: function(program, input) {
			self.clear();
			self.interpret(program.replace(/[^><\+\-\[\]\.,]/g, ""), input || []);
			return self.std_out;
		}
	};
};

BF.prototype.clear = function() {
	this.array.fill(0);
	this.pointer = 0;
	this.instruction_pointer = 0;
	this.in_pointer = 0;
	this.program = "";
	this.std_out = [];
	this.std_in = [];
};

BF.prototype.throwError = function(err_id, fatal) {
	fatal = typeof fatal === "boolean" ? fatal : false;

	if (fatal)
		bf = null;

	var error;

	switch (err_id) {
		case 0:
			error = "Index out of bounds exception. Instruction Number: " + self.instruction_pointer;
			break;
		case 1:
			error = "Input was asked for and none was found. Instruction Number: " + self.instruction_pointer;
			break;
	}

	if (error)
		throw new Error("Error " + err_id + ": " + error)
};

BF.prototype.interpret = function(program, input) {
	this.program = program;

	this.std_in = input;

	while (this.program.charAt(this.instruction_pointer) != "") {
		this.execute();
		this.instruction_pointer++;
	}
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
};

BF.prototype.decrementPointer = function() {
	this.pointer--;

	if (this.options.mode == this.modes[1] && this.pointer < 0)
		this.throwError(0, true);
};

BF.prototype.incrementValue = function() {
	(this.array[this.pointer])++;
};

BF.prototype.decrementValue = function() {
	(this.array[this.pointer])--;
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
	this.std_out.push(this.array[this.pointer]);
};

BF.prototype.read = function() {
	if (this.in_pointer >= this.std_in.length)
		this.throwError(1, true);

	this.array[this.pointer] = this.std_in[this.in_pointer++];
};

var bf = new BF(30000);

/**
 * I believe that uncommenting this should make it work in node.js.
 * However, I do not have node installed on my computer and am unable to test that.
 */
//module.exports = {
//	interpret: function(src, inp) {
//		return bf.interpret(src, inp);
//	}
//};