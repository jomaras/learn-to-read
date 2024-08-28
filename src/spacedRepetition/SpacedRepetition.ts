/*
Quality:
5 - perfect response
4 - correct response after a hesitation
3 - correct response recalled with serious difficulty
2 - incorrect response; where the correct one seemed easy to recall
1 - incorrect response; the correct one remembered
0 - complete blackout.
*/

import { ValueUtils } from "../utils/ValueUtils";

export interface ISpacedRepetitionItem {
    id: string;
    
    question: string;
    answer: string;

    quality: number;
    repetitions: number;
    easeFactor: number;
    interval: number;
}

export class SpacedRepetition {
    private items: ISpacedRepetitionItem[] = [];
    private localStorageKey: string;
    
    constructor(localStorageKey: string){
        this.localStorageKey = localStorageKey;
        this.items = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
    }

    public getBestItemOf(ids: string[]): ISpacedRepetitionItem {
        const existingItems: ISpacedRepetitionItem[] = [];
        
        for(const id of ids){
            const existingItem = this.retrieveItem(id);
            
            if(existingItem == null) {
                return this.constructSpacedRepetitionItemForLetters(id, 0);
            }
            else {
                existingItems.push(existingItem);
            }
        }

        if(existingItems.length == 0) { return null; }
        if(existingItems.length == 1) { return existingItems[0]; }
        
        existingItems.sort((a, b) => a.interval - b.interval);

        const topExistingItem = existingItems[0];
        const sameIntervalExistingItems = existingItems.filter(it => it.interval == topExistingItem.interval);

        return ValueUtils.getRandomArrayItem(sameIntervalExistingItems);
    }

    public constructSpacedRepetitionItemForLetters(letter: string, quality: number): ISpacedRepetitionItem {
        const newSpacedRepetitionItem = {
            id: letter,
            
            question: "What is this letter?",
            answer: letter,
            
            quality: quality,

            repetitions: 0,
            easeFactor: 2.5,
            interval: 0
        };

        this.items.push(newSpacedRepetitionItem);
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.items));

        return newSpacedRepetitionItem;
    }

    public retrieveItem(id: string): ISpacedRepetitionItem | undefined {
        return this.items.find(it => it.id == id);
    }

    public addItem(spacedRepetitionItem: ISpacedRepetitionItem){
        if(spacedRepetitionItem.quality >= 3){
            if(spacedRepetitionItem.repetitions == 0){
                spacedRepetitionItem.interval = 1;
            }
            else if(spacedRepetitionItem.repetitions == 1){
                spacedRepetitionItem.interval = 6;
            }
            else {
                spacedRepetitionItem.interval = spacedRepetitionItem.interval * spacedRepetitionItem.easeFactor
            }

            spacedRepetitionItem.interval = Math.floor(spacedRepetitionItem.interval);
            spacedRepetitionItem.repetitions++;
            spacedRepetitionItem.easeFactor = spacedRepetitionItem.easeFactor + (0.1 - (5 - spacedRepetitionItem.quality) * (0.08 + (5 - spacedRepetitionItem.quality ) * 0.02));
        }
        else {
            spacedRepetitionItem.repetitions = 0;
            spacedRepetitionItem.interval = 1;
        }
        
        if(spacedRepetitionItem.easeFactor < 1.3) {
            spacedRepetitionItem.easeFactor = 1.3;
        }

        localStorage.setItem(this.localStorageKey, JSON.stringify(this.items));
    }
}