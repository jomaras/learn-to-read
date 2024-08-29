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

    public getRandomNumber(lowend: number, highend: number){
        return Math.floor(Math.random() * highend) + lowend;
    }

    public sleep(time: number){
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }
}

export const ValueUtils = new ValueUtilsClass();