import axios from 'axios';
import { key, proxy } from '../config';

export default class Search {
    constructor(query){
        this.query = query;
    }

    async getResults(query){

        try {
            const result = await axios(`https://www.food2fork.com/api/search/?key=${key}&q=${this.query}`);
             this.recipes = result.data.recipes;
             console.log(result);
        } catch (err){
            console.log(err);
        }
    }
}
