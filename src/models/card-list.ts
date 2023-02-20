import { ICard } from "./card";

export interface ICardList {
    object: string;

    data: ICard[]
    has_more: boolean;

    next_page?: string;
    total_cards?: number;
    warnings?: string[];
}