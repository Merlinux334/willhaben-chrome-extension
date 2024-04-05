// Function to extract JSON data from HTML content
function extractJSONFromHTML(html) {
    try{
        const jsonStart = html.indexOf('<script id="__NEXT_DATA__"');
        const jsonEnd = html.indexOf('</script>', jsonStart);
        const jsonDataString = html.slice(jsonStart, jsonEnd);
        const jsonData = JSON.parse(jsonDataString.match(/{.*}/)[0]);
        return jsonData.props.pageProps.searchResult;
    } catch (error) {
        console.error('Error getting JSON:', error);
        return null;
    }
  }

  // Export the function for use in other scripts
  if (typeof module !== 'undefined') {
    module.exports = { extractJSONFromHTML };
  }