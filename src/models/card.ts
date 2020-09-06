import { ICardImages } from "./card-images";
import { ICardFace } from "./card-face";

export interface ICard {
    object: string;

    oracle_id: string;
    name: string;
    type_line: string;
    rarity: string;

    mana_cost: string | undefined;
    printed_type_line: string | undefined;
    power: string | undefined;
    toughness: string | undefined;
    loyalty: string | undefined;
    flavor_text: string | undefined;
    oracle_text: string | undefined;
    printed_text: string | undefined;
    type: string | undefined;

    image_uris: ICardImages | undefined;
    card_faces: ICardFace[] | undefined;
}