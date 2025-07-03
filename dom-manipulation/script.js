document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const syncBtn = document.getElementById('syncBtn'); // New: Sync Button
    const syncStatus = document.getElementById('syncStatus'); // New: Sync Status Display

    // --- Data Initialization ---
    const initialQuotes = [
        { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { id: 2, text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
        { id: 3, text: "The mind is everything. What you think you become.", category: "Wisdom" },
        { id: 4, text: "An unexamined life is not worth living.", category: "Wisdom" },
        { id: 5, text: "I have not failed. I've just found 10,000 ways that won't work.", category: "Perseverance" }
    ];
    let quotes = [];
    let nextQuoteId = 1; // To assign unique IDs to new quotes for syncing

    // --- Server Simulation Configuration ---
    // JSONPlaceholder doesn't support actual POST/PUT for long-term storage.
    // We'll use a fixed endpoint for GET and simulate POST/PUT behavior locally for display.
    // For a more robust simulation, you'd use a tool like json-server on your machine.
    const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // A dummy endpoint
    const SYNC_INTERVAL = 30 * 1000; // Sync every 30 seconds (adjust for testing)

    // --- Utility Functions for Notifications ---
    function showNotification(message, type = 'info') {
        syncStatus.textContent = message;
        syncStatus.className = ''; // Clear existing classes
        syncStatus.classList.add(type === 'success' ? 'sync-success' : type === 'error' ? 'sync-error' : 'sync-info');
        syncStatus.style.display = 'block';
        setTimeout(() => {
            syncStatus.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    }

    // --- Storage Functions ---
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function loadQuotes() {
        const storedQuotes = localStorage.getItem('quotes');
        quotes = storedQuotes ? JSON.parse(storedQuotes) : initialQuotes;
        // Ensure IDs are unique and increment correctly after loading
        if (quotes.length > 0) {
            nextQuoteId = Math.max(...quotes.map(q => q.id || 0)) + 1;
        } else {
            nextQuoteId = 1;
        }
        saveQuotes(); // Ensures initial quotes are saved on first visit
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

    async function addQuote() {
        const newQuoteText = document.getElementById('newQuoteText').value.trim();
        const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (newQuoteText && newQuoteCategory) {
            const newQuote = { id: nextQuoteId++, text: newQuoteText, category: newQuoteCategory };
            quotes.push(newQuote);
            saveQuotes(); // Save the updated array to local storage
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';
            populateCategories(); // Update the category filter dropdown if a new category was added
            filterQuotes(); // This will also save the current filter
            showNotification('New quote added locally and ready for sync.', 'info');

            // Simulate sending new quote to server (JSONPlaceholder won't actually save it)
            try {
                // This is a simulation, JSONPlaceholder will just return the posted data.
                // In a real app, you'd send `newQuote` and expect a successful response.
                await fetch(SERVER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
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
                    // Assign IDs to imported quotes if they don't have them
                    const quotesWithIds = importedQuotes.map(q => ({
                        ...q,
                        id: q.id || nextQuoteId++
                    }));
                    quotes.push(...quotesWithIds); // Add new quotes to the existing array
                    saveQuotes(); // Save the merged array
                    populateCategories(); // Update UI with potentially new categories
                    filterQuotes(); // Re-apply filter and show a quote from the potentially updated list
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
    async function syncQuotesWithServer() {
        showNotification('Syncing with server...', 'info');
        try {
            // Simulate fetching quotes from a server
            // JSONPlaceholder provides mock data, so we'll use a consistent set.
            // In a real app, this would be your actual quotes API endpoint.
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=7'); // Fetch a few mock posts
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const serverData = await response.json();

            // Transform JSONPlaceholder data to your quote format if necessary
            // For simulation, let's assume serverData are posts that we convert to quotes
            const serverQuotes = serverData.map(item => ({
                id: item.id, // Use item.id as unique identifier
                text: item.title, // Map title to text
                category: "Server Data" // Assign a default category or infer if possible
            }));

            let updatedQuotes = [...quotes]; // Start with current local quotes
            let conflictsResolved = 0;
            let newServerQuotes = 0;
            let newLocalQuotesSynced = 0; // Simulate pushing new local quotes to server

            // Phase 1: Merge server quotes into local quotes (server takes precedence)
            serverQuotes.forEach(serverQuote => {
                const existingLocalIndex = updatedQuotes.findIndex(q => q.id === serverQuote.id);
                if (existingLocalIndex !== -1) {
                    // Quote exists locally, server takes precedence (overwrite)
                    // Check if content is actually different to count as a conflict
                    if (JSON.stringify(updatedQuotes[existingLocalIndex]) !== JSON.stringify(serverQuote)) {
                        updatedQuotes[existingLocalIndex] = serverQuote;
                        conflictsResolved++;
                    }
                } else {
                    // New quote from server, add it
                    updatedQuotes.push(serverQuote);
                    newServerQuotes++;
                }
            });

            // Phase 2: Simulate pushing new local quotes to server (simple version)
            // In a real application, you'd track 'dirty' local quotes and POST/PUT them.
            // For this simulation, we'll assume any local quotes not found on server
            // in the initial fetch are new and would be pushed up.
            quotes.forEach(localQuote => {
                const existsOnServer = serverQuotes.some(q => q.id === localQuote.id);
                if (!existsOnServer) {
                    // This is a new local quote, simulate pushing it to server
                    // JSONPlaceholder will just echo this back, not actually save.
                    fetch(SERVER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(localQuote),
                    }).then(() => {
                        // console.log(`Simulated push of local quote ID ${localQuote.id}`);
                    }).catch(err => {
                        console.error(`Error simulating push for ID ${localQuote.id}:`, err);
                    });
                    newLocalQuotesSynced++;
                }
            });

            quotes = updatedQuotes; // Update the global quotes array
            saveQuotes(); // Persist the merged data
            populateCategories(); // Update categories based on new data
            filterQuotes(); // Apply the current filter to the potentially new data

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
    syncBtn.addEventListener('click', syncQuotesWithServer); // New: Sync Button Listener

    // Run functions on page load
    loadQuotes();
    populateCategories(); // Populate categories after loading quotes
    createAddQuoteForm();
    showLastViewedQuote();
    filterQuotes(); // Apply the saved filter or default 'all'

    // Periodically sync with server
    setInterval(syncQuotesWithServer, SYNC_INTERVAL);
});