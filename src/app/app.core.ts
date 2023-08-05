export interface UserAccount{
    name: string,
    partiesId: string[],
    cocktailsId: string[]
}

export interface Party{
    name: string,
    cocktailsId: string[],
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
    id: string
}
