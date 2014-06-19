var instructions = [
	{
		mnemonic: "AAA",
		opcode: "37",
		synopsis: "ASCII Adjust After Addition",
		short_description: "Adjusts the sum of two unpacked BCD values to create an unpacked BCD result.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "AAD",
		opcode: "D5",
		synopsis: "SCII Adjust AX Before Division",
		short_description: "Adjusts two unpacked BCD digits (the least-significant digit in the AL register and the most-significantdigit in the AH register) so that adivision operation performed on the result will yield a correct unpacked BCD value. ",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "AAM",
		opcode: "D4",
		synopsis: "ASCII Adjust AX After Multiply",
		short_description: "Adjusts the result of the multiplication of two unpacked BCD values to create a pair of unpacked (base10) BCD values.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "ADD",
		opcode: "04",
		synopsis: "Add",
		short_description: "Adds the destination operand (first operand) and the source operand (second operand) and then stores the result in the destination operand.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "MOV",
		opcode: "88",
		synopsis: "Moves data from the second operand to the first operand.",
		short_description: "Copies the second operand (source operand) to the first operand (destination operand).",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "CALL",
		opcode: "E8",
		synopsis: "Calls a procedure.",
		short_description: "Saves procedure linking information on the stack and branches to the called procedure specified using the target operand.",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "RET",
		opcode: "C3",
		synopsis: "Returns from a procedure call.",
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