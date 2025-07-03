document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');

    const initialQuotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
        { text: "The mind is everything. What you think you become.", category: "Wisdom" }
    ];

    let quotes = [];

    // --- Web Storage Functions ---

    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function loadQuotes() {
        const storedQuotes = localStorage.getItem('quotes');
        // Load from local storage or use initial quotes if storage is empty
        quotes = storedQuotes ? JSON.parse(storedQuotes) : initialQuotes;
        saveQuotes(); // This ensures initial quotes are saved on first visit
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

    // --- Core Application Functions ---

    function populateCategories() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
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

        // Save the shown quote to session storage
        sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
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

        // Add event listener to the dynamically created button
        document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
    }

    function addQuote() {
        const newQuoteText = document.getElementById('newQuoteText').value.trim();
        const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (newQuoteText && newQuoteCategory) {
            quotes.push({ text: newQuoteText, category: newQuoteCategory });
            saveQuotes(); // Save to local storage
            populateCategories(); // Update categories dropdown
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';
            alert('New quote added successfully!');
        } else {
            alert('Please fill in both the quote and its category.');
        }
    }

    // --- JSON Import/Export Functions ---

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
        if (!file) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                if (Array.isArray(importedQuotes)) {
                    quotes.push(...importedQuotes);
                    saveQuotes();
                    populateCategories();
                    alert('Quotes imported successfully!');
                } else {
                    alert('Invalid JSON format. The file should contain an array of quotes.');
                }
            } catch (error) {
                alert('Error reading or parsing JSON file.');
                console.error("JSON Parse Error:", error);
            }
        };
        fileReader.readAsText(file);
    }


    // --- Event Listeners and Initialization ---

    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);

    // Initial setup
    loadQuotes();
    populateCategories();
    createAddQuoteForm();
    showLastViewedQuote();
});