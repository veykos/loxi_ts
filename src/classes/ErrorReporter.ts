// Later can be used
export class LoxSyntaxError extends Error {
    override name = "SyntaxError";
    override message: string;
    line?: number;
    where?: string;

    constructor(message: string, line?: number, where?: string) {
        super();
        this.message = message;
        this.line = line;
        this.where = where;
    }
}

class ErrorReporter {
    hadCliError = false;
    hadRuntimeError = false;
    hadSyntaxError = false;

    // For now no need to overcomplicate
    hadGeneralError = false;
    report(error: Error) {
        if (error instanceof LoxSyntaxError) {
            this.hadSyntaxError = true;
            console.error(
                `[${error.line}] Error ${error.where} : ${error.message}`,
            );
        }
    }
}

export const errorReporter = new ErrorReporter();
