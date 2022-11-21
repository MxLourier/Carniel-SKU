//i. Function definitions

// Resets field to only have one option - "--select--"
function clearOptions(field) {
  field.options.length = 1;
  showOutput('', '', '');
}

// find all children of "chosenParent" item and add them as options to childField
function addOptions(chosenParent, childField) {
  clearOptions(childField);
  const childOptions = contentTable.filter((item) => item.parent_code === chosenParent);
  for (const childOption of childOptions) {
    const newOption = document.createElement('option');
    newOption.innerText = childOption.category_name;
    childField.appendChild(newOption);
  }
}

// Show a certain result in the ".output" area
function showOutput(sku, instruction, example) {
  skuField.value = sku;
  instructionField.innerText = instruction;
  exampleField.innerText = example;
};

// Function triggered whenever one of the first three input fields changes
// 1. Clear all fields that are two levels lower
// e.g. whenever level 1 changes levels 3 and 4 are cleared
// 2. If "--select--" is chosen - clear child field as well and return
// 3. Populate child field according to the option selected in the parent field
// 4. For level 2 only: save the sku value of the chosen option
function onChangeHandler(event) {
  const dependentField = document.getElementById(this.getAttribute('data-dependent-id'));
  const chosenName = event.target.value;
  let fieldToClear = document.getElementById(dependentField.getAttribute('data-dependent-id'));
  while (fieldToClear) {
    console.log('run clear!');
    clearOptions(fieldToClear);
    fieldToClear = document.getElementById(fieldToClear.getAttribute('data-dependent-id'));
  }
  if(chosenName==='--select--'){
    clearOptions(dependentField);
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name===chosenName);
  console.log(chosenItem.category_code);
  addOptions(chosenItem.category_code, dependentField);
  if(this.getAttribute('data-dependent-id')==='group'){
    console.log('setting sku2!');
    skuData.sku2 = chosenItem.sku;
  }
}

// ii. function executions

// output fields
const skuField = document.getElementById('sku');
const instructionField = document.getElementById('instruction');
const exampleField = document.getElementById('example');

// Data pieces that will later form the "מק"ט" output field
// These are the sku values of the second level choice and forth level choice
// Empty initially
const skuData = {
  sku2: '',
  sku4: ''
}

// Add onChangeHandler function ONLY for the first three input fields
document.querySelectorAll('select.firstThree').forEach((field) => {
  field.addEventListener('change', onChangeHandler);
});

// Last input field needs a different onChange handler
document.getElementById('category').addEventListener('change', event => {
  const chosenName = event.target.value;
  if (chosenName === '--select--') {
    showOutput('', '', '');
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name === chosenName);
  skuData.sku4 = chosenItem.sku;
  console.log('sku4 = ' + skuData.sku4);
  console.log(chosenItem.category_code);
  const skuOutput = `${skuData.sku2}-${skuData.sku4}-XXXXXXXX-000`;
  const instruction = chosenItem.instruction ? chosenItem.instruction : '';
  const example = chosenItem.example ? chosenItem.example : '';
  showOutput(skuOutput, instruction, example);
});


// Fetch data table
const url = 'https://cpq.binet.co.il/api/cpq/sku/all';

class Item {
  constructor(parent_code, category_code, category_name, sku, instruction, example) {
    this.parent_code = parent_code;
    this.category_code = category_code;
    this.category_name = category_name;
    this.sku = sku;
    this.instruction = instruction;
    this.example = example;
  }
}

let contentTable = [];

function flattenArray(array) {
  for (let i = 0; i < array.length; i++) {
    contentTable.push(array[i]);
    if(array[i].children){
      flattenArray(array[i].children);
    }
  }
}

function convertArray(array) {
  const result = [];
  for(const element of array){
    const item = new Item(element.parent, element.id, element.label, element.sku, element.instruction, element.example);
    result.push(item);
  }
  return result;
}

let promise = fetch(url);

promise.then(data => {
  return data.json();
}).then(table => {
  flattenArray(table);
  contentTable = convertArray(contentTable);
  console.log(contentTable);
});



// Start by showing all options in the "משפחה ראשית" field
addOptions(0, document.getElementById('main-family'));
