export interface UserAccount{
    name: string,
    partiesId: string[],
    cocktailsId: string[]
}

export interface Party{
    name: string,
    cocktailsId: string[]
}

export interface Cocktail{
    name: string,
    ingredients: string[],
    image: string,
}
