#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <stdio.h>

#include <debug.h>
#include <jstring.h>

#include "sqlite_helper.h"

#define FROM 			"FROM"
#define WHERE 			"WHERE"
#define FIELD_SEPARATOR ", "

static debug_context_t* debug_ctx = NULL;

struct sql_statement_s
{
	const char* 	statement;
	const char** 	column_names;
	const char* 	table_name;
	const char* 	where_clause;
};

static void create_debug_ctx(void)
{
	if (!debug_ctx)
	{
		debug_ctx = debug_create_context("sqlite_helper");
	}
}

sql_statement_t* sqlite_helper_create_sql_statement(const char* 	statement,
													const char** 	column_names,
													const char* 	table_name,
													const char* 	where_clause)
{
	sql_statement_t* sql_statement = malloc(sizeof(sql_statement_t));
	if (!sql_statement)
		return NULL;

	sql_statement->statement    = statement;
	sql_statement->column_names = column_names;
	sql_statement->table_name        = table_name;
	sql_statement->where_clause = where_clause;

	return sql_statement;
}

const char* sqlite_helper_sql_statement_to_string(const sql_statement_t* sql_statement)
{
	size_t string_size           = 0;
	char*  statement_string      = NULL;
	const char** column_names    = NULL;
	char* formatted_column_names = NULL;

	create_debug_ctx();

	assert(sql_statement);
	if (!sql_statement)
		return NULL;

	string_size += strlen(sql_statement->statement);
	string_size += 1; /* space after SQL statement */

	column_names = sql_statement->column_names;
	while (*column_names)
	{
		/*
		 * + 2 to account for a comma and a space in the SQL statement
		 * when concatenating column names.
		 */
		string_size += strlen(*column_names);
		if (*(column_names + 1))
			string_size += strlen(FIELD_SEPARATOR);

		++column_names;
	}

	string_size += strlen(FROM) + 1; /* +1 for space after column names */
	string_size += strlen(sql_statement->table_name) + 1; /* +1 for space after FROM */

	if (sql_statement->where_clause)
	{
		string_size += strlen(WHERE) + 1; /* +1 for space after table's name */
		string_size += strlen(sql_statement->where_clause) + 1; /* +1 for space after "WHERE" */
	}

	++string_size; /* semi-colon at the end */
	++string_size; /* NULL character termination */

	debug(debug_ctx, "String size: %d\n", string_size);

	statement_string = malloc(string_size * sizeof(char));
	if (!statement_string)
		return NULL;

	formatted_column_names = jstr_join(sql_statement->column_names, ", ");
	if (!formatted_column_names)
		return NULL;

	debug(debug_ctx, "Formatted column_names: [%s]\n", formatted_column_names);

	if (sql_statement->where_clause)
	{
		snprintf(statement_string, string_size, "%s %s %s %s %s %s;",
				sql_statement->statement,
				formatted_column_names,
				FROM,
				sql_statement->table_name,
				WHERE,
				sql_statement->where_clause);
	}
	else
	{
		snprintf(statement_string, string_size, "%s %s %s %s;",
				sql_statement->statement,
				formatted_column_names,
				FROM,
				sql_statement->table_name);
	}

	debug(debug_ctx, "SQL statement string: [%s]\n", statement_string);

	if (formatted_column_names)
	{
		free(formatted_column_names);
		formatted_column_names = NULL;
	}

	return statement_string;
}