var LineStream = require('line-stream');
var fs         = require('fs');
var debug      = require('debug')('x86-ref-parser:debug');
var trace      = require('debug')('x86-ref-parser:trace');

var assert     = require('assert');

var instructions       = {};

var INSTRUCTION_HEADER_MARKER    = /^[A-Z\/]+\s?\u0097\s?[^\s]+/;
var INSTRUCTION_HEADER_SEPARATOR = '\u0097';

var DESCRIPTION_HEADER    = /^Description$/;
var FLAGS_AFFECTED_HEADER = /^Flags Affected$/;
var OPERATION_HEADER      = /^Operation$/;

var PARSING_DESCRIPTION_STATE    = 'description_state';
var PARSING_INSTRUCTION_STATE    = 'instruction_state';
var PARSING_AFFECTED_FLAGS_STATE = 'affected_flags_state';
var PARSING_OPERATION_STATE      = 'operation_state';

var stateToKeyName = {};
stateToKeyName[PARSING_DESCRIPTION_STATE]    = 'description';
stateToKeyName[PARSING_OPERATION_STATE]      = 'operation';
stateToKeyName[PARSING_AFFECTED_FLAGS_STATE] = 'affectedFlags';

function parse(filePath, callback) {
	var fileStream    = fs.createReadStream(filePath);
	var lineStream    = new LineStream();

	var lineStreamEnd = false;
	var parsingChunks = false;

	var instructions = [];
	var parserState = [];

	lineStream.on('end', function () {
		debug('Got end on lineStream, parsing done!');

		callback(null, instructions);
	});

	lineStream.on('error', function (err) {
		debug('Got error on lineStream, parsing done:', err);

		callback(err);
	})

	lineStream.on('readable', function () {
		trace('readable emitted, calling doParse...');

		doParse(lineStream, instructions, parserState);
	});

	fileStream.pipe(lineStream)
}

function doParse(lineStream, instructions, parserState) {
	var chunk, mnemonicAndSynopsis, mnemonic, synopsis;

	while ((chunk = lineStream.read()) !== null) {
		trace('Chunk:', chunk);
		lineStr = chunk.toString();

		if (startsAffectedFlags(lineStr)) {
			trace('Detected start of affected flags!');
			trace('Parser state:, ', parserState);

			popParserState(parserState);
			parserState.push({state: PARSING_AFFECTED_FLAGS_STATE, string: ''});
			continue;
		}

		if (startsOperation(lineStr)) {
			trace('Detected start of operation!');
			trace('Parser state:, ', parserState);

			popParserState(parserState);
			parserState.push({state: PARSING_OPERATION_STATE, string: ''});
			continue;
		}

		if (startsDescription(lineStr)) {
			trace('Detected start of description!');
			trace('Parser state:', parserState);

			popParserState(parserState);
			parserState.push({state: PARSING_DESCRIPTION_STATE, string: ''});
			continue;
		}

		if (mnemonicAndSynopsis = startsNewInstruction(lineStr, parserState)) {
			trace('Detected start of new instruction!');
			trace('Parser state:', parserState);

			if (isParsingInstruction(parserState)) {
				popParserState(parserState);
				createInstructions(parserState.pop()).forEach(function (instruction) {
					instructions.push(instruction);
				});
			}

			parserState.push({
				state 	: PARSING_INSTRUCTION_STATE,
				mnemonic: mnemonicAndSynopsis[0],
				synopsis: mnemonicAndSynopsis[1]
			});
			continue;
		}

		if (isParsingInstruction(parserState)) {
			trace('Adding string to current parserState:', lineStr);
			trace('Parser state:', parserState);

			if (parserState[1].string && parserState[1].string.length) {
				parserState[1].string += ' ' + lineStr;
			} else {
				parserState[1].string += lineStr;
			}
		}
	}
}

function popParserState(parserState) {
	var currentParserState, keyName;

	if (parserState && parserState.length === 2) {
		currentParserState = parserState.pop();
		keyName = stateToKeyName[currentParserState.state];
		if (keyName) {
			parserState[0][keyName] = currentParserState.string;
		}
	}
}

function createInstructions(instructionParserState) {
	trace('Creating instruction [%s]:', instructionParserState.mnemonic);
	trace('Parser state:', instructionParserState);

	instructions = [];

	// If the parserState does contain any description,
	// it probably is a genuine instruction, not a false positive.
	if (instructionParserState.description) {
		instructionParserState.mnemonic.split('/').forEach(function (mnemonic) {
			instructions.push({
				mnemonic 		: mnemonic,
				synopsis 		: instructionParserState.synopsis,
				description 	: instructionParserState.description,
				affectedFlags 	: instructionParserState.affectedFlags,
				operation 		: instructionParserState.operation
			});
		});
	}

	return instructions;
}

function startsNewInstruction(str, parserState) {
	var mnemonicAndSynopsis;
	if (INSTRUCTION_HEADER_MARKER.test(str)) {
		mnemonicAndSynopsis = str.split(INSTRUCTION_HEADER_SEPARATOR);
		mnemonicAndSynopsis = mnemonicAndSynopsis.map(function (str) {
			return str.trim();
		})

		if (parserState.length == 0 ||
			(parserState[0].mnemonic !==  mnemonicAndSynopsis[0])) {
			return mnemonicAndSynopsis;
		}
	}
}

function startsDescription(str) {
	return DESCRIPTION_HEADER.test(str);
}

function startsOperation(str) {
	return OPERATION_HEADER.test(str);
}

function startsAffectedFlags(str) {
	return FLAGS_AFFECTED_HEADER.test(str);
}

function isParsingInstruction(parserState) {
	return 	parserState &&
			parserState.length > 1;
}

module.exports = {
	parse: parse
}