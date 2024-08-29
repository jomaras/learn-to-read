export interface ITeachingResult {
    success: boolean;
    duration: number;
    target: string;
}

export type ITeachingResultCallback = (teachingResult: ITeachingResult) => void;