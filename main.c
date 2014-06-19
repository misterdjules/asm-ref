#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <intel_x86_ref.h>

#define X86_REF_DATABASE_PATH "./x86-ref.sqlite"

int main(int argc, char *argv[])
{
	ref_database_t* ref_db                 = x86_ref_open_database(X86_REF_DATABASE_PATH);
	instructions_list_t* instructions_list = NULL;
	instruction_t* instruction             = NULL;

	if (!ref_db)
	{
		fprintf(stderr, "Could not open x86 reference database, aborting\n");
		return EXIT_FAILURE;
	}

	instructions_list = x86_ref_get_all_instructions(ref_db);
	if (!instructions_list)
	{
		fprintf(stderr, "Couldn't list x86 instructions\n");
		return EXIT_FAILURE;
	}

	while ((instruction = x86_ref_next_instruction_from_list(&instructions_list)) != NULL)
	{
		fprintf(stdout, "Instruction: %s\n", x86_ref_get_instruction_mnemonic(instruction));
		fprintf(stdout, "OpCode: %s\n", x86_ref_get_instruction_opcode(instruction));
		fprintf(stdout, "Short desc: %s\n", x86_ref_get_instruction_short_desc(instruction));
	}

	instruction = x86_ref_get_instruction_by_mnemonic(ref_db, "ADD");
	if (instruction)
	{
		fprintf(stdout, "ADD short description: %s\n", x86_ref_get_instruction_short_desc(instruction));
		fprintf(stdout, "ADD synopsis: %s\n", x86_ref_get_instruction_synopsis(instruction));
	}

	if (x86_ref_close_database(&ref_db) != X86_REF_OK)
	{
		fprintf(stderr, "Couldn't close x86 ref database, reason: %s.\n", x86_ref_errmsg(ref_db));
		return EXIT_FAILURE;
	}

	return EXIT_SUCCESS;
}