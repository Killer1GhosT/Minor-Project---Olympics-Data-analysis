var olympicsData;

/* ------------------------------------------------------ */
d3.json('/api/medals-tally/years_after_1960').then(function(data) {

    console.log(data);

    olympicsData = JSON.parse(JSON.stringify(data, ['Year', 'Season', 'Nation', 'Medals', 'Gold', 'Silver', 'Bronze']));

    console.log(olympicsData);

    // Build the table using original data when page loads
    buildTable(olympicsData);

    // Find distinct values for each key
    findDistinct(olympicsData);

    // Add Input-fields for all the keys and dropdown for distinct values
    createDropdown(distinctData);

    // Attach an event listener for changes in any filter
    d3.selectAll('.filter').on('change', updateFilters)

    /* ------------------------------------------------------ */

    function capitalize(string){
        return string.charAt(0).toUpperCase() + string.slice(1) 
    };

    /* ------------------------------------------------------ */

    function titleCase(string) {

        // Convert the string to lowercase and split at space
        var splitStr = string.toLowerCase().split(' ');

        // Loop thru all the words
        for (var i = 0; i < splitStr.length; i++) {
            // Change 1st letter of each word to uppercase & assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
        }

        // Return the joined string
        return splitStr.join(' '); 
    }

    /* ------------------------------------------------------ */

    function buildTable(data){

        // Select the table body
        var tbody =  d3.select('tbody');

        // remove data from the table
        tbody.html("");

        data.forEach(record => {

            const newrow = tbody.append('tr');

            Object.values(record).forEach(value => {
                let newtd = newrow.append('td')
                                .text(value);
            }); 
        });
    };

    /* ------------------------------------------------------ */

    var distinctData = {};

    function findDistinct(data) {

        distinctData = {'Year': [],
                        'Season': [],
                        'Nation': []
                        };

        data.forEach(eventrow => {
            Object.entries(eventrow).forEach( ([key, value]) => {       
                if (distinctData[key] && ! distinctData[key].includes(value)){
                    distinctData[key].push(value);
                }
            })
        });

        // sorting the distinct values in alphatical order for dropdown menu
        Object.keys(distinctData).forEach(key => {distinctData[key].sort()});
    };

    /* ------------------------------------------------------ */

    function createDropdown(data) {

        Object.entries(data).forEach( ([key, values]) => {

            let ul = d3.select("#filters");

            let newLi = ul.append('li').attr('class', 'filter list-group-item');

            let newLabel = newLi.append('label')
                                .text("Enter a " + capitalize(key))
                                .attr('for', key);

            let newSelect = newLi.append('select')
                                .attr('class', 'form-control')
                                .attr('id', key)
                                .attr('type', 'text')
                                .text("Choose a " + capitalize(key));
                                

            // Appending an 'optgroup' to wrap the dropdown options
            let newOptgroup = newSelect.append('optgroup')
                                    .attr('class', `${key}_options`);

            // Start of dropdown menu
            let newOption = newOptgroup.append('option')
                                    .attr('value', "")
                                    .text("Choose a " + capitalize(key));
            
            // Lopping thru distinct values of each key and adding them to dropdown menu
            values.forEach(value => {
                newOption = newOptgroup.append('option')
                                    .attr('value', value)
                                    .text(value);
            });
        });

    };

    /* ------------------------------------------------------ */

    function updateDropdown(data) {

        findDistinct(data);

        Object.entries(distinctData).forEach( ([key,values]) => {
            // Clearing the previous dropdown options
            let optGroup = d3.select(`.${key}_options`)
                            .html("");
            
            // Start of new dropdown menu
            let newOption = optGroup.append('option')
                                    .attr('value', "")
                                    .text("Choose a " + capitalize(key));
            
            // Lopping thru distinct values of each key and adding them to dropdown menu
            values.forEach(value => {
                newOption = optGroup.append('option')
                                        .attr('value', value)
                                        .text(value);   
            });
        });

        // Displaying selected filter in its input field
        Object.entries(filters).forEach(([key,value]) => {
            optgroup = d3.select(`.${key}_options`)
                        .html("");
            newOption = optgroup.append('option')
                                .text(value);
        });
    };

    /* ------------------------------------------------------ */

    // Keep track of all filters
    var filters = {};

    function updateFilters() {

        var changedElement = d3.select(this).select('select');
        var elementValue = changedElement.property('value');
        var filterId = changedElement.attr('id');

        // If a filter value was entered add that filterId and value to filters array.
        // Otherwise clear that filter from filters array.
        if (elementValue) {
            filters[filterId] = elementValue;
        }
        else {
            delete filters[filterId];
        }

        console.log('\nFilters applied:');
        Object.entries(filters).forEach(([key,value]) => {
            console.log(capitalize(key) + ":" + value);
        });

        filterTable();
    };

    /* ------------------------------------------------------ */

    function filterTable() {

        var filteredData = olympicsData;

        // Loop through the filters and keep the data that matches the filter values
        Object.entries(filters).forEach(([key,value])  => {
            filteredData = filteredData.filter( row => row[key] == value );
        
            // Rebuild the table using filtered data
            buildTable(filteredData);

            // Update the dropdown values with filtered data
            updateDropdown(filteredData);

        });

    };
});