/**
 * Type definitions for customs utility functions
 */

export function getSafeProperty(object: any, prop: string): any

export function setSafeProperty(object: any, prop: string, value: any): any

export function isSafeProperty(object: any, prop: string): boolean

export function getSafeMethod(object: any, method: string): Function

export function isSafeMethod(object: any, method: string): boolean

export function isPlainObject(object: any): boolean
