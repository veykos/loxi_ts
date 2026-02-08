import type { TokenType } from "../types/scanner.types";

// Figure out what this Literal type can be this is for now
// placeholder
export type Literal = Record<string, unknown> | string | number | null;

export class Token {
    type: TokenType;
    lexeme: string;
    literal: Literal;
    line: number;

    constructor(
        type: TokenType,
        lexeme: string,
        literal: Literal,
        line: number,
    ) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString(): string {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}
