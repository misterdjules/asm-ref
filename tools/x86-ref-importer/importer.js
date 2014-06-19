var sqlite3           = require('sqlite3');
var db                = new sqlite3.Database('x86-ref.sqlite');
var intelX86RefParser = require('./intel-x86-ref-parser');

db.serialize(function() {
	db.run('CREATE TABLE instructions( ' 	+
		   'mnemonic TEXT PRIMARY KEY, ' 	+
		   'opcode TEXT, ' 					+
		   'synopsis TEXT, ' 				+
		   'short_description TEXT, ' 		+
		   'long_description TEXT, ' 		+
		   'affected_flags TEXT)');

	var addInstructionStatement = db.prepare('INSERT INTO instructions VALUES (?, ?, ?, ?, ?, ?)');

	intelX86RefParser.parse('x86.txt', function(instructionObject) {
		var mnemonic          = instructionObject.mnemonic;
		var opcode            = instructionObject.opcode;
		var synopsis		  = instructionObject.synopsis;
		var short_description = instructionObject.short_description;
		var long_description  = instructionObject.long_description;
		var affected_flags    = instructionObject.affected_flags;

		addInstructionStatement.run(mnemonic,
									opcode,
									synopsis,
									short_description,
									long_description,
									affected_flags);
	});
	addInstructionStatement.finalize();

	db.each("SELECT mnemonic FROM instructions", function(err, row) {
		console.log("mnemonic: " + row.mnemonic);
	});
});