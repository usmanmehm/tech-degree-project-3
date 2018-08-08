//This javascript file will optimize a form so that it is more interactive and
// shows more relevant details. The features are summarized below:
// 1) When the page loads, it will focus on the first text field
// 2) It will hide the 'Other' job field unless the other option is selected
// 3) When a design is selected, the color options for that design are shown
// 4) As activities are selected, the cost is updated
// 5) As activities are selected, those with overlapping times are grayed out
// 6) The payment fields that the user selects are the only ones shown
// 7) Error messages are shown as the user types
// 8) The page shows the errors when the user submits
// 9) The credit card field gives 2 different errors depending on what is entered


// form variable to use with event listeners
const form = $('form')[0];
// when the page reloads, the name field is focused on
$('#name').focus();

// Initially hiding the 'Other' job field
const otherLabel = document.querySelector('.other-label');
const otherTitle = document.getElementById('other-title');
otherLabel.classList.toggle("is-hidden");
otherTitle.classList.toggle("is-hidden");

// When the other job field is selected, the text field appears
$('#title').on('change', (e) => {
  const option = e.target.value;
  if(option === 'other') {
    otherLabel.style.display = 'block';
    otherTitle.style.display = 'block';
  }
  if (option !== 'other') {
    otherLabel.style.display = 'none';
    otherTitle.style.display = 'none';
  }
});


// When the user clicks a design, the color drop-down will be filtered to only
// include color options for that design
$('#colors-js-puns').hide();
const selectDesign = document.getElementById('design').options[0];
selectDesign.style.display = 'none';

$('#design').on('change', (e) => {
  const design = e.target.value;
  if(design === 'heart js') {
    $('#colors-js-puns').show();
    $('.heart-js').show();
    $('#first-heart').prop('selected', true);
    $('.js-puns').hide();
  }
  else if (design === 'js puns'){
    $('#colors-js-puns').show();
    $('.js-puns').show();
    $('#first-pun').prop('selected', true);
    $('.heart-js').hide();
  } else{
    $('#colors-js-puns').hide();
  }
});

const eventArray = assignEventProperties();

// Dynamically showing cost
const costDiv = document.createElement('div');
costDiv.className = 'total-cost';
$('.activities').append(costDiv)

let totalCost = 0;
$('.activities').on('change', (e) =>{
  const eventList = $('.activities input');
  const eventName = e.target.name;
  const eventId = e.target.id;
  let timePeriod = eventArray[eventId].time;

  // updating cost as an activity is selected/unselected
  if (e.target.checked === true) {
    totalCost += eventArray[eventId].cost;
    disableEvents(eventName, timePeriod, eventArray);
  } else if (e.target.checked === false) {
    totalCost -= eventArray[eventId].cost;
    enableEvents(eventName, timePeriod, eventArray);
  }
  let costHTML =`Your total cost for activities is: $${totalCost}`;
  costDiv.innerHTML = costHTML;
});


// PAYMENT OPTIONS - only show the payment option that is selected
$('#paypal').hide();
$('#bitcoin').hide();
document.getElementById('payment').options[1].selected = true;
$('#select-method').hide();

$('#payment').on('change', (e) => {
  let paymentType = e.target.value;
  $('#credit-card').hide();
  $('#paypal').hide();
  $('#bitcoin').hide();
  // I altered the HTML so that the name of 'credit card' is 'credit-card' so that the following line works
  $(`#${paymentType}`).show();

  });

  // VALIDATION VARIABLES - typically organized as field, then label, then the current
  //label so that we can reset the original message after an error is corrected
labelArray = []; // this array is to hold all of the labels to check for errors when the page is submitted

nameField = document.getElementById('name');
nameLabel = document.getElementById('name-label');
oldNameLabel = nameLabel.textContent;

emailField = document.getElementById('mail');
emailLabel = document.getElementById('mail-label');
// need a Regular expression to validate email address - not using HTML built in validation
emailRegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
oldEmailLabel = emailLabel.textContent;

activitySelect = $('.activities legend')[0];
oldActivityLabel = activitySelect.textContent;

