//brainfuck = new BF(100);
//
//bf.setCallback(function(output) {
//	console.log(output);
//});
//
//var test_input = "++++[>+++++<-]>[<+++++>-]+<+[ >[>+>+<<-]++>>[<<+>>-]>>>[-]++>[-]+ >>>+[[-]++++++>>>]<<<[[<++++++++<++>>-]+<.<[>----<-]<] <<[>>>>>[>>>[-]+++++++++<[>-<-]+++++++++>[-[<->-]+[<<<]]<[>+<-]>]<<-]<<- ] [Outputs square numbers from 0 to 10000. Daniel B Cristofani (cristofdathevanetdotcom) http://www.hevanet.com/cristofd/brainfuck/]";
//
//bf.interpret(test_input);



$(document).ready(function() {
	bf = new BF(100);

	$("#brainfuck_run").click(function() {
		var $input = $("#input");
		var $output = $("#output");
		var $elem = $(this).parent().addClass("running");
		$elem.find("textarea").prop("disabled", true);
		$input.prop("disabled", true);

		brainfuck.setCallback(function(output) {
			$elem.removeClass("running").find("textarea").prop("disabled", false);
			$input.prop("disabled", false);
			$output.val(output);
		});

		brainfuck.interpret($elem.find("textarea").val());
	});
});