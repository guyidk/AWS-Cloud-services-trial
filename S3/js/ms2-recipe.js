// This function adds a new recipe
function addRecipe() {
    var jsonData = new Object();
    jsonData.recipename = document.getElementById("recipename").value;
    jsonData.category = document.getElementById("category").value;
    jsonData.ingredients = document.getElementById("ingredients").value;
    jsonData.instructions = document.getElementById("instructions").value;
    var recipeImage = document.getElementById("recipeImage").files[0];

    // Validate input fields
    if (jsonData.recipename == "" || jsonData.category == "" || jsonData.ingredients == "" || jsonData.instructions == "") {
        alert('All fields are required!');
        return;
    }

    if (jsonData.recipename.length > 30) {
        alert('Recipe name cannot be more than 30 characters!');
        return;
    }

    if (jsonData.category.length > 30) {
        alert('Category cannot be more than 30 characters!');
        return;
    }

    if (jsonData.ingredients.length > 5000) {
        alert('Ingredients cannot be more than 5000 characters!');
        return;
    }

    if (jsonData.instructions.length > 5000) {
        alert('Instructions cannot be more than 5000 characters!');
        return;
    }

    // If a profile image is provided, read it as a data URL and then send the registration request
    if (recipeImage) {
        var reader = new FileReader();
        reader.onloadend = function () {
            jsonData.recipeImage = reader.result;
            sendAddRecipeRequest(jsonData);
        };
        reader.readAsDataURL(recipeImage);
    } else {
        alert('Image is required!');
    }
}

// This function sends the add recipe request to the server
function sendAddRecipeRequest(jsonData) {
    var userId = sessionStorage.getItem("userId");
    var token = sessionStorage.getItem("token");

    if (!userId || !token) {
        alert("User not authenticated. Please log in.");
        return;
    }

    jsonData.userId = userId; // Add userId to the data being sent

    var request = new XMLHttpRequest();
    request.open("POST", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipe", true);
    request.setRequestHeader("Authorization", `Bearer ${token}`);

    // Define what happens when the server responds to the add request
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            alert('Recipe added successfully');
            document.getElementById("addRecipeForm").reset();
            // Reset image preview
            document.getElementById("previewImage").src = "#";
            document.getElementById("previewImage").style.display = 'none';
        } else {
            alert('Unable to add new recipe.');
        }
    };

    // Define what happens if the request fails
    request.onerror = function () {
        alert('Request failed. Please try again.');
    };

    request.send(JSON.stringify(jsonData));
}

