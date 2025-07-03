document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const syncBtn = document.getElementById('syncBtn');
    const syncStatus = document.getElementById('syncStatus');

    // --- Data Initialization ---
    const initialQuotes = [
        { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { id: 2, text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
        { id: 3, text: "The mind is everything. What you think you become.", category: "Wisdom" },
        { id: 4, text: "An unexamined life is not worth living.", category: "Wisdom" },
        { id: 5, text: "I have not failed. I've just found 10,000 ways that won't work.", category: "Perseverance" }
    ];
    let quotes = [];
    let nextQuoteId = 1;

    // --- Server Simulation Configuration ---
    const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
    const SYNC_INTERVAL = 30 * 1000;

    // --- Utility Functions for Notifications ---
    function showNotification(message, type = 'info') {
        syncStatus.textContent = message;
        syncStatus.className = '';
        syncStatus.classList.add(type === 'success' ? 'sync-success' : type === 'error' ? 'sync-error' : 'sync-info');
        syncStatus.style.display = 'block';
        setTimeout(() => {
            syncStatus.style.display = 'none';
        }, 5000);
    }

    // --- Storage Functions ---
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function loadQuotes() {
        const storedQuotes = localStorage.getItem('quotes');
        quotes = storedQuotes ? JSON.parse(storedQuotes) : initialQuotes;
        if (quotes.length > 0) {
            nextQuoteId = Math.max(...quotes.map(q => q.id || 0)) + 1;
        } else {
            nextQuoteId = 1;
        }
        saveQuotes();
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
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        const lastFilter = localStorage.getItem('lastCategoryFilter');
        if (lastFilter && categories.includes(lastFilter)) {
            categoryFilter.value = lastFilter;
        } else {
            categoryFilter.value = 'all';
        }
    }

    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('lastCategoryFilter', selectedCategory);
        showRandomQuote();
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
        
        sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
    }

    async function addQuote() {
        const newQuoteText = document.getElementById('newQuoteText').value.trim();
        const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (newQuoteText && newQuoteCategory) {
            const newQuote = { id: nextQuoteId++, text: newQuoteText, category: newQuoteCategory };
            quotes.push(newQuote);
            saveQuotes();
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';
            populateCategories();
            filterQuotes();
            showNotification('New quote added locally and ready for sync.', 'info');

            try {
                await fetch(SERVER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newQuote),
                });
                showNotification('Quote sent to simulated server (not truly saved).', 'info');
            } catch (error) {
                console.error('Error sending quote to simulated server:', error);
                showNotification('Failed to send quote to simulated server.', 'error');
            }
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
                    const quotesWithIds = importedQuotes.map(q => ({
                        ...q,
                        id: q.id || nextQuoteId++
                    }));
                    quotes.push(...quotesWithIds);
                    saveQuotes();
                    populateCategories();
                    filterQuotes();
                    showNotification('Quotes imported successfully from file!', 'success');
                } else {
                    alert('Invalid JSON format. File must contain an array of quotes.');
                }
            } catch (error) {
                alert('Error reading or parsing the JSON file.');
                console.error('Import error:', error);
            }
        };
        fileReader.readAsText(file);
    }

    // --- Data Syncing and Conflict Resolution ---

    /**
     * Fetches quotes from the simulated server.
     * @returns {Promise<Array>} A promise that resolves with an array of quotes from the server.
     */
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=7'); // Fetch a few mock posts
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const serverData = await response.json();

            // Transform JSONPlaceholder data to your quote format
            const serverQuotes = serverData.map(item => ({
                id: item.id,
                text: item.title,
                category: "Server Data" // Assign a default category for simulated server quotes
            }));
            return serverQuotes;
        } catch (error) {
            console.error('Failed to fetch quotes from server:', error);
            throw error; // Re-throw to be caught by syncQuotesWithServer
        }
    }

    /**
     * Synchronizes local quotes with server data, resolving conflicts.
     * Server data takes precedence.
     */
    async function syncQuotesWithServer() {
        showNotification('Syncing with server...', 'info');
        try {
            const serverQuotes = await fetchQuotesFromServer(); // Call the dedicated fetch function

            let updatedQuotes = [...quotes];
            let conflictsResolved = 0;
            let newServerQuotes = 0;
            let newLocalQuotesSynced = 0;

            // Phase 1: Merge server quotes into local quotes (server takes precedence)
            serverQuotes.forEach(serverQuote => {
                const existingLocalIndex = updatedQuotes.findIndex(q => q.id === serverQuote.id);
                if (existingLocalIndex !== -1) {
                    if (JSON.stringify(updatedQuotes[existingLocalIndex]) !== JSON.stringify(serverQuote)) {
                        updatedQuotes[existingLocalIndex] = serverQuote;
                        conflictsResolved++;
                    }
                } else {
                    updatedQuotes.push(serverQuote);
                    newServerQuotes++;
                }
            });

            // Phase 2: Simulate pushing new local quotes to server
            quotes.forEach(localQuote => {
                const existsOnServer = serverQuotes.some(q => q.id === localQuote.id);
                if (!existsOnServer) {
                    // Simulate POST request for new local quotes
                    fetch(SERVER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(localQuote),
                    }).catch(err => {
                        console.error(`Error simulating push for ID ${localQuote.id}:`, err);
                    });
                    newLocalQuotesSynced++;
                }
            });

            quotes = updatedQuotes;
            saveQuotes();
            populateCategories();
            filterQuotes();

            let message = 'Sync complete!';
            if (newServerQuotes > 0) message += ` ${newServerQuotes} new quotes from server.`;
            if (conflictsResolved > 0) message += ` ${conflictsResolved} conflicts resolved (server took precedence).`;
            if (newLocalQuotesSynced > 0) message += ` ${newLocalQuotesSynced} local quotes sent to server.`;
            showNotification(message, 'success');

        } catch (error) {
            console.error('Sync failed:', error);
            showNotification('Sync failed: ' + error.message, 'error');
        }
    }

    // --- Event Listeners & Initial Setup ---
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes); 
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);
    syncBtn.addEventListener('click', syncQuotesWithServer);

    // Run functions on page load
    loadQuotes();
    populateCategories();
    createAddQuoteForm();
    showLastViewedQuote();
    filterQuotes();

    // Periodically sync with server
    setInterval(syncQuotesWithServer, SYNC_INTERVAL);
});