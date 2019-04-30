import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeVew from './views/likeView';
import { elements, renderLoader, clearLoader } from './views/base';


/** Global State of The App
 * - Search Object
 * - Current Recipe Object
 * - Shopping List Object
 * - Liked Recipes
 */

const state = {};

/**
 * SEARCH Conroller
 */
const controlSearch = async () => {
    // 1) Get Query from View
    const query = searchView.getInput();

    if(query){
        // 2) New Search Object Added To State
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult);

        try {
            // 4) Search for Recipies
            await state.search.getResults();

            // 5) Render Results on UI
            clearLoader();
            searchView.renderResult(state.search.recipes);

        } catch(err){

            alert('Something wrong with Search....');
            clearLoader();
            
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();

    controlSearch();  
});


elements.searchResultPages.addEventListener('click', e => {
    e.preventDefault();

    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResult(state.search.recipes, goToPage);
    }
});


/**
 * RECIPE Conroller
 */
const controlRecipe = async () => {
    // Get ID from URL
    const id = window.location.hash.replace('#', '');

    if(id){
            // Prepare UI for changes
            recipeView.clearRecipe();
            renderLoader(elements.recipe);

            // Highlight selected search item
            if(state.search) searchView.highLightSelected(id); 

            // Create new Recipe Object
            state.recipe = new Recipe(id);

            try {

                // Get Recipe Data
                await state.recipe.getRecipe();

                state.recipe.parseIngredients();

                // Calculate Servings and Time
                state.recipe.calcTime();
                state.recipe.calcServings();

                // Render Recipe
                clearLoader();
                recipeView.renderRecipe(
                    state.recipe,
                    state.likes.isLiked(id)
                    );
            } catch(error){
                console.log(error);
                console.log('Error Processing Recipe');
            }

    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); 

/**
 * LIST Conroller
 */

const controlList = () => {
    // Create New List if there in none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the List and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};
// Handling delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle Count Update
    } else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);

        state.list.updateCount(id, val);
    }
});

/**
 * LIKES Conroller
 */

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const curID = state.recipe.id;

    // User has NOT yet liked the current recipe
    if(!state.likes.isLiked(curID)){
        // Add like to the state
        const newLike = state.likes.addLike(
            curID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button
        likeVew.toggleLikeBtn(true);

        // Add like to UI list
        likeVew.renderLike(newLike);

    // User HAS liked the current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(curID);

        // Toggle the like button
        likeVew.toggleLikeBtn(false);

        // Remove like from UI list
        likeVew.deleteLike(curID);
    }
    // TESTING
    likeVew.toggleLikeMenu(state.likes.getNumLikes());
};

// Restored liked recipe on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likeVew.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likeVew.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease Button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if(e.target.matches('.btn-increase, .btn-increase *')){
        // Increase Button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // Add Ingredients to the shopoing List
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        // Like Controller
        controlLike();
    }
});