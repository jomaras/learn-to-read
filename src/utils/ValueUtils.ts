class ValueUtilsClass {
    public isLetter(c: string){
        return c.toLowerCase() != c.toUpperCase();
    }

    public splitIntoWords(text: string) {
        return text.match(/[A-Za-zČčĆćĐđŠšŽž]+/g);;
    }

    public getRandomArrayItem<T>(array: Array<T>){
        if(!array || array.length === 0) { return null; }
        
        return array[Math.floor(Math.random()*array.length)];
    }
}

export const ValueUtils = new ValueUtilsClass();