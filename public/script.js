let isLoggedIn = false;

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('login-status');
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isLoggedIn = true;
            statusDiv.innerHTML = '<p class="success">Login successful!</p>';
            document.getElementById('reports-section').style.display = 'block';
            document.getElementById('login-section').style.display = 'none';
        } else {
            statusDiv.innerHTML = '<p class="error">Login failed. Please check your credentials.</p>';
        }
    } catch (error) {
        statusDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
    } finally {
        showLoading(false);
    }
});

document.getElementById('reports-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const startDate = document.getElementById('startDate').value.replace(/-/g, '');
    const endDate = document.getElementById('endDate').value.replace(/-/g, '');
    const pageSize = parseInt(document.getElementById('pageSize').value);
    const pageNo = parseInt(document.getElementById('pageNo').value);
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate, endDate, pageSize, pageNo })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Report data received:', data);
            displayResults(data);
        } else {
            alert('Error fetching reports: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        showLoading(false);
    }
});

function displayResults(response) {
    const resultsSection = document.getElementById('results-section');
    const summaryDiv = document.getElementById('results-summary');
    const containerDiv = document.getElementById('results-container');
    
    resultsSection.style.display = 'block';
    
    // Check if response has the expected structure
    if (response.status === 'OK' && response.data && response.data.rows) {
        const rows = response.data.rows;
        
        // Aggregate data by channelname3
        const aggregatedData = {};
        
        rows.forEach(row => {
            const channel = row.channelName3 || 'Unknown Channel';
            
            if (!aggregatedData[channel]) {
                aggregatedData[channel] = {
                    channelName3: channel,
                    estimated_revenue: 0,
                    impressions: 0,
                    total_clicks: 0,
                    count: 0
                };
            }
            
            aggregatedData[channel].estimated_revenue += row.estimated_revenue || 0;
            aggregatedData[channel].impressions += row.impressions || 0;
            aggregatedData[channel].total_clicks += row.total_clicks || 0;
            aggregatedData[channel].count += 1;
        });
        
        // Convert aggregated data to array
        const aggregatedRows = Object.values(aggregatedData);
        
        // Calculate summary from the aggregated data
        const totalRevenue = aggregatedRows.reduce((sum, row) => sum + row.estimated_revenue, 0);
        const totalImpressions = aggregatedRows.reduce((sum, row) => sum + row.impressions, 0);
        const totalClicks = aggregatedRows.reduce((sum, row) => sum + row.total_clicks, 0);
        
        summaryDiv.innerHTML = `
            <div class="summary-card">
                <h3>Summary</h3>
                <p><strong>Total Channels:</strong> ${aggregatedRows.length}</p>
                <p><strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}</p>
                <p><strong>Total Impressions:</strong> ${totalImpressions.toLocaleString()}</p>
                <p><strong>Total Clicks:</strong> ${totalClicks.toLocaleString()}</p>
            </div>
        `;
        
        // Display aggregated data in a table
        if (aggregatedRows.length > 0) {
            // Define headers to display (excluding searches)
            const headers = ['channelName3', 'estimated_revenue', 'impressions', 'total_clicks'];
            let tableHTML = '<div class="table-wrapper"><table><thead><tr>';
            
            headers.forEach(header => {
                tableHTML += `<th>${header.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`;
            });
            
            tableHTML += '</tr></thead><tbody>';
            
            aggregatedRows.forEach(row => {
                tableHTML += '<tr>';
                headers.forEach(header => {
                    let value = row[header];
                    
                    // Format different types of values
                    if (header === 'estimated_revenue' && typeof value === 'number') {
                        value = '$' + value.toFixed(2);
                    } else if ((header === 'impressions' || header === 'total_clicks') && typeof value === 'number') {
                        value = value.toLocaleString();
                    }
                    
                    tableHTML += `<td>${value !== null && value !== undefined ? value : '-'}</td>`;
                });
                tableHTML += '</tr>';
            });
            
            tableHTML += '</tbody></table></div>';
            containerDiv.innerHTML = tableHTML;
        } else {
            containerDiv.innerHTML = '<p>No data available for the selected date range.</p>';
        }
    } else {
        containerDiv.innerHTML = '<p>No data available or unexpected response format.</p>';
        console.error('Unexpected response format:', response);
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}