// This function retrieves all recipes and displays them
function getRecipes() {
    var userId = sessionStorage.getItem("userId");

    var request = new XMLHttpRequest();
    request.open("GET", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipes", true);

    // Define what happens when the server responds to the get request
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = JSON.parse(request.responseText);
            var html = "";
            response.forEach(function (recipe) {
                const timestamp = new Date().getTime(); // Get current timestamp
                const imageUrlWithTimestamp = `${recipe.recipeImageUrl}?${timestamp}`; // Append timestamp to URL

                // Truncate name and description if they are too long
                let truncatedName = recipe.recipename.length > 18 ? recipe.recipename.substring(0, 18) + "..." : recipe.recipename;
                let truncatedInsturctions = recipe.instructions.length > 18 ? recipe.instructions.substring(0, 18) + "..." : recipe.instructions;
                let truncatedIngredients = recipe.ingredients.length > 18 ? recipe.ingredients.substring(0, 18) + "..." : recipe.ingredients;
                let truncatedCategory = recipe.category.length > 18 ? recipe.category.substring(0, 18) + "..." : recipe.category;
                html += `
                    <div class="recipe">
                        <img src="${imageUrlWithTimestamp}" alt="${truncatedName}">
                        <h2>${truncatedName}</h2>
                        <p><strong>Category:</strong> ${truncatedCategory}</p>
                        <p><strong>Ingredients:</strong> ${truncatedIngredients}</p>
                        <p><strong>Instructions:</strong> ${truncatedInsturctions}</p>
                        <div class="buttons">
                            <button class="view-button" onclick="window.location.href = 'view_recipe.html?RecipeId=${recipe.RecipeId}'">View Recipe</button>
                            ${recipe.userId === userId ? `
                            <button class="edit-button" onclick="window.location.href = 'edit_recipe.html?RecipeId=${recipe.RecipeId}'">Edit Recipe</button>
                            <button class="delete-button" onclick="deleteRecipe('${recipe.RecipeId}')">Delete Recipe</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            document.getElementById("recipeList").innerHTML = html;
        } else {
            console.error('Failed to retrieve recipes:', request.statusText);
        }
    };

    // Define what happens if the request fails
    request.onerror = function () {
        console.error('Request failed');
    };

    request.send();
}

// This function retrieves recipes created by the logged-in user and displays them
function getUserRecipes() {
    var userId = sessionStorage.getItem("userId");

    // Check if the user is authenticated
    if (!userId) {
        console.error("User ID not found");
        return;
    }

    var request = new XMLHttpRequest();
    request.open("GET", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipes/${userId}`, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = JSON.parse(request.responseText);
            var html = "";
            response.forEach(function (recipe) {
                const timestamp = new Date().getTime(); // Get current timestamp
                const imageUrlWithTimestamp = `${recipe.recipeImageUrl}?${timestamp}`; // Append timestamp to URL

                html += `
                    <div class="recipe">
                        <img src="${imageUrlWithTimestamp}" alt="${recipe.recipename}">
                        <h2>${recipe.recipename}</h2>
                        <p><strong>Category:</strong> ${recipe.category}</p>
                        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                        <button class="view-button" onclick="window.location.href = 'view_recipe.html?RecipeId=${recipe.RecipeId}'">View Recipe</button>
                        <button class="edit-button" onclick="window.location.href = 'edit_recipe.html?RecipeId=${recipe.RecipeId}'">Edit Recipe</button> 
                        <button class="delete-button" onclick="deleteRecipe('${recipe.RecipeId}')">Delete Recipe</button>
                    </div>
                `;
            });
            document.getElementById("user_recipeList").innerHTML = html;
        } else {
            console.error('Failed to retrieve recipes:', request.statusText);
        }
    };

    // Define what happens if the request fails
    request.onerror = function () {
        console.error('Request failed');
    };

    request.send();
}

// Event listener to load user recipes on page load
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById("user_recipeList")) {
        getUserRecipes();
    }
});

// This function retrieves the details of a specific recipe and displays them.
function getRecipeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const RecipeId = urlParams.get('RecipeId');

    if (!RecipeId) {
        console.error('RecipeId not found in URL');
        return;
    }

    var request = new XMLHttpRequest();
    request.open("GET", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipe/" + RecipeId, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = JSON.parse(request.responseText);

            if (!response || !response.length) {
                console.error('Recipe not found or invalid response:', response);
                document.getElementById("recipeDetails").innerHTML = "<p>Recipe not found.</p>";
                return;
            }

            var recipe = response[0];
            if (!recipe.recipeImageUrl || !recipe.recipename) {
                console.error('Invalid recipe data:', recipe);
                document.getElementById("recipeDetails").innerHTML = "<p>Invalid recipe data.</p>";
                return;
            }

            const timestamp = new Date().getTime(); // Get current timestamp
            const imageUrlWithTimestamp = `${recipe.recipeImageUrl}?${timestamp}`; // Append timestamp to URL

            // Determine which page we're on
            if (document.getElementById("current-recipe-image")) {
                // We're on edit_recipe.html
                document.getElementById("current-recipe-image").src = imageUrlWithTimestamp;
                document.getElementById("edit-recipename").value = recipe.recipename;
                document.getElementById("edit-category").value = recipe.category;
                document.getElementById("edit-ingredients").value = recipe.ingredients;
                document.getElementById("edit-instructions").value = recipe.instructions;
            } else if (document.getElementById("recipeDetails")) {
                // We're on view_recipe.html
                const html = `
                    <img src="${imageUrlWithTimestamp}" alt="${recipe.recipename}">
                    <div class="details">
                        <p><strong>Name:</strong> ${recipe.recipename}</p>
                        <p><strong>Category:</strong> ${recipe.category}</p>
                        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                        <button class="back-button" onclick="window.history.back()">Back</button>
                    </div>
                `;
                document.getElementById("recipeDetails").innerHTML = html;
            }
        } else {
            console.error('Failed to retrieve recipe:', request.statusText);
        }
    };

    request.onerror = function () {
        console.error('Request failed');
    };

    request.send();
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById("editRecipeForm")) {
        getRecipeDetails();
    }
    if (document.getElementById("recipeDetails")) {
        getRecipeDetails();
    }
});

function editRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const RecipeId = urlParams.get('RecipeId');

    var jsonData = {
        recipename: document.getElementById("edit-recipename").value,
        category: document.getElementById("edit-category").value,
        ingredients: document.getElementById("edit-ingredients").value,
        instructions: document.getElementById("edit-instructions").value
    };
    var recipeImage = document.getElementById("edit-recipeImage").files[0];

    if (jsonData.recipename === "" || jsonData.category === "" || jsonData.ingredients === "" || jsonData.instructions === "") {
        alert('All fields are required!');
        return;
    }

    if (jsonData.recipename.length > 30) {
        alert('Recipe name cannot be more than 30 characters!');
        return;
    }

    if (jsonData.category.length > 30) {
        alert('Category cannot be more than 30 characters!');
        return;
    }

    if (jsonData.ingredients.length > 5000) {
        alert('Ingredients cannot be more than 5000 characters!');
        return;
    }

    if (jsonData.instructions.length > 5000) {
        alert('Instructions cannot be more than 5000 characters!');
        return;
    }

    if (recipeImage) {
        var reader = new FileReader();
        reader.onloadend = function () {
            jsonData.recipeImage = reader.result;
            sendEditRecipeRequest(jsonData, RecipeId);
        };
        reader.readAsDataURL(recipeImage);
    } else {
        sendEditRecipeRequest(jsonData, RecipeId);
    }
}

function sendEditRecipeRequest(jsonData, RecipeId) {
    var userId = sessionStorage.getItem("userId");
    var token = sessionStorage.getItem("token");

    if (!userId || !token) {
        alert("User not authenticated. Please log in.");
        return;
    }

    jsonData.userId = userId; // Add userId to the data being sent

    var request = new XMLHttpRequest();
    request.open("PUT", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipe/${RecipeId}`, true);
    request.setRequestHeader("Authorization", `Bearer ${token}`);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            alert('Recipe edited successfully');
            window.location.href = 'index.html';
        } else {
            alert('Error. Unable to edit the recipe.');
        }
    };

    request.onerror = function () {
        alert('Request failed. Please try again.');
    };

    request.send(JSON.stringify(jsonData));
}

