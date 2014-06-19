include ../../mktools/show_make_rules.mk

lib_sqlite_helper_dyn_shared := libsqlitehelper.so
lib_sqlite_helper_static 	 := libsqlitehelper.a

sources := sqlite_helper.c
objects := $(subst .c,.o,$(sources))

lib_debug_dir 		:= ../debug
libdebug_static_lib := $(lib_debug_dir)/libdebug.a
libdebug_objects    := $(wildcard $(lib_debug_dir)/*.o)

lib_jstring_dir 		:= ../jstring
libjstring_static_lib 	:= $(lib_jstring_dir)/libjstring.a
libjstring_objects 		:= $(wildcard $(lib_jstring_dir)/*.o)

include_dirs := ./ $(lib_debug_dir) $(lib_jstring_dir)

CFLAGS  += $(addprefix -I, $(include_dirs))
CFLAGS  += -fPIC
CFLAGS  += -g -Wall -pedantic

LDFLAGS += -shared
#LDFLAGS += -L$(lib_debug_dir) $(libdebug_static_lib)
#LDFLAGS += -L$(lib_jstring_dir) $(libjstring_static_lib)

RANLIB := ranlib

.PHONY: all clean test

all: dyn_shared_lib static_lib
dyn_shared_lib: $(lib_sqlite_helper_dyn_shared)
static_lib: $(lib_sqlite_helper_static)

$(lib_sqlite_helper_dyn_shared): $(objects)
	$(CC) $^ $(LDFLAGS) -o $@

$(lib_sqlite_helper_static): $(objects)
	$(RM) $@
	$(AR) $(ARFLAGS) $@ $^
	$(RANLIB) $@

%.o: %.c sqlite_helper.h
	$(CC) -c $(CFLAGS) -o $@ $<

test:
	$(MAKE) --directory=$@

clean:
	$(RM) $(lib_sqlite_helper_dyn_shared) $(lib_sqlite_helper_static) $(objects)
