include deps/mktools/show_make_rules.mk

lib_x86_ref := ./deps/libx86-ref
lib_debug   := ./deps/debug

include_dirs := $(lib_x86_ref)

sources := main.c
objects := $(subst .c,.o,$(sources))

CFLAGS += $(addprefix -I , $(include_dirs))
CFLAGS += -g -Wall -pedantic

LDFLAGS += -L$(lib_x86_ref) -Wl,--rpath,$(lib_x86_ref)

.PHONY: all $(lib_x86_ref) clean clean-asm-ref clean-tools clean_lib_x86_ref

all: asm-ref

asm-ref: $(lib_x86_ref) $(objects)
	$(CC) $(LDFLAGS) $(objects) -lx86ref -o $@

$(lib_x86_ref):
	$(MAKE) --directory=$@

main.o: main.c
	$(CC) $(CFLAGS) -c $< -o $@

clean: clean-asm-ref clean-tools clean_lib_x86_ref clean_debug

clean-asm-ref:
	rm -f *.o asm-ref

clean-tools:

clean_lib_x86_ref:
	$(MAKE) --directory=$(lib_x86_ref) clean

clean_debug:
	$(MAKE) --directory=$(lib_debug) clean
