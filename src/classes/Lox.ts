import {
    COMMAND_LINE_USAGE_ERROR_CODE,
    DATA_FORMAT_ERROR_CODE,
} from "../errors/errors";
import { Scanner } from "./Scanner/Scanner";

// biome-ignore lint/complexity/noStaticOnlyClass: thats what we want
export class Lox {
    static hadError = false;

    private static run(source: string) {
        // TODO: Yeah this creates a circular dependancy, Scanner imports Lox
        // Lox imports Scanner
        const scanner = new Scanner(source);

        const tokens = scanner.scanTokens();

        for (const token of tokens) {
            console.log(
                `Token: type ${token.type}, lexeme: ${token.lexeme}, literal ${token.literal}`,
            );
        }
    }

    static error(line: number, message: string) {
        Lox.report(line, "", message);
    }

    private static report(_line: number, _where: string, _message: string) {
        Lox.hadError = true;
    }

    private static runFile(path: string): void {
        const file = Bun.file(path);
        const fileBytes = file.bytes();
        Lox.run(String(fileBytes));

        if (Lox.hadError) {
            process.exit(DATA_FORMAT_ERROR_CODE);
        }
    }

    private static async runPrompt() {
        while (true) {
            const line = prompt("> ");

            if (line === null) {
                break;
            }

            Lox.run(line);
            Lox.hadError = false;
        }
    }

    // By default, Bun adds 2 arguments to the process.argv array, the first being the path to the Bun
    // executable and the second being the path to the script being executed. Therefore, if there
    // are more than 2 arguments, it means that the user has provided additional arguments, which is not allowed.
    // If there is exactly 2 arguments, it means that the user has provided a script to run.
    // If there is only 1 argument, it means that the user wants to run the REPL.
    static main() {
        const args = process.argv;
        if (args.length > 3) {
            process.stdout.write("Usage jlox [script]");
            process.exit(COMMAND_LINE_USAGE_ERROR_CODE);
        } else if (args.length === 3 && args[2]) {
            Lox.runFile(args[2]);
        } else {
            Lox.runPrompt();
        }
    }
}
