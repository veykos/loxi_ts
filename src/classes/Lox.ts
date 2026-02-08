import {
    COMMAND_LINE_USAGE_ERROR_CODE,
    DATA_FORMAT_ERROR_CODE,
} from "../errors/errors";

export class Lox {
    static hadError = false;

    private run(source: string) {
        // Here we actually need a Scanner class, this is abysmal
        // oversimplification
        const tokens = source.split(" ");
        for (const token of tokens) {
            process.stdout.write(token);
        }
    }

    static error(line: number, message: string) {
        Lox.report(line, "", message);
    }

    private static report(line: number, where: string, message: string) {
        console.error(`[${line} line] Error ${where} : ${message}`);

        Lox.hadError = true;
    }

    private runFile(path: string): void {
        const file = Bun.file(path);
        const fileBytes = file.bytes();
        this.run(String(fileBytes));

        if (Lox.hadError) {
            process.exit(DATA_FORMAT_ERROR_CODE);
        }
    }

    private async runPrompt() {
        while (true) {
            const line = prompt("> ");

            if (line === null) {
                break;
            }

            this.run(line);
            Lox.hadError = false;
        }
    }

    main() {
        const args = Bun.argv;
        if (args.length > 1) {
            process.stdout.write("Usage jlox [script]");
            process.exit(COMMAND_LINE_USAGE_ERROR_CODE);
        } else if (args.length === 1 && args[0]) {
            this.runFile(args[0]);
        } else {
            this.runPrompt();
        }
    }
}
