document.addEventListener('DOMContentLoaded', () => {
    let quotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
        { text: "The mind is everything. What you think you become.", category: "Wisdom" },
        { text: "An unexamined life is not worth living.", category: "Wisdom" },
        { text: "I have not failed. I've just found 10,000 ways that won't work.", category: "Perseverance" }
    ];

    const quoteDisplay = document.getElementById('quoteDisplay');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');

    function populateCategories() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        categoryFilter.innerHTML = '<option value="all">All</option>'; // Reset
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
    }

    function createAddQuoteForm() {
        const formHtml = `
            <div class="form-container">
                <h2>Add a New Quote</h2>
                <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
                <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
                <button onclick="addQuote()">Add Quote</button>
            </div>
        `;
        addQuoteFormContainer.innerHTML = formHtml;
    }

    window.addQuote = function() {
        const newQuoteText = document.getElementById('newQuoteText').value.trim();
        const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (newQuoteText && newQuoteCategory) {
            quotes.push({ text: newQuoteText, category: newQuoteCategory });
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';
            populateCategories();
            alert('New quote added successfully!');
        } else {
            alert('Please fill in both the quote and its category.');
        }
    }

    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', showRandomQuote);

    // Initial setup
    populateCategories();
    createAddQuoteForm();
});