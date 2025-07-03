document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');

    // --- Data Initialization ---
    const initialQuotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
        { text: "The mind is everything. What you think you become.", category: "Wisdom" },
        { text: "An unexamined life is not worth living.", category: "Wisdom" },
        { text: "I have not failed. I've just found 10,000 ways that won't work.", category: "Perseverance" }
    ];
    let quotes = [];

    // --- Storage Functions ---
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function loadQuotes() {
        const storedQuotes = localStorage.getItem('quotes');
        quotes = storedQuotes ? JSON.parse(storedQuotes) : initialQuotes;
        saveQuotes(); // Ensures initial quotes are saved on first visit

        // Restore last selected category filter
        const lastFilter = localStorage.getItem('lastCategoryFilter');
        if (lastFilter) {
            categoryFilter.value = lastFilter;
        }
    }

    function showLastViewedQuote() {
        const lastQuote = sessionStorage.getItem('lastQuote');
        if (lastQuote) {
            const { text, category } = JSON.parse(lastQuote);
            quoteDisplay.textContent = `"${text}"`;
            quoteAuthor.textContent = `- ${category}`;
        } else {
            quoteDisplay.textContent = 'Click the button to see a quote!';
        }
    }


    // --- Core Application Logic ---
    function populateCategories() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset with "All Categories"
        categories.sort().forEach(category => { // Sort categories alphabetically
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Ensure the previously selected filter is re-applied after repopulating
        const lastFilter = localStorage.getItem('lastCategoryFilter');
        if (lastFilter && categories.includes(lastFilter)) {
            categoryFilter.value = lastFilter;
        } else {
            categoryFilter.value = 'all'; // Default to 'all' if the category no longer exists
        }
    }

    // New function to filter quotes based on selected category
    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('lastCategoryFilter', selectedCategory); // Save the selected filter

        showRandomQuote(); // Display a random quote from the *currently filtered* list
    }


    function showRandomQuote() {
        const selectedCategory = categoryFilter.value; // Get the currently selected category
        const filteredQuotes = selectedCategory === 'all'
            ? quotes
            : quotes.filter(quote => quote.category === selectedCategory);

        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = 'No quotes available in this category.';
            quoteAuthor.textContent = '';
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        quoteDisplay.textContent = `"${randomQuote.text}"`;
        quoteAuthor.textContent = `- ${randomQuote.category}`;
        
        // Save the currently displayed quote to session storage
        sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
    }

    function addQuote() {
        const newQuoteText = document.getElementById('newQuoteText').value.trim();
        const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (newQuoteText && newQuoteCategory) {
            quotes.push({ text: newQuoteText, category: newQuoteCategory });
            saveQuotes(); // Save the updated array to local storage
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';
            populateCategories(); // Update the category filter dropdown if a new category was added
            // After adding, apply the current filter or show a random quote from all
            filterQuotes(); // This will also save the current filter
            alert('New quote added successfully!');
        } else {
            alert('Please fill in both the quote and its category.');
        }
    }

    function createAddQuoteForm() {
        const formHtml = `
            <div class="form-container">
                <h2>Add a New Quote</h2>
                <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
                <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
                <button id="addQuoteBtn">Add Quote</button>
            </div>
        `;
        addQuoteFormContainer.innerHTML = formHtml;
        // Attach event listener after the button is created
        document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
    }

    // --- Import/Export Functions ---
    function exportToJson() {
        const jsonString = JSON.stringify(quotes, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importFromJsonFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                if (Array.isArray(importedQuotes)) {
                    quotes.push(...importedQuotes); // Add new quotes to the existing array
                    saveQuotes(); // Save the merged array
                    populateCategories(); // Update UI with potentially new categories
                    filterQuotes(); // Re-apply filter and show a quote from the potentially updated list
                    alert('Quotes imported successfully!');
                } else {
                    alert('Invalid JSON format. File must contain an array of quotes.');
                }
            } catch (error) {
                alert('Error reading or parsing the JSON file.');
            }
        };
        fileReader.readAsText(file);
    }

    // --- Event Listeners & Initial Setup ---
    newQuoteBtn.addEventListener('click', showRandomQuote);
    // Use JS event listener for category filter, as it's more robust than inline onchange
    categoryFilter.addEventListener('change', filterQuotes); 
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);

    // Run functions on page load
    loadQuotes();
    populateCategories(); // Populate categories after loading quotes
    createAddQuoteForm();
    showLastViewedQuote();
    filterQuotes(); // Apply the saved filter or default 'all'
});