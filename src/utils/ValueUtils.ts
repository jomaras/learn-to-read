class ValueUtilsClass {
    public isLetter(c: string){
        return c.toLowerCase() != c.toUpperCase();
    }

    public splitIntoWords(text: string) {
        return text.split(/(?<=\w)(?=\W)|(?<=\W)(?=\w)/u);
    }
}

export const ValueUtils = new ValueUtilsClass();