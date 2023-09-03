export interface UserAccount{
    name: string,
    partiesId: string[],
    cocktailsId: string[]
}

export interface Party{
    name: string,
    cocktails: CocktailPartyLink[],
    opened: boolean
}

export interface Cocktail{
    name: string,
    ingredients: string[],
    image: string,
    desc: string,
}

export interface CocktailWithId{
    cock: Cocktail,
    id: string,
    new: boolean
}

export interface CocktailOfParty{
    cock: Cocktail,
    link: CocktailPartyLink,
    imageUrl: string
}

export interface CocktailPartyLink{
    id: string,
    outOfStock: boolean
}

export interface PartyWithId{
    party: Party,
    id: string
}

export interface ConfigCocktail{
    partyIds: string[]
}
