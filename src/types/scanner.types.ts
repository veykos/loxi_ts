import type { TOKENS } from "../constants/scanner.constants";

export type TokenType = (typeof TOKENS)[keyof typeof TOKENS];
