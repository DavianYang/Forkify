import uniqid from "uniqid";

export default class List{
    constructor(){
        this.items = [];
    }

    addItem(count, unit, ingredient){
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);

        return item;
    }

    deleteItem(id){
        const index = this.items.findIndex(el => el.id === id);
        // [2, 4, 8] splice(1, 2(how many do I want to delete)) -> return [4, 8], orignal array = [2]
        // [2, 4, 8] slice(1, 2(end but not included)) -> return [4], orignal array = [2, 4, 8]
        this.items.splice(index, 1);
    }

    updateCount(id, newCount){
        this.items.find(el => el.id === id).count = newCount;
    } 
}