all: asm-ref

asm-ref: main.o
	$(CC) $< -lsqlite3 -o $@

main.o: main.c
	$(CC) -c $< -o $@

clean: clean-asm-ref clean-tools

clean-asm-ref:
	rm -f *.o asm-ref

clean-tools:

