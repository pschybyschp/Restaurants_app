/* import algoliasearch from "algoliasearch";
import algoliasearchHelper from "algoliasearch-helper"; */

let currentIndex = 0; // Start index for hits
let currentPage = 0; // Start at the first page
const hitsPerPage = 5; // Number of hits to show per page
let totalPages = 0; // To store the total number of pages
let starrating = 0; // To store the total number of pages


var indexName = 'restaurants_index1'
var $inputfield = $("#search-box");
var $hits = $('#hits');
var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, indexName, {
	hitsPerPage: hitsPerPage,
	facets: ['food_type', 'stars_count', 'payment_options'],
	getRankingInfo: true
	});



function displayFacets(facets) {
  $('#facet1').html(
    Object.keys(facets).slice(0, 5)
      .map(
        (facet) => `
        <div class="facet-item filter__label" data-facet="${facet}">
          <span class="facet-name filter__label-text">${facet}</span>
          <span class="facet-count filter__label-number">${facets[facet]}</span>
        </div>
      `
      )
      .join('')
  );
}

// Event listener for facet click
$(document).on('click', '.facet-item', function () {
  const facetValue = $(this).data('facet');

  if (helper.hasRefinements('food_type') && 
	helper.getRefinements('food_type').some(refinement => refinement.value === facetValue)) {
    // If the facet is already selected, clear the refinement to reset the filter
    helper.clearRefinements('food_type');
  } else {
    // Otherwise, clear any existing refinements and apply the new one
    helper.clearRefinements('food_type');
    helper.addFacetRefinement('food_type', facetValue);
  }
  
  helper.search();
});


function displayStarRatings(starFacet) {
	const container = $('#facet2');

  // Clear any existing content
	container.empty();

  // Create an array to hold the counts for each star rating from 1 to 5
	const starCounts = Array(5).fill(0);

  // Iterate through the starFacet object and populate the starCounts array
	  Object.keys(starFacet)
		.forEach((stars) => {
		  const starCount = Math.floor(parseFloat(stars)); // Round down
		  if (starCount >= 1 && starCount <= 5) {
			starCounts[starCount - 1] += starFacet[stars];
		  }
		});

  // Generate the HTML for each star rating line
	  starCounts.forEach((count, index) => {
		const totalStars = 5;
		let starsHtml = '';

		// Generate star line HTML
		for (let i = 1; i <= totalStars; i++) {
		  if (i <= index + 1) {
			starsHtml += '<span class="fa fa-star starchecked "></span>'; // Filled star
		  } else {
			starsHtml += '<span class="fa fa-star "></span>'; // Empty star
		  }
		}

		// Append the star rating line with the number of restaurants
		container.append(`
		  <div class="stars__line filter__label" data-stars="${index + 1}">
			${starsHtml} <span class="star-count">${count}</span>
		  </div>
		`);
	  });
}


// Event listener for star rating facet click
$(document).on('click', '.stars__line', function () {
  const starValue = parseFloat($(this).data('stars')); // Get the selected star rating value
  const upperBound = starValue + 0.9; // Define the upper boundary for the rating range

  // Check if the current star rating range is already applied as a refinement
  const currentRefinements = helper.getRefinements('stars_count');
  const isRefined = helper.hasRefinements('stars_count') && 
    helper.getRefinements('stars_count').some(refinement => parseFloat(refinement.value) === starValue);

  if (isRefined) {
    // If the refinement is already applied, clear it and reset to initial state
    helper.clearRefinements('stars_count');

  } else {
    // Otherwise, clear any existing refinements and apply the new one
    helper.clearRefinements('stars_count');
    helper.addNumericRefinement('stars_count', '>=', starValue); // Lower bound
    helper.addNumericRefinement('stars_count', '<=', upperBound); // Upper bound
  }

  // Perform the search with the updated refinements
  helper.search();
});


function displayPayments(paymentFacet) {
  const container_payment = $('#facet3'); // Assuming this is your HTML container
  const container_disco = $('#facet4'); // Assuming this is your HTML container

  // Clear any existing content
  container_payment.empty();
  container_disco.empty();

  // Filter and display only "Visa" and "AMEX"
  const selectedPayments = ['Visa', 'AMEX', 'Discover', 'MasterCard'];
  selectedPayments.forEach(paymentType => {
    if (paymentFacet[paymentType]) {
      const paymentHtml = `
        <div class="payment-item  filter__label" data-paymenttype="${paymentType}">
          <span class="payment-type facet-name filter__label-text">${paymentType}:</span>
          <span class="payment-count facet-count filter__label-number">${paymentFacet[paymentType]}</span>
        </div>
      `;
      container_payment.append(paymentHtml);
    }
  });
  
    // Filter and display only "DC" and "CB"
  const selectedDiscos = ['Diners Club','Carte Blanche'];
  selectedDiscos.forEach(paymentType => {
    if (paymentFacet[paymentType]) {
      const discoHtml = `
        <div class="disco-item  filter__label" data-discotype="${paymentType}">
          <span class="disco-type facet-name filter__label-text">${paymentType}:</span>
          <span class="disco-count facet-count filter__label-number">${paymentFacet[paymentType]}</span>
        </div>
      `;
      container_disco.append(discoHtml);
    }
  });
}


