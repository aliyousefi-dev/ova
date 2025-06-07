package logs

import (
	"fmt"
	"log"
	"os"
	"sync"
)

var (
	loggers = make(map[string]*Logger)
	mu      sync.Mutex
)

type Logger struct {
	name       string
	infoLogger *log.Logger
	warnLogger *log.Logger
	errLogger  *log.Logger
}

// Info logs an informational message.
func (l *Logger) Info(format string, v ...interface{}) {
	l.infoLogger.Printf("[INFO] [%s] %s", l.name, fmt.Sprintf(format, v...))
}

// Warn logs a warning message.
func (l *Logger) Warn(format string, v ...interface{}) {
	l.warnLogger.Printf("[WARN] [%s] %s", l.name, fmt.Sprintf(format, v...))
}

// Error logs an error message.
func (l *Logger) Error(format string, v ...interface{}) {
	l.errLogger.Printf("[ERROR] [%s] %s", l.name, fmt.Sprintf(format, v...))
}

// newLogger creates a logger with timestamp-first formatting.
func newLogger(loggerName string) *Logger {
	flags := log.LstdFlags // adds timestamp (date and time)
	return &Logger{
		name:       loggerName,
		infoLogger: log.New(os.Stdout, "", flags),
		warnLogger: log.New(os.Stdout, "", flags),
		errLogger:  log.New(os.Stdout, "", flags),
	}
}

// getLogger returns a singleton logger for the given name.
func getLogger(loggerName string) *Logger {
	mu.Lock()
	defer mu.Unlock()

	if logger, exists := loggers[loggerName]; exists {
		return logger
	}

	logger := newLogger(loggerName)
	loggers[loggerName] = logger
	return logger
}

// Loggers returns a named logger instance (singleton per name).
func Loggers(loggerName string) *Logger {
	return getLogger(loggerName)
}
