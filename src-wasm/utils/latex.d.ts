/**
 * Type definitions for latex utility functions
 */

export const latexSymbols: Record<string, string>

export const latexOperators: Record<string, string>

export const latexFunctions: Record<string, any>

export const defaultTemplate: string

export function escapeLatex(string: string): string

export function toSymbol(name: string, isUnit?: boolean): string
