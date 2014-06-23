var LineStream = require('line-stream');
var fs         = require('fs');
var debug	   = require('debug')('x86-ref-parser');

var instructions       = {};

var INSTRUCTION_HEADER_MARKER = /^[^\s]+\u0097[^\s]+/;
var INSTRUCTION_HEADER_SEPARATOR = '\u0097';

var DESCRIPTION_HEADER = /^Description$/;
var FLAGS_AFFECTED_HEADER = /^Flags Affected$/;

function parse(filePath, callback) {
	var fileStream = fs.createReadStream(filePath);
	var lineStream = new LineStream();
	var mnemonicAndSynopsis = null;
	var menmonic, synopsis;
	var chunk;
	var lineStr = null;

	var parsingDescription    = false;
	var parsingNewInstruction = false;
	var parsingFlagsAffected  = false;

	var currentInstructionMnemonic      = null;
	var currentInstructionSynopsis      = null;
	var currentInstructionDescription   = '';
	var currentInstructionFlagsAffected = '';

	lineStream.on('data', function (chunk) {
		line = chunk.toString();
		if (parsingNewInstruction) {
			if (parsingDescription) {
				if (line.length === 0) {
					instructions[currentInstructionMnemonic].description = currentInstructionDescription;
					parsingDescription = false;
				} else {
					currentInstructionDescription += ' ' + line;
				}
			} else if (parsingFlagsAffected) {
				if (line.length === 0) {
					instructions[currentInstructionMnemonic].affectedFlags = currentInstructionFlagsAffected;
					parsingFlagsAffected = false;
				} else {
					currentInstructionFlagsAffected += '' + line;
				}
			} else if (DESCRIPTION_HEADER.test(line)) {
				parsingDescription = true;
				currentInstructionDescription = '';
			} else if (FLAGS_AFFECTED_HEADER.test(line)) {
				parsingFlagsAffected = true;
				currentInstructionFlagsAffected = '';
			} else if (INSTRUCTION_HEADER_MARKER.test(line)) {
				parsingNewInstruction = false;
				lineStream.unshift(chunk);
			}
		} else {
			if (INSTRUCTION_HEADER_MARKER.test(line)) {
				mnemonicAndSynopsis = line.split(INSTRUCTION_HEADER_SEPARATOR);
				currentInstructionMnemonic = mnemonicAndSynopsis[0];
				currentInstructionSynopsis = mnemonicAndSynopsis[1];

				if (!instructions[currentInstructionMnemonic]) {
					instructions[currentInstructionMnemonic] = { 'synopsis' : currentInstructionSynopsis }
					debug("Mnemonic: %s, synopsis: %s",
						  currentInstructionMnemonic,
						  currentInstructionSynopsis);
					parsingNewInstruction = true;
				}

			}
		}
	});

	lineStream.on('end', function () {
		callback(null, instructions);
	});

	lineStream.on('error', function (err) {
		callback(err);
	})

	fileStream.pipe(lineStream)
}

module.exports = {
	parse: parse
}