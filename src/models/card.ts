import { ICardImages } from "./card-images";
import { ICardFace } from "./card-face";

export interface ICard {
    object: string;

    oracle_id: string;
    name: string;
    type_line: string;
    rarity: string;

    mana_cost?: string;
    printed_type_line?: string;
    power?: string;
    toughness?: string;
    loyalty?: string;
    flavor_text?: string;
    oracle_text?: string;
    printed_text?: string;
    type?: string;

    image_uris?: ICardImages;
    card_faces?: ICardFace[];
}