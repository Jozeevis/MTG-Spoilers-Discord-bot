import { ICardImages } from "./card-images";

export interface ICardFace {
    object: string;

    name: string;
    mana_cost: string;
    type_line: string;

    artist?: string;
    flavor_Text?: string;
    illustration_id?: string;
    image_uris?: ICardImages;
    loyalty?: string;
    oracle_text?: string;
    power?: string;
    printed_name?: string;
    printed_text?: string;
    printed_type_line?: string;
    toughness?: string;
    watermark?: string;
}