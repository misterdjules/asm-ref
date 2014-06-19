#ifndef SQLITE_HELPER_H_
#define SQLITE_HELPER_H_

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */
typedef struct sql_statement_s sql_statement_t;

sql_statement_t* sqlite_helper_create_sql_statement(const char* statement,
													const char** column_names,
													const char* table,
													const char* where_clause);

const char* sqlite_helper_sql_statement_to_string(const sql_statement_t* sql_statement);
#ifdef __cplusplus
}
#endif /* __cplusplus */

#endif /* SQLITE_HELPER_H_ */