creditcardLabel = $('.col-6 label')[0];
cardField = $('.col-6 input')[0];

zipLabel = $('.col-3 label')[0];
zipField = $('.col-3 input')[0];

cvcLabel = $('.col-3 label')[1];
cvcField = $('.col-3 input')[1];

// END VALIDATION VARIABLES

//VALIDATION EVENT LISTENERS

// for dynamically checking for errors as the person types
form.addEventListener('keyup', (e) => {
  errorFieldAndLabel (e, nameLabel, nameField, nameField.value.length, oldNameLabel, 'Name: (please enter a name)', true);
  errorFieldAndLabel(e, emailLabel, emailField, emailRegExp.test(emailField.value),
  oldEmailLabel, 'Please enter a valid email address', true);

  //variables associated with the current field values (easier to understand when using with functions)
  paymentType = $('#payment')[0].value;
  let cardNumber = cardField.value;
  let zipNumber = zipField.value;
  let cvcNumber = cvcField.value;
  // The credit card field has two different error messages depending on the type of error
  let emptyCreditCardField = emptyCreditCard(e, creditcardLabel, cardField,
  'Card Number', 'Please Enter a Credit Card Number', true);
  if (!emptyCreditCardField) {
    errorCreditCard(e, creditcardLabel, cardField, cardNumber.length >= 13 && cardNumber.length <= 16,
                    'Card Number', 'Please Enter a Credit Card Number Between 13 and 16 digits', true);
    emptyCreditCardField = false;
  }

  errorCreditCard(e, zipLabel, zipField, zipNumber.length === 5, 'Zip Code:', 'Please Enter a Valid Zip Code', true);
  errorCreditCard(e, cvcLabel, cvcField, cvcNumber.length === 3, 'CVV:', 'Please Enter a Valid CVV', true);
});

//Checking for errors in case the fields are blank, or if there are error messages
// already associated with the fields from the 'keyup' event listener

form.addEventListener('submit', (e) => {

  // Making sure the user has registered for an activity
  errorFieldAndLabel(e, activitySelect, 'undefined', $('.activities input:checkbox:checked').length > 0, 'Register for Activities', 'Register For At Least One Activity', false);

  //Checking for errors in case the user has left fields blank
  errorFieldAndLabel (e, nameLabel, nameField, nameField.value.length, oldNameLabel, 'Name: (please enter a name)', false);
  errorFieldAndLabel(e, emailLabel, emailField, emailRegExp.test(emailField.value),
  oldEmailLabel, 'Please enter a valid email address', false);
  //variables associated with the current field values (easier to understand when using with functions)
  paymentType = $('#payment')[0].value;
  let cardNumber = cardField.value;
  let zipNumber = zipField.value;
  let cvcNumber = cvcField.value;
  // The credit card field has two different error messages depending on the type of error
  let emptyCreditCardField = emptyCreditCard(e, creditcardLabel, cardField,
  'Card Number', 'Please Enter a Credit Card Number', false);
  if (!emptyCreditCardField) {
    errorCreditCard(e, creditcardLabel, cardField, cardNumber.length >= 13 && cardNumber.length <= 16,
                    'Card Number', 'Please Enter a Credit Card Number Between 13 and 16 digits', false);
    emptyCreditCardField = false;
  }

  errorCreditCard(e, zipLabel, zipField, zipNumber.length === 5, 'Zip Code:', 'Please Enter a Valid Zip Code', false);
  errorCreditCard(e, cvcLabel, cvcField, cvcNumber.length === 3, 'CVV:', 'Please Enter a Valid CVV', false);

});

// *********** FUNCTIONS!!! *********** //

// This function takes in a label, field, condition and error messages
// to check for an error and pass the label and field variables into another function
// which will activate teh error
function errorFieldAndLabel(e, label, field, condition, noErrorLabel, errorLabel, active) {
  let activeElementRequired = !active; // the active variable is assessing whether this is a case
  // where it matters that the field is the currently selected element
  // active is always true when using the keyup event listener
  if (active) {
    activeElementRequired = field === document.activeElement;
  }
  if (activeElementRequired && !condition) {
    errorActive(e, label, field);
    label.textContent = errorLabel;
    return true;
  }
  if (condition) {
    noError(label, field)
    label.textContent = noErrorLabel;
    return false;
  }
}

