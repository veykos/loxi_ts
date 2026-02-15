import { beforeEach, describe, expect, it } from "bun:test";
import { TOKENS } from "../../constants/scanner.constants";
import type { TokenType } from "../../types/scanner.types";
import { Lox } from "../Lox";
import type { Token } from "../Token";
import { Scanner } from "./Scanner";

describe("Scanner", () => {
    // Reset errors between tests that expect errors
    beforeEach(() => {
        Lox.hadError = false;
    });

    it("scans single character tokens", () => {
        const toScan = "(){},.-+/!<>";
        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.LeftParen,
            TOKENS.RightParen,
            TOKENS.LeftBrace,
            TOKENS.RightBrace,
            TOKENS.Comma,
            TOKENS.Dot,
            TOKENS.Minus,
            TOKENS.Plus,
            TOKENS.Slash,
            TOKENS.Bang,
            TOKENS.Less,
            TOKENS.Greater,
            // We always have EOF at the end of a file / string
            TOKENS.EOF,
        ]);
    });

    it("scans multiple character tokens", () => {
        const toScan = "!= >= <= ==";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.BangEqual,
            TOKENS.GreaterEqual,
            TOKENS.LessEqual,
            TOKENS.EqualEqual,
            TOKENS.EOF,
        ]);
    });

    it("ignores comments", () => {
        const toScan = "// This is a comment";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.EOF,
        ]);
    });

    it("ignores comments, but still scans next lines", () => {
        const firstLine = "// This is a comment";
        const secondLine = "!";
        const toScan = [
            firstLine,
            secondLine,
        ].join("\n");

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.Bang,
            TOKENS.EOF,
        ]);
    });

    it("scans all keywords", () => {
        const toScan =
            "and class else false true for fun if nil or print return super this var while";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.And,
            TOKENS.Class,
            TOKENS.Else,
            TOKENS.False,
            TOKENS.True,
            TOKENS.For,
            TOKENS.Fun,
            TOKENS.If,
            TOKENS.Nil,
            TOKENS.Or,
            TOKENS.Print,
            TOKENS.Return,
            TOKENS.Super,
            TOKENS.This,
            TOKENS.Var,
            TOKENS.While,
            TOKENS.EOF,
        ]);
    });

    it("scans plain strings", () => {
        const toScan = "those are plain strings";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);
        const tokensLexeme = tokens.map(tokenToLexeme);

        expect(tokensType).toEqual([
            ...toScan.split(" ").map((_) => TOKENS.Identifier),
            TOKENS.EOF,
        ]);

        expect(tokensLexeme).toEqual([
            ...toScan.split(" "),
            // Empty, as EOF does not have lexeme
            "",
        ]);
    });

    it("can scan numbers", () => {
        const toScan = "1 11 1245 123.123 1.2323";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);
        const tokensLexeme = tokens.map(tokenToLexeme);

        expect(tokensType).toEqual([
            ...toScan.split(" ").map((_) => TOKENS.Number),
            TOKENS.EOF,
        ]);

        expect(tokensLexeme).toEqual([
            ...toScan.split(" "),
            // Empty, as EOF does not have lexeme
            "",
        ]);
    });

    it("ignores new lines", () => {
        const toScan = "\n \n \n \n \n \n \n \n \n \n \n \n";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.EOF,
        ]);
    });

    it("ignores whitespaces", () => {
        const toScan = "\t \t \t \t \t \t \t \t \t \t \t \t";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.EOF,
        ]);
    });

    it("scans lexemes after whitespace and new lines", () => {
        const toScan = "\tvar \n var";

        const scanner = new Scanner(toScan);

        const tokens = scanner.scanTokens();
        const tokensType = tokens.map(tokenToTokenType);

        expect(tokensType).toEqual([
            TOKENS.Var,
            TOKENS.Var,
            TOKENS.EOF,
        ]);
    });

    it.each([
        "@",
        "#",
        "^",
        "&",
    ])("will error out on unexpected token %s", (data) => {
        const scanner = new Scanner(data);

        scanner.scanTokens();

        expect(Lox.hadError).toBeTrue();
    });
});

function tokenToTokenType(token: Token): TokenType {
    return token.type;
}

function tokenToLexeme(token: Token): string {
    return token.lexeme;
}
