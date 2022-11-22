//i. Function definitions

// Resets field to only have one option - "--select--"
function clearOptions(field) {
  field.options.length = 1;
  clearOutput();
}

// find all children of "chosenParent" item and add them as options to childField
function addOptions(chosenParent, childField) {
  clearOptions(childField);
  const childOptions = contentTable.filter((item) => item.parent_code === chosenParent);
  for (const childOption of childOptions) {
    const newOption = new Option(childOption.category_name, childOption.category_code);
    childField.options.add(newOption);
  }
}

// Show a certain result in the ".output" area
function showOutput(instruction, example) {
  skuField.value = `${skuData.sku1}-${skuData.sku2}-XXXXXXXX-000`;
  instructionField.innerText = instruction ? instruction : '';
  exampleField.innerText = example ? example : '';
};

function clearOutput() {
  skuField.value = ``;
  instructionField.innerText = '';
  exampleField.innerText = '';
}

// Function triggered whenever one of the first two/three input fields changes
// 1. Clear all fields that are two levels lower
// e.g. whenever level 1 changes levels 3 and 4 are cleared
// 2. If "--select--" is chosen - clear child field as well and return
// 3. Populate child field according to the option selected in the parent field
function onChangeHandler(event) {
  if(this.getAttribute('id')!=='group'){
    hideCategoryField();
  }
  const dependentField = document.getElementById(this.getAttribute('data-dependent-id'));
  const chosenName = event.target.value;
  let fieldToClear = document.getElementById(dependentField.getAttribute('data-dependent-id'));
  while (fieldToClear) {
    clearOptions(fieldToClear);
    fieldToClear = document.getElementById(fieldToClear.getAttribute('data-dependent-id'));
  }
  if(chosenName==='--select--'){
    clearOptions(dependentField);
    return;
  }
  const chosenItem = contentTable.find(item => item.category_code===chosenName);
  addOptions(chosenItem.category_code, dependentField);

}

function showCategoryField() {
  const categoryLabel = document.createElement('label');
  const categoryField = document.createElement('select');
  const defaultOption = new Option('--select--');

  categoryLabel.setAttribute('for', 'category');
  categoryLabel.setAttribute('id', 'category-label');
  categoryLabel.innerText = 'קטגוריה';

  categoryField.setAttribute('id', 'category');
  categoryField.appendChild(defaultOption);

  const inputDiv = document.querySelector('.input');
  inputDiv.appendChild(categoryLabel);
  inputDiv.appendChild(categoryField);

  categoryField.addEventListener('change', event => {
    const chosenName = event.target.value;
    if (chosenName === '--select--') {
      clearOutput();
      return;
    }
    const chosenItem = contentTable.find(item => item.category_code === chosenName);
    skuData.sku2 = chosenItem.sku;
    showOutput(chosenItem.instruction, chosenItem.example);
  });
}

function hideCategoryField() {
  const inputDiv = document.querySelector('.input');
  const categoryLabel = document.getElementById('category-label');
  const categoryField = document.getElementById('category');
  if(!categoryLabel || !categoryField) {
    return;
  }
  inputDiv.removeChild(categoryLabel);
  inputDiv.removeChild(categoryField);
}


// ii. function executions

// input fields
const mainFamilyField = document.getElementById('main-family');
const subFamilyField = document.getElementById('sub-family');
const groupField = document.getElementById('group');

// output fields
const skuField = document.getElementById('sku');
const instructionField = document.getElementById('instruction');
const exampleField = document.getElementById('example');

// Data pieces that will later form the "מק"ט" output field
// These are the sku values of the second level choice and forth level choice
// Empty initially
const skuData = {
  sku1: '',
  sku2: ''
}

// Variable that shows whether the current 3 level choice has children
// This will be used in the sku section
let fourthElementExists = true;

// Change handler specific for 'group' fields
// If the chosen third level item has children => show fourth field
// If the chosen third level item has no children => go on to form output (not done yet)
function onChangeHandlerGroup(event) {
  hideCategoryField();
  const chosenItem = contentTable.find(item => item.category_code===event.target.value);
  const children = contentTable.find(item => item.parent_code===chosenItem.category_code);
  if(children) {
    showCategoryField();
    const bindedChangeHandler = onChangeHandler.bind(this);
    bindedChangeHandler(event);
    fourthElementExists = true;
  } else {
    fourthElementExists = false;
  }
}

mainFamilyField.addEventListener('change', onChangeHandler);
subFamilyField.addEventListener('change', onChangeHandler);
groupField.addEventListener('change', onChangeHandlerGroup);

// sku logic

// sku1: always determined by level 2 category
subFamilyField.addEventListener('change', event => {
  const chosenItem = contentTable.find(item => item.category_code===event.target.value);
  skuData.sku1 = chosenItem.sku;
});

// sku2: determined by level 3 category, overwridden by level 4 item if it exists
// Logic for level 4 sku is inside showCategoryField function
groupField.addEventListener('change', event => {
  const chosenItem = contentTable.find(item => item.category_code===event.target.value);
  skuData.sku2 = chosenItem.sku;
  if(!fourthElementExists){
    showOutput(chosenItem.instruction, chosenItem.example);
  }
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
  // Start by showing all options in the "משפחה ראשית" field
  addOptions(0, document.getElementById('main-family'));
});
