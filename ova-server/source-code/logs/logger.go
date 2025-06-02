package logs

import (
	"log"
	"os"
	"sync"
)

var (
	loggers = make(map[string]*Logger)
	mu      sync.Mutex
)

type Logger struct {
	infoLogger *log.Logger
	warnLogger *log.Logger
	errLogger  *log.Logger
}

func (l *Logger) Info(format string, v ...interface{}) {
	l.infoLogger.Printf(format, v...)
}

func (l *Logger) Warn(format string, v ...interface{}) {
	l.warnLogger.Printf(format, v...)
}

func (l *Logger) Error(format string, v ...interface{}) {
	l.errLogger.Printf(format, v...)
}

func getLogger(LoggerName string) *Logger {
	mu.Lock()
	defer mu.Unlock()

	if logger, ok := loggers[LoggerName]; ok {
		return logger
	}

	logger := &Logger{
		infoLogger: log.New(os.Stdout, "Log"+LoggerName+": ", 0),
		warnLogger: log.New(os.Stdout, "[WARN] "+"Log"+LoggerName+": ", 0),
		errLogger:  log.New(os.Stdout, "[ERROR] "+"Log"+LoggerName+": ", 0),
	}

	loggers[LoggerName] = logger
	return logger
}

func Loggers(LoggerName string) *Logger {
	return getLogger(LoggerName)
}
