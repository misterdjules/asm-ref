#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <sqlite3.h>

#define X86_REF_DATABASE_PATH "./x86-ref.sqlite"
#define SELECT_MNEMONIC_FROM_INSTRUCTIONS "SELECT mnemonic FROM instructions"

int main(int argc, char *argv[])
{
	sqlite3* db        = NULL;
	int rc             = -1;
	sqlite3_stmt* stmt = NULL;

	rc = sqlite3_open("x86.sqlite", &db);
	if (rc != SQLITE_OK)
	{
		fprintf(stderr, "Could not open database at path [%s], reason: %s\n", 
				X86_REF_DATABASE_PATH,
				sqlite3_errmsg(db));
		sqlite3_close(db);
		return EXIT_FAILURE;
	}

	rc = sqlite3_prepare_v2(db,
						 	SELECT_MNEMONIC_FROM_INSTRUCTIONS,
						 	strlen(SELECT_MNEMONIC_FROM_INSTRUCTIONS),
						 	&stmt,
						 	NULL);
	if (rc != SQLITE_OK)
	{
		fprintf(stderr, "Could not prepare statement [%s], reason: %s\n",
				SELECT_MNEMONIC_FROM_INSTRUCTIONS,
				sqlite3_errmsg(db));
		sqlite3_close(db);
		return EXIT_FAILURE;
	}

	while ((rc = sqlite3_step(stmt)) == SQLITE_ROW)
	{
		fprintf(stdout, "MNEMONIC: %s\n", sqlite3_column_text(stmt, 0));
	}

	if (rc != SQLITE_DONE)
	{
		fprintf(stderr, "Could not execute statement, reason: %s\n", sqlite3_errmsg(db));
		sqlite3_close(db);
		return EXIT_FAILURE;
	}

	return EXIT_SUCCESS;
}