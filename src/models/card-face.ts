import { ICardImages } from "./card-images";

export interface ICardFace {
    object: string;

    name: string;
    mana_cost: string;
    type_line: string;

    artist: string | undefined;
    flavor_Text: string | undefined;
    illustration_id: string | undefined;
    image_uris: ICardImages | undefined;
    loyalty: string | undefined;
    oracle_text: string | undefined;
    power: string | undefined;
    printed_name: string | undefined;
    printed_text: string | undefined;
    printed_type_line: string | undefined;
    toughness: string | undefined;
    watermark: string | undefined;
}