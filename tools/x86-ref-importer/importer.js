var sqlite3           = require('sqlite3');
var db                = null;
var intelX86RefParser = require('./intel-x86-ref-parser');
var async			  = require('async');
var child_process     = require('child_process');
var debug			  = require('debug')('x86_ref_importer');

var DROP_INSTRUCTIONS_TABLE = 'DROP TABLE IF EXISTS instructions;';
var X86_REF_PDF_FILE_PATH   = './x86.pdf'
var X86_REF_TXT_FILE_PATH   = './x86.txt'

console.log('Importing...');

async.waterfall([
	function removeOldX86TxtRef(callback) {
		var rm;

		console.log('Removing old x86 text reference...');

		rm = child_process.spawn('rm', ['-f', X86_REF_TXT_FILE_PATH]);
		rm.on('close', function (exitCode) {
			if (exitCode !== 0) {
				return callback(exitCode);
			} else {
				return callback();
			}
		});
	},
	function x86RefPdfToText(callback) {
		var pdfToText;

		console.log('Converting current x86 PDF ref to txt for easier parsing...');

		pdfToText = child_process.spawn('pdftotext', [X86_REF_PDF_FILE_PATH]);
		pdfToText.on('close', function (exitCode) {
			if (exitCode !== 0) {
				return callback(exitCode);
			} else {
				return callback();
			}
		});
	},
	function openDatabase(callback) {
		console.log('Opening database...');
		db = new sqlite3.Database('x86-ref.sqlite', callback);

		if (db) {
			db.on('trace', function (sqlStatement) {
				debug('SQL statement: ', sqlStatement);
			});
		}
	},
	function dropTable(callback) {
		console.log('Dropping existing instructions table...');
		db.run(DROP_INSTRUCTIONS_TABLE, callback);
	},
	function createTable(callback) {
		console.log('Creating new instructions table...');
		db.run('CREATE TABLE instructions( ' 	+
			   'mnemonic TEXT PRIMARY KEY, ' 	+
			   'opcode TEXT, ' 					+
			   'synopsis TEXT, ' 				+
			   'short_description TEXT, ' 		+
			   'long_description TEXT, ' 		+
			   'affected_flags TEXT)', callback);
	},
	function parseX86RefDoc(callback) {
		console.log('Parsing x86 reference documentation...');
		intelX86RefParser.parse('x86.txt', function(err, instructions) {
			return callback(err, instructions);
		});
	},
	function insertData(instructions, callback) {
		console.log('Inserting new data...');

		insertErrors = [];
		var addInstructionStatement = db.prepare('INSERT INTO instructions VALUES (?, ?, ?, ?, ?, ?)');

		async.eachSeries(Object.keys(instructions), function (mnemonic, mnemonicDone) {
			var opcode, synopsis, longDescription, shortDescription,
				affectedFlags;

			opcode           = instructions[mnemonic].opcode || '';
			synopsis		 = instructions[mnemonic].synopsis;
			longDescription  = instructions[mnemonic].description;

			if (longDescription) {
				shortDescription = longDescription.split('.')[0] + '.';
			}

			affectedFlags = instructions[mnemonic].affectedFlags;

			async.eachSeries(mnemonic.split('/'), function (actualMnemonic, actualMnemonicDone) {
				if (actualMnemonic.length > 0) {
					debug('Adding menmonic: ', actualMnemonic);
					addInstructionStatement.run(actualMnemonic,
												opcode,
												synopsis,
												shortDescription,
												longDescription,
												affectedFlags,
												function (err) {
													if (err) {
														insertErrors.push({ mnemonic: actualMnemonic, reason: err});
													}

													actualMnemonicDone();
												});
				} else {
					actualMnemonicDone();
				}
			}, function (err) {
				mnemonicDone();
			});
		}, function (err) {
			callback(null, insertErrors);
		});
	},
	function reportInsertErrors(insertErrors, callback) {
		if (insertErrors) {
			if (insertErrors.length > 0) {
				console.log('WARNING: there were some errors when inserting data.');
				insertErrors.forEach(function (error) {
					console.log("Could not insert instruction with mnemonic [%s], reason: ",
								error.mnemonic,
								error.reason);
				});
			}
		}
		callback();
	},
	function cleanup(callback) {
		var rm;

		rm = child_process.spawn('rm', ['-f', X86_REF_TXT_FILE_PATH]);
		rm.on('close', function (exitCode) {
			callback(exitCode === 0 ? null : exitCode);
		});
	}], function (err, results) {
		if (!err) {
			console.log('Import done!');
		} else {
			console.log('An error occured when importing: %s', err);
		}
	});