// This function deletes a recipe
function deleteRecipe(recipeId) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        var token = sessionStorage.getItem("token");

        var request = new XMLHttpRequest();
        request.open("DELETE", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipe/${recipeId}`, true);
        request.setRequestHeader("Authorization", `Bearer ${token}`);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                alert('Recipe deleted successfully');
                getRecipes();
            } else {
                alert('Error. Unable to delete the recipe.');
            }
        };

        request.onerror = function () {
            alert('Request failed. Please try again.');
        };

        request.send();
    }
}


function searchRecipes() {
    var searchQuery = document.getElementById('searchInput').value.toLowerCase();
    var categoryQuery = document.getElementById('categoryInput').value.toLowerCase();
    var userId = sessionStorage.getItem("userId");

    var request = new XMLHttpRequest();
    request.open("GET", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipes", true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = JSON.parse(request.responseText);
            var filteredRecipes = response.filter(function (recipe) {
                if (searchQuery && categoryQuery) {
                    return recipe.recipename.toLowerCase().includes(searchQuery) && recipe.category.toLowerCase().includes(categoryQuery);
                } else if (searchQuery) {
                    return recipe.recipename.toLowerCase().includes(searchQuery);
                } else if (categoryQuery) {
                    return recipe.category.toLowerCase().includes(categoryQuery);
                } else {
                    return true; // No filters applied, return all recipes
                }
            });
            displayRecipes(filteredRecipes);
        } else {
            console.error('Failed to retrieve recipes:', request.statusText);
        }
    };

    request.onerror = function () {
        console.error('Request failed');
    };

    request.send();
}

function displayRecipes(recipes) {
    var html = "";
    var userId = sessionStorage.getItem("userId");
    recipes.forEach(function (recipe) {
        const timestamp = new Date().getTime(); // Get current timestamp
        const imageUrlWithTimestamp = `${recipe.recipeImageUrl}?${timestamp}`; // Append timestamp to URL

        // Truncate name and description if they are too long
        let truncatedInsturctions = recipe.instructions.length > 18 ? recipe.instructions.substring(0, 18) + "..." : recipe.instructions;
        let truncatedIngredients = recipe.ingredients.length > 18 ? recipe.ingredients.substring(0, 18) + "..." : recipe.ingredients;
        let truncatedCategory = recipe.category.length > 18 ? recipe.category.substring(0, 18) + "..." : recipe.category;
        html += `
            <div class="recipe">
                <img src="${imageUrlWithTimestamp}" alt="${recipe.recipename}">
                <h2>${recipe.recipename}</h2>
                <p><strong>Category:</strong> ${truncatedCategory}</p>
                <p><strong>Ingredients:</strong> ${truncatedIngredients}</p>
                <p><strong>Instructions:</strong> ${truncatedInsturctions}</p>
                <div class="buttons">
                    <button class="view-button" onclick="window.location.href = 'view_recipe.html?RecipeId=${recipe.RecipeId}'">View Recipe</button>
                    ${recipe.userId === userId ? `
                    <button class="edit-button" onclick="window.location.href = 'edit_recipe.html?RecipeId=${recipe.RecipeId}'">Edit Recipe</button>
                    <button class="delete-button" onclick="deleteRecipe('${recipe.RecipeId}')">Delete Recipe</button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    document.getElementById("recipeList").innerHTML = html;
}

// Modify getRecipes to use displayRecipes
function getRecipes() {
    var userId = sessionStorage.getItem("userId");

    var request = new XMLHttpRequest();
    request.open("GET", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/recipes", true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = JSON.parse(request.responseText);
            displayRecipes(response);
        } else {
            console.error('Failed to retrieve recipes:', request.statusText);
        }
    };

    // Define what happens if the request fails
    request.onerror = function () {
        console.error('Request failed');
    };

    request.send();
}
