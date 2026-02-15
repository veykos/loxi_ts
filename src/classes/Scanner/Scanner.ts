import { TOKENS } from "../../constants/scanner.constants";
import type { TokenType } from "../../types/scanner.types";
import { Lox } from "../Lox";
import type { Literal } from "../Token";
import { Token } from "../Token";

export class Scanner {
    source: string;
    tokens: Array<Token> = [];
    keywords: Map<string, TokenType> = new Map([
        [
            "and",
            TOKENS.And,
        ],
        [
            "class",
            TOKENS.Class,
        ],
        [
            "else",
            TOKENS.Else,
        ],
        [
            "false",
            TOKENS.False,
        ],
        [
            "for",
            TOKENS.For,
        ],
        [
            "fun",
            TOKENS.Fun,
        ],
        [
            "if",
            TOKENS.If,
        ],
        [
            "nil",
            TOKENS.Nil,
        ],
        [
            "or",
            TOKENS.Or,
        ],
        [
            "print",
            TOKENS.Print,
        ],
        [
            "return",
            TOKENS.Return,
        ],
        [
            "super",
            TOKENS.Super,
        ],
        [
            "this",
            TOKENS.This,
        ],
        [
            "true",
            TOKENS.True,
        ],
        [
            "var",
            TOKENS.Var,
        ],
        [
            "while",
            TOKENS.While,
        ],
    ]);

    private start = 0;
    private current = 0;
    private line = 1;

    constructor(source: string) {
        this.source = source;
    }

    private isAtEnd() {
        return this.current >= this.source.length;
    }

    scanTokens(): Array<Token> {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TOKENS.EOF, "", null, this.line));

        return this.tokens;
    }

    private scanToken() {
        const char = this.advance();

        switch (char) {
            case "(":
                this.addToken(TOKENS.LeftParen);
                break;
            case ")":
                this.addToken(TOKENS.RightParen);
                break;
            case "{":
                this.addToken(TOKENS.LeftBrace);
                break;
            case "}":
                this.addToken(TOKENS.RightBrace);
                break;
            case ",":
                this.addToken(TOKENS.Comma);
                break;
            case ".":
                this.addToken(TOKENS.Dot);
                break;
            case "-":
                this.addToken(TOKENS.Minus);
                break;
            case "+":
                this.addToken(TOKENS.Plus);
                break;
            case ";":
                this.addToken(TOKENS.Semicolon);
                break;
            case "*":
                this.addToken(TOKENS.Star);
                break;
            // Operators - need to check the previous character
            // as we can have `!=` or `<=`
            case "!":
                this.addToken(this.match("=") ? TOKENS.BangEqual : TOKENS.Bang);
                break;
            case "=":
                this.addToken(
                    this.match("=") ? TOKENS.EqualEqual : TOKENS.Equal,
                );
                break;
            case "<":
                this.addToken(this.match("=") ? TOKENS.LessEqual : TOKENS.Less);
                break;
            case ">":
                this.addToken(
                    this.match("=") ? TOKENS.GreaterEqual : TOKENS.Greater,
                );
                break;
            // Case for '/' needs special care as it can be either division
            // or a block of comments
            case "/": {
                if (this.match("/")) {
                    while (this.peek() !== "\n" && !this.isAtEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken(TOKENS.Slash);
                }

                break;
            }
            case " ":
            case "\r":
            case "\t":
                // Ignore whitespace.
                break;

            case "\n":
                this.line++;
                break;
            case '"': {
                this.string();
                break;
            }

            default: {
                if (this.isDigit(char)) {
                    this.number();
                    return;
                } else if (this.isAlpha(char)) {
                    this.identifier();
                    return;
                }

                Lox.error(this.line, `Unexpected character ${char}`);
            }
        }
    }

    private advance(): string {
        return this.source.charAt(this.current++);
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) {
            return false;
        }
        if (this.source.charAt(this.current) !== expected) {
            return false;
        }

        this.current++;
        return true;
    }

    private peek() {
        if (this.isAtEnd()) {
            return "\0";
        }

        return this.source.charAt(this.current);
    }

    private peekNext() {
        if (this.current + 1 >= this.source.length) {
            return "\0";
        }

        return this.source.charAt(this.current + 1);
    }

    private string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === "\n") {
                this.line++;
            }

            this.advance();
        }

        if (this.isAtEnd()) {
            Lox.error(this.line, "Unterminated string.");
            return;
        }

        // The closing "
        this.advance();

        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TOKENS.String, value);
    }

    private number() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            // Consume the dot
            this.advance();

            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        const finalCharacters = this.source.substring(this.start, this.current);
        this.addToken(TOKENS.Number, Number.parseFloat(finalCharacters));
    }

    private identifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const text = this.source.substring(this.start, this.current);
        let type = this.keywords.get(text);

        if (!type) {
            type = TOKENS.Identifier;
        }

        this.addToken(type);
    }

    private isDigit(char: string): boolean {
        const code = this.codeOf(char);

        return code >= this.codeOf("0") && code <= this.codeOf("9");
    }

    private isAlpha(char: string): boolean {
        const code = this.codeOf(char);

        return (
            (code >= this.codeOf("a") && code <= this.codeOf("z")) ||
            (code >= this.codeOf("A") && code <= this.codeOf("Z")) ||
            char === "_"
        );
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isDigit(char) || this.isAlpha(char);
    }

    private codeOf(char: string): number {
        return char.charCodeAt(0);
    }

    private addToken(type: TokenType, literal?: Literal) {
        const _literal = literal ?? null;

        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, _literal, this.line));
    }
}