$(document).on('click', '.payment-item', function () {
  const facetValue = $(this).data('paymenttype');
  const facetName = 'payment_options';
  
  if (helper.hasRefinements(facetName) && 
      helper.getRefinements(facetName).some(refinement => refinement.value === facetValue)) {
    helper.clearRefinements(facetName);
  } else {
    helper.clearRefinements(facetName);
    helper.addFacetRefinement(facetName, facetValue);
  }

  helper.search();
});

$(document).on('click', '.disco-item', function () {
  const facetValueD = $(this).data('discotype');
  const facetNameD = 'payment_options';
  
  if (helper.hasRefinements(facetNameD) && 
      helper.getRefinements(facetNameD).some(refinement => refinement.value === facetValueD)) {
    helper.clearRefinements(facetNameD);
  } else {
    helper.clearRefinements(facetNameD);
    helper.addFacetRefinement(facetNameD, facetValueD);
  }

  helper.search();
});


helper.on('result', function(content) {
	renderHits(content);
	console.log(content);

    const facets = content.results?.facets[0].data;
    if (facets) {
		displayFacets(facets);
		console.log(facets);
    }else {console.log('No food facet')};

	const starFacet = content.results?.facets[1]?.data;
	if (starFacet) {
		displayStarRatings(starFacet);
		console.log(starFacet);
	}else {console.log('No star facet')};	
	
	const paymentFacet = content.results?.facets[2]?.data;
	if (paymentFacet) {
		displayPayments(paymentFacet);
		console.log(paymentFacet);
	}else {console.log('No paymeent facet')};	


});



// When there is a new character input: update the query, trigger the search
$inputfield.keyup(function(e) {
  helper.setQuery($inputfield.val()).search();
    console.log(e);
	console.log($inputfield.val());
});

$('#search-box').on('keyup', function() {
  helper.setQuery($(this).val())
        .search();
});

function renderSearchInfo(content) {
  const totalResults = content.results?.nbHits; // Total number of results found
  const searchTime = content.results?.processingTimeMS/1000; // Time taken for the search in milliseconds
  // Display the results in a designated element
  $('.results__count-text').html(totalResults +' results found');
  $('.results__time-text').html(' in '+ searchTime + 'ms');
}
  
  
function renderHits(content) {
  // Access the hits from the nested structure
  const hits = content.results?._rawResults?.[0]?.hits;
  totalPages = content.results?._rawResults?.[0]?.nbPages || 0;
  
  if (Array.isArray(hits) && hits.length > 0) {
	displayHits(hits);  
		
  } else {
    $('#container').html('<li>No results found</li>'); // Fallback if hits are not available
  }
// Call the function to render search info
  renderSearchInfo(content);
}

function populateTitle(hits) {
  const content = $.map(hits, function(hit) {
    return hit._highlightResult.name.value;
  }).join('</br>'); // Join the array into a single string 
  $('.result__title').html(content);
}

function generateStarRating(starsCount, starsCount_orginal, reviewsCount, resultId) {
	let starsHtml = '<div class="review-line">';

	starsHtml += '<span class="stars_org">'+starsCount_orginal+'</span>'; 
  for (let i = 1; i <= 5; i++) {
    if (i <= starsCount) {
      // Add checked star
      starsHtml += `<span class="fa fa-star starchecked" id="${resultId}star${i}"></span>`;
    } else {
      // Add unchecked star
      starsHtml += `<span class="fa fa-star" id="${resultId}star${i}"></span>`;
    }
  }
  starsHtml += '<span class="result__summary review-count">'+reviewsCount+' reviews)</span></div>';
  return starsHtml;
}

function displayHits(hits) {
  hits.forEach((hit, i) => {
    const starsCount = parseInt(hit._highlightResult.stars_count.value, 10);
	const starsCount_orginal = hit._highlightResult.stars_count.value;
    const reviewsCount = "   (".concat(String(hit._highlightResult.reviews_count.value)," ") ;
    const starsHtml = generateStarRating(starsCount, starsCount_orginal, reviewsCount, `resItem${i + 1}`);

    $(`#img${i + 1}`).attr("src", hit.image_url);
    $(`#tit${i + 1}`).html(hit._highlightResult.name.value);
    $(`#suma${i + 1}`).html(
      hit._highlightResult.food_type.value + ' | ' +
      hit._highlightResult.neighborhood.value + ' | ' +
      (hit._highlightResult.price_range ? hit._highlightResult.price_range.value : hit.price_range)
    );
    $(`#rating${i + 1}`).html(starsHtml); // Assuming you have a placeholder for the rating
  });
}


helper.search();


// Event listener for the "More" button
$('#loadMore').on('click', function() {
  currentPage += 1; // Move to the next page
  
  // Fetch the next page of hits
  fetchNextPage(currentPage);
  
  // Disable the button if we reach the last page
  if (currentPage >= totalPages - 1) {
    $(this).attr("disabled", true).text("No more results");
  }
});

function fetchNextPage(page) {
  // Assuming you have a function to fetch the next page of results
  // Replace this with your actual API call to get results for the specific page
  helper.setPage(page).search();
}

