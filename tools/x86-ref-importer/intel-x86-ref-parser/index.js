var instructions = [
	{
		mnemonic: "ADD",
		opcode: "37FA",
		short_description: "A short decription",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "MOV",
		opcode: "42FE",
		short_description: "A short decription",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "CALL",
		opcode: "21A6",
		short_description: "A short decription",
		long_description: "A long description",
		affected_flags: "AF, CF"
	},
	{
		mnemonic: "RET",
		opcode: "33",
		short_description: "A short decription",
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