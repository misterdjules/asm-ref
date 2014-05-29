var instructions = [
	{
		mnemonic: "ADD",
		opcode: "04",
		short_description: "Adds the destination operand (first operand) and the source operand (second operand) and then stores the result in the destination operand.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "MOV",
		opcode: "88",
		short_description: "Copies the second operand (source operand) to the first operand (destination operand).",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "CALL",
		opcode: "E8",
		short_description: "Saves procedure linking information on the stack and branches to the called procedure specified using the target operand.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "RET",
		opcode: "C3",
		short_description: "Transfers program control to a return address located on th e top of the stack.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	}
];

module.exports = {
	parse: function parse(filePath, callback) {
		instructions.forEach(function(instruction) {
			callback(instruction);
		});
	}
}