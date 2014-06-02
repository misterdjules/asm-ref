ifdef SHOW_MAKE_RULES
	OLD_SHELL := $(SHELL)
	SHELL = $(warning [$@ ($^)($?)])$(OLD_SHELL)
endif # SHOW_MAKE_RULES
