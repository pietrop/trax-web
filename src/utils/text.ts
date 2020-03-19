export const punctuations = ['.', ',', '!', '?', ';', ':']

export function isPunctuation(char: string) {
    return char.length === 1 && punctuations.indexOf(char) >= 0
}