// this function is needed because the credit card fields have an extra requirement
// of only having numbers included
function errorCreditCard(e, label, field, condition, noErrorLabel, errorLabel, active) {
  let intField = parseInt(field.value); //this variable is used to validate that a number is being entered as opposed to letters
  let activeElementRequired = !active;
  if (active) {
    activeElementRequired = field === document.activeElement;
  }
  if(activeElementRequired && paymentType === 'credit-card' && field.value.length !== 0 && !intField) {
    errorActive(e, label, field);
    label.textContent = 'Please only enter numbers!';
    return true;
  }
  else if (activeElementRequired && paymentType === 'credit-card' && !condition) {
    errorActive(e, label, field);
    label.textContent = errorLabel;
    return true;
  }
  if (condition) {
    noError(label, field)
    label.textContent = noErrorLabel;
    return false;
  }
}

//this special function is used to validate whether the credit card field is empty
function emptyCreditCard(e, label, field, noErrorLabel, errorLabel, active) {
  let isEmpty = field.value.length === 0;
  let activeElementRequired = !active;
  if (active) {
    activeElementRequired = field === document.activeElement;
  }
  if (activeElementRequired && paymentType === 'credit-card' && isEmpty) {
    errorActive(e, label, field);
    label.textContent = errorLabel;
    return true;
  } else {
    noError(label, field)
    label.textContent = noErrorLabel;
    return false;
  }
}

// These set of functions are used in conjunction with the other error functions
// they set the class names of the fields/labels with errors so that the
// appropriate CSS is used
// It also stops the page from laoding when called
function errorActive(event, label, field) {
  event.preventDefault();
  // not every
  if (typeof field !== 'undefined') {
    field.className = 'error-active';
  }
  label.className = 'error-label';
}

function noError(label, field) {
  if (typeof field !== 'undefined') {
    field.className = '';
  }
  label.className = '';
}

// This function is used to disable events with overlapping times as those the user has selected
function disableEvents(eventName, eventTime, eventObject) {
  for(i = 0; i < eventObject.length; i++) {
    if (eventObject[i].time === eventTime && eventName !== eventObject[i].name) {
      $(`#${i}`).prop('disabled', true);
    }
  }
}
// This function does the opposite as the above
function enableEvents(eventName, eventTime, eventObject) {
  for(i = 0; i < eventObject.length; i++) {
    if (eventObject[i].time === eventTime && eventName !== eventObject[i].name) {
      $(`#${i}`).prop('disabled', false);
    }
  }
}

// In order to dynamically have an array with the event properties, this returns an array
// with all the appropriate data by going through the activities
// *** requires activities to have the same formatting ***
function assignEventProperties () {
  let eventArray = [];
  const activityInput = $('.activities input');
  const activityLabel = $('.activities label');
  for (let i=0; i < activityInput.length; i++) {
    let fullDescription = activityLabel[i].textContent
    let name = activityInput[i].name;
    eventArray.push({name});

    // Dynamically assigning cost
    if (i === 0) {
      eventArray[i].cost = 200;
      eventArray[i].time = 'n/a';
    } else {
      let cost = findCost(fullDescription)
      eventArray[i].cost = cost;

      let time = findTime(fullDescription);
      eventArray[i].time = time;
    }
  }

  function findCost (string) {
    let startIndex = string.search(',') + 3;
    let endIndex = string.length;
    let costString = '';
    for (let j = startIndex; j < endIndex; j++) {
      costString += string[j];
    }
    return parseInt(costString);
  }

  function findTime (string) {
    let startIndex = string.search('—') + 2;
    let endIndex = string.search(',');
    let time = '';
    for (j = startIndex; j < endIndex; j++){
      time += string[j];
    }
    return time;
  }
  return eventArray;
}
